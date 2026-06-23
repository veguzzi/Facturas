import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://facturaco.com"),
  title: {
    default: "FacturaCO — Generador Gratuito de Facturas para Colombia",
    template: "%s | FacturaCO",
  },
  description:
    "Genera facturas de venta, cuentas de cobro y cotizaciones en PDF gratis. Cálculo automático de IVA, retenciones y DV del NIT. Formato legal Colombia 2026.",
  keywords: [
    "generar factura colombia gratis",
    "factura electronica colombia gratis",
    "crear factura colombia",
    "generador de facturas colombia",
    "cuenta de cobro colombia",
    "factura de venta colombia pdf",
    "requisitos factura colombia 2026",
    "formato factura colombia",
  ],
  openGraph: {
    title: "FacturaCO — Generador Gratuito de Facturas para Colombia",
    description:
      "Genera facturas de venta, cuentas de cobro y cotizaciones en PDF gratis. IVA, retenciones y DV automáticos.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
