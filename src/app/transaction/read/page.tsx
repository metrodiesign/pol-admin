import { PageHeader } from "@/components/shared/page-header";
import { TransactionDetailView } from "@/components/transaction/transaction-detail-view";

export const metadata = {
  title: "รายละเอียดธุรกรรม | POL Admin",
};

export default async function TransactionReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <PageHeader
        title="รายละเอียดธุรกรรม"
        breadcrumbs={[
          { label: "รายการชำระเงิน", href: "/transaction/list" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <TransactionDetailView id={id} />
    </>
  );
}
