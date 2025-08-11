'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import OrderStepper from './OrderStepper';

interface OrderProduct {
  name: string;
  quantity: number;
}

interface Order {
  _id: string;
  estado: 'Pendiente' | 'Enviado' | 'Entregado';
  creado_en: string;
  products: OrderProduct[];
}

interface User {
  name: string;
  email: string;
  // Agrega más campos si es necesario
}

interface DashboardClientProps {
  user: User;
  orders: Order[];
  consumoMensual: { mes: string; m3: number }[];
}

// ✅ Componente separado para mostrar el estado con estilos
function EstadoBadge({ estado }: { estado: Order['estado'] }) {
  const base = 'inline-block px-2 py-0.5 rounded text-xs font-medium';
  const estilos: Record<Order['estado'], string> = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Enviado: 'bg-blue-100 text-blue-800',
    Entregado: 'bg-green-100 text-green-800',
  };

  const iconos: Record<Order['estado'], string> = {
    Pendiente: '⏳',
    Enviado: '🚚',
    Entregado: '✅',
  };

  return (
    <span className={`${base} ${estilos[estado]}`}>
      {iconos[estado]} {estado}
    </span>
  );
}

// ✅ Helper para formatear fechas
const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('es-CO').format(new Date(dateStr));

export default function DashboardClient({
  user,
  orders,
  consumoMensual
}: DashboardClientProps) {
  // ✅ Clasifica en un solo recorrido
  const pedidosActivos: Order[] = [];
  const pedidosFinalizados: Order[] = [];

  for (const o of orders) {
    if (o.estado === 'Entregado') {
      pedidosFinalizados.push(o);
    } else {
      pedidosActivos.push(o);
    }
  }

  const consumoMesActual = consumoMensual.at(-1)?.m3 ?? 0;

  return (
    <div className="space-y-10 font-sans text-black">

      {/* Consumo del mes */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">📊 Consumo del mes</h2>
        <p className="text-4xl font-bold text-green-600">{consumoMesActual.toFixed(2)} m³</p>
      </section>

      {/* Gráfica */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de consumo mensual</h2>
        {consumoMensual.length < 2 ? (
          <p className="text-gray-500 text-sm">No hay datos suficientes para mostrar la gráfica.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={consumoMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="m3"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Pedidos activos */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🚚 Pedidos activos</h2>
        {pedidosActivos.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos activos.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosActivos.map(order => (
              <li
                key={order._id}
                className="p-4 bg-gray-50 rounded-xl shadow border border-gray-200 space-y-2"
              >
                <div className="text-sm text-gray-800 font-semibold">
                  {order.products.map(p => `${p.quantity}x ${p.name}`).join(', ')}
                </div>
                <div className="text-xs text-gray-500">📅 {formatDate(order.creado_en)}</div>
                <EstadoBadge estado={order.estado} />
                <OrderStepper estado={order.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pedidos entregados */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">✅ Pedidos entregados</h2>
        {pedidosFinalizados.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos entregados aún.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosFinalizados.map(order => (
              <li
                key={order._id}
                className="p-4 bg-gray-50 rounded-xl shadow border border-gray-200"
              >
                <div className="text-sm text-gray-800 font-semibold">
                  {order.products.map(p => `${p.quantity}x ${p.name}`).join(', ')}
                </div>
                <div className="text-xs text-gray-500">📅 {formatDate(order.creado_en)}</div>
                <EstadoBadge estado={order.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
