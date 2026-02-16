import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Client from '@/models/Client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.correo) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await req.json();

    const {
      address,
      solicitante,
      numeroSolicitante,
      observaciones,
      products,
    } = body;

    // 🔐 Validar productos
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Debe enviar al menos un producto' },
        { status: 400 }
      );
    }

    // 🔍 Buscar cliente
    const client = await Client.findOne({ correo: session.user.correo });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // 🏷 Determinar clasificación AUTOMÁTICAMENTE
    const clientTipo = (client.tipo || '').toLowerCase();

    const classification =
      clientTipo === 'industrial'
        ? 'Industrial'
        : 'Medicinal';

    // 📦 Mapear productos de forma segura
    const formattedProducts = products.map((p: any) => ({
      _id: p._id,

      quantity: Number(p.quantity ?? 0),

      cantidadAjenos: Number(p.cantidadAjenos ?? 0),
      cantidadVacios: Number(p.cantidadVacios ?? 0),
      cantidadLlenos: Number(p.cantidadLlenos ?? 0),
      cantidadAsignacion: Number(p.cantidadAsignacion ?? 0),

      // 👇 NUEVO CAMPO
      volume: 0, // SIEMPRE inicia en 0

      etiqueta:
        p.etiqueta === 'Recoleccion Ajenos' ||
        p.etiqueta === 'Entrega Ajenos' ||
        p.etiqueta === 'Entrega'
          ? p.etiqueta
          : 'Entrega',
    }));

    console.log('📦 Products guardados:', formattedProducts);
    console.log('🏷 Classification:', classification);

    // 🧾 Crear orden
    const newOrder = await Order.create({
      userId: client._id,
      email: session.user.correo,
      address,
      solicitante,
      numeroSolicitante,
      observaciones: observaciones || '',
      products: formattedProducts,
      classification,
    });

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error creando orden:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}