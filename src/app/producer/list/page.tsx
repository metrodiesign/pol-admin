import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตัวแทน/นายหน้า | POL",
};

import { PageHeader } from "@/components/shared/page-header";
import { ProducerListView } from "@/components/producer/producer-list-view";

export default function ProducerListPage() {
  return (
    <>
      <PageHeader
        title="รายชื่อตัวแทน/นายหน้า"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/producer/list" },
          { label: "รายชื่อ" },
        ]}
        action={{ label: "เพิ่มตัวแทน", href: "/producer/new" }}
      />
      <ProducerListView />
    </>
  );
}
