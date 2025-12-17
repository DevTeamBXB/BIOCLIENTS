import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { Cliente } from "@/models/Client";
import Order from "@/models/Order";
import Product from "@/models/Product";
import DashboardClient from "@/components/DashboardClient";
import Navbar from "@/components/Navbar";
import { Types } from "mongoose";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect("/");

  await connectToDatabase();

  // Es mejor usar directamente la interfaz de Mongoose si ya la tienes tipada
  const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();
  if (!client) return <p>Usuario no encontrado</p>;

  // Traer pedidos y productos
  const orders = await Order.find({ userId: client._id }).sort({ createdAt: -1 }).lean();
  const allProducts = await Product.find().lean();

  // Mapa idProducto -> { name, m3, type, businessLine } (clave string)
  const productMap = new Map<string, { name: string; m3: number; type?: string; businessLine?: string }>();
  allProducts.forEach((p: any) => {
    if (!p?._id) return;
    productMap.set(String(p._id), { name: p.name, m3: Number(p.m3) || 0, type: p.type, businessLine: p.businessLine });
  });

  // Enriquecer pedidos: añadir name, volumen por producto y normalizar quantity
  const enrichedOrders = orders.map((order: any) => {
    const transformedProducts = (order.products || []).map((prod: any) => {
      // cantidad segura (maneja { $numberInt: "1" } o number o string)
      let cantidad = 0;
      if (prod && typeof prod.quantity === "object" && prod.quantity !== null && "$numberInt" in prod.quantity) {
        cantidad = parseInt(prod.quantity.$numberInt);
      } else {
        cantidad = Number(prod.quantity) || 0;
      }

      const pid = prod._id ? String(prod._id) : "";
      const info = productMap.get(pid) || { name: "Producto desconocido", m3: 0 };

      const volumen = cantidad * (info.m3 || 0);

      return {
        _id: pid,
        name: info.name,
        quantity: cantidad,
        cantidadVacios: Number(prod.cantidadVacios) || 0,
        cantidadLlenos: Number(prod.cantidadLlenos) || 0,
        volumen,
        // 🟢 CORRECCIÓN CLAVE: Asignar la etiqueta desde el objeto 'prod'
        etiqueta: prod.etiqueta,
      };
    });

    return {
      ...order,
      products: transformedProducts,
      // normalizar createdAt en string ISO para el frontend
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    };
  });

  // Calcular consumo mensual: SOLO pedidos con classification === 'Medicinal'
  const consumoMensualMap = new Map<string, number>();
  enrichedOrders.forEach((order: any) => {
    const classification = (order.classification || "").toString().toLowerCase();
    if (classification !== "medicinal") return; // ignorar no-medicinal

    const date = new Date(order.createdAt);
    if (isNaN(date.getTime())) return;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const totalVolumen = (order.products || []).reduce((sum: number, p: any) => sum + (p.volumen || 0), 0);

    consumoMensualMap.set(monthKey, (consumoMensualMap.get(monthKey) || 0) + totalVolumen);
  });

  // convertir a objeto ordenado por mes (opcional)
  const consumoMensual = Array.from(consumoMensualMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<Record<string, number>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

  // DEBUG: ver en server logs
  // console.log("📦 Pedidos (enriquecidos) count:", enrichedOrders.length);
/*   if (enrichedOrders[0]) {
    console.log("📦 Ejemplo pedido[0]:", {
      _id: enrichedOrders[0]._id,
      classification: enrichedOrders[0].classification,
      products: enrichedOrders[0].products.map((p: any) => ({
        // Mostrar la etiqueta para depuración
        _id: p._id, 
        name: p.name, 
        etiqueta: p.etiqueta 
      }))
    });
  } */

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, {client.nombre || session.user.correo}
          </h1>
          <p className="text-gray-600 mb-6">Este es tu panel de gestión de pedidos.</p>

          <DashboardClient
            user={JSON.parse(JSON.stringify(client))}
            // El JSON.stringify/parse es útil para pasar objetos serializables entre Server Component y Client Component
            orders={JSON.parse(JSON.stringify(enrichedOrders))}
            consumoMensual={consumoMensual}
          />
        </div>
      </main>
    </>
  );
}