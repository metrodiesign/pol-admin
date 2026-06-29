import { PageHeader } from "@/components/shared/page-header";
import { ApiClientsView } from "@/components/control/api-client/api-clients-view";

export const metadata = {
  title: "ไคลเอนต์ API | POL Admin",
};

export default function ApiClientsPage() {
  return (
    <>
      <PageHeader
        title="ไคลเอนต์ API"
        description="แอปและระบบภายนอกที่เชื่อมต่อผ่าน API — จัดการสิทธิ์การเข้าถึงและการเพิกถอน"
        breadcrumbs={[{ label: "Control plane" }, { label: "ไคลเอนต์ API" }]}
      />
      <ApiClientsView />
    </>
  );
}
