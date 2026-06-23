import { InvoiceForm } from "@/components/invoice/InvoiceForm";

export const metadata = {
  title: "Generar factura",
  description:
    "Completa el formulario y genera tu factura, cuenta de cobro o cotización en PDF.",
};

export default function GenerarPage() {
  return <InvoiceForm />;
}
