"use client";

import { useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LinkIcon, ShoppingCart } from "lucide-react";
import { POLICIES } from "@/lib/mock/policies";
import {
  pickPoliciesByIds,
  buildLineItem,
  buildCustomerInfo,
  lineItemsTotal,
  canIssue,
  expiryDescription,
  type CustomerInfo,
  type PaymentChannel,
  type LinkExpiry,
  type NotifyMode,
} from "@/lib/policy/checkout";
import { checkoutItemsReducer } from "@/lib/policy/checkout-items-reducer";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { CheckoutCustomerCard } from "./checkout-customer-card";
import { CheckoutItemsCard } from "./checkout-items-card";
import { CheckoutChannelCard } from "./checkout-channel-card";
import { CheckoutLinkSettingsCard } from "./checkout-link-settings-card";
import { CheckoutNoteCard } from "./checkout-note-card";
import { CheckoutFooterBar } from "./checkout-footer-bar";

interface PolicyCheckoutViewProps {
  /** policy ids ที่ resolve จาก checkout session แล้ว. */
  ids: string[];
  /** session id — ใช้กลับไปแก้ไขรายการที่หน้ารายการ (?resumeSession=). */
  sessionId: string;
}

export function PolicyCheckoutView({ ids, sessionId }: PolicyCheckoutViewProps) {
  const router = useRouter();
  const policies = useMemo(() => pickPoliciesByIds(POLICIES, ids), [ids]);
  const backHref = `/policy/list?resumeSession=${sessionId}`;

  const [items, dispatch] = useReducer(
    checkoutItemsReducer,
    policies,
    (ps) => ps.map(buildLineItem),
  );
  const [customer, setCustomer] = useState<CustomerInfo>(() => buildCustomerInfo(policies[0]));
  const [channel, setChannel] = useState<PaymentChannel>("credit_card");
  const [expiry, setExpiry] = useState<LinkExpiry>("72h");
  const [notifyMode, setNotifyMode] = useState<NotifyMode>("send_customer");
  const [smsOn, setSmsOn] = useState(true);
  const [emailOn, setEmailOn] = useState(false);
  const [notifyCustomPhone, setNotifyCustomPhone] = useState(() => buildCustomerInfo(policies[0]).phone);
  const [notifyCustomEmail, setNotifyCustomEmail] = useState(() => buildCustomerInfo(policies[0]).email);
  const [customSmsOn, setCustomSmsOn] = useState(false);
  const [customPhone, setCustomPhone] = useState("");
  const [customEmailOn, setCustomEmailOn] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [note, setNote] = useState("");
  const [issuedLink, setIssuedLink] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "issue" | null>(null);

  const total = lineItemsTotal(items);
  const ready = canIssue({ customer, items });

  // ── empty: ไม่มี ids / id ผิดทั้งหมด ────────────────────────────────────────
  if (policies.length === 0) {
    return (
      <EmptyOrDone
        icon={<ShoppingCart className="size-7" />}
        tone="info"
        title="ไม่มีรายการรับชำระเบี้ย"
        subtitle="กลับไปเลือกกรมธรรม์ที่ต้องการรับชำระจากหน้ารายการก่อน"
      />
    );
  }

  // ── สำเร็จ (mock — ไม่เรียก backend) ────────────────────────────────────────
  if (issuedLink) {
    const toPhone = notifyCustomPhone || customer.phone;
    const toEmail = notifyCustomEmail || customer.email;
    const customerChannels = notifyMode === "none"
      ? "ไม่ได้ส่งแจ้งเตือนลูกค้า"
      : [smsOn && `SMS (${toPhone || "—"})`, emailOn && `อีเมล (${toEmail || "—"})`]
          .filter(Boolean)
          .join(" · ") || "ไม่ได้เลือกช่องทางแจ้งเตือนลูกค้า";
    const channels = [
      customerChannels,
      customSmsOn && `SMS ผู้รับเพิ่มเติม (${customPhone || "—"})`,
      customEmailOn && `อีเมลผู้รับเพิ่มเติม (${customEmail || "—"})`,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <EmptyOrDone
        icon={<CheckCircle2 className="size-8" />}
        tone="success"
        title={`ออกใบแจ้งหนี้สำเร็จ ${items.length} รายการ`}
        subtitle={`ส่งลิงก์ชำระเงินแล้ว · ${channels} · ${expiryDescription(expiry)}`}
      >
        <div className="flex w-full max-w-md items-center gap-2 rounded-control border border-[var(--divider)] bg-grey-50 px-3.5 py-2.5">
          <LinkIcon className="size-4 shrink-0 text-grey-500" />
          <span className="truncate text-sm text-grey-700">{issuedLink}</span>
        </div>
      </EmptyOrDone>
    );
  }

  function handleIssue() {
    // mock — สร้างลิงก์จำลอง ไม่เรียก backend
    const token = crypto.randomUUID().slice(0, 8);
    setIssuedLink(`https://pay.pol.example/${token}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <CheckoutCustomerCard customer={customer} onChange={setCustomer} />

      <CheckoutItemsCard
        items={items}
        total={total}
        onUpdate={(uid, patch) => dispatch({ type: "update", uid, patch })}
        onRemove={(uid) => dispatch({ type: "remove", uid })}
      />

      <CheckoutChannelCard value={channel} onChange={setChannel} />

      <CheckoutLinkSettingsCard
        expiry={expiry}
        onExpiry={setExpiry}
        notifyMode={notifyMode}
        onNotifyMode={(v) => {
          setNotifyMode(v);
          if (v === "none") {
            setSmsOn(false);
            setEmailOn(false);
          }
        }}
        smsOn={smsOn}
        onSms={setSmsOn}
        emailOn={emailOn}
        onEmail={setEmailOn}
        notifyCustomPhone={notifyCustomPhone}
        onNotifyCustomPhone={setNotifyCustomPhone}
        notifyCustomEmail={notifyCustomEmail}
        onNotifyCustomEmail={setNotifyCustomEmail}
        customSmsOn={customSmsOn}
        onCustomSms={setCustomSmsOn}
        customPhone={customPhone}
        onCustomPhone={setCustomPhone}
        customEmailOn={customEmailOn}
        onCustomEmail={setCustomEmailOn}
        customEmail={customEmail}
        onCustomEmailValue={setCustomEmail}
      />

      <CheckoutNoteCard value={note} onChange={setNote} />

      <CheckoutFooterBar
        count={items.length}
        total={total}
        canIssue={ready}
        onCancel={() => setConfirmAction("cancel")}
        onIssue={() => setConfirmAction("issue")}
      />

      <ConfirmDialog
        open={confirmAction === "cancel"}
        title="ยกเลิกรายการนี้?"
        description="ระบบจะพากลับไปหน้ารายการกรมธรรม์ ข้อมูลที่กรอกในหน้านี้จะไม่ถูกบันทึก"
        confirmLabel="ยกเลิกรายการ"
        onConfirm={() => router.push(backHref)}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "issue"}
        title="ยืนยันคำสั่งซื้อ?"
        description={`ระบบจะสร้างคำสั่งซื้อและส่งลิงก์ชำระเงิน ${items.length} รายการ ยอดรวม ${total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`}
        confirmLabel="ยืนยันคำสั่งซื้อ"
        onConfirm={() => {
          setConfirmAction(null);
          handleIssue();
        }}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}

function EmptyOrDone({
  icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  tone: "info" | "success";
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card px-6 py-16 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span
        className={
          "flex size-16 items-center justify-center rounded-full " +
          (tone === "success" ? "bg-success/12 text-success" : "bg-info/12 text-info")
        }
      >
        {icon}
      </span>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-grey-500">{subtitle}</p>
      {children}
      <Button
        render={<Link href="/policy/list" />}
        nativeButton={false}
        className="mt-1 h-10 bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
      >
        กลับไปหน้ารายการ
      </Button>
    </div>
  );
}
