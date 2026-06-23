import { z } from "zod";
import { calculateDV } from "./calculator";
import type { Invoice } from "./types";

const today = () => new Date().toISOString().slice(0, 10);

export const issuerSchema = z
  .object({
    documentType: z.string(),
    documentNumber: z.string().min(5, "Número de documento requerido"),
    dv: z.string(),
    legalName: z.string().min(3, "Razón social / nombre requerido"),
    email: z.string().email("Email inválido").or(z.literal("")),
  })
  .refine(
    (d) => d.documentType !== "31" || calculateDV(d.documentNumber) === d.dv,
    { message: "El dígito de verificación no coincide", path: ["dv"] }
  );

export const customerSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string().min(3, "Número de documento requerido"),
  legalName: z.string().min(3, "Nombre / razón social requerido"),
  email: z.string().email("Email inválido").or(z.literal("")),
});

export const itemSchema = z.object({
  description: z.string().min(3, "Descripción mínima de 3 caracteres"),
  quantity: z.number().gt(0, "Cantidad debe ser mayor a 0"),
  unitPrice: z.number().gt(0, "Precio debe ser mayor a 0"),
  discount: z.number().min(0).max(100),
});

/** Valida un paso concreto del formulario y retorna errores por campo. */
export function validateIssuer(issuer: Invoice["issuer"]): Record<string, string> {
  return zodToErrors(issuerSchema.safeParse(issuer));
}

export function validateCustomer(customer: Invoice["customer"]): Record<string, string> {
  return zodToErrors(customerSchema.safeParse(customer));
}

export function validateItems(items: Invoice["items"]): string | null {
  if (items.length === 0) return "Agrega al menos una línea de factura";
  for (let i = 0; i < items.length; i++) {
    const r = itemSchema.safeParse(items[i]);
    if (!r.success) {
      const first = r.error.issues[0];
      return `Línea ${i + 1}: ${first.message}`;
    }
  }
  return null;
}

export function validatePayment(invoice: Invoice): string | null {
  if (!invoice.prefix && invoice.consecutive <= 0) {
    return "Indica el número/consecutivo de la factura";
  }
  if (invoice.issueDate > today()) {
    return "La fecha de expedición no puede ser futura";
  }
  if (invoice.payment.paymentForm === "credito" && invoice.dueDate) {
    if (invoice.dueDate < invoice.issueDate) {
      return "La fecha de vencimiento debe ser igual o posterior a la expedición";
    }
  }
  if (invoice.resolution) {
    const { rangeFrom, rangeTo } = invoice.resolution;
    if (
      rangeFrom &&
      rangeTo &&
      (invoice.consecutive < rangeFrom || invoice.consecutive > rangeTo)
    ) {
      return `El consecutivo ${invoice.consecutive} está fuera del rango autorizado (${rangeFrom}–${rangeTo})`;
    }
  }
  if (invoice.totals.grandTotal < 0) {
    return "El total no puede ser negativo";
  }
  return null;
}

function zodToErrors(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!result.success && result.error) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  return errors;
}
