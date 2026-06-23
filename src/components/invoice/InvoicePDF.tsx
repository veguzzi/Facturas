"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatCOP } from "@/lib/calculator";
import {
  DOCUMENT_TYPES,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHODS,
  RETEFUENTE_CONCEPT_LABELS,
  TAX_REGIME_LABELS,
  UNITS_OF_MEASURE,
} from "@/lib/constants";
import type { Invoice } from "@/lib/types";

function docLabel(code: string) {
  return DOCUMENT_TYPES.find((d) => d.code === code)?.shortLabel ?? code;
}
function unitLabel(code: string) {
  return UNITS_OF_MEASURE.find((u) => u.code === code)?.label ?? code;
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 36,
    paddingVertical: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: 320,
    left: 60,
    fontSize: 60,
    color: "#e2e8f0",
    fontFamily: "Helvetica-Bold",
    transform: "rotate(-30deg)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: { width: 120, height: 56, objectFit: "contain", marginBottom: 4 },
  legalName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  muted: { color: "#64748b" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  numberBadge: {
    color: "#ffffff",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
  },
  customerBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  table: { marginTop: 12 },
  thead: { flexDirection: "row", color: "#ffffff" },
  th: { paddingVertical: 4, paddingHorizontal: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  td: { paddingVertical: 4, paddingHorizontal: 4, fontSize: 8 },
  cNum: { width: "5%" },
  cDesc: { width: "37%" },
  cQty: { width: "8%", textAlign: "right" },
  cUnit: { width: "12%" },
  cPrice: { width: "16%", textAlign: "right" },
  cTax: { width: "8%", textAlign: "right" },
  cTotal: { width: "14%", textAlign: "right" },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalsBox: { width: 240 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1.5 },
  grandLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    paddingTop: 3,
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  retLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: 6,
  },
  netLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    paddingTop: 2,
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  words: { marginTop: 8, fontStyle: "italic", fontSize: 9 },
  payBlock: { marginTop: 10, borderTopWidth: 0.5, borderTopColor: "#e2e8f0", paddingTop: 4, fontSize: 8 },
  resolution: {
    marginTop: 6,
    borderWidth: 0.5,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    padding: 5,
    fontSize: 7,
  },
  footer: {
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 5,
    fontSize: 7,
    color: "#94a3b8",
    lineHeight: 1.4,
  },
  brand: { marginTop: 4, fontSize: 7, color: "#94a3b8", textAlign: "center" },
});

export function InvoicePDFDocument({ invoice }: { invoice: Invoice }) {
  const { issuer, customer, items, totals, payment, resolution, withholdings } =
    invoice;
  const color = issuer.brandColor || "#1a56db";
  const watermark =
    invoice.invoiceType === "cotizacion"
      ? "COTIZACIÓN"
      : invoice.invoiceType === "cuenta_cobro"
        ? "CUENTA DE COBRO"
        : null;

  return (
    <Document
      title={`${invoice.invoiceNumber} - ${issuer.legalName}`}
      author="FacturaCO"
    >
      <Page size="LETTER" style={[styles.page, { display: "flex", flexDirection: "column" }]}>
        {watermark && <Text style={styles.watermark}>{watermark}</Text>}

        {/* ── ZONA SUPERIOR: crece con el contenido ── */}
        <View style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ maxWidth: "60%" }}>
            {issuer.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={issuer.logoUrl} style={styles.logo} />
            ) : null}
            <Text style={styles.legalName}>{issuer.legalName || "Tu Empresa"}</Text>
            {issuer.tradeName ? (
              <Text style={styles.muted}>{issuer.tradeName}</Text>
            ) : null}
            <Text>
              {docLabel(issuer.documentType)}: {issuer.documentNumber || "—"}
              {issuer.documentType === "31" && issuer.dv ? `-${issuer.dv}` : ""}
            </Text>
            {issuer.address ? (
              <Text>
                {issuer.address}
                {issuer.city ? `, ${issuer.city}` : ""}
              </Text>
            ) : null}
            {issuer.phone ? <Text>Tel: {issuer.phone}</Text> : null}
            {issuer.email ? <Text>{issuer.email}</Text> : null}
            <Text style={styles.muted}>
              {TAX_REGIME_LABELS[issuer.taxRegime]}
              {invoice.taxConfig.isResponsibleIVA ? " — Responsable de IVA" : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.title, { color }]}>
              {INVOICE_TYPE_LABELS[invoice.invoiceType]}
            </Text>
            <Text style={[styles.numberBadge, { backgroundColor: color }]}>
              {invoice.invoiceNumber}
            </Text>
            <Text style={{ marginTop: 6 }}>Fecha: {invoice.issueDate}</Text>
            {invoice.dueDate ? <Text>Vence: {invoice.dueDate}</Text> : null}
            <Text>Moneda: {invoice.currency}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={[styles.customerBox, { borderLeftColor: color }]}>
          <Text style={styles.sectionLabel}>Datos del cliente</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {customer.legalName || "—"}
          </Text>
          <Text>
            {docLabel(customer.documentType)}: {customer.documentNumber || "—"}
          </Text>
          {customer.address ? <Text>{customer.address}</Text> : null}
          {customer.email ? <Text>{customer.email}</Text> : null}
        </View>

        {/* Items */}
        <View style={styles.table}>
          <View style={[styles.thead, { backgroundColor: color }]}>
            <Text style={[styles.th, styles.cNum]}>#</Text>
            <Text style={[styles.th, styles.cDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.cQty]}>Cant</Text>
            <Text style={[styles.th, styles.cUnit]}>Und</Text>
            <Text style={[styles.th, styles.cPrice]}>V/Unit</Text>
            <Text style={[styles.th, styles.cTax]}>Imp</Text>
            <Text style={[styles.th, styles.cTotal]}>Total</Text>
          </View>
          {items.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.tr,
                idx % 2 ? { backgroundColor: "#f8fafc" } : {},
              ]}
            >
              <Text style={[styles.td, styles.cNum]}>{idx + 1}</Text>
              <Text style={[styles.td, styles.cDesc]}>
                {item.description || "—"}
                {item.discount > 0 ? `  (Desc: ${item.discount}%)` : ""}
              </Text>
              <Text style={[styles.td, styles.cQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.cUnit]}>
                {unitLabel(item.unitOfMeasure)}
              </Text>
              <Text style={[styles.td, styles.cPrice]}>
                {formatCOP(item.unitPrice)}
              </Text>
              <Text style={[styles.td, styles.cTax]}>{item.taxRate}%</Text>
              <Text
                style={[styles.td, styles.cTotal, { fontFamily: "Helvetica-Bold" }]}
              >
                {formatCOP(item.totalWithTax)}
              </Text>
            </View>
          ))}
        </View>

        </View>{/* fin zona superior */}

        {/* ── ZONA INFERIOR: siempre al pie de página ── */}
        <View>

        {/* Totales */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <TotalLine label="Subtotal" value={formatCOP(totals.subtotal)} />
            {totals.totalDiscount > 0 ? (
              <TotalLine
                label="Descuentos"
                value={"-" + formatCOP(totals.totalDiscount)}
              />
            ) : null}
            <TotalLine
              label="Base gravable"
              value={formatCOP(totals.taxableBase)}
            />
            {totals.totalIVA > 0 ? (
              <TotalLine label="IVA" value={formatCOP(totals.totalIVA)} />
            ) : null}
            {totals.totalINC > 0 ? (
              <TotalLine label="INC" value={formatCOP(totals.totalINC)} />
            ) : null}
            {totals.totalICA > 0 ? (
              <TotalLine label="ICA" value={formatCOP(totals.totalICA)} />
            ) : null}
            <View style={[styles.grandLine, { borderTopColor: color, color }]}>
              <Text>TOTAL</Text>
              <Text>{formatCOP(totals.totalBeforeWithholdings)}</Text>
            </View>

            {totals.totalWithholdings > 0 ? (
              <View>
                <Text style={styles.retLabel}>Retenciones (informativo)</Text>
                {totals.totalReteFuente > 0 ? (
                  <TotalLine
                    label={`ReteFuente (${RETEFUENTE_CONCEPT_LABELS[withholdings.reteFuenteConcept]})`}
                    value={`(${formatCOP(totals.totalReteFuente)})`}
                    muted
                  />
                ) : null}
                {totals.totalReteIVA > 0 ? (
                  <TotalLine
                    label="ReteIVA"
                    value={`(${formatCOP(totals.totalReteIVA)})`}
                    muted
                  />
                ) : null}
                {totals.totalReteICA > 0 ? (
                  <TotalLine
                    label="ReteICA"
                    value={`(${formatCOP(totals.totalReteICA)})`}
                    muted
                  />
                ) : null}
                <View style={styles.netLine}>
                  <Text>VALOR NETO A RECIBIR</Text>
                  <Text>{formatCOP(totals.grandTotal)}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.words}>Son: {totals.totalInWords}</Text>

        {/* Pago */}
        <View style={styles.payBlock}>
          <Text>
            Forma de pago:{" "}
            {payment.paymentForm === "credito" ? "Crédito" : "Contado"} ·{" "}
            {PAYMENT_METHODS.find((m) => m.code === payment.paymentMethod)?.label}
          </Text>
          {payment.bankName ? (
            <Text>
              Banco: {payment.bankName}
              {payment.accountType ? ` · ${payment.accountType}` : ""}
              {payment.accountNumber ? ` · ${payment.accountNumber}` : ""}
              {payment.accountHolder ? ` · ${payment.accountHolder}` : ""}
            </Text>
          ) : null}
        </View>

        {resolution?.number ? (
          <View style={styles.resolution}>
            <Text>Resolución DIAN No. {resolution.number}</Text>
            <Text>
              Prefijo {invoice.prefix} del {resolution.rangeFrom} al{" "}
              {resolution.rangeTo}
            </Text>
            {resolution.validFrom ? (
              <Text>
                Vigencia: {resolution.validFrom} a {resolution.validTo}
              </Text>
            ) : null}
          </View>
        ) : null}

        {invoice.notes ? (
          <Text style={{ marginTop: 6, fontSize: 8 }}>
            Observaciones: {invoice.notes}
          </Text>
        ) : null}

        <Text style={styles.footer}>
          ⚠ Este documento es una representación gráfica con formato de factura.
          No constituye factura electrónica validada por la DIAN ni genera CUFE.
          Para efectos fiscales, consulte con su proveedor tecnológico de
          facturación electrónica autorizado.
        </Text>
        <Text style={styles.brand}>Generado con FacturaCO — facturaco.com</Text>

        </View>{/* fin zona inferior */}
      </Page>
    </Document>
  );
}

function TotalLine({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={[styles.totalLine, muted ? { opacity: 0.7 } : {}]}>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}
