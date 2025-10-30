'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react';

// ✅ Validaciones simples y ligeras
function validateEmail(email: string): string {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El correo es obligatorio';
  if (!regex.test(email)) return 'Formato de correo inválido';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'Debe tener al menos 6 caracteres';
  return '';
}

// ✅ InputField memoizado (solo renderiza si cambian props)
const InputField = React.memo(function InputField({
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
}: {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full p-3 border rounded focus:outline-none focus:ring-2 text-black ${
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:ring-green-400'
        }`}
        value={value}
        onChange={onChange}
        required
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
});

export default function LoginPage() {
  const [form, setForm] = useState({ correo: '', password: '' });
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const errors = {
    correo: validateEmail(form.correo),
    password: validatePassword(form.password),
  };
  const hasErrors = !!errors.correo || !!errors.password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    if (hasErrors) return;

    try {
      const res = await signIn('credentials', {
        correo: form.correo,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        console.error('Login error:', res.error);
        setServerError('Correo o contraseña incorrectos');
        return;
      }

      if (res?.ok) router.replace('/Index');
    } catch (err) {
      console.error('Unexpected login error:', err);
      setServerError('Error en el servidor. Intenta nuevamente.');
    }
  }

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
            priority // ⚡ Mejora el LCP (precarga el logo)
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Iniciar Sesión
        </h1>

        {serverError && (
          <p className="text-red-500 text-sm mb-4 text-center">{serverError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={handleChange}
            error={errors.correo}
          />

          <InputField
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            className={`w-full py-3 rounded transition ${
              hasErrors
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={hasErrors}
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
