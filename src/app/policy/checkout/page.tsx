import { PageHeader } from "@/components/shared/page-header";
import { parseIdsParam } from "@/lib/policy/checkout";
import { PolicyCheckoutView } from "@/components/policy/policy-checkout-view";

export const metadata = {
  title: "ชำระเบี้ย | POL Admin",
};

export default async function PolicyCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;

  return (
    <>
      <PageHeader
        title="ชำระเบี้ย"
        breadcrumbs={[{ label: "กรมธรรม์", href: "/policy/list" }, { label: "ชำระเบี้ย" }]}
      />
      <PolicyCheckoutView ids={parseIdsParam(ids)} />
    </>
  );
}
