import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { PositionListView } from "@/components/organization/position/list-view";

export const metadata: Metadata = {
  title: "ตำแหน่ง | POL",
};

export default function PositionListPage() {
  return (
    <>
      <PageHeader
        title="ตำแหน่ง"
        breadcrumbs={[{ label: "Console" }, { label: "ตำแหน่ง" }]}
        action={{ label: "เพิ่มตำแหน่ง", href: "/organization/position/create" }}
      />
      <PositionListView />
    </>
  );
}
