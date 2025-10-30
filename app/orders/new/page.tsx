import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import OrderForm from '@/components/OrderForm';
import Client, { Cliente } from '@/models/Client';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductType } from '@/types/Product';
import { AlertCircle } from "lucide-react"; 
import Image from 'next/image';



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

  const clientTipo = (client.tipo || '').toLowerCase();
  if (!['medicinal', 'industrial'].includes(clientTipo)) {
    redirect('/');
  }

const rawProducts = await Product.find(
  { type: clientTipo }, 
  '_id name m3 type businessLine' // 👈 incluye businessLine en la consulta
).lean<ProductType[]>();

const products: ProductType[] = rawProducts.map((p) => ({
  _id: p._id.toString(),
  name: p.name,
  m3: p.m3,
  type: p.type,
  businessLine: p.businessLine, // 👈 obligatorio según types/Product.ts
}));


return (
  <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div className="bg-white p-8 rounded shadow-md w-full max-w-6xl flex gap-8">
      {/* Formulario a la izquierda */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6 text-center">Nuevo pedido</h1>
        <p className="flex items-center gap-2 text-green-600 mb-6">
          <AlertCircle className="w-5 h-5" /> {client.order_min}
        </p>
        <OrderForm
          addresses={addresses}
          userEmail={session.user.correo}
          products={products}
          classification="Medicinal"
        />
      </div>

      {/* Guía de productos a la derecha */}
      <div className="w-80 bg-gray-50 p-4 rounded border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Guía de productos</h2>
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
            {/* <span>Cilindro de3.5ts (imagen ilustrativa)</span>
          </li>
              <li className="flex items-center gap-4">
            <Image 
              src="/images/portatil.jpeg" 
              alt="Cilindro de 1mts" 
              width={75} 
              height={75} 
              className="rounded"
            /> */}
            <span>Cilindro de 1mts (imagen ilustrativa)</span>
          </li>
          {/* Agrega más productos si quieres */}
        </ul>
      </div>
    </div>
  </main>
);
}
