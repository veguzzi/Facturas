# FacturaCO

Generador gratuito de facturas para Colombia. Crea facturas de venta, cuentas de
cobro y cotizaciones en PDF, con cálculo automático de IVA, INC, ICA, retenciones
y dígito de verificación del NIT. **Fase 1 (MVP) — sin backend, datos en el navegador.**

> ⚠️ Genera la representación gráfica (PDF) de una factura. NO es proveedor
> tecnológico DIAN: no genera XML UBL 2.1, no firma, no transmite ni genera CUFE.

## Cómo correrlo

```bash
cd facturaco
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
```

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind v4** + primitivas UI propias (estilo shadcn, en `src/components/ui`)
- **Zustand** (con `persist` a localStorage) para el formulario multi-step
- **Zod** para validación por paso
- **@react-pdf/renderer** para el PDF (texto seleccionable, render cliente)

## Estructura

```
src/
  app/
    page.tsx              Landing (SEO, FAQ, disclaimer)
    generar/page.tsx      Formulario multi-step + preview en vivo
    vista-previa/page.tsx Visor PDF + descarga
  components/
    invoice/              Steps 1-5, InvoicePreview (HTML), InvoicePDF (@react-pdf)
    ui/                   Primitivas (Button, Input, Select, Switch, …)
    Disclaimer.tsx
  lib/
    types.ts  constants.ts  calculator.ts  validators.ts  store.ts  utils.ts
```

## Lógica de negocio implementada

- DV del NIT (módulo 11, factores primos DIAN), auto-calculado.
- Cálculo en tiempo real: subtotales, descuentos, IVA/INC/ICA, ReteFuente/ReteIVA/ReteICA.
- Número a letras en español colombiano (`… PESOS M/CTE`).
- Reglas: no-responsable IVA → solo "Excluido"; exportación → IVA 0%; fecha de
  expedición ≤ hoy; vencimiento ≥ expedición; consecutivo dentro de rango de
  resolución; bases mínimas de retención en UVT (aviso).
- Persistencia en localStorage: perfil del emisor, clientes frecuentes, último
  consecutivo por prefijo.
- Watermark "COTIZACIÓN" / "CUENTA DE COBRO" según el tipo de documento.

## Fuera de alcance (Fase 2/3)

Auth/Supabase, historial "Mis Facturas", envío por email, templates premium,
multimoneda TRM, API, notas crédito/débito, PWA.
