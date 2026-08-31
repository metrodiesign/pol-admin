import { ApiClientDetailView } from "@/components/control/api-client/detail-view";

export const metadata = {
  title: "รายละเอียด API Client | POL Admin",
};

export default async function ApiClientReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <ApiClientDetailView id={id} />;
}
