import { PageHeader } from "@/components/shared/page-header";
import { NotificationsView } from "@/components/control/notification/view";

export const metadata = {
  title: "การแจ้งเตือน | POL Admin",
};

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="การแจ้งเตือน"
        description="ตั้งกฎแจ้งเตือนเหตุการณ์สำคัญ และดูประวัติการส่งแจ้งเตือน"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การแจ้งเตือน" },
        ]}
      />
      <NotificationsView />
    </>
  );
}
