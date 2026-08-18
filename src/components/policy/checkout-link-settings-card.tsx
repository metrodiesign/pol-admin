"use client";

import { MessageSquare, Mail } from "lucide-react";
import {
  LINK_EXPIRY_OPTIONS,
  NOTIFY_MODE_OPTIONS,
  type LinkExpiry,
  type NotifyMode,
} from "@/lib/policy/checkout";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CheckoutCard } from "./checkout-card";

interface CheckoutLinkSettingsCardProps {
  expiry: LinkExpiry;
  onExpiry: (v: LinkExpiry) => void;
  notifyMode: NotifyMode;
  onNotifyMode: (v: NotifyMode) => void;
  smsOn: boolean;
  onSms: (v: boolean) => void;
  emailOn: boolean;
  onEmail: (v: boolean) => void;
  notifyCustomPhone: string;
  onNotifyCustomPhone: (v: string) => void;
  notifyCustomEmail: string;
  onNotifyCustomEmail: (v: string) => void;
  customSmsOn: boolean;
  onCustomSms: (v: boolean) => void;
  customPhone: string;
  onCustomPhone: (v: string) => void;
  customEmailOn: boolean;
  onCustomEmail: (v: boolean) => void;
  customEmail: string;
  onCustomEmailValue: (v: string) => void;
}

function Pills<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={
              "h-9 rounded-full border px-4 text-sm font-semibold transition-colors " +
              (active
                ? "border-secondary bg-secondary/8 text-secondary"
                : "border-[var(--divider)] text-grey-700 hover:bg-grey-100")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const labelCls = "mb-2 block text-sm font-semibold text-grey-700";

export function CheckoutLinkSettingsCard(props: CheckoutLinkSettingsCardProps) {
  return (
    <CheckoutCard title="ตั้งค่าลิงก์ และการแจ้งเตือน">
      <div className="flex flex-col gap-6">
        <div>
          <span className={labelCls}>ระยะเวลาก่อนลิงก์หมดอายุ</span>
          <Pills
            value={props.expiry}
            onChange={props.onExpiry}
            options={LINK_EXPIRY_OPTIONS}
            ariaLabel="ระยะเวลาก่อนลิงก์หมดอายุ"
          />
        </div>

        <div>
          <span className={labelCls}>การแจ้งเตือนลูกค้า</span>
          <Pills
            value={props.notifyMode}
            onChange={props.onNotifyMode}
            options={NOTIFY_MODE_OPTIONS}
            ariaLabel="การแจ้งเตือนลูกค้า"
          />

          {(() => {
            const sending = props.notifyMode === "send_customer";
            return (
              <div className="mt-4 flex flex-col gap-3">
                <CustomNotifyToggle
                  icon={<MessageSquare className="size-4.5" />}
                  title="ส่ง SMS แจ้งลิงก์"
                  checked={sending && props.smsOn}
                  onChange={props.onSms}
                  disabled={!sending}
                  value={props.notifyCustomPhone}
                  onValue={props.onNotifyCustomPhone}
                  placeholder="เบอร์โทรผู้รับ"
                  inputMode="tel"
                />
                <CustomNotifyToggle
                  icon={<Mail className="size-4.5" />}
                  title="ส่งอีเมลพร้อมลิงก์"
                  checked={sending && props.emailOn}
                  onChange={props.onEmail}
                  disabled={!sending}
                  value={props.notifyCustomEmail}
                  onValue={props.onNotifyCustomEmail}
                  placeholder="อีเมลผู้รับ"
                  inputMode="email"
                />
              </div>
            );
          })()}
        </div>

        <div>
          <span className={labelCls}>การแจ้งเตือนกำหนดผู้รับเอง</span>
          <div className="flex flex-col gap-3">
            <CustomNotifyToggle
              icon={<MessageSquare className="size-4.5" />}
              title="ส่ง SMS ถึงผู้รับที่กำหนด"
              checked={props.customSmsOn}
              onChange={props.onCustomSms}
              value={props.customPhone}
              onValue={props.onCustomPhone}
              placeholder="เบอร์โทรของผู้รับ"
              inputMode="tel"
            />
            <CustomNotifyToggle
              icon={<Mail className="size-4.5" />}
              title="ส่งอีเมลถึงผู้รับที่กำหนด"
              checked={props.customEmailOn}
              onChange={props.onCustomEmail}
              value={props.customEmail}
              onValue={props.onCustomEmailValue}
              placeholder="อีเมลของผู้รับ"
              inputMode="email"
            />
          </div>
        </div>
      </div>
    </CheckoutCard>
  );
}

function CustomNotifyToggle({
  icon,
  title,
  checked,
  onChange,
  value,
  onValue,
  placeholder,
  inputMode,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  value: string;
  onValue: (v: string) => void;
  placeholder: string;
  inputMode: "tel" | "email";
  disabled?: boolean;
}) {
  return (
    <div className={"rounded-xl border border-[var(--divider)]" + (disabled ? " opacity-60" : "")}>
      <label
        className={
          "flex items-center gap-3 px-4 py-3 " +
          (disabled ? "cursor-not-allowed" : "cursor-pointer")
        }
      >
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
        <span className="flex size-8 items-center justify-center rounded-full bg-grey-100 text-grey-600">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-foreground">{title}</span>
          <span className="block truncate text-xs text-grey-500">
            {checked ? "กรอกปลายทางด้านล่าง" : "ปิดอยู่"}
          </span>
        </span>
      </label>
      {checked && (
        <div className="border-t border-[var(--divider)] px-4 py-3">
          <Input
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            placeholder={placeholder}
            aria-label={title}
            className="h-11 w-full"
          />
        </div>
      )}
    </div>
  );
}
