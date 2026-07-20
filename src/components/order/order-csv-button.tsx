"use client";

import { Download } from "lucide-react";
import { ORDER_ROWS, downloadCsv } from "@/lib/order";

export function OrderCsvButton() {
  return (
    <button
      type="button"
      onClick={() => downloadCsv("orders.csv", ORDER_ROWS)}
      className="inline-flex h-9 items-center gap-1.5 rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
    >
      <Download className="size-4" />
      ส่งออก CSV
    </button>
  );
}
