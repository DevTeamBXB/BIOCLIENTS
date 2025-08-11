'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState({ address1: '', address2: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/address')
        .then(res => res.json())
        .then(data => {
          if (data.addresses) {
            setAddresses(data.addresses);
          }
          setLoading(false);
        })
        .catch(() => {
          setMessage('Error cargando direcciones');
          setLoading(false);
        });
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddresses({ ...addresses, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/user/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addresses),
      });

      const data = await res.json();
      setMessage(res.ok ? '✅ Direcciones actualizadas' : `❌ ${data.error}`);
    } catch {
      setMessage('❌ Error al actualizar');
    }
  };

  if (status === 'loading' || loading) return <p>Cargando...</p>;
  if (status === 'unauthenticated') return <p>Debes iniciar sesión</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Mis Direcciones</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="address1"
          value={addresses.address1}
          onChange={handleChange}
          placeholder="Dirección 1"
          className="border p-2 rounded"
        />
        <input
          name="address2"
          value={addresses.address2}
          onChange={handleChange}
          placeholder="Dirección 2"
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Guardar Cambios
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
