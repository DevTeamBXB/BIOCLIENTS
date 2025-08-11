'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';

import logo from '../app/img/simboloBioxigenpng.png';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-4 z-50 flex justify-center">
      <div className="backdrop-blur bg-white/80 shadow-md rounded-xl px-6 py-3 flex items-center justify-between w-full max-w-screen-lg mx-auto text-black">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight">BioSupport</span>
        </div>

        {/* Links principales */}
        <div className="flex items-center space-x-6">
          <Link href="/admin/orders" className="flex items-center gap-1 hover:text-green-600 transition">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Pedidos</span>
          </Link>

          <Link href="/admin/clients" className="flex items-center gap-1 hover:text-green-600 transition">
            <UsersIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Clientes</span>
          </Link>

          <Link href="/employee" className="flex items-center gap-1 hover:text-green-600 transition">
            <HomeIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Inicio</span>
          </Link>
        </div>

        {/* Cerrar sesión */}
        <button
        onClick={() => signOut({ callbackUrl: '/login' })}
          title="Cerrar sesión"
          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}
