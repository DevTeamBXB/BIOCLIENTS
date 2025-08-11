'use client';

import Link from 'next/link';

export default function HomePage() {
return (
  <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 px-4 py-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full">
      {/* Card 1 */}
      <Link
        href="/dashboard"
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02]"
      >
        <span className="text-2xl font-bold text-green-700 mb-2">Mi Dashboard</span>
        <p className="text-gray-500 text-sm">Accede a tu panel de usuario</p>
      </Link>

      {/* Card 2 */}
      <Link
        href="/orders/new"
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02]"
      >
        <span className="text-2xl font-bold text-green-700 mb-2">Realizar Pedido</span>
        <p className="text-gray-500 text-sm">Crea una nueva orden rápidamente</p>
      </Link>

      {/* Card 3 */}
      <a
        href="https://wa.me/573053824464"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02]"
      >
        <span className="text-2xl font-bold text-green-700 mb-2">Soporte Técnico</span>
        <p className="text-gray-500 text-sm">Chatea con nuestro equipo por WhatsApp</p>
      </a>
    </div>
  </main>
);

}
