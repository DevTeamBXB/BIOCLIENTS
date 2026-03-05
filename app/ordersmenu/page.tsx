"use client";

import Link from "next/link";
import { useSession, SessionProvider } from "next-auth/react";
import { FlaskRound, Stethoscope, Factory } from "lucide-react";
import React from "react";

type CardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

function Card({ title, description, href, icon, external = false }: CardProps) {
  const baseClasses =
    "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02] border border-green-100";

  const content = (
    <>
      <div className="mb-6 flex justify-center items-center w-20 h-20 rounded-full bg-green-50 border border-green-200 shadow-inner">
        <div className="text-green-600">{icon}</div>
      </div>

      <span className="text-2xl font-bold text-green-700 mb-2">
        {title}
      </span>

      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  );
}

export default function OrdersMenu() {
  const { data: session, status } = useSession();

  /* ---------------- LOADING ---------------- */

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-green-700 font-semibold">
          Cargando sesión...
        </p>
      </main>
    );
  }

  /* ---------------- SIN SESIÓN ---------------- */

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Debes iniciar sesión para continuar.
        </p>
      </main>
    );
  }

  /* ---------------- ESPERAR TIPO ---------------- */

  const tipo = session?.user?.tipo?.toString().toLowerCase().trim();

  if (!tipo) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-green-700 font-semibold">
          Cargando opciones...
        </p>
      </main>
    );
  }

  /* ---------------- UI PRINCIPAL ---------------- */

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 px-4 py-12">
      <div className="grid gap-8 max-w-5xl w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">

        {/* 🧪 MEDICINAL */}
        {tipo === "medicinal" && (
          <>
            <Card
              title="Productos Medicinales"
              description="Cilindros, termos y suministro hospitalario."
              href="/orders/new"
              icon={<FlaskRound size={56} strokeWidth={1.5} />}
            />

            <Card
              title="Equipos Biomédicos"
              description="Concentradores, línea del sueño y equipos hospitalarios."
              href="/otherorder/orders/biomedicalequipment"
              icon={<Stethoscope size={56} strokeWidth={1.5} />}
            />
          </>
        )}

        {/* 🏭 INDUSTRIAL */}
        {tipo === "industrial" && (
          <Card
            title="Productos Industriales"
            description="Pedidos de gases para uso industrial"
            href="/ordersInd/new"
            icon={<Factory size={56} strokeWidth={1.5} />}
          />
        )}

        {/* 🚨 TIPO DESCONOCIDO */}
        {tipo !== "medicinal" && tipo !== "industrial" && (
          <div className="col-span-full text-center text-gray-500">
            Tu tipo de usuario no tiene opciones configuradas.
          </div>
        )}
      </div>
    </main>
  );
}