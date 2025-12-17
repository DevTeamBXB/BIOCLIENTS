'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react';
import { User, LockKeyhole } from 'lucide-react'; // Importamos íconos para minimalismo

// -------------------------------------------------------------------
// ✅ Validaciones
// -------------------------------------------------------------------
function validateUsuario(usuario: string): string {
  if (!usuario) return 'El nombre de usuario es obligatorio';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'Debe tener al menos 6 caracteres';
  return '';
}

// ✅ InputField mejorado con iconos y estilo minimalista
const InputField = React.memo(function InputField({
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  Icon,
}: {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  Icon: React.ElementType; // Tipo para el componente de ícono (ej: User, LockKeyhole)
}) {
  return (
    <div className="flex flex-col space-y-1">
      <div className={`flex items-center border-b-2 transition-all ${
          error ? 'border-red-500' : 'border-gray-200 focus-within:border-emerald-500'
      }`}>
        <Icon className="h-5 w-5 text-gray-400 mr-3" />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className="w-full p-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
          value={value}
          onChange={onChange}
          required
        />
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
});

export default function LoginPage() {
  const [form, setForm] = useState({ usuario: '', password: '' }); 
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado de carga
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const errors = {
    usuario: validateUsuario(form.usuario),
    password: validatePassword(form.password),
  };
  const hasErrors = !!errors.usuario || !!errors.password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (hasErrors) return;

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        usuario: form.usuario,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        console.error('Login error:', res.error);
        setServerError('Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }

      if (res?.ok) router.replace('/Index');
    } catch (err) {
      console.error('Unexpected login error:', err);
      setServerError('Error en el servidor. Intenta nuevamente.');
      setIsLoading(false);
    }
  }

  return (
    // 🎨 Diseño minimalista: Fondo blanco sutil
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-12 rounded-xl shadow-2xl w-full max-w-sm">
        
        {/* 🌿 Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo.png"
            alt="Logo Bioxigen"
            width={100}
            height={100}
            className="object-contain drop-shadow-md"
            priority 
          />
        </div>

        {/* 📝 Título Elegante */}
        <h1 className="text-3xl font-light text-center text-gray-800 mb-2 tracking-wide">
          Bienvenido
        </h1>
        <p className="text-center text-gray-500 mb-8">Accede a tu cuenta de cliente.</p>

        {serverError && (
          <p className="text-red-500 text-sm mb-4 text-center p-2 bg-red-50 rounded-md border border-red-300">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de Usuario */}
          <InputField
            name="usuario" 
            type="text" 
            placeholder="Nombre de Usuario" 
            value={form.usuario}
            onChange={handleChange}
            error={errors.usuario}
            Icon={User} // Ícono de Usuario
          />

          {/* Campo de Contraseña */}
          <InputField
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            Icon={LockKeyhole} // Ícono de Candado
          />

          {/* 🔘 Botón de Ingreso con Gradiente */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-300 flex justify-center items-center gap-2 ${
              hasErrors || isLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:from-emerald-600 hover:to-green-700'
            }`}
            disabled={hasErrors || isLoading}
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                </>
            ) : (
                'Ingresar'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}