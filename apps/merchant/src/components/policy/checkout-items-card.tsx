"use client";

import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import {
  lineItemDiscountPct,
  lineItemAmountDue,
  type CheckoutLineItem,
} from "@/lib/policy/checkout";
import { formatAmount, formatTHB } from "@/lib/utils";
import { CheckoutCard } from "./checkout-card";
import { Button } from "@/components/ui/button";

interface CheckoutItemsCardProps {
  items: CheckoutLineItem[];
  total: number;
  onUpdate: (uid: string, patch: { discount: number }) => void;
  onRemove: (uid: string) => void;
}

export function CheckoutItemsCard({ items, total, onUpdate, onRemove }: CheckoutItemsCardProps) {
  const canRemove = items.length > 1;
  const [focusedUid, setFocusedUid] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <CheckoutCard title="รายการกรมธรรม์" contentClassName="px-6 pt-0 pb-6">
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="bg-grey-200 text-sm font-semibold text-grey-600 dark:bg-grey-900">
              <th className="whitespace-nowrap py-4 pr-4 pl-4 text-center">ลำดับ</th>
              <th className="whitespace-nowrap px-4 py-4 text-left">
                หมายเลขกรมธรรม์ / รับแจ้ง / สลักหลัง
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-left">ชื่อ-นามสกุล</th>
              <th className="whitespace-nowrap px-4 py-4 text-right">เบี้ยสุทธิ</th>
              <th className="whitespace-nowrap px-4 py-4 text-right">เบี้ยรวม</th>
              <th className="whitespace-nowrap px-4 py-4 text-right">ส่วนลด</th>
              <th className="whitespace-nowrap px-4 py-4 text-right">%จากเบี้ยสุทธิ</th>
              <th className="whitespace-nowrap px-4 py-4 text-right">ยอดชำระ</th>
              <th className="whitespace-nowrap py-4 pr-4 pl-4 text-left">ข้อมูลอ้างอิง</th>
              <th className="whitespace-nowrap px-4 py-4" aria-label="ลบ" />
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr
                key={it.uid}
                className="border-b border-dashed border-[var(--divider)] align-top text-sm"
              >
                <td className="py-4 pr-4 pl-4 text-center text-grey-600">{idx + 1}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-primary">{it.policyNo}</p>
                  <p className="mt-0.5 text-xs text-grey-500">
                    {it.referenceType === "claim" ? "เลขรับแจ้ง" : "เลขกรมธรรม์"}
                  </p>
                </td>
                <td className="max-w-[160px] truncate px-4 py-4 text-foreground">{it.payerName}</td>
                <td className="px-4 py-4 text-right tabular-nums text-foreground">
                  {formatAmount(it.netPremium, 2)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-foreground">
                  {formatAmount(it.grossPremium, 2)}
                </td>
                <td className="px-4 py-4 text-right">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`ส่วนลด ${it.policyNo}`}
                    value={focusedUid === it.uid ? draft : it.discount ? String(it.discount) : "0"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!/^\d*\.?\d{0,2}$/.test(v)) return; // digits + max 2 decimals
                      const n = v === "" || v === "." ? 0 : parseFloat(v);
                      const maxDiscount = Math.max(0, Math.round((it.grossPremium - it.netPremium) * 100) / 100); // เบี้ยรวม − เบี้ยสุทธิ
                      const clamped = Math.min(n, maxDiscount);
                      setDraft(clamped === n ? v : String(clamped));
                      onUpdate(it.uid, { discount: clamped });
                    }}
                    onFocus={() => {
                      setFocusedUid(it.uid);
                      setDraft(it.discount ? String(it.discount) : "");
                    }}
                    onBlur={() => setFocusedUid(null)}
                    className="h-9 w-28 rounded-control border border-[var(--divider)] bg-transparent px-2.5 text-right text-sm tabular-nums text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-grey-500">
                  {lineItemDiscountPct(it).toFixed(2)}%
                </td>
                <td className="px-4 py-4 text-right font-semibold tabular-nums text-foreground">
                  {formatAmount(lineItemAmountDue(it), 2)}
                </td>
                <td className="px-4 py-4 text-grey-600">{it.reference}</td>
                <td className="px-4 py-4">
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => onRemove(it.uid)}
                    disabled={!canRemove}
                    aria-label={`ลบรายการ ${it.policyNo}`}
                    className="size-10 cursor-pointer bg-error/8 text-error hover:bg-error hover:text-white"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 rounded-2xl bg-info/8 px-5 py-4 mmd:flex-row mmd:items-center mmd:justify-between">
        <p className="flex items-center gap-2 text-sm text-grey-600">
          <Info className="size-4 shrink-0 text-info" />
          ลูกค้าจะเห็นรายการย่อยทั้งหมดในหน้าชำระเงิน และจ่ายครั้งเดียว
        </p>
        <div className="text-right">
          <p className="text-sm text-grey-500">ยอดที่ลูกค้าต้องชำระ</p>
          <p className="text-2xl font-bold tabular-nums text-secondary">{formatTHB(total, 2)}</p>
        </div>
      </div>
    </CheckoutCard>
  );
}
