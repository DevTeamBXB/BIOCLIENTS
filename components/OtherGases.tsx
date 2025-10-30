'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircleIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';

type Product = {
  _id: string;
  name: string;
  m3: number;
  type: string;
  businessLine: 'Medicinal' | 'Otros Gases' | 'Redes y Mantenimientos' | 'Industrial' | 'Equipos Biomedicos';

};

type Direccion = {
  id: string;
  alias?: string;
  calle: string;
  ciudad: string;
};

type OrderFormProps = {
  addresses: Direccion[];
  userEmail: string;
  products: Product[];
};

type SelectedProduct = {
  _id: string;
  cantidadVacios: number;
  cantidadLlenos: number;
  quantity?: number;
};

export default function OrderForm({
  addresses,
  userEmail,
  products: availableProducts
}: OrderFormProps) {
  const [products, setProducts] = useState<SelectedProduct[]>([
    { _id: '', cantidadVacios: 0, cantidadLlenos: 0, quantity: 0 }
  ]);
  const [addressId, setAddressId] = useState<string>(addresses[0]?.id || '');
  const [solicitante, setSolicitante] = useState('');
  const [numeroSolicitante, setNumeroSolicitante] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === addressId) || null,
    [addressId, addresses]
  );

  const updateProduct = (
    index: number,
    field: keyof SelectedProduct,
    value: string | number
  ) => {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]:
                field === '_id'
                  ? String(value)
                  : value === '' || value === null || value === undefined
                  ? 0
                  : Number(value) || 0
            }
          : p
      )
    );
  };

  const addProduct = () =>
    setProducts((prev) => [
      ...prev,
      { _id: '', cantidadVacios: 0, cantidadLlenos: 0, cantidadAsignacion: 0 }
    ]);

  const removeProduct = (index: number) =>
    setProducts((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return alert('Selecciona una dirección válida');
    if (!solicitante.trim()) return alert('Ingrese el nombre del solicitante');
    if (!numeroSolicitante.trim())
      return alert('Ingrese el número del solicitante');

    if (products.some((p) => !p._id)) {
      return alert('Selecciona un producto en cada línea.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          address: {
            calle: selectedAddress.calle,
            ciudad: selectedAddress.ciudad,
            alias: selectedAddress.alias || ''
          },
          solicitante,
          numeroSolicitante,
          observaciones,
          products
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Pedido realizado con éxito');
        router.push('/dashboard');
      } else {
        alert(data.error || 'Error al realizar el pedido');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border border-gray-200 text-black"
    >
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="flex items-center text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Regresar al dashboard
      </button>

      <h2 className="text-2xl font-bold mb-6 text-green-700">Nuevo Pedido</h2>

      {products.map((product, index) => (
        <div
          key={`${product._id}-${index}`}
          className="mb-6 border border-gray-200 p-4 rounded-lg bg-gray-50 relative"
        >
          <label className="block mb-2 font-semibold">Producto</label>
          <select
            value={product._id}
            onChange={(e) => updateProduct(index, '_id', e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
          >
            <option value="">Seleccione un producto</option>
            {availableProducts
              .filter((p) => p.businessLine === "Otros Gases")
              .map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} 
                </option>
            ))}
          </select>

                    <label className="block mb-2 font-semibold">
            Cantidad
          </label>
          <input
            type="number"
            min={0}
            value={product.quantity}
            onChange={(e) =>
              updateProduct(index, 'quantity', e.target.value)
            }
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />

          {products.length > 1 && (
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-700"
              title="Eliminar producto"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addProduct}
        className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <PlusCircleIcon className="h-5 w-5" />
        <span>Añadir otro producto</span>
      </button>
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Solicitante</label>
        <input
          type="text"
          value={solicitante}
          onChange={(e) => setSolicitante(e.target.value)}
          required
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Número telefonico</label>
        <input
          type="text"
          value={numeroSolicitante}
          onChange={(e) => setNumeroSolicitante(e.target.value)}
          required
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Observaciones</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Dirección de entrega</label>
        <select
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          required
          className="w-full border border-gray-300 px-3 py-2 rounded"
        >
          <option value="">Seleccione una dirección</option>
          {addresses.map((addr) => (
            <option key={addr.id} value={addr.id}>
              {addr.alias
                ? `${addr.alias} - ${addr.calle}, ${addr.ciudad}`
                : `${addr.calle}, ${addr.ciudad}`}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
      >
        {loading ? 'Enviando pedido...' : 'Realizar pedido'}
      </button>
    </form>
  );
}
