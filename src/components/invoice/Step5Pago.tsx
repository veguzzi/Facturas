"use client";

import { CreditCard } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { INVOICE_TYPE_LABELS, PAYMENT_METHODS } from "@/lib/constants";
import type { InvoiceType, PaymentMethod, ResolutionInfo } from "@/lib/types";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const EMPTY_RESOLUTION: ResolutionInfo = {
  number: "",
  issueDate: "",
  prefix: "",
  rangeFrom: 0,
  rangeTo: 0,
  validFrom: "",
  validTo: "",
};

export function Step5Pago({ error }: { error?: string }) {
  const invoice = useInvoiceStore((s) => s.invoice);
  const patchInvoice = useInvoiceStore((s) => s.patchInvoice);
  const patchPayment = useInvoiceStore((s) => s.patchPayment);

  const { payment, resolution } = invoice;
  const isCredito = payment.paymentForm === "credito";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Pago y detalles finales</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de documento" required>
          <Select
            value={invoice.invoiceType}
            onChange={(e) =>
              patchInvoice({ invoiceType: e.target.value as InvoiceType })
            }
          >
            {Object.entries(INVOICE_TYPE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de expedición" required>
          <Input
            type="date"
            value={invoice.issueDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => patchInvoice({ issueDate: e.target.value })}
          />
        </Field>
        <Field label="Prefijo" hint="Máx. 4 caracteres alfanuméricos">
          <Input
            maxLength={4}
            value={invoice.prefix}
            onChange={(e) =>
              patchInvoice({
                prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
              })
            }
            placeholder="FACT"
          />
        </Field>
        <Field label="Consecutivo" required>
          <Input
            type="number"
            min={1}
            value={invoice.consecutive}
            onChange={(e) =>
              patchInvoice({ consecutive: Number(e.target.value) })
            }
          />
        </Field>
      </div>

      <div className="rounded-md bg-muted px-4 py-3 text-sm">
        Número de factura:{" "}
        <span className="font-semibold">{invoice.invoiceNumber}</span>
      </div>

      {/* Pago */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Forma de pago">
          <Select
            value={payment.paymentForm}
            onChange={(e) =>
              patchPayment({
                paymentForm: e.target.value as "contado" | "credito",
              })
            }
          >
            <option value="contado">Contado</option>
            <option value="credito">Crédito</option>
          </Select>
        </Field>
        {isCredito && (
          <Field label="Fecha de vencimiento">
            <Input
              type="date"
              value={invoice.dueDate ?? ""}
              min={invoice.issueDate}
              onChange={(e) => patchInvoice({ dueDate: e.target.value || null })}
            />
          </Field>
        )}
        <Field label="Medio de pago">
          <Select
            value={payment.paymentMethod}
            onChange={(e) =>
              patchPayment({ paymentMethod: e.target.value as PaymentMethod })
            }
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Datos bancarios */}
      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer font-medium">
          Datos bancarios (opcional)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Banco">
            <Input
              value={payment.bankName}
              onChange={(e) => patchPayment({ bankName: e.target.value })}
              placeholder="Bancolombia"
            />
          </Field>
          <Field label="Tipo de cuenta">
            <Select
              value={payment.accountType ?? ""}
              onChange={(e) =>
                patchPayment({
                  accountType:
                    (e.target.value as "ahorros" | "corriente") || null,
                })
              }
            >
              <option value="">—</option>
              <option value="ahorros">Ahorros</option>
              <option value="corriente">Corriente</option>
            </Select>
          </Field>
          <Field label="Número de cuenta">
            <Input
              value={payment.accountNumber}
              onChange={(e) => patchPayment({ accountNumber: e.target.value })}
            />
          </Field>
          <Field label="Titular de la cuenta">
            <Input
              value={payment.accountHolder}
              onChange={(e) => patchPayment({ accountHolder: e.target.value })}
            />
          </Field>
        </div>
      </details>

      {/* Resolución DIAN */}
      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer font-medium">
          Resolución DIAN (opcional)
        </summary>
        <div className="mt-4 space-y-4">
          <Checkbox
            checked={!!resolution}
            onCheckedChange={(v) =>
              patchInvoice({ resolution: v ? { ...EMPTY_RESOLUTION } : null })
            }
            label="Incluir información de resolución en la factura"
          />
          {resolution && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Número de resolución" className="sm:col-span-2">
                <Input
                  value={resolution.number}
                  onChange={(e) =>
                    patchInvoice({
                      resolution: { ...resolution, number: e.target.value },
                    })
                  }
                  placeholder="18764000001234"
                />
              </Field>
              <Field label="Rango desde">
                <Input
                  type="number"
                  value={resolution.rangeFrom}
                  onChange={(e) =>
                    patchInvoice({
                      resolution: {
                        ...resolution,
                        rangeFrom: Number(e.target.value),
                      },
                    })
                  }
                />
              </Field>
              <Field label="Rango hasta">
                <Input
                  type="number"
                  value={resolution.rangeTo}
                  onChange={(e) =>
                    patchInvoice({
                      resolution: {
                        ...resolution,
                        rangeTo: Number(e.target.value),
                      },
                    })
                  }
                />
              </Field>
              <Field label="Vigencia desde">
                <Input
                  type="date"
                  value={resolution.validFrom}
                  onChange={(e) =>
                    patchInvoice({
                      resolution: { ...resolution, validFrom: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Vigencia hasta">
                <Input
                  type="date"
                  value={resolution.validTo}
                  onChange={(e) =>
                    patchInvoice({
                      resolution: { ...resolution, validTo: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          )}
        </div>
      </details>

      <Field label="Observaciones / Notas">
        <Textarea
          value={invoice.notes}
          onChange={(e) => patchInvoice({ notes: e.target.value })}
          placeholder="Servicio prestado según contrato No. 2026-0045"
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
