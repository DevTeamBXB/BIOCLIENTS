import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import OrderForm from '@/components/OrderFormTwo';
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
  // 🔐 Verificación de sesión
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect('/');

  // 🌐 Conexión a base de datos
  await connectToDatabase();

  // 🧍 Obtener cliente
  const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();
  if (!client || !Array.isArray(client.direccion_envio)) redirect('/login');

  // 📦 Mapeo de direcciones
  const addresses: DireccionOption[] = client.direccion_envio.map((dir, index) => ({
    id: index.toString(),
    alias: dir.alias || '',
    calle: dir.calle,
    ciudad: dir.ciudad,
  }));

  // 🏭 Determinar tipo de cliente
  const clientTipo = client.tipo?.toLowerCase();
  if (!['medicinal', 'industrial'].includes(clientTipo)) redirect('/');

  // 🧾 Obtener productos según tipo
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

  // 🎨 Render del layout
  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-br from-emerald-200 via-white to-sky-300 p-6">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">

        {/* 🧾 Formulario principal */}
        <section className="bg-white p-8 rounded-2xl shadow-lg flex-1">
          <h1 className="text-2xl font-medium mb-6 text-center text-emerald-700">
            Equipos Biomédicos
          </h1>
          <OrderForm
            addresses={addresses}
            userEmail={session.user.correo}
            products={products}
            classification="Equipos Biomedicos"
          />
        </section>

        {/* 📘 Guía de productos */}
        <aside className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 w-full lg:w-80 h-fit shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            Guía de productos
          </h2>
          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <Image
                src="/images/concentrador.png"
                alt="Cpap"
                width={80}
                height={80}
                className="rounded-lg border border-gray-300 shadow-sm"
              />
              <span className="text-gray-600 text-sm">
                Cpap
                <br />
                <span className="text-xs text-gray-400">(imagen ilustrativa)</span>
              </span>
            </li>

            <li className="flex items-center gap-4">
              <Image
                src="/images/cpap.png"
                alt="Concentrador"
                width={80}
                height={80}
                className="rounded-lg border border-gray-300 shadow-sm"
              />
              <span className="text-gray-600 text-sm">
                Concentrador
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
