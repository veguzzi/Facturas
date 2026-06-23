import type {
  DocumentType,
  ItemTaxType,
  PaymentMethod,
  ReteFuenteConcept,
} from "./types";

export const UVT_2025 = 49_799;
export const UVT_2026 = 52_374;
export const CURRENT_UVT = UVT_2026; // Actualizar cada año

// Bases mínimas de retención (en UVT) — Decreto 0572/2025
export const RETEFUENTE_BASES: Record<string, number> = {
  compras_generales: 10,
  servicios_generales: 2,
  honorarios: 0,
  arrendamiento_inmuebles: 10,
  arrendamiento_muebles: 0,
  transporte_carga: 2,
  transporte_pasajeros: 10,
  otros_ingresos: 10,
};

// Tarifas ReteFuente — declarantes
export const RETEFUENTE_RATES_DECLARANTE: Record<ReteFuenteConcept, number> = {
  compras_generales: 2.5,
  servicios_generales: 4,
  honorarios_pj: 11,
  honorarios_pn_declarante: 11,
  honorarios_pn_no_decl: 10,
  arrendamiento_inmuebles: 3.5,
  arrendamiento_muebles: 4,
  transporte_carga: 1,
  transporte_pasajeros: 3.5,
  otros_ingresos: 2.5,
  software: 3.5,
  no_aplica: 0,
};

// Tarifas ReteFuente — NO declarantes
export const RETEFUENTE_RATES_NO_DECLARANTE: Record<ReteFuenteConcept, number> = {
  compras_generales: 3.5,
  servicios_generales: 6,
  honorarios_pj: 11,
  honorarios_pn_declarante: 11,
  honorarios_pn_no_decl: 10,
  arrendamiento_inmuebles: 4,
  arrendamiento_muebles: 4,
  transporte_carga: 1,
  transporte_pasajeros: 3.5,
  otros_ingresos: 3.5,
  software: 3.5,
  no_aplica: 0,
};

export const RETEFUENTE_CONCEPT_LABELS: Record<ReteFuenteConcept, string> = {
  compras_generales: "Compras generales",
  servicios_generales: "Servicios generales",
  honorarios_pj: "Honorarios (persona jurídica)",
  honorarios_pn_declarante: "Honorarios (PN declarante)",
  honorarios_pn_no_decl: "Honorarios (PN no declarante)",
  arrendamiento_inmuebles: "Arrendamiento de inmuebles",
  arrendamiento_muebles: "Arrendamiento de muebles",
  transporte_carga: "Transporte de carga",
  transporte_pasajeros: "Transporte de pasajeros",
  otros_ingresos: "Otros ingresos tributarios",
  software: "Software / licencias",
  no_aplica: "No aplica",
};

// Mapa concepto -> clave de base mínima
export const RETEFUENTE_BASE_KEY: Record<ReteFuenteConcept, string> = {
  compras_generales: "compras_generales",
  servicios_generales: "servicios_generales",
  honorarios_pj: "honorarios",
  honorarios_pn_declarante: "honorarios",
  honorarios_pn_no_decl: "honorarios",
  arrendamiento_inmuebles: "arrendamiento_inmuebles",
  arrendamiento_muebles: "arrendamiento_muebles",
  transporte_carga: "transporte_carga",
  transporte_pasajeros: "transporte_pasajeros",
  otros_ingresos: "otros_ingresos",
  software: "compras_generales",
  no_aplica: "honorarios",
};

// ReteIVA
export const RETEIVA_GENERAL_RATE = 15; // 15% del IVA
export const RETEIVA_BASE_BIENES = 10; // 10 UVT
export const RETEIVA_BASE_SERVICIOS = 2; // 2 UVT

export const DOCUMENT_TYPES: { code: DocumentType; label: string; shortLabel: string }[] = [
  { code: "13", label: "Cédula de ciudadanía", shortLabel: "CC" },
  { code: "31", label: "NIT", shortLabel: "NIT" },
  { code: "22", label: "Cédula de extranjería", shortLabel: "CE" },
  { code: "41", label: "Pasaporte", shortLabel: "PAS" },
  { code: "42", label: "Documento extranjero", shortLabel: "DIE" },
  { code: "50", label: "NIT otro país", shortLabel: "NIT-E" },
  { code: "91", label: "NUIP", shortLabel: "NUIP" },
];

export const UNITS_OF_MEASURE: { code: string; label: string }[] = [
  { code: "EA", label: "Unidad" },
  { code: "HUR", label: "Hora" },
  { code: "DAY", label: "Día" },
  { code: "MON", label: "Mes" },
  { code: "KGM", label: "Kilogramo" },
  { code: "LTR", label: "Litro" },
  { code: "MTR", label: "Metro" },
  { code: "MTK", label: "Metro²" },
  { code: "SET", label: "Conjunto" },
  { code: "XBX", label: "Caja" },
];

export const PAYMENT_METHODS: { code: PaymentMethod; label: string; dianCode: string }[] = [
  { code: "efectivo", label: "Efectivo", dianCode: "10" },
  { code: "transferencia", label: "Transferencia bancaria", dianCode: "47" },
  { code: "consignacion", label: "Consignación bancaria", dianCode: "42" },
  { code: "tarjeta_credito", label: "Tarjeta de crédito", dianCode: "48" },
  { code: "tarjeta_debito", label: "Tarjeta débito", dianCode: "49" },
  { code: "cheque", label: "Cheque", dianCode: "20" },
  { code: "nequi", label: "Nequi", dianCode: "47" },
  { code: "daviplata", label: "Daviplata", dianCode: "47" },
  { code: "otro", label: "Otro", dianCode: "1" },
];

export const ITEM_TAX_TYPES: { code: ItemTaxType; label: string; group: "iva" | "inc" | "none" }[] = [
  { code: "iva_19", label: "IVA 19%", group: "iva" },
  { code: "iva_5", label: "IVA 5%", group: "iva" },
  { code: "iva_0", label: "IVA 0% (exento)", group: "iva" },
  { code: "excluido", label: "Excluido de IVA", group: "none" },
  { code: "inc_8", label: "INC 8% (restaurantes)", group: "inc" },
  { code: "inc_4", label: "INC 4% (telefonía)", group: "inc" },
  { code: "inc_16", label: "INC 16% (vehículos)", group: "inc" },
];

export const INVOICE_TYPE_LABELS: Record<string, string> = {
  factura_venta: "Factura de venta",
  factura_exportacion: "Factura de exportación",
  cuenta_cobro: "Cuenta de cobro",
  cotizacion: "Cotización",
};

export const TAX_REGIME_LABELS: Record<string, string> = {
  ordinario: "Régimen Ordinario",
  simple: "Régimen Simple (RST)",
  no_responsable: "No responsable de IVA",
};

export const DEPARTMENTS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar",
  "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca",
  "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía",
  "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta",
  "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre",
  "Tolima", "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
];

export const MAJOR_CITIES: Record<string, string[]> = {
  Antioquia: ["Medellín", "Bello", "Envigado", "Itagüí", "Rionegro", "Sabaneta"],
  "Bogotá D.C.": ["Bogotá"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá"],
  Atlántico: ["Barranquilla", "Soledad"],
  Santander: ["Bucaramanga", "Floridablanca", "Girón"],
  Bolívar: ["Cartagena", "Magangué"],
  Cundinamarca: ["Soacha", "Zipaquirá", "Chía", "Facatativá"],
};

export const ICA_RATES: Record<string, { min: number; max: number; common: number }> = {
  Bogotá: { min: 4.14, max: 13.8, common: 9.66 },
  Medellín: { min: 2.0, max: 10.0, common: 6.9 },
  Cali: { min: 2.0, max: 10.0, common: 6.6 },
  Barranquilla: { min: 3.0, max: 10.0, common: 7.0 },
  Bucaramanga: { min: 3.0, max: 10.0, common: 5.0 },
  Cartagena: { min: 2.0, max: 10.0, common: 7.0 },
};

export const CONSUMIDOR_FINAL = {
  documentType: "13" as DocumentType,
  documentNumber: "222222222222",
  legalName: "Consumidor Final",
};

export const DEFAULT_BRAND_COLOR = "#1a56db";

export const LEGAL_DISCLAIMER =
  "AVISO LEGAL: FacturaCO es una herramienta de generación de documentos PDF con formato de factura. NO es un proveedor tecnológico autorizado por la DIAN, NO genera XML UBL 2.1, NO firma digitalmente, NO transmite documentos a la DIAN y NO genera CUFE válido. Los documentos generados NO constituyen factura electrónica de venta en los términos del artículo 616-1 del Estatuto Tributario y la Resolución DIAN 000165 de 2023. Para facturación electrónica con validación DIAN, utilice un proveedor tecnológico autorizado o el software gratuito de la DIAN. Esta herramienta es útil para generar cotizaciones, cuentas de cobro, proformas y borradores de factura. Consulte a su contador para asesoría tributaria específica.";
