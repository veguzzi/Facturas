"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FilePlus2, History, LogOut, Pencil, ReceiptText } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui";

const PdfViewerClient = dynamic(
  () => import("@/components/invoice/PdfViewerClient").then((m) => m.PdfViewerClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
        Generando PDF…
      </div>
    ),
  }
);

export default function VistaPreviaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const invoice = useInvoiceStore((s) => s.invoice);
  const setStep = useInvoiceStore((s) => s.setStep);
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice);
  const { user, signOut } = useAuth();

  useEffect(() => setMounted(true), []);

  function handleEdit() {
    setStep(1);
    router.push("/generar-v2");
  }

  function handleNew() {
    resetInvoice();
    router.push("/generar-v2");
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
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
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleNew}>
              <FilePlus2 className="h-4 w-4" /> Nueva factura
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">
            {invoice.invoiceNumber} — Lista para descargar
          </h1>
          <p className="text-sm text-muted-foreground">
            Revisa tu documento y descárgalo en PDF.
          </p>
        </div>

        <PdfViewerClient invoice={invoice} />
      </main>
    </div>
  );
}
