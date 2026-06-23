"use client";

import { Info, Percent } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { formatCOP } from "@/lib/calculator";
import {
  CURRENT_UVT,
  ICA_RATES,
  RETEFUENTE_BASE_KEY,
  RETEFUENTE_BASES,
  RETEFUENTE_CONCEPT_LABELS,
  RETEFUENTE_RATES_DECLARANTE,
} from "@/lib/constants";
import type { ReteFuenteConcept } from "@/lib/types";
import { Checkbox, Field, Input, Select, Switch } from "@/components/ui";

export function Step4Impuestos() {
  const taxConfig = useInvoiceStore((s) => s.invoice.taxConfig);
  const withholdings = useInvoiceStore((s) => s.invoice.withholdings);
  const totals = useInvoiceStore((s) => s.invoice.totals);
  const patchTaxConfig = useInvoiceStore((s) => s.patchTaxConfig);
  const patchWithholdings = useInvoiceStore((s) => s.patchWithholdings);

  function setConcept(concept: ReteFuenteConcept) {
    patchWithholdings({
      reteFuenteConcept: concept,
      reteFuenteRate: RETEFUENTE_RATES_DECLARANTE[concept],
    });
  }

  // Validación de base mínima ReteFuente
  const baseKey = RETEFUENTE_BASE_KEY[withholdings.reteFuenteConcept];
  const minUVT = RETEFUENTE_BASES[baseKey] ?? 0;
  const minBase = minUVT * CURRENT_UVT;
  const belowBase =
    withholdings.applyReteFuente &&
    minUVT > 0 &&
    totals.taxableBase < minBase;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Percent className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Impuestos y retenciones</h2>
      </div>

      {/* Resumen de impuestos */}
      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 font-medium">Impuestos</p>
        <dl className="space-y-2 text-sm">
          <Row label="Base gravable" value={formatCOP(totals.taxableBase)} />
          <Row label="IVA" value={formatCOP(totals.totalIVA)} />
          {totals.totalINC > 0 && (
            <Row label="INC" value={formatCOP(totals.totalINC)} />
          )}
        </dl>

        <div className="mt-4 border-t border-border pt-4">
          <label className="flex items-center gap-3 text-sm">
            <Switch
              checked={taxConfig.includeICA}
              onCheckedChange={(v) => patchTaxConfig({ includeICA: v })}
            />
            Incluir ICA (Impuesto de Industria y Comercio)
          </label>
          {taxConfig.includeICA && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Municipio">
                <Select
                  value={taxConfig.icaMunicipality}
                  onChange={(e) => {
                    const m = e.target.value;
                    patchTaxConfig({
                      icaMunicipality: m,
                      icaRate: ICA_RATES[m]?.common ?? taxConfig.icaRate,
                    });
                  }}
                >
                  <option value="">Otro…</option>
                  {Object.keys(ICA_RATES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tarifa ICA (‰ por mil)">
                <Input
                  type="number"
                  step="any"
                  value={taxConfig.icaRate}
                  onChange={(e) =>
                    patchTaxConfig({ icaRate: Number(e.target.value) })
                  }
                />
              </Field>
              <Row
                label="Total ICA"
                value={formatCOP(totals.totalICA)}
                className="sm:col-span-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Retenciones */}
      <div className="rounded-lg border border-border p-4">
        <label className="flex items-center gap-3">
          <Switch
            checked={withholdings.includeWithholdings}
            onCheckedChange={(v) =>
              patchWithholdings({ includeWithholdings: v })
            }
          />
          <span className="font-medium">Mostrar retenciones en la factura</span>
        </label>

        <div className="mt-3 flex gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          Las retenciones son practicadas por el comprador. Se incluyen aquí de
          forma informativa para mostrar el valor neto a recibir.
        </div>

        {withholdings.includeWithholdings && (
          <div className="mt-4 space-y-4">
            {/* ReteFuente */}
            <div className="rounded-md border border-border p-3">
              <Checkbox
                checked={withholdings.applyReteFuente}
                onCheckedChange={(v) =>
                  patchWithholdings({ applyReteFuente: v })
                }
                label="Aplicar Retención en la Fuente"
              />
              {withholdings.applyReteFuente && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Concepto">
                    <Select
                      value={withholdings.reteFuenteConcept}
                      onChange={(e) =>
                        setConcept(e.target.value as ReteFuenteConcept)
                      }
                    >
                      {Object.entries(RETEFUENTE_CONCEPT_LABELS).map(
                        ([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        )
                      )}
                    </Select>
                  </Field>
                  <Field label="Tarifa %">
                    <Input
                      type="number"
                      step="any"
                      value={withholdings.reteFuenteRate}
                      onChange={(e) =>
                        patchWithholdings({
                          reteFuenteRate: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  {belowBase && (
                    <p className="text-xs text-amber-600 sm:col-span-2">
                      ⚠ La base gravable ({formatCOP(totals.taxableBase)}) es
                      menor a la base mínima de {minUVT} UVT ({formatCOP(minBase)}).
                      Normalmente no se practica esta retención.
                    </p>
                  )}
                  <Row
                    label="Total ReteFuente"
                    value={formatCOP(totals.totalReteFuente)}
                    className="sm:col-span-2"
                  />
                </div>
              )}
            </div>

            {/* ReteIVA */}
            <div className="rounded-md border border-border p-3">
              <Checkbox
                checked={withholdings.applyReteIVA}
                onCheckedChange={(v) => patchWithholdings({ applyReteIVA: v })}
                label="Aplicar ReteIVA (15% del IVA)"
              />
              {withholdings.applyReteIVA && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Tarifa % (sobre el IVA)">
                    <Input
                      type="number"
                      step="any"
                      value={withholdings.reteIVARate}
                      onChange={(e) =>
                        patchWithholdings({ reteIVARate: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Row
                    label="Total ReteIVA"
                    value={formatCOP(totals.totalReteIVA)}
                  />
                </div>
              )}
            </div>

            {/* ReteICA */}
            <div className="rounded-md border border-border p-3">
              <Checkbox
                checked={withholdings.applyReteICA}
                onCheckedChange={(v) => patchWithholdings({ applyReteICA: v })}
                label="Aplicar ReteICA"
              />
              {withholdings.applyReteICA && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Tarifa ReteICA (‰ por mil)">
                    <Input
                      type="number"
                      step="any"
                      value={withholdings.reteICARate}
                      onChange={(e) =>
                        patchWithholdings({ reteICARate: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Row
                    label="Total ReteICA"
                    value={formatCOP(totals.totalReteICA)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Totales finales */}
      <div className="rounded-lg border-2 border-primary/30 bg-accent p-4">
        <dl className="space-y-2 text-sm">
          <Row
            label="Total factura"
            value={formatCOP(totals.totalBeforeWithholdings)}
          />
          {totals.totalWithholdings > 0 && (
            <Row
              label="Total retenciones"
              value={"-" + formatCOP(totals.totalWithholdings)}
            />
          )}
          <div className="flex justify-between border-t border-primary/30 pt-2 text-base font-bold text-primary">
            <dt>Valor neto a recibir</dt>
            <dd>{formatCOP(totals.grandTotal)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={"flex justify-between " + (className ?? "")}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
