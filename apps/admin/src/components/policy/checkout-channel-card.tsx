"use client";

import {
  PAYMENT_CHANNEL_OPTIONS,
  type PaymentChannel,
} from "@/lib/policy/checkout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckoutCard } from "./checkout-card";

interface CheckoutChannelCardProps {
  value: PaymentChannel;
  onChange: (v: PaymentChannel) => void;
}

// โลโก้จริงวางที่ public/payment/<ช่องทาง>.svg (รองรับ .png ได้ — เปลี่ยนนามสกุลตรงนี้).
// ใช้ <img> ธรรมดาเพื่อให้โลโก้คงสัดส่วนจริงของไฟล์ ไม่ว่าจะ aspect ใด.
const IMAGES: Record<PaymentChannel, string> = {
  credit_card: "/payment/credit-card-v2.png",
  promptpay: "/payment/promptpay-qr-v2.png",
  installment: "/payment/installment-v2.png",
};

export function CheckoutChannelCard({ value, onChange }: CheckoutChannelCardProps) {
  return (
    <CheckoutCard
      title="ช่องทางการชำระเงิน"
      description="เลือกช่องทางเดียวที่ลูกค้าจะใช้ในการชำระลิงก์นี้"
    >
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PaymentChannel)}
        aria-label="ช่องทางการชำระเงิน"
        className="grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {PAYMENT_CHANNEL_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--divider)] p-3.5 transition-colors hover:bg-grey-100 has-data-checked:border-secondary has-data-checked:bg-secondary/4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES[opt.value]}
              alt={opt.label}
              className="h-20 w-20 shrink-0 object-contain"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-bold text-foreground group-has-data-checked:text-secondary">
                {opt.label}
              </span>
              <span className="text-xs leading-relaxed text-grey-500">{opt.caption}</span>
            </span>
            <RadioGroupItem value={opt.value} className="sr-only" />
          </label>
        ))}
      </RadioGroup>
    </CheckoutCard>
  );
}
