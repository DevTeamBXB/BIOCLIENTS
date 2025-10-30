// app/api/auth/[...nextauth]/route.ts (fragmento)
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        correo: { label: 'Correo', type: 'text' },
        password: { label: 'Contraseña', type: 'password' }, // usamos "password" en front
        contraseña: { label: 'Contraseña (ñ)', type: 'password' }, // por compatibilidad si quieres
      },
      async authorize(credentials) {
        if (!credentials?.correo || (!credentials?.password && !credentials?.contraseña)) {
          throw new Error('Correo y contraseña requeridos');
        }

        await connectToDatabase();

        const user = await Client.findOne({ correo: credentials.correo });
        if (!user) throw new Error('Usuario no encontrado');

        // Intentamos usar user.password primero; si no existe, fallback a user['contraseña']
        const storedHash = (user as any).password || (user as any)['contraseña'];

        if (!storedHash) throw new Error('No existe contraseña registrada para el usuario');

        // preferimos credentials.password (front debería enviar 'password'), pero admitimos 'contraseña'
        const candidate = credentials.password ?? credentials.contraseña;

        const passwordMatch = await bcrypt.compare(candidate, storedHash);
        if (!passwordMatch) throw new Error('Contraseña incorrecta');

        return {
          id: user._id.toString(),
          correo: user.correo,
          nombre: user.nombre,
          tipo: user.tipo,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.correo = (user as any).correo;
        token.nombre = (user as any).nombre;
        token.tipo = (user as any).tipo;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.correo = token.correo as string;
        (session.user as any).nombre = token.nombre;
        (session.user as any).tipo = token.tipo;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
