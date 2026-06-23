import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateInvoiceTotals, calculateLineItem } from "./calculator";
import { CONSUMIDOR_FINAL, DEFAULT_BRAND_COLOR } from "./constants";
import type {
  CustomerInfo,
  Invoice,
  InvoiceItem,
  PartyInfo,
  PaymentInfo,
  TaxConfig,
  WithholdingConfig,
} from "./types";
import { uuid } from "./utils";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyIssuer(): PartyInfo {
  return {
    documentType: "31",
    documentNumber: "",
    dv: "",
    legalName: "",
    tradeName: "",
    address: "",
    city: "",
    department: "",
    postalCode: "",
    country: "Colombia",
    phone: "",
    email: "",
    taxRegime: "ordinario",
    fiscalResponsibilities: ["O-48"],
    economicActivity: "",
    logoUrl: null,
    brandColor: DEFAULT_BRAND_COLOR,
  };
}

function emptyCustomer(): CustomerInfo {
  return {
    documentType: "13",
    documentNumber: "",
    legalName: "",
    dv: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    taxRegime: null,
    isGranContribuyente: false,
    isAgentRetencion: false,
    isSelfRetainer: false,
  };
}

function defaultTaxConfig(): TaxConfig {
  return {
    isResponsibleIVA: true,
    isResponsibleINC: false,
    defaultIVARate: 19,
    includeICA: false,
    icaRate: 0,
    icaMunicipality: "",
  };
}

function defaultWithholdings(): WithholdingConfig {
  return {
    includeWithholdings: false,
    applyReteFuente: false,
    reteFuenteRate: 0,
    reteFuenteConcept: "no_aplica",
    applyReteIVA: false,
    reteIVARate: 15,
    applyReteICA: false,
    reteICARate: 0,
  };
}

function defaultPayment(): PaymentInfo {
  return {
    paymentForm: "contado",
    paymentMethod: "transferencia",
    bankName: "",
    accountType: null,
    accountNumber: "",
    accountHolder: "",
    paymentTermDays: null,
  };
}

export function newItem(lineNumber: number): InvoiceItem {
  return calculateLineItem({
    id: uuid(),
    lineNumber,
    description: "",
    quantity: 1,
    unitOfMeasure: "EA",
    unitPrice: 0,
    discount: 0,
    taxType: "iva_19",
  });
}

export function createEmptyInvoice(): Invoice {
  const items = [newItem(1)];
  const taxConfig = defaultTaxConfig();
  const withholdings = defaultWithholdings();
  return {
    id: uuid(),
    createdAt: new Date().toISOString(),
    status: "draft",
    invoiceNumber: "FACT001",
    prefix: "FACT",
    consecutive: 1,
    issueDate: todayISO(),
    dueDate: null,
    invoiceType: "factura_venta",
    currency: "COP",
    exchangeRate: null,
    resolution: null,
    issuer: emptyIssuer(),
    customer: emptyCustomer(),
    items,
    taxConfig,
    withholdings,
    payment: defaultPayment(),
    totals: calculateInvoiceTotals(items, taxConfig, withholdings),
    notes: "",
    internalNotes: "",
  };
}

interface SavedCustomer extends CustomerInfo {
  savedAt: string;
}

interface InvoiceStore {
  invoice: Invoice;
  currentStep: number;
  savedIssuer: PartyInfo | null;
  savedCustomers: SavedCustomer[];
  lastConsecutive: Record<string, number>;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  recalc: () => void;
  patchInvoice: (patch: Partial<Invoice>) => void;
  patchIssuer: (patch: Partial<PartyInfo>) => void;
  patchCustomer: (patch: Partial<CustomerInfo>) => void;
  patchTaxConfig: (patch: Partial<TaxConfig>) => void;
  patchWithholdings: (patch: Partial<WithholdingConfig>) => void;
  patchPayment: (patch: Partial<PaymentInfo>) => void;

  addItem: () => void;
  updateItem: (id: string, patch: Partial<InvoiceItem>) => void;
  duplicateItem: (id: string) => void;
  removeItem: (id: string) => void;

  setConsumidorFinal: () => void;
  saveIssuerProfile: () => void;
  loadIssuerProfile: () => void;
  saveCustomer: () => void;
  loadCustomer: (documentNumber: string) => void;
  resetInvoice: () => void;
}

function withTotals(invoice: Invoice): Invoice {
  const items = invoice.items.map((it, idx) =>
    calculateLineItem({ ...it, lineNumber: idx + 1 })
  );
  return {
    ...invoice,
    items,
    invoiceNumber: `${invoice.prefix}${invoice.consecutive}`,
    totals: calculateInvoiceTotals(items, invoice.taxConfig, invoice.withholdings),
  };
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoice: createEmptyInvoice(),
      currentStep: 1,
      savedIssuer: null,
      savedCustomers: [],
      lastConsecutive: {},

      setStep: (step) => set({ currentStep: Math.max(1, Math.min(5, step)) }),
      nextStep: () => set((s) => ({ currentStep: Math.min(5, s.currentStep + 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),

      recalc: () => set((s) => ({ invoice: withTotals(s.invoice) })),

      patchInvoice: (patch) =>
        set((s) => ({ invoice: withTotals({ ...s.invoice, ...patch }) })),
      patchIssuer: (patch) =>
        set((s) => ({
          invoice: withTotals({ ...s.invoice, issuer: { ...s.invoice.issuer, ...patch } }),
        })),
      patchCustomer: (patch) =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            customer: { ...s.invoice.customer, ...patch },
          }),
        })),
      patchTaxConfig: (patch) =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            taxConfig: { ...s.invoice.taxConfig, ...patch },
          }),
        })),
      patchWithholdings: (patch) =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            withholdings: { ...s.invoice.withholdings, ...patch },
          }),
        })),
      patchPayment: (patch) =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            payment: { ...s.invoice.payment, ...patch },
          }),
        })),

      addItem: () =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            items: [...s.invoice.items, newItem(s.invoice.items.length + 1)],
          }),
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            items: s.invoice.items.map((it) =>
              it.id === id ? calculateLineItem({ ...it, ...patch }) : it
            ),
          }),
        })),
      duplicateItem: (id) =>
        set((s) => {
          const idx = s.invoice.items.findIndex((it) => it.id === id);
          if (idx === -1) return s;
          const copy = { ...s.invoice.items[idx], id: uuid() };
          const items = [...s.invoice.items];
          items.splice(idx + 1, 0, copy);
          return { invoice: withTotals({ ...s.invoice, items }) };
        }),
      removeItem: (id) =>
        set((s) => {
          if (s.invoice.items.length <= 1) return s;
          return {
            invoice: withTotals({
              ...s.invoice,
              items: s.invoice.items.filter((it) => it.id !== id),
            }),
          };
        }),

      setConsumidorFinal: () =>
        set((s) => ({
          invoice: withTotals({
            ...s.invoice,
            customer: { ...emptyCustomer(), ...CONSUMIDOR_FINAL },
          }),
        })),

      saveIssuerProfile: () => set((s) => ({ savedIssuer: s.invoice.issuer })),
      loadIssuerProfile: () =>
        set((s) =>
          s.savedIssuer
            ? { invoice: withTotals({ ...s.invoice, issuer: s.savedIssuer }) }
            : s
        ),
      saveCustomer: () =>
        set((s) => {
          const c = s.invoice.customer;
          if (!c.documentNumber || !c.legalName) return s;
          const others = s.savedCustomers.filter(
            (x) => x.documentNumber !== c.documentNumber
          );
          return {
            savedCustomers: [
              { ...c, savedAt: new Date().toISOString() },
              ...others,
            ].slice(0, 20),
          };
        }),
      loadCustomer: (documentNumber) =>
        set((s) => {
          const found = s.savedCustomers.find(
            (x) => x.documentNumber === documentNumber
          );
          return found
            ? { invoice: withTotals({ ...s.invoice, customer: { ...found } }) }
            : s;
        }),

      resetInvoice: () =>
        set((s) => {
          const prefix = s.invoice.prefix;
          const lastUsed = s.invoice.consecutive;
          const lastConsecutive = {
            ...s.lastConsecutive,
            [prefix]: lastUsed,
          };
          const fresh = createEmptyInvoice();
          // Reutiliza el perfil del emisor y avanza el consecutivo
          const issuer = s.savedIssuer ?? s.invoice.issuer;
          const nextConsecutive = (lastConsecutive[prefix] ?? 0) + 1;
          return {
            lastConsecutive,
            currentStep: 1,
            invoice: withTotals({
              ...fresh,
              issuer,
              prefix,
              consecutive: nextConsecutive,
            }),
          };
        }),
    }),
    {
      name: "facturaco-store",
      partialize: (s) => ({
        invoice: s.invoice,
        savedIssuer: s.savedIssuer,
        savedCustomers: s.savedCustomers,
        lastConsecutive: s.lastConsecutive,
      }),
    }
  )
);
