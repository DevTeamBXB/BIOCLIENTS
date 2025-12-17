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
      classification,
    } = body;

    // Debug para ver lo que llega
    console.log("📦 Products recibidos en API:", JSON.stringify(products, null, 2));

    // Encontrar cliente
    const client = await Client.findOne({ correo: session.user.correo });
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Mapeo seguro de productos
    const formattedProducts = products.map((p: any) => ({
      _id: p._id,
      quantity: p.quantity ?? 0,

      // 👌 TODAS las cantidades llegan bien desde FE
      cantidadAjenos: Number(p.cantidadAjenos ?? 0),
      cantidadVacios: Number(p.cantidadVacios ?? 0),
      cantidadLlenos: Number(p.cantidadLlenos ?? 0),
      cantidadAsignacion: Number(p.cantidadAsignacion ?? 0),

      etiqueta: typeof p.etiqueta === "string" ? p.etiqueta : "Entrega",
    }));

    console.log("📦 Products GUARDADOS en DB:", formattedProducts);

    const newOrder = await Order.create({
      userId: client._id,
      email: session.user.correo,
      address,
      solicitante,
      numeroSolicitante,
      observaciones: observaciones || "",
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
