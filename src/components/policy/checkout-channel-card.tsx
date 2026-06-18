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
  credit_card: "/payment/credit-card.svg",
  promptpay: "/payment/promptpay.svg",
  installment: "/payment/installment.svg",
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
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-[var(--divider)] p-4 transition-colors hover:bg-grey-100 has-data-checked:border-primary has-data-checked:bg-primary/4"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMAGES[opt.value]}
                  alt={opt.label}
                  className="h-9 w-auto object-contain"
                />
                <span className="text-sm font-bold text-foreground">{opt.label}</span>
              </span>
              <RadioGroupItem value={opt.value} />
            </div>
            <span className="text-[13px] leading-relaxed text-grey-500">{opt.caption}</span>
          </label>
        ))}
      </RadioGroup>
    </CheckoutCard>
  );
}
