"use client";

import { Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentChannel } from "@/types/transaction";

interface InvoiceListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  channelFilter: PaymentChannel | "all";
  onChannelFilterChange: (v: PaymentChannel | "all") => void;
}

export function InvoiceListToolbar({
  search,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
}: InvoiceListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 px-5 py-3 border-b border-[rgba(145,158,171,0.12)]">
      {/* Channel filter */}
      <Select
        value={channelFilter}
        onValueChange={(v) => onChannelFilterChange(v as PaymentChannel | "all")}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="ช่องทาง: ทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ช่องทาง: ทั้งหมด</SelectItem>
          <SelectItem value="card">บัตรเครดิต/เดบิต</SelectItem>
          <SelectItem value="qr">PromptPay QR</SelectItem>
          <SelectItem value="installment">ผ่อนชำระ</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-grey-400 pointer-events-none" />
        <input
          type="text"
          placeholder="เลขใบแจ้งหนี้, ลูกค้า, ref..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-72 rounded-lg border border-[rgba(145,158,171,0.32)] bg-transparent pl-9 pr-8 text-sm outline-none focus:border-primary placeholder:text-grey-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 text-grey-400 hover:text-grey-600 transition-colors"
            aria-label="ล้างคำค้น"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Create button */}
      <Link
        href="/invoices/new"
        className={buttonVariants({ size: "sm" })}
      >
        <Plus className="size-3.5 mr-1" />
        ออกใบแจ้งหนี้ใหม่
      </Link>
    </div>
  );
}
