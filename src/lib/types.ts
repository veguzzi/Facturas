// === TIPOS DE FACTURA ===
export type InvoiceType =
  | "factura_venta"
  | "factura_exportacion"
  | "cuenta_cobro"
  | "cotizacion";

export type DocumentType = "13" | "31" | "22" | "41" | "42" | "50" | "91";

export type TaxRegime = "ordinario" | "simple" | "no_responsable";

export type FiscalResponsibility =
  | "O-48"
  | "O-15"
  | "O-23"
  | "O-13"
  | "O-47"
  | "R-99-PN"
  | "O-49";

export type ItemTaxType =
  | "iva_19"
  | "iva_5"
  | "iva_0"
  | "excluido"
  | "inc_8"
  | "inc_4"
  | "inc_16";

export type UnitOfMeasure =
  | "EA"
  | "HUR"
  | "DAY"
  | "MON"
  | "KGM"
  | "LTR"
  | "MTR"
  | "MTK"
  | "SET"
  | "XBX";

export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "consignacion"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "cheque"
  | "nequi"
  | "daviplata"
  | "otro";

export type ReteFuenteConcept =
  | "compras_generales"
  | "servicios_generales"
  | "honorarios_pj"
  | "honorarios_pn_declarante"
  | "honorarios_pn_no_decl"
  | "arrendamiento_inmuebles"
  | "arrendamiento_muebles"
  | "transporte_carga"
  | "transporte_pasajeros"
  | "otros_ingresos"
  | "software"
  | "no_aplica";

export interface ResolutionInfo {
  number: string;
  issueDate: string;
  prefix: string;
  rangeFrom: number;
  rangeTo: number;
  validFrom: string;
  validTo: string;
}

export interface PartyInfo {
  documentType: DocumentType;
  documentNumber: string;
  dv: string;
  legalName: string;
  tradeName: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  taxRegime: TaxRegime;
  fiscalResponsibilities: FiscalResponsibility[];
  economicActivity: string;
  logoUrl: string | null;
  brandColor: string;
}

export interface CustomerInfo {
  documentType: DocumentType;
  documentNumber: string;
  legalName: string;
  dv: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  taxRegime: TaxRegime | null;
  isGranContribuyente: boolean;
  isAgentRetencion: boolean;
  isSelfRetainer: boolean;
}

export interface InvoiceItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  discount: number;
  discountAmount: number;
  taxType: ItemTaxType;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  totalAfterDiscount: number;
  totalWithTax: number;
}

export interface TaxConfig {
  isResponsibleIVA: boolean;
  isResponsibleINC: boolean;
  defaultIVARate: number;
  includeICA: boolean;
  icaRate: number;
  icaMunicipality: string;
}

export interface WithholdingConfig {
  includeWithholdings: boolean;
  applyReteFuente: boolean;
  reteFuenteRate: number;
  reteFuenteConcept: ReteFuenteConcept;
  applyReteIVA: boolean;
  reteIVARate: number;
  applyReteICA: boolean;
  reteICARate: number;
}

export interface PaymentInfo {
  paymentForm: "contado" | "credito";
  paymentMethod: PaymentMethod;
  bankName: string;
  accountType: "ahorros" | "corriente" | null;
  accountNumber: string;
  accountHolder: string;
  paymentTermDays: number | null;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  taxableBase: number;
  totalIVA: number;
  totalINC: number;
  totalICA: number;
  totalTax: number;
  totalBeforeWithholdings: number;
  totalReteFuente: number;
  totalReteIVA: number;
  totalReteICA: number;
  totalWithholdings: number;
  grandTotal: number;
  totalInWords: string;
}

export interface Invoice {
  id: string;
  createdAt: string;
  status: "draft" | "generated";
  invoiceNumber: string;
  prefix: string;
  consecutive: number;
  issueDate: string;
  dueDate: string | null;
  invoiceType: InvoiceType;
  currency: "COP" | "USD";
  exchangeRate: number | null;
  resolution: ResolutionInfo | null;
  issuer: PartyInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  taxConfig: TaxConfig;
  withholdings: WithholdingConfig;
  payment: PaymentInfo;
  totals: InvoiceTotals;
  notes: string;
  internalNotes: string;
}
