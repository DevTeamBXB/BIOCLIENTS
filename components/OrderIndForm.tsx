'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PlusCircleIcon from '@heroicons/react/24/solid/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import { Product } from '@/types/Product';
import Swal from "sweetalert2";

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
  clientTipo: string;
  etiqueta: string;
  classification: string;
};

type SelectedProduct = {
  _id: string;
  cantidadVacios: number;
  cantidadLlenos: number;
  cantidadAjenos: number;
  cantidadAsignacion: number;
  quantity: number;
  etiqueta: "Recoleccion Ajenos" | "Entrega Ajenos" | "Entrega";
};

export default function OrderForm({
  addresses,
  userEmail,
  products: availableProducts,
  clientTipo,
  etiqueta,
  classification,
}: OrderFormProps) {

  const [products, setProducts] = useState<Record<string, SelectedProduct>>({
    '0': { 
      _id: '',
      cantidadVacios: 0,
      cantidadLlenos: 0,
      cantidadAjenos: 0,
      cantidadAsignacion: 0,
      quantity: 0,
      etiqueta: 'Entrega'
    },
  });

  const [addressId, setAddressId] = useState<string>(addresses[0]?.id || '');
  const [solicitante, setSolicitante] = useState('');
  const [numeroSolicitante, setNumeroSolicitante] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateProduct = useCallback(
    (key: string, field: keyof SelectedProduct, value: string) => {
      setProducts((prev) => {
        const current = prev[key] ?? {
          _id: '',
          cantidadVacios: 0,
          cantidadLlenos: 0,
          cantidadAjenos: 0,
          cantidadAsignacion: 0,
          quantity: 0,
          etiqueta: 'Entrega',
        };

        if (field === '_id' || field === 'etiqueta') {
          return {
            ...prev,
            [key]: {
              ...current,
              [field]: value,
            } as SelectedProduct,
          };
        }

        const numeric = Number(value);
        return {
          ...prev,
          [key]: {
            ...current,
            [field]: Number.isNaN(numeric) ? 0 : numeric,
          } as SelectedProduct,
        };
      });
    },
    []
  );

  const addProduct = useCallback(() => {
    const newKey = Date.now().toString();
    setProducts((prev) => ({
      ...prev,
      [newKey]: {
        _id: '',
        cantidadVacios: 0,
        cantidadLlenos: 0,
        cantidadAjenos: 0,
        cantidadAsignacion: 0,
        quantity: 0,
        etiqueta: 'Entrega',
      },
    }));
  }, []);

  const removeProduct = useCallback((key: string) => {
    setProducts((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const selectedAddress = addresses.find((a) => a.id === addressId);
      if (!selectedAddress) return Swal.fire("Error", "Selecciona una dirección válida", "error");
      if (!solicitante.trim()) return Swal.fire("Error", "Ingrese el nombre del solicitante", "error");
      if (!numeroSolicitante.trim()) return Swal.fire("Error", "Ingrese el número del solicitante", "error");

      const sanitizedProducts = Object.values(products).map((p) => ({
        _id: p._id,
        quantity: p.quantity,
        cantidadVacios: p.cantidadVacios,
        cantidadLlenos: p.cantidadLlenos,
        cantidadAjenos: p.cantidadAjenos,
        cantidadAsignacion: p.cantidadAsignacion ?? 0,
      }));

      if (sanitizedProducts.some((p) => !p._id)) {
        return Swal.fire("Error", "Seleccione un producto en cada línea.", "error");
      }

      setLoading(true);

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            address: {
              calle: selectedAddress.calle,
              ciudad: selectedAddress.ciudad,
            },
            solicitante,
            numeroSolicitante,
            observaciones,
            etiqueta,
            tipo_cliente: clientTipo,
            classification, // 🔥 ahora dinámico
            products: sanitizedProducts,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire("Listo!", "Pedido creado con éxito", "success");
          router.push("/dashboard");
        } else {
          Swal.fire("Error", data.error || "Error al realizar el pedido", "error");
        }
      } catch (err) {
        console.error("Error:", err);
        Swal.fire("Error", "Error de conexión al servidor", "error");
      } finally {
        setLoading(false);
      }
    },
    [
      addresses,
      addressId,
      solicitante,
      numeroSolicitante,
      observaciones,
      etiqueta,
      clientTipo,
      products,
      userEmail,
      router,
      classification
    ]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200 text-black"
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

      {Object.entries(products).map(([key, product]) => (
        <div
          key={key}
          className="mb-6 border border-gray-200 p-4 rounded-lg bg-gray-50 relative"
        >
          <label className="block mb-2 font-semibold">Producto</label>
          <select
            value={product._id}
            onChange={(e) => updateProduct(key, '_id', e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
          >
            <option value="">Seleccione un producto</option>

            {/* 🔥 AQUÍ ESTABA EL ERROR — QUITAMOS EL FILTER MEDICINAL */}
            {availableProducts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.m3}m³)
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">Cantidad Solicitada</label>
              <input
                type="number"
                min={0}
                value={product.quantity}
                onChange={(e) => updateProduct(key, 'quantity', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Cilindros Vacíos</label>
              <input
                type="number"
                min={0}
                value={product.cantidadVacios}
                onChange={(e) => updateProduct(key, 'cantidadVacios', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Cantidad Llenos</label>
              <input
                type="number"
                min={0}
                value={product.cantidadLlenos}
                onChange={(e) => updateProduct(key, 'cantidadLlenos', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Cantidad Ajenos</label>
              <input
                type="number"
                min={0}
                value={product.cantidadAjenos}
                onChange={(e) => updateProduct(key, 'cantidadAjenos', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>
          </div>

          {Object.keys(products).length > 1 && (
            <button
              type="button"
              onClick={() => removeProduct(key)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addProduct}
        className="flex items-center text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <PlusCircleIcon className="h-5 w-5 mr-2" />
        Añadir otro producto
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
        <label className="block mb-2 font-semibold">Número telefónico</label>
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