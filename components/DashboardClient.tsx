'use client';

import OrderStepper from './OrderStepper';

// 1. Interfaces (Sin cambios, ya están bien tipadas)
interface OrderProduct {
  _id: string;
  name?: string;
  quantity: number;
  cantidadVacios: number;
  cantidadLlenos: number;
  cantidadAsignacion?: number;
  etiqueta?: 'Recoleccion Ajenos' | 'Entrega Ajenos' | 'Entrega';
}

interface Order {
  _id: string;
  status:
    | 'pendiente'
    | 'procesando'
    | 'produccion'
    | 'en_distribucion'
    | 'cancelado'
    | 'completado';
  createdAt: string;
  updatedAt?: string;
  products: OrderProduct[];
  classification?: string;
}

interface User {
  name: string;
  email: string;
}

interface DashboardClientProps {
  user: User;
  orders: Order[];
  consumoMensual?: { mes: string; m3: number }[] | Record<string, number>;
}

// 2. Componente EtiquetaBadge: Se asegura de que siempre haya un valor por defecto.
type Etiqueta = OrderProduct['etiqueta'];

function EtiquetaBadge({ etiqueta }: { etiqueta: Etiqueta }) {
  // 🟢 Asignación robusta: Usa la etiqueta pasada, o si es nula/undefined, usa 'Entrega'.
  const etiquetaFinal: NonNullable<Etiqueta> = etiqueta ?? 'Entrega'; 

  const base =
    'inline-flex items-center px-2 py-1 rounded text-xs font-medium gap-1 whitespace-nowrap';

  const estilos: Record<NonNullable<Etiqueta>, string> = {
    'Recoleccion Ajenos': 'bg-red-100 text-red-800',
    'Entrega Ajenos': 'bg-orange-100 text-orange-800',
    'Entrega': 'bg-cyan-100 text-cyan-800',
  };

  const iconos: Record<NonNullable<Etiqueta>, string> = {
    'Recoleccion Ajenos': '📥',
    'Entrega Ajenos': '📦',
    'Entrega': '📤',
  };

  return (
    <span className={`${base} ${estilos[etiquetaFinal]}`}>
      {iconos[etiquetaFinal]} {etiquetaFinal}
    </span>
  );
}

// (El componente EstadoBadge y formatDate se mantienen igual)
function EstadoBadge({ estado }: { estado: Order['status'] }) {
  const base =
    'inline-flex items-center px-2 py-1 rounded text-xs font-medium gap-1';
  const estilos: Record<Order['status'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    procesando: 'bg-blue-100 text-blue-800',
    produccion: 'bg-purple-100 text-purple-800',
    en_distribucion: 'bg-indigo-100 text-indigo-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  const iconos: Record<Order['status'], string> = {
    pendiente: '⏳',
    procesando: '🧾',
    produccion: '🏭',
    en_distribucion: '🚚',
    completado: '✅',
    cancelado: '❌',
  };
  const nombresAmigables: Record<Order['status'], string> = {
    pendiente: 'Pendiente',
    procesando: 'Verificación',
    produccion: 'Producción',
    en_distribucion: 'Distribución',
    completado: 'Finalizado',
    cancelado: 'Cancelado',
  };

  return (
    <span className={`${base} ${estilos[estado]}`}>
      {iconos[estado]} {nombresAmigables[estado]}
    </span>
  );
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Sin fecha';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// 3. Componente Principal DashboardClient
export default function DashboardClient({ user, orders }: DashboardClientProps) {
  const pedidosActivos = orders.filter(
    (o) => o.status !== 'completado' && o.status !== 'cancelado'
  );
  const pedidosFinalizados = orders.filter((o) => o.status === 'completado');

  return (
    <div className="space-y-10 font-sans text-black">
      {/* 🚚 Pedidos activos */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          🚚 Pedidos activos
        </h2>

        {pedidosActivos.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos activos.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosActivos.map((order) => (
              <li
                key={order._id}
                className="p-4 bg-gray-50 rounded-xl shadow border border-gray-200 space-y-2"
              >
                <div className="text-sm text-gray-800 font-semibold">
                  {order.products
                    ?.map(
                      (p) => `${p.quantity}x ${p.name || 'Producto desconocido'}`
                    )
                    .join(', ') || 'Sin productos'}
                </div>

                <div className="text-xs text-gray-500">
                  📅 {formatDate(order.createdAt)}
                </div>

                <div className="flex items-center gap-4">
                  {/* 🟢 LLamada a EtiquetaBadge */}
                  <EtiquetaBadge etiqueta={order.products[0]?.etiqueta} />
                  <OrderStepper estado={order.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      ---

      {/* ✅ Pedidos finalizados */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          ✅ Pedidos finalizados
        </h2>

        {pedidosFinalizados.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos finalizados aún.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosFinalizados.map((order) => (
              <li
                key={order._id}
                className="p-4 bg-gray-50 rounded-xl shadow border border-gray-200"
              >
                <div className="text-sm text-gray-800 font-semibold">
                  {order.products
                    ?.map(
                      (p) => `${p.quantity}x ${p.name || 'Producto desconocido'}`
                    )
                    .join(', ') || 'Sin productos'}
                </div>

                <div className="text-xs text-gray-500">
                  📅 {formatDate(order.createdAt)}
                </div>

                {/* 🟢 LLamada a EtiquetaBadge */}
                <EtiquetaBadge etiqueta={order.products[0]?.etiqueta} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}