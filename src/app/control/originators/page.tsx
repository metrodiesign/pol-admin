import { PageHeader } from "@/components/shared/page-header";
import { OriginatorsView } from "@/components/control/originator/view";

export const metadata = {
  title: "ต้นทางคำสั่ง | POL Admin",
};

export default function OriginatorsPage() {
  return (
    <>
      <PageHeader
        title="ต้นทางคำสั่ง"
        breadcrumbs={[
          { label: "Originators", href: "/control/originators" },
          { label: "รายชื่อ" },
        ]}
      />
      <OriginatorsView />
    </>
  );
}
