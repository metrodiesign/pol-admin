"use client";

import { Textarea } from "@/components/ui/textarea";
import { CheckoutCard } from "./checkout-card";

interface CheckoutNoteCardProps {
  value: string;
  onChange: (v: string) => void;
}

export function CheckoutNoteCard({ value, onChange }: CheckoutNoteCardProps) {
  return (
    <CheckoutCard title="หมายเหตุ" description="หมายเหตุภายใน · ไม่แสดงให้ลูกค้า">
      <Textarea
        rows={7}
        className="min-h-40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="หมายเหตุภายใน (ไม่แสดงให้ลูกค้า)"
      />
    </CheckoutCard>
  );
}
