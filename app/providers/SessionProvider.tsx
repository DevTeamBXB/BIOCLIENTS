// app/providers/SessionProvider.tsx
'use client';

import { SessionProvider as NextAuthProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function SessionProvider({ children, session }: { children: ReactNode; session?: any }) {
  return <NextAuthProvider session={session}>{children}</NextAuthProvider>;
}
