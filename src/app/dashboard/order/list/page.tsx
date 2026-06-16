import { PageHeader } from "@/components/shared/page-header";
import { OrderListView } from "@/components/dashboard/order/order-list-view";

export const metadata = {
  title: "Order list | Dashboard - Minimal UI",
};

export default function OrderListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Order", href: "/dashboard/order/list" },
          { label: "List" },
        ]}
      />
      <OrderListView />
    </>
  );
}
