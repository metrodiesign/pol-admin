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

const th = "h-14 px-3 font-semibold text-grey-600 whitespace-nowrap";
const td = "px-3 py-3 text-sm text-foreground align-middle";

export function CheckoutItemsCard({ items, total, onUpdate, onRemove }: CheckoutItemsCardProps) {
  const canRemove = items.length > 1;
  const [focusedUid, setFocusedUid] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <CheckoutCard
      title="รายการกรมธรรม์ที่จะรับชำระ"
      description={`${items.length} รายการ · 1 ลิงก์ชำระครั้งเดียว`}
    >
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--divider)] bg-grey-200 text-left">
              <th className={`${th} pl-6`}>ลำดับ</th>
              <th className={th}>หมายเลขกรมธรรม์ / รับแจ้ง / สลักหลัง</th>
              <th className={th}>ชื่อ-นามสกุล</th>
              <th className={`${th} text-right`}>เบี้ยสุทธิ</th>
              <th className={`${th} text-right`}>เบี้ยรวม</th>
              <th className={`${th} text-right`}>ส่วนลด</th>
              <th className={`${th} text-right`}>%จากเบี้ยสุทธิ</th>
              <th className={`${th} text-right`}>ยอดชำระ</th>
              <th className={th}>ข้อมูลอ้างอิง</th>
              <th className={`${th} pr-6`} aria-label="ลบ" />
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.uid} className="border-b border-[var(--divider)] last:border-b-0">
                <td className={`${td} pl-6 text-grey-500`}>{idx + 1}</td>
                <td className={`${td} whitespace-nowrap`}>
                  <span className="block font-bold text-primary underline underline-offset-2">
                    {it.policyNo}
                  </span>
                  <span className="mt-0.5 block text-xs text-grey-500">
                    {it.referenceType === "claim" ? "เลขรับแจ้ง" : "เลขกรมธรรม์"}
                  </span>
                </td>
                <td className={`${td} whitespace-nowrap`}>{it.payerName}</td>
                <td className={`${td} text-right tabular-nums`}>{formatAmount(it.netPremium, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatAmount(it.grossPremium, 2)}</td>
                <td className={`${td} text-right`}>
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
                <td className={`${td} text-right tabular-nums text-grey-600`}>
                  {lineItemDiscountPct(it).toFixed(2)}%
                </td>
                <td className={`${td} text-right tabular-nums`}>
                  {formatAmount(lineItemAmountDue(it), 2)}
                </td>
                <td className={`${td} whitespace-nowrap text-grey-600`}>{it.reference}</td>
                <td className={`${td} pr-6`}>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => onRemove(it.uid)}
                    disabled={!canRemove}
                    aria-label={`ลบรายการ ${it.policyNo}`}
                    className="size-10 cursor-pointer text-error hover:bg-error/8 hover:text-error"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-info/8 px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4.5 shrink-0 text-info" aria-hidden />
          <p className="text-xs leading-relaxed text-grey-600">
            ลูกค้าจะเห็นรายการย่อยทั้งหมดในหน้าชำระเงิน และจ่ายครั้งเดียว
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-grey-500">ยอดที่ลูกค้าต้องชำระ</p>
          <p className="text-2xl font-bold tabular-nums text-primary">{formatTHB(total, 2)}</p>
        </div>
      </div>
    </CheckoutCard>
  );
}
