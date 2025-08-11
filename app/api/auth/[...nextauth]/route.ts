// /app/api/auth/[...nextauth]/route.ts
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
        contraseña: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contraseña) {
          throw new Error('Correo y contraseña requeridos');
        }

        await connectToDatabase();

        const user = await Client.findOne({ correo: credentials.correo });

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        const passwordMatch = await bcrypt.compare(
          credentials.contraseña,
          user.contraseña
        );

        if (!passwordMatch) {
          throw new Error('Contraseña incorrecta');
        }

        // Puedes incluir más campos si necesitas pasarlos al token
        return {
          id: user._id.toString(),
          correo: user.correo,
          nombre: user.nombre,
          tipo: user.tipo,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
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
