import { EditPageHeader } from "@/components/shared/edit-page-header";
import { NotificationLogDetailView } from "@/components/control/notification/notification-log-detail-view";

export const metadata = {
  title: "รายละเอียดการส่งแจ้งเตือน | POL Admin",
};

export default async function NotificationLogReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียดการส่งแจ้งเตือน"
        backHref="/control/notifications"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การแจ้งเตือน", href: "/control/notifications" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <NotificationLogDetailView id={id} />
    </>
  );
}
