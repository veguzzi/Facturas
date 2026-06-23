import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Check,
  Download,
  FileText,
  Lock,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

const features = [
  {
    icon: Calculator,
    title: "Cálculo automático",
    desc: "IVA, INC, ICA y retenciones (ReteFuente, ReteIVA, ReteICA) calculados en tiempo real, además del dígito de verificación del NIT.",
  },
  {
    icon: FileText,
    title: "Formato legal Colombia",
    desc: "Campos según el Estatuto Tributario (Art. 615, 616-1, 617) y normativa DIAN vigente 2026.",
  },
  {
    icon: Download,
    title: "PDF profesional",
    desc: "Descarga un PDF listo para enviar a tu cliente, con tu logo y color de marca.",
  },
  {
    icon: Lock,
    title: "100% privado",
    desc: "Tus datos se guardan solo en tu navegador (localStorage). No subimos nada a ningún servidor.",
  },
  {
    icon: Wallet,
    title: "Total en letras",
    desc: "Conversión automática del valor a palabras en español colombiano (PESOS M/CTE).",
  },
  {
    icon: Sparkles,
    title: "Gratis, sin registro",
    desc: "Genera todas las facturas que necesites sin crear cuenta ni pagar nada.",
  },
];

const invoiceTypes = [
  {
    title: "Factura de venta",
    desc: "Documento de venta estándar con todos los campos legales.",
  },
  {
    title: "Cuenta de cobro",
    desc: "Para no obligados a facturar (personas naturales, servicios).",
  },
  {
    title: "Cotización / Proforma",
    desc: "Presupuestos profesionales con formato de factura.",
  },
];

const faqs = [
  {
    q: "¿Esta factura es válida ante la DIAN?",
    a: "FacturaCO genera la representación gráfica (PDF) de una factura con los campos legales correctos, pero NO es un proveedor tecnológico autorizado por la DIAN: no genera XML UBL 2.1, no firma digitalmente ni transmite a la DIAN. Es ideal para cuentas de cobro, cotizaciones y borradores. Para facturación electrónica validada usa un proveedor autorizado.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Es completamente gratis. No necesitas registrarte ni ingresar datos de pago.",
  },
  {
    q: "¿Dónde se guardan mis datos?",
    a: "Solo en tu navegador. Guardamos el perfil de tu negocio y tus clientes frecuentes en localStorage para que no tengas que escribirlos cada vez. Nada se envía a un servidor.",
  },
  {
    q: "¿Calcula las retenciones?",
    a: "Sí. Calcula ReteFuente, ReteIVA y ReteICA de forma informativa (las practica el comprador), validando las bases mínimas en UVT.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <ReceiptText className="h-6 w-6 text-primary" />
            <span>
              Factura<span className="text-primary">CO</span>
            </span>
          </Link>
          <Link
            href="/generar-v2"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Generar Factura
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center md:py-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Formato legal Colombia 2026 · Gratis
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Genera facturas profesionales para Colombia{" "}
          <span className="text-primary">en minutos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Crea facturas de venta, cuentas de cobro y cotizaciones en PDF, con
          cálculo automático de IVA, retenciones y dígito de verificación del
          NIT. Sin registro y 100% gratis.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/generar-v2"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground hover:opacity-90"
          >
            Generar Factura Gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex h-12 items-center rounded-md border border-input px-6 text-base font-medium hover:bg-muted"
          >
            Cómo funciona
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No requiere tarjeta · No requiere cuenta · Datos solo en tu navegador
        </p>
      </section>

      {/* Features */}
      <section id="como-funciona" className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Todo lo que necesitas para facturar
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invoice types */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Tipos de documento soportados
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {invoiceTypes.map((t) => (
              <div
                key={t.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <Check className="mb-3 h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-border bg-card p-5"
              >
                <summary className="cursor-pointer list-none font-medium">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Empieza a facturar gratis ahora</h2>
          <p className="mt-4 text-muted-foreground">
            Sin registros. Sin costos. Tu primera factura en menos de 2 minutos.
          </p>
          <Link
            href="/generar-v2"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground hover:opacity-90"
          >
            Generar Factura Gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
          <Disclaimer />
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ReceiptText className="h-5 w-5 text-primary" />
              FacturaCO
            </div>
            <p>© 2026 FacturaCO — Hecho para emprendedores en Colombia 🇨🇴</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
