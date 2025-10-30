import Link from "next/link";
import {
  FlaskRound,
  Stethoscope,
} from "lucide-react"; // puedes agregar más si lo deseas

type CardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

function Card({ title, description, href, icon, external = false }: CardProps) {
  const baseClasses =
    "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02] border border-green-100";

  const content = (
    <>
      <div className="mb-6 flex justify-center items-center w-20 h-20 rounded-full bg-green-50 border border-green-200 shadow-inner">
        <div className="text-green-600">{icon}</div>
      </div>
      <span className="text-2xl font-bold text-green-700 mb-2">{title}</span>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 px-4 py-12">
      <div className="grid gap-8 max-w-5xl w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {/* 🧪 Oxígeno Medicinal */}
        <Card
          title="Oxígeno Medicinal"
          description="Cilindros, termos y suministro hospitalario de oxígeno."
          href="/orders/new"
          icon={<FlaskRound size={56} strokeWidth={1.5} />}
        />

        {/* 💉 Equipos Biomédicos */}
        <Card
          title="Equipos Biomédicos"
          description="Concentradores, línea del sueño y equipos hospitalarios."
          href="/otherorder/orders/biomedicalequipment"
          icon={<Stethoscope size={56} strokeWidth={1.5} />}
        />
      </div>
    </main>
  );
}
