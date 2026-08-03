import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LevelListView } from "@/components/organization/level/list-view";

export const metadata: Metadata = {
  title: "ระดับ | POL",
};

export default function LevelListPage() {
  return (
    <>
      <PageHeader
        title="ระดับ"
        breadcrumbs={[{ label: "Console" }, { label: "ระดับ" }]}
        action={{ label: "เพิ่มระดับ", href: "/organization/level/create" }}
      />
      <LevelListView />
    </>
  );
}
