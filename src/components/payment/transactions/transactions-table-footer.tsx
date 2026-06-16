"use client";

import { TableFooter } from "@/components/payment/table-footer";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { Transaction } from "@/types/transaction";

interface TransactionsTableFooterProps {
  table: TanstackTable<Transaction>;
  totalFiltered: number;
}

export function TransactionsTableFooter({
  table,
  totalFiltered,
}: TransactionsTableFooterProps) {
  return (
    <TableFooter
      table={table}
      totalFiltered={totalFiltered}
      entityLabel="ธุรกรรม"
    />
  );
}
