"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface AdvancedInfo {
  invoiceNo: string;
  references: string[]; // length 5 (Reference 1-5)
  note: string;
}

export const EMPTY_ADVANCED: AdvancedInfo = {
  invoiceNo: "",
  references: ["", "", "", "", ""],
  note: "",
};

interface CheckoutAdvancedCardProps {
  value: AdvancedInfo;
  onChange: (next: AdvancedInfo) => void;
}

const fieldLabel = "mb-1.5 block text-[13px] font-semibold text-grey-700";

export function CheckoutAdvancedCard({ value, onChange }: CheckoutAdvancedCardProps) {
  const [open, setOpen] = useState(false);

  const setRef = (idx: number, v: string) => {
    const references = value.references.map((r, i) => (i === idx ? v : r));
    onChange({ ...value, references });
  };

  return (
    <section
      className="rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-base font-bold text-foreground">
            ใบแจ้งหนี้และเลขที่อ้างอิง (ขั้นสูง)
          </span>
          <span className="mt-0.5 block text-[13px] text-grey-500">
            Invoice No, Reference 1-5, หมายเหตุ · ใช้กระทบยอดกับระบบต้นทาง
          </span>
        </span>
        <ChevronDown
          className={
            "size-5 shrink-0 text-grey-500 transition-transform " + (open ? "rotate-180" : "")
          }
          aria-hidden
        />
      </button>

      {open ? (
        <div className="border-t border-[var(--divider)] px-6 py-5">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Invoice No</label>
                <Input
                  value={value.invoiceNo}
                  onChange={(e) => onChange({ ...value, invoiceNo: e.target.value })}
                  placeholder="INV-xxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mlg:grid-cols-3">
              {value.references.map((r, i) => (
                <div key={i}>
                  <label className={fieldLabel}>Reference {i + 1}</label>
                  <Input value={r} onChange={(e) => setRef(i, e.target.value)} />
                </div>
              ))}
            </div>

            <div>
              <label className={fieldLabel}>หมายเหตุ</label>
              <Textarea
                value={value.note}
                onChange={(e) => onChange({ ...value, note: e.target.value })}
                placeholder="หมายเหตุภายใน (ไม่แสดงให้ลูกค้า)"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
