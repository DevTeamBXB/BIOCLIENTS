import clsx from "clsx";

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

// Mapeo de nombres visibles + iconos
const etiquetasCliente: Record<StepperProps["estado"], string> = {
  pendiente: "🕓 Pendiente",
  procesando: "🔍 Verificación",
  produccion: "🏭 Producción",
  en_distribucion: "🚚 Distribución",
  completado: "✅ Completado",
  cancelado: "❌ Cancelado",
};

export default function OrderStepper({ estado }: StepperProps) {
  const estadoNormalizado = estado?.toLowerCase() as StepperProps["estado"];
  const currentIndex = estados.indexOf(estadoNormalizado);
  const isCanceled = estadoNormalizado === "cancelado";

  return (
    <div className="mt-4 px-4">
      <div className="flex justify-between items-center relative max-w-md mx-auto">
        {estados.map((label, index) => {
          const isActive = index <= currentIndex && !isCanceled;
          const isLast = index === estados.length - 1;

          return (
            <div
              key={label}
              className="relative flex-1 flex flex-col items-center text-center"
            >
              {/* Punto */}
              <div
                className={clsx(
                  "w-4 h-4 rounded-full border-2 z-10 transition-colors duration-300",
                  isCanceled
                    ? "bg-red-500 border-red-500"
                    : isActive
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-gray-300"
                )}
              />

              {/* Etiqueta visible al cliente */}
              <span
                className={clsx(
                  "mt-2 text-xs font-semibold transition-colors duration-300",
                  isCanceled
                    ? "text-red-600"
                    : isActive
                    ? "text-green-700"
                    : "text-gray-500"
                )}
              >
                {etiquetasCliente[label]}
              </span>

              {/* Línea de conexión */}
              {!isLast && (
                <div
                  className={clsx(
                    "absolute top-2 left-1/2 h-0.5 w-full z-0 transition-colors duration-300",
                    isCanceled
                      ? "bg-red-400"
                      : isActive
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {isCanceled && (
        <p className="text-center mt-3 text-sm text-red-600 font-semibold">
          Pedido cancelado ❌
        </p>
      )}
    </div>
  );
}
