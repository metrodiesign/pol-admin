"use client";

import { TableFooter } from "@/components/payment/table-footer";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { Role } from "@/types/role";

interface RolesTableFooterProps {
  table: TanstackTable<Role>;
  totalFiltered: number;
}

export function RolesTableFooter({ table, totalFiltered }: RolesTableFooterProps) {
  return (
    <TableFooter table={table} totalFiltered={totalFiltered} entityLabel="Role" />
  );
}
