import { cn } from "@/lib/utils";
import type { MinimalsInvoiceStatus } from "@/lib/mock/invoice-minimals";

const STATUS_CONFIG: Record<MinimalsInvoiceStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "text-success-dark bg-success/16",
  },
  pending: {
    label: "Pending",
    className: "text-warning-dark bg-warning/16",
  },
  overdue: {
    label: "Overdue",
    className: "text-error-dark bg-error/16",
  },
  draft: {
    label: "Draft",
    className: "text-grey-600 bg-grey-200",
  },
};

interface InvoiceStatusLabelProps {
  status: MinimalsInvoiceStatus;
  className?: string;
}

export function InvoiceStatusLabel({ status, className }: InvoiceStatusLabelProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-[6px] px-1.5 text-xs font-bold leading-[18px]",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
