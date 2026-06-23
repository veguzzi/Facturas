"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  ReceiptText,
  X,
} from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import {
  validateCustomer,
  validateIssuer,
  validateItems,
  validatePayment,
} from "@/lib/validators";
import { Button } from "@/components/ui";
import { Step1Emisor } from "./Step1Emisor";
import { Step2Receptor } from "./Step2Receptor";
import { Step3Items } from "./Step3Items";
import { Step4Impuestos } from "./Step4Impuestos";
import { Step5Pago } from "./Step5Pago";
import { InvoicePreview } from "./InvoicePreview";

const STEPS = ["Emisor", "Cliente", "Productos", "Impuestos", "Pago"];

export function InvoiceForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [stepError, setStepError] = useState<string | null>(null);

  const invoice = useInvoiceStore((s) => s.invoice);
  const currentStep = useInvoiceStore((s) => s.currentStep);
  const setStep = useInvoiceStore((s) => s.setStep);
  const nextStep = useInvoiceStore((s) => s.nextStep);
  const prevStep = useInvoiceStore((s) => s.prevStep);

  useEffect(() => setMounted(true), []);

  function validateCurrent(): boolean {
    setFieldErrors({});
    setStepError(null);
    if (currentStep === 1) {
      const errs = validateIssuer(invoice.issuer);
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        return false;
      }
    }
    if (currentStep === 2) {
      const errs = validateCustomer(invoice.customer);
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        return false;
      }
    }
    if (currentStep === 3) {
      const err = validateItems(invoice.items);
      if (err) {
        setStepError(err);
        return false;
      }
    }
    if (currentStep === 5) {
      const err = validatePayment(invoice);
      if (err) {
        setStepError(err);
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateCurrent()) return;
    if (currentStep === 5) {
      handleGenerate();
      return;
    }
    nextStep();
    window.scrollTo({ top: 0 });
  }

  function handleGenerate() {
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
    router.push("/vista-previa");
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <ReceiptText className="h-5 w-5 text-primary" />
            Factura<span className="-ml-1.5 text-primary">CO</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4" /> Vista previa
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <ol className="flex items-center gap-1 sm:gap-2">
          {STEPS.map((label, i) => {
            const step = i + 1;
            const active = step === currentStep;
            const done = step < currentStep;
            return (
              <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => step < currentStep && setStep(step)}
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-primary/20 text-primary cursor-pointer"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {done ? <Check className="h-4 w-4" /> : step}
                </button>
                <span
                  className={
                    "hidden text-xs sm:inline " +
                    (active ? "font-semibold text-foreground" : "text-muted-foreground")
                  }
                >
                  {label}
                </span>
                {step < STEPS.length && (
                  <span className="h-px flex-1 bg-border" />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Split layout */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            {currentStep === 1 && <Step1Emisor errors={fieldErrors} />}
            {currentStep === 2 && <Step2Receptor errors={fieldErrors} />}
            {currentStep === 3 && (
              <Step3Items error={stepError ?? undefined} />
            )}
            {currentStep === 4 && <Step4Impuestos />}
            {currentStep === 5 && <Step5Pago error={stepError ?? undefined} />}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                prevStep();
                window.scrollTo({ top: 0 });
              }}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </Button>
            <Button onClick={handleNext}>
              {currentStep === 5 ? (
                <>
                  Generar factura <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Siguiente <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview (desktop) */}
        <div className="hidden min-w-0 lg:block">
          <div className="sticky top-20">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Vista previa en vivo
            </p>
            <div className="max-h-[80vh] overflow-auto rounded-xl border border-border bg-slate-100 p-3">
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal (mobile) */}
      {showPreview && (
        <div className="fixed inset-0 z-30 flex flex-col bg-black/50 lg:hidden">
          <div className="flex items-center justify-between bg-background p-3">
            <span className="font-semibold">Vista previa</span>
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 p-3">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      )}
    </div>
  );
}
