"use client";

import { PaginationFooterShell } from "@/components/payment/table-footer";

interface InvoiceTableFooterProps {
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function InvoiceTableFooter({
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: InvoiceTableFooterProps) {
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <PaginationFooterShell
      from={from}
      to={to}
      total={total}
      pageSize={rowsPerPage}
      canPrev={page > 0}
      canNext={page < totalPages - 1}
      onPrev={() => onPageChange(page - 1)}
      onNext={() => onPageChange(page + 1)}
      onPageSizeChange={(size) => {
        onRowsPerPageChange(size);
        onPageChange(0);
      }}
      entityLabel="รายการ"
    />
  );
}
