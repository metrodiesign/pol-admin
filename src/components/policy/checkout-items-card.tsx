"use client";

import { Info, Trash2 } from "lucide-react";
import {
  lineItemDiscountPct,
  lineItemAmountDue,
  type CheckoutLineItem,
} from "@/lib/policy/checkout";
import { formatAmount, formatTHB } from "@/lib/utils";
import { CheckoutCard } from "./checkout-card";

interface CheckoutItemsCardProps {
  items: CheckoutLineItem[];
  total: number;
  onUpdate: (uid: string, patch: { discount: number }) => void;
  onRemove: (uid: string) => void;
}

const th = "px-3 py-2.5 text-xs font-semibold text-grey-600 whitespace-nowrap";
const td = "px-3 py-3 text-sm text-foreground align-middle";

export function CheckoutItemsCard({ items, total, onUpdate, onRemove }: CheckoutItemsCardProps) {
  const canRemove = items.length > 1;

  return (
    <CheckoutCard
      title="รายการกรมธรรม์ที่จะรับชำระ"
      description={`${items.length} รายการ · 1 ลิงก์ชำระครั้งเดียว`}
    >
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--divider)] bg-grey-50 text-left">
              <th className={th}>ลำดับ</th>
              <th className={th}>หมายเลขกรมธรรม์ / รับแจ้ง / สลักหลัง</th>
              <th className={th}>ชื่อ-นามสกุล</th>
              <th className={`${th} text-right`}>เบี้ยสุทธิ</th>
              <th className={`${th} text-right`}>เบี้ยรวม</th>
              <th className={`${th} text-right`}>ส่วนลด</th>
              <th className={`${th} text-right`}>%จากเบี้ยสุทธิ</th>
              <th className={`${th} text-right`}>ยอดชำระ</th>
              <th className={th}>ข้อมูลอ้างอิง</th>
              <th className={th} aria-label="ลบ" />
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.uid} className="border-b border-[var(--divider)] last:border-b-0">
                <td className={`${td} text-grey-500`}>{idx + 1}</td>
                <td className={`${td} whitespace-nowrap font-medium`}>{it.policyNo}</td>
                <td className={`${td} whitespace-nowrap`}>{it.payerName}</td>
                <td className={`${td} text-right tabular-nums`}>{formatAmount(it.netPremium, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatAmount(it.grossPremium, 2)}</td>
                <td className={`${td} text-right`}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={it.grossPremium}
                    step="0.01"
                    aria-label={`ส่วนลด ${it.policyNo}`}
                    value={Number.isFinite(it.discount) ? it.discount : ""}
                    onChange={(e) => onUpdate(it.uid, { discount: e.target.valueAsNumber || 0 })}
                    className="h-9 w-28 rounded-md border border-dashed border-grey-400 bg-warning/8 px-2.5 text-right text-sm tabular-nums text-foreground outline-none focus:border-grey-800 focus:bg-warning/12 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                  />
                </td>
                <td className={`${td} text-right tabular-nums text-grey-600`}>
                  {lineItemDiscountPct(it)}%
                </td>
                <td className={`${td} text-right tabular-nums`}>
                  {formatAmount(lineItemAmountDue(it), 2)}
                </td>
                <td className={`${td} whitespace-nowrap text-grey-600`}>{it.reference}</td>
                <td className={td}>
                  <button
                    type="button"
                    onClick={() => onRemove(it.uid)}
                    disabled={!canRemove}
                    aria-label={`ลบรายการ ${it.policyNo}`}
                    className="flex size-8 items-center justify-center rounded-full text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-info/8 px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4.5 shrink-0 text-info" aria-hidden />
          <p className="text-[13px] leading-relaxed text-grey-600">
            ลูกค้าจะเห็นรายการย่อยทั้งหมดในหน้าชำระเงิน และจ่ายครั้งเดียว
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] text-grey-500">ยอดที่ลูกค้าต้องชำระ</p>
          <p className="text-2xl font-bold tabular-nums text-primary">{formatTHB(total, 2)}</p>
        </div>
      </div>
    </CheckoutCard>
  );
}
