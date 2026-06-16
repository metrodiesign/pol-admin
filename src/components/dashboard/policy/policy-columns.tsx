"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Policy, PolicyStatus, PaymentStatus } from "@/types/policy";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, EllipsisVertical, Eye, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/payment/toast/toast-provider";

const statusStyles: Record<PolicyStatus, string> = {
  active: "bg-success/16 text-success-dark",
  pending: "bg-warning/16 text-warning-dark",
  expired: "bg-grey-500/16 text-grey-600",
  cancelled: "bg-error/16 text-error-dark",
  due: "bg-warning/16 text-warning-dark",
  lapsed: "bg-error/16 text-error-dark",
};

const statusLabels: Record<PolicyStatus, string> = {
  active: "มีผลบังคับ",
  pending: "รอดำเนินการ",
  expired: "หมดอายุ",
  cancelled: "ยกเลิก",
  due: "ใกล้ครบกำหนด",
  lapsed: "ขาดอายุ",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  paid: "bg-success/16 text-success-dark",
  partial: "bg-warning/16 text-warning-dark",
  unpaid: "bg-grey-500/16 text-grey-600",
  overdue: "bg-error/16 text-error-dark",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "ชำระแล้ว",
  partial: "ชำระบางส่วน",
  unpaid: "ยังไม่ชำระ",
  overdue: "เกินกำหนด",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PolicyActionCell({ policy }: { policy: Policy }) {
  const router = useRouter();
  const toast = useToast();

  function goBuyNow() {
    toast.info("กำลังไปออกใบแจ้งหนี้", {
      description: `กรมธรรม์ ${policy.policyNumber}`,
    });
    router.push(`/invoices/new?policies=${policy.id}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-grey-600 hover:text-foreground"
        aria-label="ดูรายละเอียด"
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-grey-600 hover:text-primary"
        aria-label="ซื้อเลย"
        onClick={(e) => { e.stopPropagation(); goBuyNow(); }}
        title="ซื้อเลย"
      >
        <ShoppingBag className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-grey-600 hover:text-foreground"
            />
          }
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem>
            <Eye className="size-4" />
            ดูรายละเอียด
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goBuyNow}>
            <ShoppingBag className="size-4" />
            ซื้อเลย
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil className="size-4" />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 className="size-4" />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (dateStr === "-") return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export const policyColumns: ColumnDef<Policy>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        aria-label="เลือกทั้งหมด"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(checked) => row.toggleSelected(checked)}
        aria-label={`เลือก ${row.original.policyNumber}`}
      />
    ),
    enableSorting: false,
    size: 48,
    meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
  },
  {
    accessorKey: "customerName",
    header: "ลูกค้า / เลขกรมธรรม์",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={p.customerAvatarUrl} alt={p.customerName} />
            <AvatarFallback>{getInitials(p.customerName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {p.customerName}
            </span>
            <span className="block truncate text-[13px] text-grey-500">
              {p.policyNumber}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: "แผนประกัน",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="min-w-0">
          <span className="block truncate">{p.productName}</span>
          <span className="block text-[13px] text-grey-500">
            ทุน {formatCurrency(p.sumInsured)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "premium",
    header: "เบี้ยประกัน",
    cell: ({ row }) => formatCurrency(row.original.premium),
  },
  {
    accessorKey: "paidAmount",
    header: "ยอดชำระ",
    cell: ({ row }) => {
      const p = row.original;
      const percent = p.totalAmount > 0
        ? Math.round((p.paidAmount / p.totalAmount) * 100)
        : 0;
      return (
        <div className="min-w-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-foreground">{formatCurrency(p.paidAmount)}</span>
            <span className="text-grey-500 text-xs">{percent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-grey-200">
            <div
              className={`h-full rounded-full transition-all ${
                percent >= 100
                  ? "bg-success"
                  : percent > 0
                    ? "bg-warning"
                    : "bg-grey-400"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <span className="text-[12px] text-grey-500">
            จาก {formatCurrency(p.totalAmount)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "ช่องทาง",
  },
  {
    accessorKey: "lastPaymentDate",
    header: "ชำระล่าสุด",
    cell: ({ row }) => formatDate(row.original.lastPaymentDate),
  },
  {
    accessorKey: "status",
    header: "สถานะกรมธรรม์",
    cell: ({ row }) => (
      <span
        className={`inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold ${
          statusStyles[row.original.status]
        }`}
      >
        {statusLabels[row.original.status]}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "สถานะชำระ",
    cell: ({ row }) => (
      <span
        className={`inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold ${
          paymentStatusStyles[row.original.paymentStatus]
        }`}
      >
        {paymentStatusLabels[row.original.paymentStatus]}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    size: 100,
    cell: ({ row }) => <PolicyActionCell policy={row.original} />,
  },
];
