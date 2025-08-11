import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Client from '@/models/Client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.correo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { products, address, email } = await req.json();

    if (
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !address?.calle ||
      !address?.ciudad ||
      !email
    ) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    await connectToDatabase();

    const client = await Client.findOne({ correo: session.user.correo });
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const clientTipo = client.tipo?.toLowerCase(); // 'medicinal' o 'industrial'

    if (!['medicinal', 'industrial'].includes(clientTipo)) {
      return NextResponse.json({ error: 'Tipo de cliente no válido' }, { status: 400 });
    }

    const productIds = products.map((p) => p._id);
    const foundProducts = await Product.find({ _id: { $in: productIds } });

    if (foundProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Uno o más productos no existen' }, { status: 400 });
    }

    // Validar que los productos correspondan al tipo del cliente
    const productosInvalidos = foundProducts.filter(p => p.type !== clientTipo);
    if (productosInvalidos.length > 0) {
      return NextResponse.json({
        error: 'Uno o más productos no corresponden al tipo de cliente',
        invalidProducts: productosInvalidos.map(p => p.name),
      }, { status: 400 });
    }

    const orderProducts = products.map((item: any) => {
      const matchedProduct = foundProducts.find((p) => p._id.toString() === item._id);
      return {
        name: matchedProduct?.name || 'Producto desconocido',
        quantity: item.quantity,
        type: matchedProduct?.type || 'industrial',
      };
    });

    const createdOrder = await Order.create({
      userId: client._id,
      email,
      products: orderProducts,
      direccion_envio: {
        calle: address.calle,
        ciudad: address.ciudad,
        alias: address.alias || '',
      },
    });

    const resumenProductos = orderProducts
      .map((p) => `- ${p.name} x${p.quantity} (${p.type})`)
      .join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'noreply@resend.dev',
      to: [session.user.correo, 'informatica@bioxigen.com'],
      subject: '📦 Pedido recibido',
      text: `Nuevo pedido:\n\n${resumenProductos}\n\nDirección:\n${address.calle}, ${address.ciudad}${address.alias ? ` (${address.alias})` : ''}\nCliente: ${session.user.correo}`,
    });

    return NextResponse.json({
      message: 'Pedido creado con éxito',
      order: createdOrder,
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
