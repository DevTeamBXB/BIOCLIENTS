import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const userId = segments[segments.length - 1];

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    const orders = await Order.find({ userId: new Types.ObjectId(userId) });

    const totalConsumption = orders.reduce((sum: number, order) => {
      const orderVolume = order.products.reduce((innerSum: number, product: any) => {
        const vol =
          /6/i.test(product.name) ? 6 :
          /5/i.test(product.name) ? 5 :
          /1/i.test(product.name) ? 1 : 0;
        return innerSum + product.quantity * vol;
      }, 0);
      return sum + orderVolume;
    }, 0);

    const productCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.products.forEach((product: any) => {
        productCounts[product.name] = (productCounts[product.name] || 0) + product.quantity;
      });
    });

    return NextResponse.json({
      orders,
      totalConsumption,
      productCounts,
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
