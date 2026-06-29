"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, EllipsisVertical, Eye, Trash2 } from "lucide-react";
import type { Order } from "@/types/order";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OrderStatusLabel } from "./order-status-label";
import { cn } from "@/lib/utils";

interface OrderTableRowProps {
  order: Order;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  dense: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function OrderTableRow({
  order,
  selected,
  onSelect,
  dense,
  expanded,
  onToggleExpand,
}: OrderTableRowProps) {
  const py = dense ? "py-2" : "py-4";

  return (
    <>
      <TableRow
        className={cn(
          "border-b border-dashed border-[var(--divider)] transition-colors",
          selected
            ? "bg-[var(--action-selected)]"
            : "hover:bg-[var(--action-hover)]",
        )}
      >
        {/* Checkbox */}
        <TableCell className="w-12 pl-1 pr-0">
          <Checkbox
            checked={selected}
            onChange={onSelect}
            aria-label={`Select order ${order.orderNumber}`}
          />
        </TableCell>

        {/* Order # */}
        <TableCell className={cn("px-4 text-sm font-normal", py)}>
          <Link
            href={`/dashboard/order/details`}
            className="text-foreground underline decoration-foreground/40 hover:decoration-foreground"
          >
            {order.orderNumber}
          </Link>
        </TableCell>

        {/* Customer */}
        <TableCell className={cn("px-4", py)}>
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-grey-200">
              <Image
                src={order.customer.avatarUrl}
                alt={order.customer.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {order.customer.name}
              </p>
              <p className="truncate text-xs text-grey-600">
                {order.customer.email}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Date */}
        <TableCell className={cn("px-4", py)}>
          <p className="text-sm text-foreground">{order.date}</p>
          <p className="text-xs text-grey-600">{order.time}</p>
        </TableCell>

        {/* Items */}
        <TableCell className={cn("px-4 text-sm text-foreground", py)}>
          {order.items}
        </TableCell>

        {/* Price */}
        <TableCell className={cn("px-4 text-sm text-foreground", py)}>
          {formatPrice(order.price)}
        </TableCell>

        {/* Status */}
        <TableCell className={cn("px-4", py)}>
          <OrderStatusLabel status={order.status} />
        </TableCell>

        {/* Actions */}
        <TableCell className={cn("px-4", py)}>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleExpand}
              className="text-grey-600 hover:text-foreground"
              aria-label="Expand row"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-grey-600 hover:text-foreground"
                    aria-label="More actions"
                  />
                }
              >
                <EllipsisVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem>
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded detail row — list of order line items */}
      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={8} className="p-0">
            <div className="m-3 rounded-lg bg-grey-200">
              {order.orderItems.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center py-3 pl-3 pr-4"
                >
                  <div className="relative mr-4 size-12 shrink-0 overflow-hidden rounded-xl bg-card">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.name}</p>
                    <p className="text-sm text-grey-500">{item.sku}</p>
                  </div>
                  <span className="text-sm text-foreground">
                    x{item.qty}
                  </span>
                  <span className="ml-8 w-20 text-right text-sm text-[rgb(28,37,46)]">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
