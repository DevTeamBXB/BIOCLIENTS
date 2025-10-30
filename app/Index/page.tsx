import Link from 'next/link';

type CardProps = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

function Card({ title, description, href, external = false }: CardProps) {
  const baseClasses =
    "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transition-shadow duration-300 p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:scale-[1.02]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        <span className="text-2xl font-bold text-green-700 mb-2">{title}</span>
        <p className="text-gray-500 text-sm">{description}</p>
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      <span className="text-2xl font-bold text-green-700 mb-2">{title}</span>
      <p className="text-gray-500 text-sm">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 px-4 py-12">
      <div className="grid gap-8 max-w-5xl w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <Card
          title="Mi Dashboard"
          description="Accede a tu panel de usuario"
          href="/dashboard"
        />
        <Card
          title="Realizar Pedido"
          description="Crea una nueva orden rápidamente"
          href="/ordersmenu"
        />
        <Card
          title="Soporte Técnico"
          description="Chatea con nuestro equipo por WhatsApp"
          href="https://wa.me/573053824464"
          external
        />
      </div>
    </main>
  );
}
