import type { Metadata } from "next";

import { RolesView } from "@/components/producer-role/roles-view";

export const metadata: Metadata = {
  title: "บทบาทและสิทธิ์ | POL",
};

export default function RolePage() {
  return <RolesView />;
}
