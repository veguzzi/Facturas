"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  History,
  LogOut,
  Package,
  Percent,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { saveInvoice } from "@/lib/db";
import {
  validateCustomer,
  validateIssuer,
  validateItems,
  validatePayment,
} from "@/lib/validators";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Step1Emisor } from "./Step1Emisor";
import { Step2Receptor } from "./Step2Receptor";
import { Step3Items } from "./Step3Items";
import { Step4Impuestos } from "./Step4Impuestos";
import { Step5Pago } from "./Step5Pago";
import { InvoicePreview } from "./InvoicePreview";

const SECTIONS = [
  { id: 1, title: "Datos del emisor", subtitle: "Tu negocio", icon: Building2 },
  { id: 2, title: "Datos del cliente", subtitle: "Receptor", icon: UserRound },
  { id: 3, title: "Productos / Servicios", subtitle: "Líneas de la factura", icon: Package },
  { id: 4, title: "Impuestos y retenciones", subtitle: "IVA, ICA, retenciones", icon: Percent },
  { id: 5, title: "Pago y detalles", subtitle: "Tipo, fechas, observaciones", icon: CreditCard },
];

export function InvoiceEditorAccordion() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true });
  const [issuerErrors, setIssuerErrors] = useState<Record<string, string>>({});
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});
  const [itemsError, setItemsError] = useState<string | undefined>();
  const [paymentError, setPaymentError] = useState<string | undefined>();

  const invoice = useInvoiceStore((s) => s.invoice);
  const { user, signOut } = useAuth();

  useEffect(() => setMounted(true), []);

  function toggle(id: number) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  async function handleGenerate() {
    const iErr = validateIssuer(invoice.issuer);
    const cErr = validateCustomer(invoice.customer);
    const itErr = validateItems(invoice.items);
    const pErr = validatePayment(invoice);

    setIssuerErrors(iErr);
    setCustomerErrors(cErr);
    setItemsError(itErr ?? undefined);
    setPaymentError(pErr ?? undefined);

    const failed: number[] = [];
    if (Object.keys(iErr).length) failed.push(1);
    if (Object.keys(cErr).length) failed.push(2);
    if (itErr) failed.push(3);
    if (pErr) failed.push(5);

    if (failed.length) {
      // Expande las secciones con error y enfoca la primera
      setOpen((o) => {
        const next = { ...o };
        failed.forEach((id) => (next[id] = true));
        return next;
      });
      document
        .getElementById(`section-${failed[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const store = useInvoiceStore.getState();
    store.saveIssuerProfile();
    store.saveCustomer();
    useInvoiceStore.setState((s) => ({
      invoice: { ...s.invoice, status: "generated" },
      lastConsecutive: {
        ...s.lastConsecutive,
        [s.invoice.prefix]: s.invoice.consecutive,
      },
    }));

    if (user) {
      const finalInvoice = useInvoiceStore.getState().invoice;
      await saveInvoice(user.id, finalInvoice);
    }

    router.push("/vista-previa");
  }

  function sectionError(id: number): boolean {
    if (id === 1) return Object.keys(issuerErrors).length > 0;
    if (id === 2) return Object.keys(customerErrors).length > 0;
    if (id === 3) return !!itemsError;
    if (id === 5) return !!paymentError;
    return false;
  }

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <ReceiptText className="h-5 w-5 text-primary" />
            Factura<span className="-ml-1.5 text-primary">CO</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {user.email}
                </span>
                <Link href="/mis-facturas">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" /> Mis facturas
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
            )}
            <Button onClick={handleGenerate}>
              Generar factura <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Two columns */}
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        {/* Left: live preview (sticky) */}
        <div className="order-2 min-w-0 lg:order-1">
          <div className="lg:sticky lg:top-20">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Vista previa de la factura
            </p>
            <div className="max-h-[calc(100vh-7rem)] overflow-auto rounded-xl border border-border bg-slate-100 p-3">
              <div className="min-w-[820px]">
                <InvoicePreview invoice={invoice} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: accordion editor */}
        <div className="order-1 min-w-0 space-y-3 lg:order-2">
          {SECTIONS.map((sec) => {
            const isOpen = !!open[sec.id];
            const hasError = sectionError(sec.id);
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                id={`section-${sec.id}`}
                className={cn(
                  "scroll-mt-20 overflow-hidden rounded-xl border bg-card",
                  hasError ? "border-destructive/60" : "border-border"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(sec.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      hasError
                        ? "bg-destructive text-white"
                        : "bg-accent text-primary"
                    )}
                  >
                    {sec.id}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {sec.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {hasError ? "Revisa los campos marcados" : sec.subtitle}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 sm:p-5">
                    {sec.id === 1 && <Step1Emisor errors={issuerErrors} />}
                    {sec.id === 2 && <Step2Receptor errors={customerErrors} />}
                    {sec.id === 3 && <Step3Items error={itemsError} />}
                    {sec.id === 4 && <Step4Impuestos />}
                    {sec.id === 5 && <Step5Pago error={paymentError} />}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <Button size="lg" onClick={handleGenerate}>
              Generar factura <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
