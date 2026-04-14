import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Anyx Comercial",
  description: "Sistema interno comercial con cotizador y calculadoras"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

