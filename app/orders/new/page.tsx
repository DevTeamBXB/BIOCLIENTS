import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import OrderForm from '@/components/OrderForm';
import Client, { Cliente } from '@/models/Client'; // ✅ Usa la interfaz del modelo real
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductType } from '@/types/Product'; // ✅ Asumo que este tipo está bien

type DireccionOption = {
  id: string;
  alias?: string;
  calle: string;
  ciudad: string;
};

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.correo) redirect('/login');

  await connectToDatabase();

  const client = await Client.findOne({ correo: session.user.correo }).lean<Cliente>();

  // Validaciones mínimas
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
    redirect('/login');
  }

const rawProducts = await Product.find({ type: clientTipo }, '_id name m3 type').lean<ProductType[]>();


  const products: ProductType[] = rawProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    m3: p.m3,
    type: p.type,
  }));

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Nuevo pedido</h1>
        <OrderForm
          addresses={addresses}
          userEmail={session.user.correo}
          products={products}
        />
      </div>
    </main>
  );
}
