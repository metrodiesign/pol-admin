import { PageHeader } from "@/components/shared/page-header";
import { WebhooksView } from "@/components/control/webhook/webhooks-view";

export const metadata = {
  title: "Webhooks & Events | POL Admin",
};

export default function WebhooksPage() {
  return (
    <>
      <PageHeader
        title="Webhooks & Events"
        description="เหตุการณ์ที่ PSP ส่งกลับมายืนยันสถานะการชำระเงิน — แหล่งความจริงของสถานะ ส่งซ้ำได้เมื่อส่งไม่สำเร็จ"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Webhooks & Events" },
        ]}
      />
      <WebhooksView />
    </>
  );
}
