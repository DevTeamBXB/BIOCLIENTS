import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import OrderForm from '@/components/OrderForm';
import Client, { Cliente } from '@/models/Client';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductType } from '@/types/Product';

type DireccionOption = {
  id: string;
  alias?: string;
  calle: string;
  ciudad: string;
};

export default async function NewOrderPage() {
  // 🔐 Sesión del usuario
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect('/');

  // 🌐 Conexión con la base de datos
  await connectToDatabase();

  // 🧍 Buscar cliente
  const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();
  if (!client || !Array.isArray(client.direccion_envio)) redirect('/login');

  // 🏠 Direcciones disponibles
  const addresses: DireccionOption[] = client.direccion_envio.map((dir, index) => ({
    id: index.toString(),
    alias: dir.alias || '',
    calle: dir.calle,
    ciudad: dir.ciudad,
  }));

  // 🏭 Tipo de cliente
  const clientTipo = (client.tipo || '').toLowerCase();
  if (!['medicinal', 'industrial'].includes(clientTipo)) redirect('/');

  // 📦 Productos según tipo
  const rawProducts = await Product.find(
    { type: clientTipo },
    '_id name m3 type businessLine'
  ).lean<ProductType[]>();

  const products: ProductType[] = rawProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    m3: p.m3,
    type: p.type,
    businessLine: p.businessLine,
  }));

  // 🎨 Renderizado principal
  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-200 p-6">

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">
        
        {/* 🧾 Sección del formulario */}
        <section className="bg-white p-8 rounded-2xl shadow-md flex-1 ">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Nuevo pedido
          </h1>
          <p className="flex items-center justify-center gap-2 text-emerald-700 mb-6 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
            {client.order_min || 'Consultar con el asesor'}
          </p>

          <OrderForm
            addresses={addresses}
            userEmail={session.user.correo}
            products={products}
            classification="Medicinal"
          />
        </section>

        {/* 📘 Guía de productos */}
        <aside className="bg-white p-6 rounded-2xl border border-gray-200 w-full lg:w-80 h-fit shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            Guía de productos
          </h2>
          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <Image
                src="/images/6mts.jpeg"
                alt="Cilindro de 6mts"
                width={80}
                height={80}
                className="rounded-lg border border-gray-300"
              />
              <span className="text-gray-600 text-sm">
                Cilindro de 6 mts de oxígeno
                <br />
                <span className="text-xs text-gray-400">(imagen ilustrativa)</span>
              </span>
            </li>

            <li className="flex items-center gap-4">
              <Image
                src="/images/portatil.jpeg"
                alt="Cilindro portátil 1mt"
                width={80}
                height={80}
                className="rounded-lg border border-gray-300"
              />
              <span className="text-gray-600 text-sm">
                Cilindro portátil de 1 m³
                <br />
                <span className="text-xs text-gray-400">(imagen ilustrativa)</span>
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
