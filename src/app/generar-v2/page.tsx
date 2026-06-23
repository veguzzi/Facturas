import { InvoiceEditorAccordion } from "@/components/invoice/InvoiceEditorAccordion";

export const metadata = {
  title: "Generar factura (editor)",
  description:
    "Editor de factura en una sola página: vista previa a la izquierda y formulario tipo acordeón a la derecha.",
};

export default function GenerarV2Page() {
  return <InvoiceEditorAccordion />;
}
