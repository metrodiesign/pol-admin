import { PageHeader } from "@/components/shared/page-header";
import { PolicyMarketplaceView } from "@/components/policy/marketplace-view";

export const metadata = {
  title: "กรมธรรม์ | POL Admin",
};

export default function PolicyListPage() {
  return (
    <>
      <PageHeader
        title="กรมธรรม์"
        breadcrumbs={[{ label: "กรมธรรม์", href: "/policy/list" }, { label: "รายการ" }]}
      />
      <PolicyMarketplaceView />
    </>
  );
}
