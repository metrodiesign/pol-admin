"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { User, UserStatus } from "@/types/admin/user";
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

export const statusStyles: Record<UserStatus, string> = {
  active: "bg-success/16 text-success-dark",
  banned: "bg-error/16 text-error-dark",
};

export const statusLabel: Record<UserStatus, string> = {
  active: "ใช้งาน",
  banned: "ระงับ",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const userColumns: ColumnDef<User>[] = [
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
        aria-label={`เลือก ${row.original.name}`}
      />
    ),
  },
  {
    id: "createdAt",
    header: "วันที่ทำรายการ",
    enableSorting: true,
    meta: { headClassName: "w-[180px]", cellClassName: "w-[180px]" },
    accessorFn: (u) => u.createdAt,
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
    accessorKey: "name",
    header: "ชื่อ-นามสกุล",
    enableSorting: true,
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-4">
          {/* avatarUrl ยังไม่มี HTTP endpoint serve รูปจริง (REQ-4.9) — placeholder initials เสมอ เหมือน merchant-user/list */}
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-[22px] text-foreground">
              {u.name}
            </span>
            <span className="block truncate text-sm leading-[22px] text-grey-500">
              {u.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "เบอร์โทรศัพท์",
    enableSorting: false,
    meta: { headClassName: "w-[160px]", cellClassName: "w-[160px]" },
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "สำนักงาน",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "roles",
    header: "บทบาท",
    enableSorting: false,
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue<string[]>().map((r) => (
          <span
            key={r}
            className="inline-flex h-6 items-center rounded-md bg-grey-600/8 px-1.5 text-xs font-bold text-grey-700"
          >
            {r}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: false,
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold ${statusStyles[row.original.status]}`}
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
                render={<Link href="/admin/user/read" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`ดูรายละเอียด ${row.original.name}`}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดูรายละเอียด</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={<Link href="/admin/user/edit" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`แก้ไข ${row.original.name}`}
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
                aria-label={`ลบ ${row.original.name}`}
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
