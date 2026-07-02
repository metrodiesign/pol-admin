import { PageHeader } from "@/components/shared/page-header";
import { OrderDetailView } from "@/components/order/order-detail-view";

export const metadata = {
  title: "รายละเอียดคำสั่งซื้อ | POL Admin",
};

export default async function OrderReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <PageHeader
        title="รายละเอียดคำสั่งซื้อ"
        breadcrumbs={[
          { label: "คำสั่งซื้อ", href: "/order/list" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <OrderDetailView id={id} />
    </>
  );
}
