import { PageHeader } from "@/components/shared/page-header";
import { OriginatorsView } from "@/components/control/originator/originators-view";

export const metadata = {
  title: "Originators | POL Admin",
};

export default function OriginatorsPage() {
  return (
    <>
      <PageHeader
        title="Originators"
        description="แหล่งที่เริ่มรายการชำระเงิน เช่น สาขา แอปเชื่อมต่อ หรือตัวแทน"
        breadcrumbs={[{ label: "Control plane" }, { label: "Originators" }]}
      />
      <OriginatorsView />
    </>
  );
}
