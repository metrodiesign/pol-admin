import { InvoiceDetailHeader } from "@/components/dashboard/invoice/invoice-detail-header";
import { InvoiceDocument } from "@/components/dashboard/invoice/invoice-document";
import { INVOICE_DETAIL } from "@/lib/mock/invoice-minimals";

export const metadata = {
  title: "Invoice details | Dashboard - Minimal UI",
};

export default function InvoiceDetailsPage() {
  const inv = INVOICE_DETAIL;

  return (
    <>
      <InvoiceDetailHeader
        invoiceNumber={inv.invoiceNumber}
        initialStatus={inv.status}
      />
      <InvoiceDocument />
    </>
  );
}
