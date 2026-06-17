"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { User, UserStatus } from "@/types/user";
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

const statusStyles: Record<UserStatus, string> = {
  active: "bg-success/16 text-success-dark",
  pending: "bg-warning/16 text-warning-dark",
  banned: "bg-error/16 text-error-dark",
  rejected: "bg-grey-500/16 text-grey-600",
  disabled: "bg-grey-500/16 text-grey-600",
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
    meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        onChange={(c) => table.toggleAllRowsSelected(c)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={u.avatarUrl} alt={u.name} />
            <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href="/user/read"
              className="block truncate text-sm font-normal leading-[22px] text-foreground hover:underline"
            >
              {u.name}
            </Link>
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
    header: "Phone number",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <span
        className={`inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold capitalize ${statusStyles[row.original.status]}`}
      >
        {row.original.status}
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
                render={<Link href="/user/read" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`View ${row.original.name}`}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดู</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={<Link href="/user/edit" />}
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`Edit ${row.original.name}`}
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
                aria-label={`Delete ${row.original.name}`}
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
