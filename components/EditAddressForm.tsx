'use client';

import { useState } from "react";

export default function EditAddressForm({ user }: { user: any }) {
  const [form, setForm] = useState({
    address1: user?.addresses?.address1 || "",
    address2: user?.addresses?.address2 || "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Dirección actualizada");
      } else {
        setMessage(`❌ ${data.error || "Error al actualizar dirección"}`);
      }
    } catch (err) {
      setMessage("❌ Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
      <input
        type="text"
        name="address1"
        placeholder="Dirección principal"
        value={form.address1}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      <input
        type="text"
        name="address2"
        placeholder="Dirección secundaria"
        value={form.address2}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {message && <p className="text-center text-sm mt-2">{message}</p>}
    </form>
  );
}
