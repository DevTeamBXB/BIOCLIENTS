// app/api/admin/clients/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await connectToDatabase();
  const clientes = await User.find({ rol: 'client' }).select('_id name email empresa');
  return NextResponse.json(clientes);
}
