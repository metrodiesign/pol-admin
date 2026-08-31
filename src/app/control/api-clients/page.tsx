import { PageHeader } from "@/components/shared/page-header";
import { ApiClientsView } from "@/components/control/api-client/view";

export const metadata = {
  title: "ไคลเอนต์ API | POL Admin",
};

export default function ApiClientsPage() {
  return (
    <>
      <PageHeader
        title="ไคลเอนต์ API"
        breadcrumbs={[
          { label: "ไคลเอนต์ API", href: "/control/api-clients" },
          { label: "รายชื่อ" },
        ]}
      />
      <ApiClientsView />
    </>
  );
}
