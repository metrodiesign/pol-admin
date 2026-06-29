import { PageHeader } from "@/components/shared/page-header";
import { TransactionListView } from "@/components/transaction/transaction-list-view";
import { TransactionCsvButton } from "@/components/transaction/transaction-csv-button";

export const metadata = {
  title: "รายการธุรกรรม | POL Admin",
};

export default function TransactionListPage() {
  return (
    <>
      <PageHeader
        title="รายการธุรกรรม"
        breadcrumbs={[
          { label: "รายการธุรกรรม", href: "/transaction/list" },
          { label: "รายการ" },
        ]}
        actions={<TransactionCsvButton />}
      />
      <TransactionListView />
    </>
  );
}
