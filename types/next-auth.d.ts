// types/next-auth.d.ts
import NextAuth from 'next-auth';

// Define la estructura de tu objeto contrato para reutilizarla
interface Contrato {
  estado: string;
  entidad: 'Bioxigen' | 'Bioximad'; // <- Añadida la entidad
  fecha_inicio?: string;
  fecha_vencimiento?: string;
}

declare module 'next-auth' {
  // 1. Extender la interfaz Session (Lo que obtienes en useSession)
  interface Session {
    user: {
      id: string;
      correo: string;
      nombre: string;
      tipo: string;
      // 👈 AÑADIDA LA PROPIEDAD 'contrato' AQUÍ
      contrato: Contrato;
    };
  }

  // 2. Extender la interfaz User (Lo que tu proveedor de DB devuelve)
  interface User {
    id: string;
    correo: string;
    nombre: string;
    tipo: string;
    // 👈 AÑADIDA LA PROPIEDAD 'contrato' AQUÍ
    contrato: Contrato;
  }
}

declare module 'next-auth/jwt' {
  // 3. Extender la interfaz JWT (El token interno)
  interface JWT {
    id: string;
    correo: string;
    nombre: string;
    tipo: string;
    // 👈 AÑADIDA LA PROPIEDAD 'contrato' AQUÍ
    contrato: Contrato;
  }
}