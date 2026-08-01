import { PageHeader } from "@/components/shared/page-header";
import { InvoiceAnalytic } from "@/components/dashboard/invoice/invoice-analytic";
import { InvoiceListView } from "@/components/dashboard/invoice/invoice-list-view";

export const metadata = {
  title: "Invoice list | Dashboard - Minimal UI",
};

export default function InvoiceListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "Invoice", href: "/minimals/invoice/list" },
          { label: "List" },
        ]}
        action={{ label: "Add invoice", href: "/minimals/invoice/new" }}
      />
      <InvoiceAnalytic />
      <InvoiceListView />
    </>
  );
}
