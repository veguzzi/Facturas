"use client";

import { UserRound } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { calculateDV } from "@/lib/calculator";
import { DEPARTMENTS, DOCUMENT_TYPES } from "@/lib/constants";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Switch,
} from "@/components/ui";

export function Step2Receptor({ errors }: { errors: Record<string, string> }) {
  const customer = useInvoiceStore((s) => s.invoice.customer);
  const patchCustomer = useInvoiceStore((s) => s.patchCustomer);
  const setConsumidorFinal = useInvoiceStore((s) => s.setConsumidorFinal);
  const savedCustomers = useInvoiceStore((s) => s.savedCustomers);
  const loadCustomer = useInvoiceStore((s) => s.loadCustomer);

  const isNIT = customer.documentType === "31";
  const isConsumidorFinal = customer.documentNumber === "222222222222";

  function setDocNumber(value: string) {
    const clean = value.replace(/[^0-9]/g, "");
    patchCustomer({
      documentNumber: clean,
      dv: isNIT && clean.length >= 9 ? calculateDV(clean) : customer.dv,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserRound className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Datos del cliente</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm">
          <Switch
            checked={isConsumidorFinal}
            onCheckedChange={(v) =>
              v
                ? setConsumidorFinal()
                : patchCustomer({ documentNumber: "", legalName: "" })
            }
          />
          Consumidor final (venta a público general)
        </label>

        {savedCustomers.length > 0 && (
          <Select
            className="w-auto"
            value=""
            onChange={(e) => e.target.value && loadCustomer(e.target.value)}
          >
            <option value="">Cargar cliente frecuente…</option>
            {savedCustomers.map((c) => (
              <option key={c.documentNumber} value={c.documentNumber}>
                {c.legalName} ({c.documentNumber})
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de documento" required>
          <Select
            value={customer.documentType}
            onChange={(e) =>
              patchCustomer({ documentType: e.target.value as typeof customer.documentType })
            }
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Número de documento" required error={errors.documentNumber}>
            <Input
              value={customer.documentNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="800456789"
            />
          </Field>
          {isNIT && (
            <Field label="DV">
              <Input className="w-16 text-center" value={customer.dv} disabled />
            </Field>
          )}
        </div>

        <Field
          label="Nombre / Razón social"
          required
          error={errors.legalName}
          className="sm:col-span-2"
        >
          <Input
            value={customer.legalName}
            onChange={(e) => patchCustomer({ legalName: e.target.value })}
            placeholder="Cliente Ejemplo S.A.S."
          />
        </Field>

        <Field label="Email (opcional)" error={errors.email}>
          <Input
            type="email"
            value={customer.email}
            onChange={(e) => patchCustomer({ email: e.target.value })}
          />
        </Field>
        <Field label="Teléfono (opcional)">
          <Input
            value={customer.phone}
            onChange={(e) => patchCustomer({ phone: e.target.value })}
          />
        </Field>
        <Field label="Dirección (opcional)">
          <Input
            value={customer.address}
            onChange={(e) => patchCustomer({ address: e.target.value })}
          />
        </Field>
        <Field label="Departamento (opcional)">
          <Select
            value={customer.department}
            onChange={(e) => patchCustomer({ department: e.target.value })}
          >
            <option value="">Selecciona…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 text-sm font-medium">
          Información fiscal (para cálculo de retenciones)
        </p>
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={customer.isGranContribuyente}
            onCheckedChange={(v) => patchCustomer({ isGranContribuyente: v })}
            label="Es Gran Contribuyente"
          />
          <Checkbox
            checked={customer.isAgentRetencion}
            onCheckedChange={(v) => patchCustomer({ isAgentRetencion: v })}
            label="Es Agente de Retención de IVA"
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => useInvoiceStore.getState().saveCustomer()}
      >
        Guardar como cliente frecuente
      </Button>
    </div>
  );
}
