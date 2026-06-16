"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { TxnDrawer } from "./txn-drawer";
import type { Transaction } from "@/types/transaction";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const rows = transactions.slice(0, 8);

  return (
    <>
      <WidgetCard
        title="ธุรกรรมล่าสุด"
        subtitle="อัปเดต real-time · 8 รายการล่าสุด"
        action={
          <Link
            href="/transactions"
            className="inline-flex items-center gap-0.5 text-sm text-grey-600 hover:text-primary transition-colors"
          >
            ดูทั้งหมด
            <ChevronRight className="size-3.5" />
          </Link>
        }
        bodyClassName="!p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(145,158,171,0.12)]">
                {["รหัสธุรกรรม", "ลูกค้า", "ที่มา", "ช่องทาง", "PSP", "จำนวน", "สถานะ", "เวลา", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grey-500 first:pl-6 last:pr-6"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const time = new Date(t.ts).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="cursor-pointer border-b border-[rgba(145,158,171,0.08)] transition-colors hover:bg-grey-50 last:border-0"
                  >
                    <td className="px-4 py-3 pl-6">
                      <p className="font-mono text-xs text-grey-700">{t.id}</p>
                      <p className="mt-0.5 text-xs text-grey-500">
                        {t.itemCount > 1 ? `${t.itemCount} รายการย่อย` : "1 รายการ"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{t.customer.name}</p>
                      <p className="mt-0.5 text-xs text-grey-500">{t.customer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {t.originator.code}
                        </span>
                        <span className="text-xs text-grey-600">{t.originator.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChannelTag channel={t.channel} />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{t.psp}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold tabular-nums">
                        ฿{t.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-grey-500 whitespace-nowrap">
                      {time} น.
                    </td>
                    <td className="px-4 py-3 pr-6">
                      <ChevronRight className="size-4 text-grey-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WidgetCard>

      <TxnDrawer txn={selected} onClose={() => setSelected(null)} />
    </>
  );
}
