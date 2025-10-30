import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Client from '@/models/Client';

export async function POST(req: Request) {
  try {
    // 🧩 Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.correo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 📦 Leer cuerpo del request
    const {
      products,
      address,
      email,
      solicitante,
      numeroSolicitante,
      observaciones,
      classification, // ✅ lo usamos desde el front
    } = await req.json();

    // ⚙️ Validación básica
    if (
      !products?.length ||
      !address?.calle ||
      !address?.ciudad ||
      !email ||
      !solicitante ||
      !numeroSolicitante
    ) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🔍 Buscar cliente autenticado
    const client = await Client.findOne({ correo: session.user.correo });
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    if (client.cuenta !== 'Habilitada') {
      return NextResponse.json(
        { error: `Cuenta ${client.cuenta}. No puede crear pedidos.` },
        { status: 403 }
      );
    }

    // 🔎 Verificar productos
    const productIds = products.map((p: any) => p._id);
    const foundProducts = await Product.find({ _id: { $in: productIds } });

    if (foundProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Uno o más productos no existen' },
        { status: 400 }
      );
    }

    // 🧮 Preparar productos correctamente según la clasificación
    const orderProducts = products.map((item: any) => {
      const matchedProduct = foundProducts.find(
        (p) => p._id.toString() === item._id
      );

      // 🩺 Caso especial: Equipos Biomédicos (solo usa quantity)
      if (classification === 'Equipos Biomedicos') {
        return {
          _id: matchedProduct?._id,
          cantidadVacios: 0,
          cantidadLlenos: 0,
          cantidadAsignacion: 0,
          quantity: item.quantity ?? 1,
        };
      }

      // 🧪 Resto de clasificaciones (usa suma)
      const totalQuantity =
        (item.cantidadVacios || 0) +
        (item.cantidadLlenos || 0) +
        (item.cantidadAsignacion || 0);

      return {
        _id: matchedProduct?._id,
        cantidadVacios: item.cantidadVacios || 0,
        cantidadLlenos: item.cantidadLlenos || 0,
        cantidadAsignacion: item.cantidadAsignacion || 0,
        quantity: totalQuantity,
      };
    });

    // 📝 Crear pedido en DB
    const createdOrder = await Order.create({
      userId: client._id,
      email,
      solicitante,
      numeroSolicitante,
      observaciones,
      address: {
        calle: address.calle,
        ciudad: address.ciudad,
        alias: address.alias || '',
      },
      products: orderProducts,
      classification: classification || client.tipo, // ✅ usa la del front si existe
      status: 'pendiente',
    });

    // 📦 Devolver la orden creada (con datos del cliente)
    const orderWithClient = await Order.findById(createdOrder._id)
      .populate('userId', 'nombre correo tipo')
      .lean();

    return NextResponse.json({
      message: 'Pedido creado con éxito',
      order: orderWithClient,
    });
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
