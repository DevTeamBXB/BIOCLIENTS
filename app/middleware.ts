// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // callback: permite lógica adicional si quieres
  function middleware(req) {
    return NextResponse.next();
  },
  {
    // configuración de protección
    pages: {
      signIn: "/login", // redirige a esta ruta si no hay sesión
    },
  }
);

// 🔒 Define qué rutas proteger
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/ordersmenu/:path*",
    "/otherorder/:path*",
    "/Index/:path*",  // protege el "Index"
    "/api/orders/:path*", // protege APIs sensibles
  ],
};
