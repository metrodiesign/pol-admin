import { NotificationLogDetailView } from "@/components/control/notification/log-detail-view";

export const metadata = {
  title: "รายละเอียดการส่งแจ้งเตือน | POL Admin",
};

export default async function NotificationLogReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <NotificationLogDetailView id={id} />;
}
