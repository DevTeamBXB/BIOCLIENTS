import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Client, { Cliente } from "@/models/Client";
import Order from "@/models/Order";
import Product from "@/models/Product";
import DashboardClient from "@/components/DashboardClient";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect("/login");

  await connectToDatabase();

 const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();
  if (!client) return <p>Usuario no encontrado</p>;

  const orders = await Order.find({ userId: client._id }).sort({ creado_en: -1 }).lean();
  const allProducts = await Product.find().lean();

  // Crear un mapa de nombre => m3
  const productMap = new Map<string, number>();
  allProducts.forEach(p => productMap.set(p.name.toLowerCase(), p.m3));

  // Agrupar consumo mensual
  const monthlyConsumptionMap = new Map<string, number>();
  orders
    .filter(order => order.estado === "Entregado")
    .forEach(order => {
      const date = new Date(order.creado_en);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const m3Total = order.products.reduce(
        (sum: number, prod: { name: string; quantity: number }) => {
          const m3 = productMap.get(prod.name.toLowerCase()) || 0;
          return sum + m3 * prod.quantity;
        },
        0
      );

      monthlyConsumptionMap.set(monthKey, (monthlyConsumptionMap.get(monthKey) || 0) + m3Total);
    });

  const monthlyConsumption = Array.from(monthlyConsumptionMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, m3]) => ({ mes, m3 }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, {client.nombre || client.correo}
          </h1>
          <p className="text-gray-600 mb-6">Este es tu panel de gestión de pedidos.</p>

          <DashboardClient
            user={JSON.parse(JSON.stringify(client))}
            orders={JSON.parse(JSON.stringify(orders))}
            consumoMensual={monthlyConsumption}
          />
        </div>
      </main>
    </>
  );
}
