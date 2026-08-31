import { OriginatorDetailView } from "@/components/control/originator/detail-view";

export const metadata = {
  title: "รายละเอียด Originator | POL Admin",
};

export default async function OriginatorReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <OriginatorDetailView id={id} />;
}
