import { PageHeader } from "@/components/shared/page-header";
import { PolicyCheckoutSessionView } from "@/components/policy/checkout-session-view";

export const metadata = {
  title: "ยืนยันคำสั่งซื้อ | POL Admin",
};

export default async function CheckoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <>
      <PageHeader
        title="ยืนยันคำสั่งซื้อ"
        breadcrumbs={[{ label: "กรมธรรม์", href: "/policy/list" }, { label: "ยืนยันคำสั่งซื้อ" }]}
      />
      <PolicyCheckoutSessionView sessionId={sessionId} />
    </>
  );
}
