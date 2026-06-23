import { supabase } from "./supabase";
import type { Invoice } from "./types";

export async function saveInvoice(
  userId: string,
  invoice: Invoice
): Promise<string | null> {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      invoice_number: invoice.invoiceNumber,
      invoice_type: invoice.invoiceType,
      prefix: invoice.prefix,
      consecutive: invoice.consecutive,
      status: "generated",
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate ?? null,
      currency: invoice.currency,
      customer_name: invoice.customer.legalName || null,
      customer_document: invoice.customer.documentNumber || null,
      subtotal: invoice.totals.subtotal,
      total_iva: invoice.totals.totalIVA,
      total_before_withholdings: invoice.totals.totalBeforeWithholdings,
      total_withholdings: invoice.totals.totalWithholdings,
      grand_total: invoice.totals.grandTotal,
      data: invoice as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving invoice:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, invoice_type, issue_date, customer_name, grand_total, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function fetchInvoiceById(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  return !error;
}
