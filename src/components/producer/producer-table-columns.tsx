"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PERSON_TYPE_LABEL,
  type Producer,
  type ProducerStatus,
} from "@/types/producer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2 } from "lucide-react";

const statusStyles: Record<ProducerStatus, string> = {
  active: "bg-success/16 text-success-dark",
  pending: "bg-warning/16 text-warning-dark",
  banned: "bg-error/16 text-error-dark",
  rejected: "bg-grey-500/16 text-grey-600",
  disabled: "bg-grey-500/16 text-grey-600",
};

const statusLabel: Record<ProducerStatus, string> = {
  active: "ใช้งาน",
  pending: "รอตรวจสอบ",
  banned: "ระงับ",
  rejected: "ปฏิเสธ",
  disabled: "ปิดใช้งาน",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const producerColumns: ColumnDef<Producer>[] = [
  {
    id: "select",
    enableSorting: false,
    meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
    header: ({ table }) => (
      <Checkbox
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
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`เลือก ${row.original.firstName}`}
      />
    ),
  },
  {
    id: "name",
    accessorFn: (p) => `${p.firstName} ${p.lastName}`,
    header: "ชื่อ",
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original;
      const name = `${p.firstName} ${p.lastName}`;
      return (
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={p.avatarUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href="/producer/read"
              className="block truncate text-sm font-normal leading-[22px] text-foreground hover:underline"
            >
              {name}
            </Link>
            <span className="block truncate text-sm leading-[22px] text-grey-500">
              {p.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "producerCode",
    header: "รหัสตัวแทน",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "personType",
    header: "ประเภท",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {PERSON_TYPE_LABEL[row.original.personType]}
      </span>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "โทรศัพท์",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "licenseNumber",
    header: "เลขที่ใบอนุญาต",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: false,
    cell: ({ row }) => (
      <span
        className={`inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold ${statusStyles[row.original.status]}`}
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
                render={<Link href="/producer/read" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`ดู ${row.original.firstName}`}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดู</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={<Link href="/producer/edit" />}
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
                className="size-10 cursor-pointer text-error hover:bg-error/8 hover:text-error"
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
