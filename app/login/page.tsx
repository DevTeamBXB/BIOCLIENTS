'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      correo,
      contraseña,
      redirect: false,
    });

    if (res?.error) {
      setError('Correo o contraseña incorrectos');
      return;
    }

    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    if (session?.user?.rol === 'admin') {
      router.push('/admin');
    } else if (session?.user?.rol === 'employee') {
      router.push('/employee');
    } else {
      router.push('/');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Logo.png"
            alt="Logo Bioxigen"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Iniciar Sesión
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
