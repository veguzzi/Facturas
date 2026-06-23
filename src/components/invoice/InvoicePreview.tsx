"use client";

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

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const { issuer, customer, items, totals, payment, resolution } = invoice;
  const color = issuer.brandColor || "#1a56db";
  const watermark =
    invoice.invoiceType === "cotizacion"
      ? "COTIZACIÓN"
      : invoice.invoiceType === "cuenta_cobro"
        ? "CUENTA DE COBRO"
        : null;

  return (
    /* A4 a 96dpi: 794 × 1123px */
    <div
      className="relative flex w-[794px] flex-col bg-white text-[13px] text-slate-800 shadow-sm"
      style={{ height: "1123px", padding: "40px 48px" }}
    >
      {watermark && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span
            className="rotate-[-30deg] select-none font-bold uppercase tracking-widest"
            style={{ fontSize: "96px", color: "rgba(148,163,184,0.45)" }}
          >
            {watermark}
          </span>
        </div>
      )}

      {/* ── ZONA SUPERIOR: crece con el contenido ── */}
      <div className="relative flex-1" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {issuer.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={issuer.logoUrl}
                alt="Logo"
                className="h-16 max-w-[150px] object-contain"
              />
            )}
            <div>
              <p className="text-base font-bold">{issuer.legalName || "Tu Empresa"}</p>
              {issuer.tradeName && (
                <p className="text-slate-500">{issuer.tradeName}</p>
              )}
              <p>
                {docLabel(issuer.documentType)}: {issuer.documentNumber || "—"}
                {issuer.documentType === "31" && issuer.dv ? `-${issuer.dv}` : ""}
              </p>
              {issuer.address && (
                <p>
                  {issuer.address}
                  {issuer.city ? `, ${issuer.city}` : ""}
                </p>
              )}
              {issuer.phone && <p>Tel: {issuer.phone}</p>}
              {issuer.email && <p>{issuer.email}</p>}
              <p className="text-slate-500">
                {TAX_REGIME_LABELS[issuer.taxRegime]}
                {invoice.taxConfig.isResponsibleIVA ? " — Responsable de IVA" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase" style={{ color }}>
              {INVOICE_TYPE_LABELS[invoice.invoiceType]}
            </p>
            <p
              className="inline-block rounded px-2 py-0.5 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {invoice.invoiceNumber}
            </p>
            <p className="mt-2">Fecha: {invoice.issueDate}</p>
            {invoice.dueDate && <p>Vence: {invoice.dueDate}</p>}
            <p>Moneda: {invoice.currency}</p>
          </div>
        </div>

        {/* Cliente */}
        <div
          className="mt-5 rounded border-l-4 bg-slate-50 p-3"
          style={{ borderColor: color }}
        >
          <p className="font-semibold uppercase text-slate-500">Datos del cliente</p>
          <p className="font-medium">{customer.legalName || "—"}</p>
          <p>
            {docLabel(customer.documentType)}: {customer.documentNumber || "—"}
          </p>
          {customer.address && <p>{customer.address}</p>}
          {customer.email && <p>{customer.email}</p>}
        </div>

        {/* Items */}
        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="text-white" style={{ backgroundColor: color }}>
              <th className="px-2 py-1.5">#</th>
              <th className="px-2 py-1.5">Descripción</th>
              <th className="px-2 py-1.5 text-right">Cant</th>
              <th className="px-2 py-1.5">Und</th>
              <th className="px-2 py-1.5 text-right">V/Unit</th>
              <th className="px-2 py-1.5 text-right">Imp</th>
              <th className="px-2 py-1.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 ? "bg-slate-50" : ""}>
                <td className="px-2 py-1.5 align-top">{idx + 1}</td>
                <td className="px-2 py-1.5 align-top">
                  {item.description || "—"}
                  {item.discount > 0 && (
                    <span className="block text-xs text-slate-500">
                      Desc: {item.discount}%
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right align-top">{item.quantity}</td>
                <td className="px-2 py-1.5 align-top">{unitLabel(item.unitOfMeasure)}</td>
                <td className="px-2 py-1.5 text-right align-top">{formatCOP(item.unitPrice)}</td>
                <td className="px-2 py-1.5 text-right align-top">{item.taxRate}%</td>
                <td className="px-2 py-1.5 text-right align-top font-medium">
                  {formatCOP(item.totalWithTax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ZONA INFERIOR: siempre en el pie de página ── */}
      <div className="relative mt-6" style={{ zIndex: 1 }}>
        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1">
            <Line label="Subtotal" value={formatCOP(totals.subtotal)} />
            {totals.totalDiscount > 0 && (
              <Line label="Descuentos" value={"-" + formatCOP(totals.totalDiscount)} />
            )}
            <Line label="Base gravable" value={formatCOP(totals.taxableBase)} />
            {totals.totalIVA > 0 && (
              <Line label="IVA" value={formatCOP(totals.totalIVA)} />
            )}
            {totals.totalINC > 0 && (
              <Line label="INC" value={formatCOP(totals.totalINC)} />
            )}
            {totals.totalICA > 0 && (
              <Line label="ICA" value={formatCOP(totals.totalICA)} />
            )}
            <div
              className="flex justify-between border-t-2 pt-1 text-base font-bold"
              style={{ borderColor: color, color }}
            >
              <span>TOTAL</span>
              <span>{formatCOP(totals.totalBeforeWithholdings)}</span>
            </div>

            {totals.totalWithholdings > 0 && (
              <div className="mt-2 text-slate-500">
                <p className="text-xs font-semibold uppercase">
                  Retenciones (informativo)
                </p>
                {totals.totalReteFuente > 0 && (
                  <Line
                    label={`ReteFuente (${RETEFUENTE_CONCEPT_LABELS[invoice.withholdings.reteFuenteConcept]})`}
                    value={`(${formatCOP(totals.totalReteFuente)})`}
                  />
                )}
                {totals.totalReteIVA > 0 && (
                  <Line label="ReteIVA" value={`(${formatCOP(totals.totalReteIVA)})`} />
                )}
                {totals.totalReteICA > 0 && (
                  <Line label="ReteICA" value={`(${formatCOP(totals.totalReteICA)})`} />
                )}
                <div className="flex justify-between border-t pt-1 font-bold text-slate-800">
                  <span>VALOR NETO A RECIBIR</span>
                  <span>{formatCOP(totals.grandTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs italic text-slate-600">Son: {totals.totalInWords}</p>

        {/* Pago */}
        <div className="mt-4 border-t border-slate-200 pt-2 text-xs">
          <p>
            <strong>Forma de pago:</strong>{" "}
            {payment.paymentForm === "credito" ? "Crédito" : "Contado"} ·{" "}
            {PAYMENT_METHODS.find((m) => m.code === payment.paymentMethod)?.label}
          </p>
          {payment.bankName && (
            <p>
              <strong>Banco:</strong> {payment.bankName}
              {payment.accountType ? ` · ${payment.accountType}` : ""}
              {payment.accountNumber ? ` · ${payment.accountNumber}` : ""}
            </p>
          )}
        </div>

        {resolution?.number && (
          <div className="mt-2 border border-dashed border-slate-300 p-2 text-xs">
            <p>Resolución DIAN No. {resolution.number}</p>
            <p>
              Prefijo {invoice.prefix} del {resolution.rangeFrom} al {resolution.rangeTo}
            </p>
            {resolution.validFrom && (
              <p>
                Vigencia: {resolution.validFrom} a {resolution.validTo}
              </p>
            )}
          </div>
        )}

        {invoice.notes && (
          <p className="mt-2 text-xs">
            <strong>Observaciones:</strong> {invoice.notes}
          </p>
        )}

        <p className="mt-4 border-t border-slate-200 pt-2 text-[10px] leading-snug text-slate-400">
          ⚠ Este documento es una representación gráfica con formato de factura. No
          constituye factura electrónica validada por la DIAN ni genera CUFE. Para
          efectos fiscales, consulte con su proveedor tecnológico de facturación
          electrónica autorizado. Generado con FacturaCO.
        </p>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
