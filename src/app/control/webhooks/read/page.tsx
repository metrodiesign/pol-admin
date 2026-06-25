import { EditPageHeader } from "@/components/shared/edit-page-header";
import { WebhookDetailView } from "@/components/control/webhook/webhook-detail-view";

export const metadata = {
  title: "รายละเอียด Webhook Event | POL Admin",
};

export default async function WebhookReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด Webhook Event"
        backHref="/control/webhooks"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Webhooks & Events", href: "/control/webhooks" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <WebhookDetailView id={id} />
    </>
  );
}
