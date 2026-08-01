import { PageHeader } from "@/components/shared/page-header";
import { PolicyCheckoutSessionView } from "@/components/policy/policy-checkout-session-view";

export const metadata = {
  title: "ชำระเบี้ย | POL Admin",
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
        title="ชำระเบี้ย"
        breadcrumbs={[{ label: "กรมธรรม์", href: "/policy/list" }, { label: "ชำระเบี้ย" }]}
      />
      <PolicyCheckoutSessionView sessionId={sessionId} />
    </>
  );
}
