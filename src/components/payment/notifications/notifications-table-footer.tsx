"use client";

import { TableFooter } from "@/components/payment/table-footer";
import type { Table as TanstackTable } from "@tanstack/react-table";
import type { Notification } from "@/lib/mock/notifications";

interface NotificationsTableFooterProps {
  table: TanstackTable<Notification>;
  totalFiltered: number;
}

export function NotificationsTableFooter({
  table,
  totalFiltered,
}: NotificationsTableFooterProps) {
  return (
    <TableFooter
      table={table}
      totalFiltered={totalFiltered}
      entityLabel="รายการ"
    />
  );
}
