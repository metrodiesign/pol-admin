"use client";

import { TableFooter } from "@/components/payment/table-footer";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { User } from "@/types/user";

interface UsersTableFooterProps {
  table: TanstackTable<User>;
  totalFiltered: number;
}

export function UsersTableFooter({ table, totalFiltered }: UsersTableFooterProps) {
  return (
    <TableFooter table={table} totalFiltered={totalFiltered} entityLabel="บัญชี" />
  );
}
