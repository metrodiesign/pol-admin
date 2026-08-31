import { PageHeader } from "@/components/shared/page-header";
import { WebhooksView } from "@/components/control/webhook/view";

export const metadata = {
  title: "Webhooks และเหตุการณ์ | POL Admin",
};

export default function WebhooksPage() {
  return (
    <>
      <PageHeader
        title="Webhooks และเหตุการณ์"
        breadcrumbs={[
          { label: "Webhooks และเหตุการณ์", href: "/control/webhooks" },
          { label: "รายชื่อ" },
        ]}
      />
      <WebhooksView />
    </>
  );
}
