import { PageHeader } from "@/components/shared/page-header";
import { OrderListView } from "@/components/order/order-list-view";
import { OrderCsvButton } from "@/components/order/order-csv-button";

export const metadata = {
  title: "รายการคำสั่งซื้อ | POL Admin",
};

export default function OrderListPage() {
  return (
    <>
      <PageHeader
        title="รายการคำสั่งซื้อ"
        breadcrumbs={[
          { label: "คำสั่งซื้อ", href: "/order/list" },
          { label: "รายการ" },
        ]}
        actions={<OrderCsvButton />}
      />
      <OrderListView />
    </>
  );
}
