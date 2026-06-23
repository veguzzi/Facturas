"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, History, LogOut, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchInvoices, fetchInvoiceById, deleteInvoice } from "@/lib/db";
import { useInvoiceStore } from "@/lib/store";
import { formatCOP } from "@/lib/calculator";
import { INVOICE_TYPE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui";
import type { Invoice } from "@/lib/types";

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  invoice_type: string;
  issue_date: string | null;
  customer_name: string | null;
  grand_total: number;
  status: string;
  created_at: string;
};

export default function MisFacturasPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?next=/mis-facturas");
      return;
    }
    if (user) {
      fetchInvoices().then((data) => {
        setInvoices(data as InvoiceRow[]);
        setFetching(false);
      });
    }
  }, [user, loading, router]);

  async function handleView(row: InvoiceRow) {
    const saved = await fetchInvoiceById(row.id);
    if (saved?.data) {
      useInvoiceStore.setState((s) => ({
        ...s,
        invoice: saved.data as Invoice,
      }));
      router.push("/vista-previa");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta factura del historial?")) return;
    const ok = await deleteInvoice(id);
    if (ok) setInvoices((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading || (user && fetching)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <ReceiptText className="h-5 w-5 text-primary" />
            Factura<span className="-ml-1.5 text-primary">CO</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
            <Link href="/generar-v2">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Nueva factura
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Mis Facturas</h1>
            <p className="text-sm text-muted-foreground">
              {invoices.length}{" "}
              {invoices.length === 1
                ? "documento guardado"
                : "documentos guardados"}
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
            <FileText className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">
              Aún no tienes facturas guardadas
            </p>
            <p className="text-sm">
              Las facturas que generes se guardarán automáticamente aquí.
            </p>
            <Link href="/generar-v2">
              <Button>
                <Plus className="h-4 w-4" /> Crear primera factura
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {inv.invoice_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {INVOICE_TYPE_LABELS[
                        inv.invoice_type as keyof typeof INVOICE_TYPE_LABELS
                      ] ?? inv.invoice_type}
                    </td>
                    <td className="px-4 py-3">{inv.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.issue_date ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCOP(inv.grand_total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(inv)}
                        >
                          Ver PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
