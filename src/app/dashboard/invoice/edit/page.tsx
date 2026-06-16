import { EditPageHeader } from "@/components/shared/edit-page-header";
import { InvoiceNewEditForm } from "@/components/dashboard/invoice/invoice-new-edit-form";
import { INVOICE_EDIT_DATA } from "@/lib/mock/invoice-minimals";

export const metadata = {
  title: "Invoice edit | Dashboard - Minimal UI",
};

export default function InvoiceEditPage() {
  const data = INVOICE_EDIT_DATA;

  return (
    <>
      <div className="mb-5">
        <EditPageHeader
          title="Edit"
          backHref="/dashboard/invoice/list"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Invoice", href: "/dashboard/invoice/list" },
            { label: data.invoiceNumber },
          ]}
        />
      </div>

      <InvoiceNewEditForm
        mode="edit"
        initialData={{
          invoiceNumber: data.invoiceNumber,
          status: data.status,
          dateCreate: data.dateCreate,
          dueDate: data.dueDate,
          from: data.from,
          to: data.to,
          items: data.items,
          shipping: data.shipping,
          discount: data.discount,
          taxes: data.taxes,
        }}
      />

      {/* Form action footer */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="h-12 rounded-control bg-transparent px-4 text-[15px] font-bold text-grey-800 transition-colors hover:bg-grey-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          className="h-12 rounded-control bg-foreground px-4 text-[15px] font-bold text-card transition-opacity hover:opacity-90"
        >
          Update &amp; send
        </button>
      </div>
    </>
  );
}
