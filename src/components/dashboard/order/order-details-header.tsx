"use client";

import Link from "next/link";
import { ChevronLeft, Pencil, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { OrderStatusLabel } from "./order-status-label";
import type { OrderStatus } from "@/types/order";

interface OrderDetailsHeaderProps {
  orderNumber: string;
  status: OrderStatus;
  date: string;
  time: string;
}

export function OrderDetailsHeader({
  orderNumber,
  status,
  date,
  time,
}: OrderDetailsHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      {/* Left cluster */}
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/order/list"
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-[var(--action-hover)]"
            aria-label="Back to order list"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h4 className="text-2xl font-bold leading-9 text-foreground">
            Order {orderNumber}
          </h4>
          <OrderStatusLabel status={status} />
        </div>
        <p className="ml-10 mt-0.5 text-sm text-grey-600">
          {date} {time}
        </p>
      </div>

      {/* Right cluster: action buttons */}
      <div className="flex items-center gap-2">
        {/* Status select */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-9 gap-1.5 rounded-lg border-[rgba(145,158,171,0.32)] text-sm font-bold text-foreground"
              />
            }
          >
            <OrderStatusLabel status={status} />
            <ChevronDown className="size-4 text-grey-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem>Pending</DropdownMenuItem>
            <DropdownMenuItem>Completed</DropdownMenuItem>
            <DropdownMenuItem>Cancelled</DropdownMenuItem>
            <DropdownMenuItem>Refunded</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Print */}
        <Button
          variant="outline"
          className="h-9 gap-1.5 rounded-lg border-[rgba(145,158,171,0.32)] text-sm font-bold text-foreground"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Print
        </Button>

        {/* Edit */}
        <Button className="h-9 gap-1.5 rounded-lg bg-foreground px-3 text-sm font-bold text-card hover:opacity-90">
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>
    </div>
  );
}
