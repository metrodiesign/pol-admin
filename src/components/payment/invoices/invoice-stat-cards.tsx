import { FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { formatTHB } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";
import { StatCardIcon } from "@/components/payment/stat-card";

function fmtTHB(n: number): string {
  if (n >= 1_000_000) return "฿" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "฿" + (n / 1_000).toFixed(1) + "K";
  return formatTHB(n);
}

interface InvoiceStatCardsProps {
  invoices: Invoice[];
}

export function InvoiceStatCards({ invoices }: InvoiceStatCardsProps) {
  const total = invoices.length;
  const pendingCount = invoices.filter((i) => i.status === "pending" || i.status === "partial").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  const totalUnpaid = invoices
    .filter((i) => i.status === "pending" || i.status === "partial")
    .reduce((s, x) => s + x.total, 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, x) => s + x.total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, x) => s + x.total, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardIcon
        icon={FileText}
        label="ใบแจ้งหนี้ทั้งหมด"
        value={String(total)}
        sub="รวมลิงก์ชำระในตัว"
        tone="primary"
      />
      <StatCardIcon
        icon={Clock}
        label="รอชำระ"
        value={fmtTHB(totalUnpaid)}
        sub={`${pendingCount} ใบ`}
        tone="warning"
      />
      <StatCardIcon
        icon={AlertTriangle}
        label="เกินกำหนด"
        value={fmtTHB(totalOverdue)}
        sub={`${overdueCount} ใบ`}
        tone="danger"
      />
      <StatCardIcon
        icon={CheckCircle}
        label="ชำระแล้ว"
        value={fmtTHB(totalPaid)}
        sub={`${paidCount} ใบ`}
        tone="success"
      />
    </div>
  );
}
