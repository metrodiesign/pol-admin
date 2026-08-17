import { PageHeader } from "@/components/shared/page-header";
import { InvoiceNewEditForm } from "@/components/dashboard/invoice/invoice-new-edit-form";

export const metadata = {
  title: "Create a new invoice | Dashboard - Minimal UI",
};

export default function InvoiceCreatePage() {
  return (
    <>
      <PageHeader
        title="Create a new invoice"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "Invoice", href: "/minimals/invoice/list" },
          { label: "Create" },
        ]}
      />

      <InvoiceNewEditForm mode="create" />

      {/* Form action footer */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="h-12 rounded-control bg-transparent px-4 text-sm font-bold text-grey-800 transition-colors hover:bg-grey-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          className="h-12 rounded-control bg-foreground px-4 text-sm font-bold text-card transition-opacity hover:opacity-90"
        >
          Create &amp; send
        </button>
      </div>
    </>
  );
}
