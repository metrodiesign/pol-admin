"use client";

import { Search, EllipsisVertical } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/mock/policies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PolicyListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

export function PolicyListToolbar({
  search,
  onSearchChange,
  paymentMethod,
  onPaymentMethodChange,
}: PolicyListToolbarProps) {
  return (
    <div className="flex items-center gap-4 py-5 pr-2 pl-5">
      <Select
        value={paymentMethod}
        onValueChange={(v) => onPaymentMethodChange(v === "__all__" || v === null ? "" : v)}
      >
        <SelectTrigger className="w-[200px] rounded-control border-grey-300 text-base" style={{ height: 56 }}>
          <SelectValue placeholder="ช่องทางชำระ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">ทั้งหมด</SelectItem>
          {PAYMENT_METHODS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-1 items-center gap-2 h-14 rounded-control border border-grey-300 px-3.5">
        <Search className="size-5 text-grey-500 shrink-0" />
        <input
          type="text"
          aria-label="ค้นหานโยบาย"
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent py-4 text-[15px] text-foreground placeholder:text-grey-500 outline-none"
        />
      </div>

      <Button variant="ghost" size="icon" className="text-grey-600 shrink-0">
        <EllipsisVertical className="size-5" />
      </Button>
    </div>
  );
}
