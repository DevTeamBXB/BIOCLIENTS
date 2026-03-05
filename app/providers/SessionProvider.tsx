"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  session?: Session | null;
};

export default function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthProvider session={session}>
      {children}
    </NextAuthProvider>
  );
}