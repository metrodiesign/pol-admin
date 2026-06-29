import { PageHeader } from "@/components/shared/page-header";
import { OriginatorsView } from "@/components/control/originator/originators-view";

export const metadata = {
  title: "ต้นทางคำสั่ง | POL Admin",
};

export default function OriginatorsPage() {
  return (
    <>
      <PageHeader
        title="ต้นทางคำสั่ง"
        description="แหล่งที่เริ่มรายการชำระเงิน เช่น สาขา แอปเชื่อมต่อ หรือตัวแทน"
        breadcrumbs={[{ label: "Control plane" }, { label: "ต้นทางคำสั่ง" }]}
      />
      <OriginatorsView />
    </>
  );
}
