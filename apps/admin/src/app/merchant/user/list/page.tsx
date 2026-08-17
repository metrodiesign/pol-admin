import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตัวแทน/นายหน้า | POL",
};

import { PageHeader } from "@/components/shared/page-header";
import { MerchantUserListView } from "@/components/merchant/user/list-view";

export default function MerchantUserListPage() {
  return (
    <>
      <PageHeader
        title="รายชื่อตัวแทน/นายหน้า"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/merchant/user/list" },
          { label: "รายชื่อ" },
        ]}
        action={{ label: "เพิ่มตัวแทน", href: "/merchant/user/new" }}
      />
      <MerchantUserListView />
    </>
  );
}
