"use client";

import { Textarea } from "@/components/ui/textarea";
import { CheckoutCard } from "./checkout-card";

interface CheckoutNoteCardProps {
  value: string;
  onChange: (v: string) => void;
}

export function CheckoutNoteCard({ value, onChange }: CheckoutNoteCardProps) {
  return (
    <CheckoutCard title="หมายเหตุ" description="สำหรับใช้งานภายในทีมเท่านั้น ลูกค้าจะไม่เห็นข้อความนี้">
      <Textarea
        rows={7}
        className="min-h-40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="พิมพ์หมายเหตุสำหรับทีมภายใน"
      />
    </CheckoutCard>
  );
}
