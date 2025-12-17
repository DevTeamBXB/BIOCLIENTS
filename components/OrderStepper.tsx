import clsx from "clsx";

// --- SIMULACIÓN DE COMPONENTES DE ICONOS ---
// NOTA: Reemplaza estas funciones con la importación real de tu librería de iconos.
// Ej: import { Clock, Package, CheckCircle, Truck, XCircle, Search } from 'lucide-react';
const IconoClock = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconoSearch = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconoFactory = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V12h-4v9m-4 0V9H7v12M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconoTruck = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const IconoCheck = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconoX = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
// ---------------------------------------------


interface StepperProps {
  estado:
    | "pendiente"
    | "procesando"
    | "produccion"
    | "en_distribucion"
    | "cancelado"
    | "completado";
}

// Estados reales en orden
const estados: StepperProps["estado"][] = [
  "pendiente",
  "procesando",
  "produccion",
  "en_distribucion",
  "completado",
];

// Mapeo de nombres visibles + iconos profesionales
const etiquetasCliente: Record<StepperProps["estado"], { name: string; icon: React.FC }> = {
  pendiente: { name: "Pendiente", icon: IconoClock },
  procesando: { name: "Verificación", icon: IconoSearch },
  produccion: { name: "Producción", icon: IconoFactory },
  en_distribucion: { name: "Distribución", icon: IconoTruck },
  completado: { name: "Completado", icon: IconoCheck },
  cancelado: { name: "Cancelado", icon: IconoX },
};

export default function OrderStepper({ estado }: StepperProps) {
  const estadoNormalizado = estado?.toLowerCase() as StepperProps["estado"];
  const currentIndex = estados.indexOf(estadoNormalizado);
  const isCanceled = estadoNormalizado === "cancelado";

  if (isCanceled) {
    return (
      <div className="mt-4 px-4 text-center">
        <p className="text-base font-semibold text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 shadow-sm flex items-center justify-center gap-2">
          <IconoX /> Pedido Cancelado
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 px-2 sm:px-4 w-full">
      {/* Estructura Responsive: Ajuste de espaciado en móvil, ancho fijo en escritorio */}
      <div className="flex justify-between items-start relative max-w-4xl mx-auto py-2">
        {estados.map((label, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === estados.length - 1;
          const IconComponent = etiquetasCliente[label].icon;

          // Clases de color: Usaremos un azul/índigo sobrio para el progreso
          const activeBg = "bg-green-600 border-green-700 text-white";
          const inactiveBg = "bg-white border-gray-300 text-gray-400";
          const activeText = "text-gray-600 font-semibold";
          const inactiveText = "text-gray-500";
          const activeLine = "bg-green-500";
          const inactiveLine = "bg-gray-300";

          return (
            <div
              key={label}
              className="relative flex-1 flex flex-col items-center text-center px-1" // Más compacto
            >
              {/* Línea de conexión */}
              {!isLast && (
                // Línea Horizontal: Ocupa todo el ancho disponible entre puntos
                <div
                  className={clsx(
                    "absolute top-4 left-[50%] right-[-50%] h-0.5 z-0 transition-colors duration-300",
                    isActive ? activeLine : inactiveLine
                  )}
                />
              )}

              {/* Punto con Icono */}
              <div
                className={clsx(
                  "w-8 h-8 rounded-full border-2 z-10 transition-all duration-500 flex items-center justify-center shadow-md",
                  isActive ? activeBg : inactiveBg,
                  {
                    "shadow-lg ring-4 ring-indigo-200": isCurrent, // Anillo y sombra para el paso actual
                    "bg-green-600 border-green-600": isLast && isActive, // Completado en verde fuerte
                  }
                )}
              >
                <IconComponent />
              </div>

              {/* Etiqueta */}
              <span
                className={clsx(
                  "mt-2 text-xs transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis w-full px-1", // Aseguramos que el texto no rompa el diseño
                  isCurrent ? activeText : inactiveText,
                  { "font-normal": !isCurrent } // Normal para inactivos, semibold para el actual
                )}
              >
                {etiquetasCliente[label].name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}