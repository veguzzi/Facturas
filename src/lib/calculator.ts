import type {
  InvoiceItem,
  InvoiceTotals,
  ItemTaxType,
  TaxConfig,
  WithholdingConfig,
} from "./types";

/**
 * Calcula el dígito de verificación (DV) de un NIT colombiano.
 * Algoritmo módulo 11 con factores primos (DIAN).
 */
export function calculateDV(nit: string): string {
  const primes = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const clean = nit.replace(/[^0-9]/g, "");
  const digits = clean.padStart(15, "0").split("").map(Number);
  const sum = digits.reduce((acc, digit, i) => acc + digit * primes[i], 0);
  const remainder = sum % 11;
  if (remainder === 0) return "0";
  if (remainder === 1) return "1";
  return String(11 - remainder);
}

/**
 * Valida NIT colombiano (formato y DV).
 */
export function validateNIT(nit: string, dv: string): boolean {
  const cleanNIT = nit.replace(/[^0-9]/g, "");
  if (cleanNIT.length < 9 || cleanNIT.length > 10) return false;
  return calculateDV(cleanNIT) === dv;
}

export function getTaxRate(taxType: ItemTaxType): number {
  const rates: Record<ItemTaxType, number> = {
    iva_19: 19,
    iva_5: 5,
    iva_0: 0,
    excluido: 0,
    inc_8: 8,
    inc_4: 4,
    inc_16: 16,
  };
  return rates[taxType];
}

/**
 * Calcula los valores derivados de una línea individual.
 */
export function calculateLineItem(item: Partial<InvoiceItem>): InvoiceItem {
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const discountPercent = item.discount || 0;
  const taxType = item.taxType || "excluido";

  const subtotal = quantity * unitPrice;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const totalAfterDiscount = subtotal - discountAmount;

  const taxRate = getTaxRate(taxType);
  const taxAmount =
    taxType === "excluido" ? 0 : Math.round(totalAfterDiscount * (taxRate / 100));

  const totalWithTax = totalAfterDiscount + taxAmount;

  return {
    ...item,
    quantity,
    unitPrice,
    discount: discountPercent,
    taxType,
    subtotal,
    discountAmount,
    totalAfterDiscount,
    taxRate,
    taxAmount,
    totalWithTax,
  } as InvoiceItem;
}

/**
 * Calcula todos los totales de la factura.
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxConfig: TaxConfig,
  withholdings: WithholdingConfig
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxableBase = subtotal - totalDiscount;

  const totalIVA = items
    .filter((i) => ["iva_19", "iva_5", "iva_0"].includes(i.taxType))
    .reduce((sum, item) => sum + item.taxAmount, 0);

  const totalINC = items
    .filter((i) => ["inc_8", "inc_4", "inc_16"].includes(i.taxType))
    .reduce((sum, item) => sum + item.taxAmount, 0);

  const totalICA = taxConfig.includeICA
    ? Math.round(taxableBase * (taxConfig.icaRate / 1000))
    : 0;

  const totalTax = totalIVA + totalINC + totalICA;
  const totalBeforeWithholdings = taxableBase + totalTax;

  let totalReteFuente = 0;
  let totalReteIVA = 0;
  let totalReteICA = 0;

  if (withholdings.includeWithholdings) {
    if (withholdings.applyReteFuente) {
      totalReteFuente = Math.round(taxableBase * (withholdings.reteFuenteRate / 100));
    }
    if (withholdings.applyReteIVA && totalIVA > 0) {
      totalReteIVA = Math.round(totalIVA * (withholdings.reteIVARate / 100));
    }
    if (withholdings.applyReteICA) {
      totalReteICA = Math.round(taxableBase * (withholdings.reteICARate / 1000));
    }
  }

  const totalWithholdings = totalReteFuente + totalReteIVA + totalReteICA;
  const grandTotal = totalBeforeWithholdings - totalWithholdings;

  return {
    subtotal,
    totalDiscount,
    taxableBase,
    totalIVA,
    totalINC,
    totalICA,
    totalTax,
    totalBeforeWithholdings,
    totalReteFuente,
    totalReteIVA,
    totalReteICA,
    totalWithholdings,
    grandTotal,
    totalInWords: numberToWords(grandTotal),
  };
}

/**
 * Formatea moneda colombiana. Ej: 1500000 → "$1.500.000"
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

const UNIDADES = [
  "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS",
  "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
];

const DECENAS = [
  "", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA",
  "OCHENTA", "NOVENTA",
];

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
];

function twoDigitsToWords(n: number): string {
  if (n <= 20) return UNIDADES[n];
  if (n < 30) return "VEINTI" + UNIDADES[n - 20];
  const tens = Math.floor(n / 10);
  const units = n % 10;
  if (units === 0) return DECENAS[tens];
  return DECENAS[tens] + " Y " + UNIDADES[units];
}

function threeDigitsToWords(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const restWords = twoDigitsToWords(rest);
  if (hundreds === 0) return restWords;
  return (CENTENAS[hundreds] + (restWords ? " " + restWords : "")).trim();
}

/**
 * Convierte un entero a palabras en español. Soporta hasta billones.
 */
function integerToWords(num: number): string {
  if (num === 0) return "CERO";

  const billones = Math.floor(num / 1_000_000_000_000);
  const millones = Math.floor((num % 1_000_000_000_000) / 1_000_000);
  const miles = Math.floor((num % 1_000_000) / 1000);
  const resto = num % 1000;

  const parts: string[] = [];

  if (billones > 0) {
    parts.push(billones === 1 ? "UN BILLÓN" : threeDigitsToWords(billones) + " BILLONES");
  }
  if (millones > 0) {
    parts.push(millones === 1 ? "UN MILLÓN" : numberSegment(millones) + " MILLONES");
  }
  if (miles > 0) {
    parts.push(miles === 1 ? "MIL" : numberSegment(miles) + " MIL");
  }
  if (resto > 0) {
    parts.push(numberSegment(resto));
  }

  return parts.join(" ").trim();
}

/** Convierte un segmento de hasta 6 cifras a palabras (para millones/miles). */
function numberSegment(n: number): string {
  if (n < 1000) return threeDigitsToWords(n);
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const milesWords = miles === 1 ? "MIL" : threeDigitsToWords(miles) + " MIL";
  return (milesWords + (resto > 0 ? " " + threeDigitsToWords(resto) : "")).trim();
}

/**
 * Convierte número a palabras en español colombiano con sufijo monetario.
 * Ej: 1500000 → "UN MILLÓN QUINIENTOS MIL PESOS M/CTE"
 */
export function numberToWords(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const words = integerToWords(rounded);
  return `${words} PESOS M/CTE`;
}
