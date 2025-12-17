import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import bcrypt from 'bcryptjs';

// NOTA: Para que esto funcione sin errores de TypeScript, 
// DEBES tener el archivo 'types/next-auth.d.ts' actualizado
// con la definición de 'contrato' en las interfaces Session, User y JWT.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        usuario: { label: 'Nombre de Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.password) {
          throw new Error('Nombre de usuario y contraseña requeridos');
        }

        await connectToDatabase();

        // 1. Buscar al usuario por el campo 'usuario'
        // NOTA: Usamos findOne y asumimos que 'Client' es un modelo Mongoose.
        // El tipo de 'user' aquí debe incluir todas las propiedades de tu esquema.
        const user: any = await Client.findOne({ usuario: credentials.usuario }).lean();
        
        if (!user) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        const storedHash = user.contraseña; 
        if (!storedHash) throw new Error('No existe contraseña registrada para el usuario');

        const passwordMatch = await bcrypt.compare(credentials.password, storedHash);
        
        if (!passwordMatch) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        // 2. ✅ CAMBIO CRUCIAL: Devolvemos el objeto de usuario completo (con 'contrato').
        // Mongoose devuelve _id, pero NextAuth necesita 'id' como string.
        return {
          id: user._id.toString(),
          usuario: user.usuario,
          correo: user.correo,
          nombre: user.nombre,
          tipo: user.tipo,
          // 👈 Incluimos el objeto 'contrato' completo desde la base de datos
          contrato: user.contrato, 
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  callbacks: {
    // 3. ✅ Actualizar JWT Callback: Copia la data personalizada al token
    async jwt({ token, user }) {
      if (user) {
        // Aseguramos que user es del tipo extendido (gracias a next-auth.d.ts)
        const extendedUser = user as any; // Usamos 'as any' aquí solo si TS no reconoce 'contrato' en 'User'
        
        token.id = extendedUser.id;
        token.usuario = extendedUser.usuario;
        token.correo = extendedUser.correo;
        token.nombre = extendedUser.nombre;
        token.tipo = extendedUser.tipo;

        // 👈 COPIAMOS 'contrato' al token
        token.contrato = extendedUser.contrato; 
      }
      return token;
    },
    
    // 4. ✅ Actualizar Session Callback: Copia la data personalizada del token a la sesión
    async session({ session, token }) {
      if (session.user) {
        // Aseguramos que session.user es del tipo extendido
        const extendedUser = session.user as any; // Usamos 'as any' solo si TS no reconoce 'contrato' en 'session.user'

        extendedUser.id = token.id as string;
        extendedUser.usuario = token.usuario;
        extendedUser.correo = token.correo as string;
        extendedUser.nombre = token.nombre;
        extendedUser.tipo = token.tipo;

        // 👈 COPIAMOS 'contrato' del token a session.user
        extendedUser.contrato = token.contrato;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };