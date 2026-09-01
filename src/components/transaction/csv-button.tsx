"use client";

import { Download } from "lucide-react";
import { PAYMENT_SESSIONS } from "@/lib/mock/transactions";
import { downloadCsv } from "@/lib/transaction";

export function TransactionCsvButton() {
  return (
    <button
      type="button"
      onClick={() => downloadCsv("transactions.csv", PAYMENT_SESSIONS)}
      className="inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Download className="size-4" />
      ส่งออก CSV
    </button>
  );
}
