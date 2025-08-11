'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import logo from '../app/img/simboloBioxigenpng.png';

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 flex justify-center">
      <div className="backdrop-blur bg-white/70 shadow-md rounded-xl px-6 py-3 flex items-center justify-between w-full max-w-screen-lg mx-auto text-black">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight">BioSupport</span>
        </div>

        {/* Centro */}
        <div className="flex items-center space-x-6">
          <Link href="/Index">
            <span className="hover:text-green-600 font-medium cursor-pointer transition-colors">
              Inicio
            </span>
          </Link>
          <Link href="/orders/new">
            <span className="hover:text-green-600 font-medium cursor-pointer transition-colors">
              Generar Pedido
            </span>
          </Link>
        </div>

        {/* Cerrar sesión */}
        <button
        onClick={() => signOut({ callbackUrl: '/login' })}
          title="Cerrar sesión"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
