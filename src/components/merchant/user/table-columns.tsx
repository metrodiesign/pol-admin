"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PERSON_TYPE_LABEL,
  type MerchantUser,
  type MerchantUserStatus,
} from "@/types/merchant/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatThaiDate } from "@/lib/date-range";

const statusStyles: Record<MerchantUserStatus, string> = {
  Active: "bg-success/16 text-success-dark",
  PendingApproval: "bg-warning/16 text-warning-dark",
  Rejected: "bg-grey-500/16 text-grey-600",
  Suspended: "bg-error/16 text-error-dark",
};

export const statusLabel: Record<MerchantUserStatus, string> = {
  Active: "ใช้งาน",
  PendingApproval: "รอตรวจสอบ",
  Rejected: "ปฏิเสธ",
  Suspended: "ระงับ",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const merchantUserColumns: ColumnDef<MerchantUser>[] = [
  {
    id: "select",
    enableSorting: false,
    meta: { headClassName: "w-12 pl-1 pr-0 py-2", cellClassName: "w-12 pl-1 pr-0" },
    header: ({ table }) => (
      <Checkbox
        className="justify-end"
        checked={table.getIsAllRowsSelected()}
        indeterminate={
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        onChange={(c) => table.toggleAllRowsSelected(c)}
        aria-label="เลือกทั้งหมด"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="justify-end"
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`เลือก ${row.original.firstName}`}
      />
    ),
  },
  {
    id: "createdAt",
    header: "วันที่ทำรายการ",
    enableSorting: true,
    meta: { headClassName: "w-[180px]", cellClassName: "w-[180px]" },
    accessorFn: (p) => p.createdAt,
    cell: ({ row }) => {
      const d = new Date(row.original.createdAt);
      const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      return (
        <span className="text-sm text-grey-600">
          {formatThaiDate(d)} {time}
        </span>
      );
    },
  },
  {
    id: "name",
    accessorFn: (p) => `${p.firstName} ${p.lastName}`,
    header: "ชื่อ-นามสกุล",
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original;
      const name = `${p.firstName} ${p.lastName}`;
      return (
        <div className="flex items-center gap-4">
          {/* photoObjectKey ไม่มี HTTP endpoint serve รูปจริง (REQ-4.9) — placeholder initials เสมอ */}
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-[22px] text-foreground">
              {name}
            </span>
            <span className="block truncate text-sm leading-[22px] text-grey-500">
              {p.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "โทรศัพท์",
    enableSorting: false,
    meta: { headClassName: "w-[160px]", cellClassName: "w-[160px]" },
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string | null>() ?? "-"}</span>
    ),
  },
  {
    accessorKey: "producerCode",
    header: "รหัสตัวแทน",
    enableSorting: false,
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string | null>() ?? "-"}</span>
    ),
  },
  {
    accessorKey: "personType",
    header: "ประเภท",
    enableSorting: false,
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ row }) => {
      const pt = row.original.personType;
      return (
        <span className="text-sm text-foreground">
          {pt ? PERSON_TYPE_LABEL[pt] : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "licenseNumber",
    header: "เลขที่ใบอนุญาต",
    enableSorting: false,
    meta: { headClassName: "w-[160px]", cellClassName: "w-[160px]" },
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string | null>() ?? "-"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: false,
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${statusStyles[row.original.status]}`}
      >
        {statusLabel[row.original.status]}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-44", cellClassName: "w-44" },
    header: () => null,
    cell: ({ row }) => (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={<Link href="/merchant/user/read" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`ดูรายละเอียด ${row.original.firstName}`}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดูรายละเอียด</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={<Link href="/merchant/user/edit" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`แก้ไข ${row.original.firstName}`}
              >
                <Pencil className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>แก้ไข</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-error/8 text-error hover:bg-error hover:text-white"
                aria-label={`ลบ ${row.original.firstName}`}
              >
                <Trash2 className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ลบ</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
];
