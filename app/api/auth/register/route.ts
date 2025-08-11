// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User'; // Asegúrate de que el modelo tenga el esquema correcto
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  await connectToDatabase();
  console.log('Hola llegue');

  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      empresa,
      celular,
      nit,
      address1,
      address2,
    } = body;

    if (!name || !email || !password || !empresa || !celular) {
      return NextResponse.json({ message: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const newUser = await User.create({
  name,
  email,
  password: hashedPassword,
  empresa,
  celular,
  nit,
  rol: 'client',
  addresses: {
    address1: address1 || null,
    address2: address2 || null,
  },
});


    return NextResponse.json({ message: 'Usuario creado correctamente', user: newUser });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}
