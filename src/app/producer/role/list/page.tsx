import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { RolesView } from "@/components/producer-role/roles-view";

export const metadata: Metadata = {
  title: "บทบาทและสิทธิ์ | POL",
};

export default function RolePage() {
  return (
    <>
      <PageHeader
        title="บทบาทและสิทธิ์"
        breadcrumbs={[{ label: "Console" }, { label: "บทบาทและสิทธิ์" }]}
        action={{ label: "เพิ่มบทบาทใหม่", href: "/producer/role/create" }}
      />
      <RolesView />
    </>
  );
}
