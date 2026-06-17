import type { Metadata } from "next";

import { RbacRolesView } from "@/components/rbac/rbac-roles-view";

export const metadata: Metadata = {
  title: "บทบาทและสิทธิ์ | POL",
};

export default function RbacPage() {
  return <RbacRolesView />;
}
