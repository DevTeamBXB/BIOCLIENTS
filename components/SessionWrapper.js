'use client';

import { SessionProvider } from 'next-auth/react';

// Este componente es un Cliente Componente que provee la sesión
export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}