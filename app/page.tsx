'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [form, setForm] = useState({ correo: '', contraseña: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      correo: form.correo,
      contraseña: form.contraseña,
      redirect: false,
    });

    if (res?.error) {
      console.error('Login error:', res.error); // útil para debug
      setError('Correo o contraseña incorrectos');
      return;
    }

    if (res?.ok) {
      router.replace('/Index');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/Logo.png"
            alt="Logo Bioxigen"
            width={120}
            height={120}
            className="object-contain"
            priority
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
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
            value={form.correo}
            onChange={handleChange}
            required
          />

          <input
            name="contraseña"
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
            value={form.contraseña}
            onChange={handleChange}
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
