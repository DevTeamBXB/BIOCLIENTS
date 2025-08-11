import clsx from "clsx";

interface StepperProps {
  estado: 'Pendiente' | 'Enviado' | 'Entregado';
}

const estados: StepperProps['estado'][] = ['Pendiente', 'Enviado', 'Entregado'];

export default function OrderStepper({ estado }: StepperProps) {
  const currentIndex = estados.indexOf(estado);

  return (
    <div className="mt-4 px-4">
      <div className="flex justify-between items-center relative max-w-md mx-auto">
        {estados.map((label, index) => {
          const isActive = index <= currentIndex;
          const isLast = index === estados.length - 1;

          return (
            <div key={label} className="relative flex-1 flex flex-col items-center text-center">
              {/* Punto */}
              <div className={clsx(
                "w-4 h-4 rounded-full border-2 z-10",
                isActive ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
              )} />

              {/* Etiqueta */}
              <span className="mt-2 text-xs text-gray-600">{label}</span>

              {/* Línea a la derecha */}
              {!isLast && (
                <div className={clsx(
                  "absolute top-2 left-1/2 h-0.5 w-full z-0",
                  isActive ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
