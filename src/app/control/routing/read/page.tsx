import { RoutingDetailView } from "@/components/control/routing/detail-view";

export const metadata = {
  title: "รายละเอียด Routing Rule | POL Admin",
};

export default async function RoutingReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <RoutingDetailView id={id} />;
}
