'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type CardProps = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

function Card({ title, description, href, external = false }: CardProps) {
  const CardWrapper = external ? 'a' : Link;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
    >
      <CardWrapper
        href={href}
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        className="group bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center"
      >
        <span className="text-2xl font-semibold text-emerald-800 mb-2 group-hover:text-emerald-600 transition-colors">
          {title}
        </span>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </CardWrapper>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-100 px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid gap-10 max-w-5xl w-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
      >
        <Card
          title="Mi Dashboard"
          description="Accede a tu panel personal y gestiona tus datos"
          href="/dashboard"
        />
        <Card
          title="Realizar Pedido"
          description="Crea una nueva orden de forma rápida y segura"
          href="/ordersmenu"
        />
        <Card
          title="Soporte Técnico"
          description="Contacta con nuestro equipo por WhatsApp"
          href="https://wa.me/573053824464"
          external
        />
      </motion.div>
    </main>
  );
}
