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
        breadcrumbs={[
          { label: "การแจ้งเตือน", href: "/control/notifications" },
          { label: "รายชื่อ" },
        ]}
      />
      <NotificationsView />
    </>
  );
}
