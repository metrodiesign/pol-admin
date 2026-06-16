"use client";

import { TableFooter } from "@/components/payment/table-footer";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { Branch } from "@/types/originator";

interface BranchesTableFooterProps {
  table: TanstackTable<Branch>;
  totalFiltered: number;
}

export function BranchesTableFooter({
  table,
  totalFiltered,
}: BranchesTableFooterProps) {
  return (
    <TableFooter table={table} totalFiltered={totalFiltered} entityLabel="สาขา" />
  );
}
