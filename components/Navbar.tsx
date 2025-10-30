'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import logo from '../app/img/simboloBioxigenpng.png';

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 flex justify-center">
      <div className="backdrop-blur-md bg-white/60 border border-white/30 shadow-lg rounded-2xl px-8 py-3 flex items-center justify-between w-full max-w-5xl mx-auto">
        
        {/* 🌿 Logo */}
        <div className="flex items-center space-x-3">
          <Image 
            src={logo} 
            alt="Logo Bioxigen" 
            className="h-9 w-9 object-contain drop-shadow-sm" 
            priority
          />
          <span className="text-xl font-semibold text-emerald-800 tracking-tight">
            BioClient
          </span>
        </div>

        {/* 🧭 Navegación */}
        <div className="flex items-center space-x-8">
          <Link href="/Index" className="relative group">
            <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
              Inicio
            </span>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link href="/ordersmenu" className="relative group">
            <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
              Pedidos
            </span>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        {/* 🚪 Botón cerrar sesión */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Cerrar sesión"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-sky-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
        </button>

      </div>
    </nav>
  );
}
