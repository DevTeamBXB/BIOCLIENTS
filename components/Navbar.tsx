'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

// 1. Importar AMBOS archivos de imagen de logo
import logoBioxigen from '../app/img/simboloBioxigenpng.png';
import logoBioximad from '../app/img/simbolobioximad.png';

export default function Navbar() {
  // 2. Obtener la sesión del usuario
  const { data: session, status } = useSession();

  // 3. Determinar el valor de 'entidad' (path: user.contrato.entidad)
  const entidad = session?.user?.contrato?.entidad;

  // 4. Lógica para seleccionar el logo y el texto alternativo
  let logoSrc = logoBioxigen; // Default: Bioxigen
  let altText = "Logo Bioxigen";

  if (entidad === 'Bioximad') {
    logoSrc = logoBioximad;
    altText = "Logo Bioximad";
  }

  // Opcional: Si la sesión está cargando, puedes mostrar un estado de carga o no mostrar el navbar
  if (status === 'loading') {
    return (
      <nav className="sticky top-4 z-50 flex justify-center">
        <div className="backdrop-blur-md bg-white/60 border border-white/30 shadow-lg rounded-2xl px-8 py-3 w-full max-w-5xl mx-auto text-center text-gray-500">
          Cargando...
        </div>
      </nav>
    );
  }

  // 5. Renderizar el Navbar con el logo dinámico
  return (
    <nav className="sticky top-4 z-50 flex justify-center">
      <div className="backdrop-blur-md bg-white/60 border border-white/30 shadow-lg rounded-2xl px-8 py-3 flex items-center justify-between w-full max-w-5xl mx-auto">
        
        {/* 🌿 Logo Dinámico */}
        <div className="flex items-center space-x-3">
          <Image 
            // Usamos la fuente de logo determinada por la lógica
            src={logoSrc} 
            alt={altText} 
            className="h-9 w-9 object-contain drop-shadow-sm" 
            priority
          />
          {/* Puedes mostrar la entidad o el nombre del usuario aquí si quieres */}
          <span className="text-xl font-semibold text-emerald-800 tracking-tight">
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
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Cerrar sesión"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-sky-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
        </button>

      </div>
    </nav>
  );
}