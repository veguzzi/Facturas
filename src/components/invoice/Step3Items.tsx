"use client";

import { Copy, Package, Plus, Trash2 } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { formatCOP } from "@/lib/calculator";
import { ITEM_TAX_TYPES, UNITS_OF_MEASURE } from "@/lib/constants";
import type { ItemTaxType } from "@/lib/types";
import {
  Button,
  CurrencyInput,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

export function Step3Items({ error }: { error?: string }) {
  const items = useInvoiceStore((s) => s.invoice.items);
  const invoiceType = useInvoiceStore((s) => s.invoice.invoiceType);
  const isResponsibleIVA = useInvoiceStore(
    (s) => s.invoice.taxConfig.isResponsibleIVA
  );
  const totals = useInvoiceStore((s) => s.invoice.totals);
  const addItem = useInvoiceStore((s) => s.addItem);
  const updateItem = useInvoiceStore((s) => s.updateItem);
  const duplicateItem = useInvoiceStore((s) => s.duplicateItem);
  const removeItem = useInvoiceStore((s) => s.removeItem);

  const isExport = invoiceType === "factura_exportacion";

  // Opciones de impuesto disponibles según responsabilidad / tipo de factura
  const taxOptions = ITEM_TAX_TYPES.filter((t) => {
    if (isExport) return t.code === "iva_0" || t.code === "excluido";
    if (!isResponsibleIVA) return t.code === "excluido" || t.group === "inc";
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Productos / Servicios</h2>
      </div>

      {isExport && (
        <p className="rounded-md bg-accent px-3 py-2 text-xs text-primary">
          Factura de exportación: el IVA es 0% en todas las líneas.
        </p>
      )}
      {!isResponsibleIVA && !isExport && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Como no eres responsable de IVA, solo puedes facturar como
          &quot;Excluido&quot; (o INC si aplica).
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Línea {idx + 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Duplicar"
                  onClick={() => duplicateItem(item.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Eliminar"
                  disabled={items.length <= 1}
                  onClick={() => {
                    if (items.length <= 1) return;
                    if (confirm("¿Eliminar esta línea?")) removeItem(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <Field label="Descripción" required className="mb-3">
              <Textarea
                value={item.description}
                maxLength={5000}
                onChange={(e) =>
                  updateItem(item.id, { description: e.target.value })
                }
                placeholder="Servicio de consultoría…"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Cantidad">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, { quantity: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Unidad">
                <Select
                  value={item.unitOfMeasure}
                  onChange={(e) =>
                    updateItem(item.id, {
                      unitOfMeasure: e.target.value as typeof item.unitOfMeasure,
                    })
                  }
                >
                  {UNITS_OF_MEASURE.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Precio unitario">
                <CurrencyInput
                  value={item.unitPrice}
                  onValueChange={(v) => updateItem(item.id, { unitPrice: v })}
                />
              </Field>
              <Field label="Descuento %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  value={item.discount}
                  onChange={(e) =>
                    updateItem(item.id, { discount: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Impuesto" className="col-span-2">
                <Select
                  value={item.taxType}
                  onChange={(e) =>
                    updateItem(item.id, { taxType: e.target.value as ItemTaxType })
                  }
                >
                  {taxOptions.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="col-span-2 flex flex-col justify-end text-right">
                <span className="text-xs text-muted-foreground">
                  Subtotal línea
                </span>
                <span className="text-lg font-semibold">
                  {formatCOP(item.totalWithTax)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" /> Agregar línea
        </Button>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Total parcial</span>
          <p className="text-xl font-bold">
            {formatCOP(totals.totalBeforeWithholdings)}
          </p>
        </div>
      </div>
    </div>
  );
}
