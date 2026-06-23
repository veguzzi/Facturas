"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { Invoice } from "@/lib/types";
import { InvoicePDFDocument } from "./InvoicePDF";

export function PdfViewerClient({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex flex-col gap-4">
      <PDFDownloadLink
        document={<InvoicePDFDocument invoice={invoice} />}
        fileName={`${invoice.invoiceNumber || "factura"}.pdf`}
        className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:opacity-90"
      >
        {({ loading }) => (
          <>
            <Download className="h-5 w-5" />
            {loading ? "Preparando PDF…" : "Descargar PDF"}
          </>
        )}
      </PDFDownloadLink>

      <div className="h-[80vh] w-full overflow-hidden rounded-xl border border-border">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <InvoicePDFDocument invoice={invoice} />
        </PDFViewer>
      </div>
    </div>
  );
}
