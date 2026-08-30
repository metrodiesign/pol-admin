import { WebhookDetailView } from "@/components/control/webhook/detail-view";

export const metadata = {
  title: "รายละเอียด Webhook Event | POL Admin",
};

export default async function WebhookReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <WebhookDetailView id={id} />;
}
