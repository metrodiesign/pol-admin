"use client";

import { Mail, Phone } from "lucide-react";
import type { CustomerInfo } from "@/lib/policy/checkout";
import { Input } from "@/components/ui/input";
import { CheckoutCard, FieldLabel } from "./checkout-card";

interface CheckoutCustomerCardProps {
  customer: CustomerInfo;
  onChange: (next: CustomerInfo) => void;
}

export function CheckoutCustomerCard({ customer, onChange }: CheckoutCustomerCardProps) {
  const set = (patch: Partial<CustomerInfo>) => onChange({ ...customer, ...patch });

  return (
    <CheckoutCard title="ข้อมูลลูกค้า" description="ใช้สำหรับการแจ้งเตือนและออกใบเสร็จ">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 mmd:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="cust-name" required>
            ชื่อ-นามสกุล
          </FieldLabel>
          <Input
            id="cust-name"
            value={customer.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="ชื่อ-นามสกุล"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="cust-email">อีเมล</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-grey-500" />
            <Input
              id="cust-email"
              type="email"
              inputMode="email"
              value={customer.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="name@example.com"
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="cust-phone" required>
            เบอร์โทรศัพท์
          </FieldLabel>
          <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-grey-500" />
            <Input
              id="cust-phone"
              type="tel"
              inputMode="tel"
              value={customer.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="08x-xxx-xxxx"
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </CheckoutCard>
  );
}
