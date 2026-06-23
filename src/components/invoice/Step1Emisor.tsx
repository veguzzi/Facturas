"use client";

import { useRef } from "react";
import { Building2, Upload, X } from "lucide-react";
import { useInvoiceStore } from "@/lib/store";
import { calculateDV } from "@/lib/calculator";
import {
  DEFAULT_BRAND_COLOR,
  DEPARTMENTS,
  DOCUMENT_TYPES,
  MAJOR_CITIES,
} from "@/lib/constants";
import type { FiscalResponsibility, TaxRegime } from "@/lib/types";
import {
  Button,
  Field,
  Input,
  Label,
  Select,
  Switch,
} from "@/components/ui";

export function Step1Emisor({ errors }: { errors: Record<string, string> }) {
  const issuer = useInvoiceStore((s) => s.invoice.issuer);
  const taxConfig = useInvoiceStore((s) => s.invoice.taxConfig);
  const patchIssuer = useInvoiceStore((s) => s.patchIssuer);
  const patchTaxConfig = useInvoiceStore((s) => s.patchTaxConfig);
  const savedIssuer = useInvoiceStore((s) => s.savedIssuer);
  const loadIssuerProfile = useInvoiceStore((s) => s.loadIssuerProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const isNIT = issuer.documentType === "31";

  function setDocNumber(value: string) {
    const clean = value.replace(/[^0-9]/g, "");
    patchIssuer({
      documentNumber: clean,
      dv: isNIT && clean.length >= 9 ? calculateDV(clean) : issuer.dv,
    });
  }

  function setRegime(regime: TaxRegime) {
    let responsibilities: FiscalResponsibility[] = [];
    let isResponsibleIVA = taxConfig.isResponsibleIVA;
    if (regime === "simple") {
      responsibilities = ["O-47"];
    } else if (regime === "no_responsable") {
      responsibilities = ["R-99-PN"];
      isResponsibleIVA = false;
    } else {
      responsibilities = isResponsibleIVA ? ["O-48"] : [];
    }
    patchIssuer({ taxRegime: regime, fiscalResponsibilities: responsibilities });
    patchTaxConfig({ isResponsibleIVA });
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("El logo debe pesar máximo 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patchIssuer({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  const cities = MAJOR_CITIES[issuer.department] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Datos del emisor (tu negocio)</h2>
        </div>
        {savedIssuer && (
          <Button variant="outline" size="sm" onClick={loadIssuerProfile}>
            Cargar perfil guardado
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de documento" required>
          <Select
            value={issuer.documentType}
            onChange={(e) => patchIssuer({ documentType: e.target.value as typeof issuer.documentType })}
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
              inputMode="numeric"
              value={issuer.documentNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="900123456"
            />
          </Field>
          <Field label="DV" error={errors.dv}>
            <Input
              className="w-16 text-center"
              value={issuer.dv}
              onChange={(e) => patchIssuer({ dv: e.target.value.replace(/[^0-9]/g, "") })}
              disabled={isNIT}
              placeholder="—"
            />
          </Field>
        </div>

        <Field
          label="Razón social / Nombre completo"
          required
          error={errors.legalName}
          className="sm:col-span-2"
        >
          <Input
            value={issuer.legalName}
            onChange={(e) => patchIssuer({ legalName: e.target.value })}
            placeholder="Mi Empresa S.A.S."
          />
        </Field>

        <Field label="Nombre comercial (opcional)" className="sm:col-span-2">
          <Input
            value={issuer.tradeName}
            onChange={(e) => patchIssuer({ tradeName: e.target.value })}
          />
        </Field>
      </div>

      <div className="rounded-lg border border-border p-4">
        <Label>Régimen tributario</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["ordinario", "Ordinario"],
              ["simple", "Régimen Simple (RST)"],
              ["no_responsable", "No responsable de IVA"],
            ] as [TaxRegime, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRegime(value)}
              className={
                "rounded-md border px-3 py-2 text-sm transition-colors " +
                (issuer.taxRegime === value
                  ? "border-primary bg-accent text-primary font-medium"
                  : "border-input hover:bg-muted")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {issuer.taxRegime !== "no_responsable" && (
          <label className="mt-4 flex items-center gap-3 text-sm">
            <Switch
              checked={taxConfig.isResponsibleIVA}
              onCheckedChange={(v) => {
                patchTaxConfig({ isResponsibleIVA: v });
                patchIssuer({
                  fiscalResponsibilities: v ? ["O-48"] : ["R-99-PN"],
                });
              }}
            />
            Responsable de IVA
          </label>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Departamento">
          <Select
            value={issuer.department}
            onChange={(e) => patchIssuer({ department: e.target.value, city: "" })}
          >
            <option value="">Selecciona…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ciudad / Municipio">
          {cities.length > 0 ? (
            <Select
              value={issuer.city}
              onChange={(e) => patchIssuer({ city: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              value={issuer.city}
              onChange={(e) => patchIssuer({ city: e.target.value })}
              placeholder="Ciudad"
            />
          )}
        </Field>
        <Field label="Dirección" className="sm:col-span-2">
          <Input
            value={issuer.address}
            onChange={(e) => patchIssuer({ address: e.target.value })}
            placeholder="Cra 43A #1-50"
          />
        </Field>
        <Field label="Teléfono">
          <Input
            value={issuer.phone}
            onChange={(e) => patchIssuer({ phone: e.target.value })}
            placeholder="300 123 4567"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={issuer.email}
            onChange={(e) => patchIssuer({ email: e.target.value })}
            placeholder="info@minegocio.com"
          />
        </Field>
      </div>

      {/* Branding */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Logo (opcional, máx. 500KB)">
          {issuer.logoUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issuer.logoUrl}
                alt="Logo"
                className="h-12 rounded border border-border object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patchIssuer({ logoUrl: null })}
              >
                <X className="h-4 w-4" /> Quitar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Subir logo
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />
        </Field>
        <Field label="Color de marca">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={issuer.brandColor || DEFAULT_BRAND_COLOR}
              onChange={(e) => patchIssuer({ brandColor: e.target.value })}
              className="h-10 w-16 cursor-pointer rounded border border-input"
            />
            <Input
              value={issuer.brandColor}
              onChange={(e) => patchIssuer({ brandColor: e.target.value })}
              className="w-32"
            />
          </div>
        </Field>
      </div>
    </div>
  );
}
