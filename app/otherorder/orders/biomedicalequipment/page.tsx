import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import OrderForm from '@/components/OrderFormTwo';
import Client, { Cliente } from '@/models/Client';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductType } from '@/types/Product';
import Image from 'next/image';
import { AlertCircle } from "lucide-react";

type DireccionOption = {
  id: string;
  alias?: string;
  calle: string;
  ciudad: string;
};

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect('/');

  await connectToDatabase();

  const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();

  if (!client || !Array.isArray(client.direccion_envio)) {
    redirect('/login');
  }

  const addresses: DireccionOption[] = client.direccion_envio.map((dir, index) => ({
    id: index.toString(),
    alias: dir.alias || '',
    calle: dir.calle,
    ciudad: dir.ciudad,
  }));

  const clientTipo = client.tipo?.toLowerCase(); // 'medicinal' o 'industrial'

  if (!['medicinal', 'industrial'].includes(clientTipo)) {
    redirect('/');
  }

  const rawProducts = await Product.find({ type: clientTipo }, '_id name m3 type businessLine').lean<ProductType[]>();

  const products: ProductType[] = rawProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    m3: p.m3,
    type: p.type,
    businessLine: p.businessLine
  }));

  return (
    <main className="min-h-screen flex justify-center bg-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">
        
        {/* Sección principal del formulario */}
        <div className="bg-white p-8 rounded shadow-md flex-1">
          <h1 className="text-2xl font-bold mb-6 text-center">Nuevo pedido</h1>
          <p className="flex items-center gap-2 text-green-600 mb-6">
            Equipos Biomédicos
          </p>
          <OrderForm
            addresses={addresses}
            userEmail={session.user.correo}
            products={products}
            classification="Equipos Biomedicos" // ✅ Clasificación
          />
        </div>

        {/* Guía de productos a la derecha */}
        <div className="w-full lg:w-80 bg-gray-50 p-4 rounded border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-center">Guía de productos</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <Image 
                src="/images/6mts.jpeg" 
                alt="Cilindro de 6mts" 
                width={75} 
                height={75} 
                className="rounded"
              />
              <span>Cilindro de 6mts oxígeno (imagen ilustrativa)</span>
            </li>
            <li className="flex items-center gap-4">
              <Image 
                src="/images/portatil.jpeg" 
                alt="Cilindro de 1mts" 
                width={75} 
                height={75} 
                className="rounded"
              />
              <span>Cilindro portátil de 1mts (imagen ilustrativa)</span>
            </li>
            {/* Puedes agregar más productos aquí */}
          </ul>
        </div>
      </div>
    </main>
  );
}
