"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/payment/toast/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HostedPaymentPreview } from "./hosted-payment-preview";
import type { PaymentChannel } from "@/types/transaction";
import type { Invoice } from "@/types/invoice";
import type { Policy } from "@/types/policy";
import { BRANCHES, AGENTS, CONNECTED_APPS } from "@/lib/mock/originators";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  Check,
  Info,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { cn, formatTHBPlain } from "@/lib/utils";

const fmtTHB = formatTHBPlain;

function nextInvoiceNo(): string {
  return "INV-26-" + String(10500 - Math.floor(Math.random() * 200));
}

const POLICY_TYPES = [
  "ประกันรถยนต์ ชั้น 1",
  "ประกันรถยนต์ 2+",
  "ประกันชีวิต",
  "ประกันสุขภาพ",
  "ประกันอัคคีภัย",
  "ประกันการเดินทาง",
  "ประกันอุบัติเหตุ",
];

interface CartItem {
  _id: number;
  policyNo: string;
  type: string;
  period: string;
  amount: number;
}

function policyToCartItem(p: Policy, idx: number): CartItem {
  const year = p.nextDueDate
    ? new Date(p.nextDueDate).getFullYear() + 543
    : 2569;
  const period = p.currentPeriod
    ? `งวดที่ ${p.currentPeriod} · ปี ${String(year).slice(-2)}`
    : "งวด 1 · ปี 69";
  return {
    _id: idx + 1,
    policyNo: p.policyNumber,
    type: p.insuranceType ?? p.productName,
    period,
    amount: p.premium,
  };
}

function invoiceToCartItems(inv: Invoice): CartItem[] {
  return inv.items.map((it, i) => ({
    _id: i + 1,
    policyNo: it.policyNo,
    type: it.type,
    period: it.period,
    amount: it.amount,
  }));
}

interface InvoiceFormProps {
  /** Edit mode: existing invoice to edit */
  editInvoice?: Invoice;
  /** Duplicate mode: existing invoice to duplicate as new */
  duplicateInvoice?: Invoice;
  /** Cart mode: policies from cart handoff */
  cartPolicies?: Policy[];
  /** Buy-now mode: single policy */
  singlePolicy?: Policy;
}

export function InvoiceForm({
  editInvoice,
  duplicateInvoice,
  cartPolicies,
  singlePolicy,
}: InvoiceFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!editInvoice;
  const isDuplicate = !!duplicateInvoice && !isEdit;
  const fromCart = !!cartPolicies && cartPolicies.length > 0 && !isEdit && !isDuplicate;
  const fromSingle = !!singlePolicy && !isEdit && !isDuplicate && !fromCart;

  const initialItems = useMemo<CartItem[]>(() => {
    if (isEdit && editInvoice) return invoiceToCartItems(editInvoice);
    if (isDuplicate && duplicateInvoice) return invoiceToCartItems(duplicateInvoice);
    if (fromCart && cartPolicies)
      return cartPolicies.map((p, i) => policyToCartItem(p, i));
    if (fromSingle && singlePolicy)
      return [policyToCartItem(singlePolicy, 0)];
    return [
      { _id: 1, policyNo: "POL-2415088", type: "ประกันรถยนต์ ชั้น 1", period: "งวด 1 · ปี 2569", amount: 18420 },
      { _id: 2, policyNo: "POL-2419244", type: "ประกันสุขภาพ", period: "งวด 2 · ปี 2569", amount: 9840 },
    ];
  }, [isEdit, isDuplicate, fromCart, fromSingle, editInvoice, duplicateInvoice, cartPolicies, singlePolicy]);

  const initialCustomer = useMemo(() => {
    if (isEdit && editInvoice) return editInvoice.customer;
    if (isDuplicate && duplicateInvoice) return duplicateInvoice.customer;
    if (fromCart && cartPolicies?.[0]) {
      return {
        name: cartPolicies[0].customerName,
        email: cartPolicies[0].customerEmail,
        phone: "",
      };
    }
    if (fromSingle && singlePolicy) {
      return {
        name: singlePolicy.customerName,
        email: singlePolicy.customerEmail,
        phone: "",
      };
    }
    return { name: "เมธาวิน อักษรเลิศ", email: "methawin.a@mail.com", phone: "081-234-5678" };
  }, [isEdit, isDuplicate, fromCart, fromSingle, editInvoice, duplicateInvoice, cartPolicies, singlePolicy]);

  const initialOriginator = useMemo(() => {
    if (isEdit && editInvoice) return editInvoice.originatorId;
    if ((fromCart || fromSingle) && (cartPolicies?.[0]?.originatorId ?? singlePolicy?.originatorId)) {
      return cartPolicies?.[0]?.originatorId ?? singlePolicy?.originatorId ?? "BR-001";
    }
    return "BR-001";
  }, [isEdit, fromCart, fromSingle, editInvoice, cartPolicies, singlePolicy]);

  const [customer, setCustomer] = useState(initialCustomer);
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [channel, setChannel] = useState<PaymentChannel>(
    isEdit ? editInvoice.channel : "card",
  );
  const [installmentMonths, setInstallmentMonths] = useState<number[]>([3, 6, 10]);
  const [expiryHours, setExpiryHours] = useState(72);
  const [originator, setOriginator] = useState(initialOriginator);
  const [notifyMode, setNotifyMode] = useState<"customer" | "custom" | "none">("customer");
  const [customRecipient, setCustomRecipient] = useState({ name: "", phone: "", email: "" });
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [invoiceNo, setInvoiceNo] = useState(
    isEdit ? editInvoice.id : "",
  );
  const [discount, setDiscount] = useState(
    isEdit ? (editInvoice.discount ?? 0) : 0,
  );

  // Generate invoice number client-side only to avoid SSR hydration mismatch.
  // One-time mount effect — intentionally empty deps to run once; setState is
  // safe here because it only fires after hydration (avoids SSR mismatch).
  useEffect(() => {
    if (!isEdit && !invoiceNo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInvoiceNo(nextInvoiceNo());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [refs, setRefs] = useState<string[]>(
    isEdit ? [...editInvoice.refs, "", "", "", ""].slice(0, 5) : ["", "", "", "", ""],
  );
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [items],
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const fee = total * 0.025;

  function addItem() {
    const newId = (items[items.length - 1]?._id ?? 0) + 1;
    setItems([
      ...items,
      { _id: newId, policyNo: "", type: POLICY_TYPES[0]!, period: "งวด 1 · ปี 2569", amount: 0 },
    ]);
  }

  function removeItem(id: number) {
    setItems(items.filter((i) => i._id !== id));
  }

  function updateItem(id: number, key: keyof CartItem, val: string | number) {
    setItems(
      items.map((i) => (i._id === id ? { ...i, [key]: val } : i)),
    );
  }

  function handleSubmit() {
    if (!customer.name || !customer.email || !customer.phone) return;
    if (total <= 0) return;
    setSubmitting(true);
    // Simulate async
    setTimeout(() => {
      setSubmitting(false);
      if (isEdit) {
        toast.success("บันทึกการแก้ไขแล้ว", {
          description: `ใบแจ้งหนี้ ${editInvoice!.id} อัปเดตเรียบร้อย`,
        });
      } else {
        const payUrl = `https://pay.centro/p/${invoiceNo}`;
        toast.success("ออกใบแจ้งหนี้แล้ว", {
          description: `${invoiceNo} · ส่งลิงก์ให้ ${customer.name}`,
          action: {
            label: "คัดลอกลิงก์",
            onClick: () => {
              navigator.clipboard.writeText(payUrl).catch(() => undefined);
            },
          },
        });
      }
      router.push("/invoices");
    }, 800);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* === Left: Form === */}
      <div className="flex min-w-0 flex-col gap-5">
        {/* Cart / Buy-now banner */}
        {(fromCart || fromSingle) && !isEdit && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Briefcase className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                นำเข้า{" "}
                {fromSingle ? "1" : (cartPolicies?.length ?? 0)}{" "}
                กรมธรรม์จากตะกร้าแล้ว
              </p>
              <p className="text-xs text-grey-500">
                สามารถปรับแก้รายการก่อนออกใบแจ้งหนี้ส่งให้ลูกค้า
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/policy/list")}
            >
              <ChevronLeft className="size-3.5 mr-0.5" />
              กลับไปตะกร้า
            </Button>
          </div>
        )}

        {/* Edit banner */}
        {isEdit && (
          <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-gradient-to-r from-warning/10 to-transparent p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning text-white">
              <AlertTriangle className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                กำลังแก้ไขใบแจ้งหนี้{" "}
                <span className="font-mono">{editInvoice.id}</span>
              </p>
              <p className="text-xs text-grey-500">
                การเปลี่ยนแปลงจะมีผลทันทีต่อลิงก์ที่ลูกค้าใช้อยู่
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/invoices")}
            >
              ยกเลิก
            </Button>
          </div>
        )}

        {/* Customer section */}
        <section className="rounded-[16px] bg-card p-6 shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <h2 className="mb-1 text-sm font-bold">ข้อมูลลูกค้า</h2>
          <p className="mb-5 text-xs text-grey-500">ใช้สำหรับการแจ้งเตือนและออกใบเสร็จ</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="ชื่อ-นามสกุล" required>
              <input
                className="form-input"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="ชื่อ-นามสกุลลูกค้า"
              />
            </FormField>
            <FormField label="เลขประจำตัวประชาชน / Passport">
              <input
                className="form-input font-mono"
                placeholder="X-XXXX-XXXXX-XX-X"
              />
            </FormField>
            <FormField label="อีเมล" required>
              <input
                type="email"
                className="form-input"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="email@example.com"
              />
            </FormField>
            <FormField label="เบอร์โทรศัพท์" required>
              <input
                className="form-input"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="08X-XXX-XXXX"
              />
            </FormField>
          </div>
        </section>

        {/* Items cart */}
        <section className="rounded-[16px] bg-card shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="flex items-center justify-between border-b border-[rgba(145,158,171,0.12)] px-6 py-4">
            <div>
              <h2 className="text-sm font-bold">รายการกรมธรรม์ที่จะรับชำระ</h2>
              <p className="text-xs text-grey-500">
                {items.length} รายการ · 1 ลิงก์ชำระครั้งเดียว
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-3.5 mr-1" />
              เพิ่มรายการ
            </Button>
          </div>

          <div className="flex flex-col gap-3 p-5">
            {items.map((it) => (
              <div
                key={it._id}
                className="flex flex-wrap items-start gap-3 rounded-lg border border-[rgba(145,158,171,0.12)] bg-[var(--action-hover)] p-3.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-5">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>
                <FormField label="เลขกรมธรรม์" className="w-[160px] min-w-0">
                  <input
                    className="form-input font-mono"
                    placeholder="POL-XXXXXXX"
                    value={it.policyNo}
                    onChange={(e) => updateItem(it._id, "policyNo", e.target.value)}
                  />
                </FormField>
                <FormField label="ประเภท" className="min-w-[140px] flex-1">
                  <Select
                    value={it.type}
                    onValueChange={(v) => updateItem(it._id, "type", v ?? "")}
                  >
                    <SelectTrigger className="h-9 w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POLICY_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="งวด / รอบปี" className="w-[160px]">
                  <input
                    className="form-input"
                    value={it.period}
                    onChange={(e) => updateItem(it._id, "period", e.target.value)}
                  />
                </FormField>
                <FormField label="เบี้ยประกัน (บาท)" className="w-[130px]">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 font-semibold text-sm">
                      ฿
                    </span>
                    <input
                      type="number"
                      className="form-input pl-7 tabular-nums"
                      value={it.amount}
                      onChange={(e) => updateItem(it._id, "amount", e.target.value)}
                    />
                  </div>
                </FormField>
                <button
                  type="button"
                  onClick={() => removeItem(it._id)}
                  disabled={items.length === 1}
                  className="mt-5 flex size-9 shrink-0 items-center justify-center rounded-full text-grey-400 hover:bg-error/10 hover:text-error disabled:opacity-30 transition-colors"
                  aria-label="ลบรายการ"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {/* Cart total */}
            <div className="rounded-lg bg-primary/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary">
                  <Info className="size-4 shrink-0" />
                  ลูกค้าจะเห็นรายการย่อยทั้งหมดและจ่ายครั้งเดียว
                </span>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-xs text-grey-500 tabular-nums">
                      ก่อนส่วนลด ฿{fmtTHB(subtotal)}
                    </p>
                  )}
                  <p className="text-xs text-grey-500">ยอดที่ลูกค้าต้องชำระ</p>
                  <p className="tabular-nums text-base font-bold">฿{fmtTHB(total)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Channel radio */}
        <section className="rounded-[16px] bg-card shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="border-b border-[rgba(145,158,171,0.12)] px-6 py-4">
            <h2 className="text-sm font-bold">ช่องทางการชำระเงินที่อนุญาต</h2>
            <p className="text-xs text-grey-500">
              เลือกช่องทางเดียวที่ลูกค้าจะใช้ในการชำระลิงก์นี้
            </p>
          </div>
          <div className="flex flex-col gap-3 p-5">
            {(
              [
                { k: "card", label: "บัตรเครดิต / เดบิต", desc: "Visa, Mastercard, JCB, UnionPay", colorCls: "text-primary" },
                { k: "qr", label: "PromptPay QR", desc: "สแกนจากแอปธนาคารใดก็ได้", colorCls: "text-emerald-600" },
                { k: "installment", label: "ผ่อนชำระ 0%", desc: "3, 6, 10 เดือน (KBank, KTC, BBL, BAY)", colorCls: "text-violet-600" },
              ] as const
            ).map((c) => {
              const active = channel === c.k;
              return (
                <label
                  key={c.k}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-[rgba(145,158,171,0.12)] hover:border-[rgba(145,158,171,0.32)]",
                  )}
                >
                  <div className={cn("size-8 flex items-center justify-center rounded-lg bg-[var(--action-hover)]", c.colorCls)}>
                    {c.k === "card" && (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    )}
                    {c.k === "qr" && (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v7h-7zM14 14v3M17 17h4"/>
                      </svg>
                    )}
                    {c.k === "installment" && (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M2 12h20"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-[12px] text-grey-500">{c.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="channel"
                    checked={active}
                    onChange={() => setChannel(c.k as PaymentChannel)}
                    className="size-[18px] accent-primary cursor-pointer"
                  />
                </label>
              );
            })}

            {channel === "installment" && (
              <div className="rounded-lg bg-[var(--action-hover)] border border-[rgba(145,158,171,0.12)] px-3.5 py-3">
                <p className="mb-2 text-sm font-semibold">งวดผ่อนชำระที่อนุญาต</p>
                <div className="flex flex-wrap gap-1.5">
                  {[3, 4, 6, 9, 10, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setInstallmentMonths(
                          installmentMonths.includes(m)
                            ? installmentMonths.filter((x) => x !== m)
                            : [...installmentMonths, m].sort((a, b) => a - b),
                        )
                      }
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        installmentMonths.includes(m)
                          ? "bg-grey-800 text-white"
                          : "bg-bg-paper border border-[rgba(145,158,171,0.32)] text-grey-600 hover:border-grey-400",
                      )}
                    >
                      {m} เดือน
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Link settings */}
        <section className="rounded-[16px] bg-card shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="border-b border-[rgba(145,158,171,0.12)] px-6 py-4">
            <h2 className="text-sm font-bold">ตั้งค่าลิงก์ และการแจ้งเตือน</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
            {/* Expiry */}
            <FormField label="ระยะเวลาก่อนลิงก์หมดอายุ" className="col-span-full sm:col-span-1">
              <div className="flex flex-wrap gap-1.5">
                {[24, 48, 72, 168].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExpiryHours(h)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      expiryHours === h
                        ? "bg-grey-800 text-white"
                        : "bg-bg-paper border border-[rgba(145,158,171,0.32)] text-grey-600 hover:border-grey-400",
                    )}
                  >
                    {h === 168 ? "7 วัน" : `${h} ชม.`}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Originator */}
            <FormField label="ที่มาของรายการ (Originator)" className="col-span-full">
              <Select
                value={originator}
                onValueChange={(v) => setOriginator(v ?? "")}
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>── สาขา ──</SelectLabel>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        [{b.code}] {b.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {BRANCHES.map((br) => {
                    const kids = AGENTS.filter((a) => a.parent === br.id);
                    if (kids.length === 0) return null;
                    return (
                      <SelectGroup key={br.id}>
                        <SelectLabel>{`── สังกัด ${br.name} ──`}</SelectLabel>
                        {kids.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            [{a.code}] {a.name} ·{" "}
                            {a.type === "agent"
                              ? "ตัวแทน"
                              : a.type === "broker"
                                ? "นายหน้า"
                                : "พนักงานประจำสาขา"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                  <SelectGroup>
                    <SelectLabel>── แอปเชื่อมต่อ ──</SelectLabel>
                    {CONNECTED_APPS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        [{a.code}] {a.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-grey-500">
                ตัวแทน/นายหน้าจะถูกผูกกับสาขาที่สังกัด · ใช้สำหรับติดตามค่าคอมมิชชั่นและการกระทบยอด
              </p>
            </FormField>

            {/* Notify mode */}
            <FormField label="การแจ้งเตือนลูกค้า" className="col-span-full">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { k: "customer", label: "ส่งหาลูกค้า" },
                    { k: "custom", label: "กำหนดผู้รับเอง" },
                    { k: "none", label: "ไม่ส่งแจ้งเตือน" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.k}
                    type="button"
                    onClick={() => {
                      setNotifyMode(m.k);
                      if (m.k === "none") {
                        setNotifySms(false);
                        setNotifyEmail(false);
                      } else {
                        setNotifySms(true);
                        setNotifyEmail(true);
                      }
                    }}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      notifyMode === m.k
                        ? "bg-grey-800 text-white"
                        : "bg-bg-paper border border-[rgba(145,158,171,0.32)] text-grey-600 hover:border-grey-400",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </FormField>

            {notifyMode === "custom" && (
              <div className="col-span-full grid grid-cols-1 gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4 sm:grid-cols-2">
                <FormField label="ชื่อผู้รับ" className="col-span-full">
                  <input
                    className="form-input"
                    placeholder="เช่น คุณสุดา ฝ่ายบัญชี"
                    value={customRecipient.name}
                    onChange={(e) =>
                      setCustomRecipient({ ...customRecipient, name: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="เบอร์โทร (สำหรับ SMS)">
                  <input
                    className="form-input font-mono"
                    placeholder="08X-XXX-XXXX"
                    value={customRecipient.phone}
                    onChange={(e) =>
                      setCustomRecipient({ ...customRecipient, phone: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="อีเมล">
                  <input
                    className="form-input"
                    placeholder="recipient@example.com"
                    value={customRecipient.email}
                    onChange={(e) =>
                      setCustomRecipient({ ...customRecipient, email: e.target.value })
                    }
                  />
                </FormField>
              </div>
            )}

            {/* SMS / Email toggles */}
            <div className="col-span-full flex flex-col gap-2.5">
              <NotifyRow
                icon="sms"
                title="ส่ง SMS แจ้งลิงก์"
                sub={`ส่งไปยัง ${notifyMode === "custom" && customRecipient.phone ? customRecipient.phone : customer.phone || "ลูกค้า"}`}
                checked={notifySms && notifyMode !== "none"}
                disabled={notifyMode === "none"}
                onChange={setNotifySms}
              />
              <NotifyRow
                icon="email"
                title="ส่งอีเมลพร้อมลิงก์"
                sub={`ส่งไปยัง ${notifyMode === "custom" && customRecipient.email ? customRecipient.email : customer.email || "ลูกค้า"}`}
                checked={notifyEmail && notifyMode !== "none"}
                disabled={notifyMode === "none"}
                onChange={setNotifyEmail}
              />
            </div>
          </div>
        </section>

        {/* Advanced */}
        <section className="rounded-[16px] bg-card shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full select-none items-center justify-between border-b border-[rgba(145,158,171,0.12)] px-6 py-4"
          >
            <div className="text-left">
              <p className="text-sm font-bold">ใบแจ้งหนี้และเลขที่อ้างอิง (ขั้นสูง)</p>
              <p className="text-xs text-grey-500">
                Invoice No, Reference 1–5, หมายเหตุ · ใช้กระทบยอดกับระบบต้นทาง
              </p>
            </div>
            {showAdvanced ? (
              <ChevronUp className="size-4 text-grey-500 shrink-0" />
            ) : (
              <ChevronDown className="size-4 text-grey-500 shrink-0" />
            )}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <FormField label="เลขที่ใบแจ้งหนี้ (Invoice No)" className="col-span-full">
                <input
                  className="form-input font-mono"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="INV-26-XXXXX"
                />
                <p className="mt-1 text-[11px] text-grey-500">
                  ใช้เป็น reference หลัก · ระบบจะออก invoice อัตโนมัติเมื่อสร้างลิงก์
                </p>
              </FormField>
              <FormField label="ส่วนลด (บาท)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 font-semibold text-sm">
                    ฿
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="form-input pl-7 tabular-nums"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                {discount > 0 && (
                  <p className="mt-1 text-[11px] text-grey-500">
                    ยอดหลังหักส่วนลด ฿{fmtTHB(total)}
                  </p>
                )}
              </FormField>
              {[1, 2, 3, 4, 5].map((n, i) => (
                <FormField key={n} label={`เลขที่อ้างอิง ${n}`}>
                  <input
                    className="form-input font-mono"
                    placeholder={
                      n === 1 ? "เช่น PO-12480" : n === 2 ? "เช่น WO-2415" : "ใส่ค่าอ้างอิงตามต้องการ"
                    }
                    value={refs[i] ?? ""}
                    onChange={(e) => {
                      const next = [...refs];
                      next[i] = e.target.value;
                      setRefs(next);
                    }}
                  />
                </FormField>
              ))}
              <FormField label="หมายเหตุ (Internal note)" className="col-span-full">
                <textarea
                  className="form-input min-h-[80px] resize-y"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ใส่หมายเหตุภายใน — ไม่แสดงให้ลูกค้าเห็น"
                />
              </FormField>
            </div>
          )}
        </section>
      </div>

      {/* === Right: Preview (desktop) + Sticky footer === */}
      <div className="flex flex-col gap-5">
        {/* Preview */}
        <div className="rounded-[16px] bg-card p-5 shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="mb-3">
            <h2 className="text-sm font-bold">ตัวอย่างหน้าชำระเงิน</h2>
            <p className="text-xs text-grey-500">Hosted Payment Page · ลูกค้าจะเห็นแบบนี้</p>
          </div>
          <HostedPaymentPreview
            customerName={customer.name}
            items={items.map((it) => ({
              policyNo: it.policyNo,
              type: it.type,
              period: it.period,
              amount: it.amount,
            }))}
            total={total}
            channel={channel}
            installmentMonths={installmentMonths}
          />
        </div>

        {/* Sticky footer (desktop: inside col, mobile: full-width below) */}
        <div className="sticky bottom-0 z-20 rounded-[16px] border border-[rgba(145,158,171,0.12)] bg-bg-paper p-5 shadow-[0_-4px_12px_rgba(145,158,171,0.08)]">
          <div className="mb-3">
            <p className="text-xs text-grey-500">ยอดรวมที่จะส่งให้ลูกค้าชำระ</p>
            <p className="tabular-nums text-2xl font-bold tracking-tight">
              ฿{fmtTHB(total)}
            </p>
            <p className="text-[11px] text-grey-500 mt-0.5">
              ค่าธรรมเนียมประมาณ ฿{fmtTHB(fee)} ·{" "}
              ลิงก์มีอายุ {expiryHours === 168 ? "7 วัน" : `${expiryHours} ชั่วโมง`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={submitting || !customer.name || !customer.email || !customer.phone || total <= 0}
              onClick={handleSubmit}
            >
              {isEdit ? (
                <>
                  <Check className="size-3.5 mr-1" strokeWidth={3} />
                  {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1" />
                  {submitting ? "กำลังออกใบแจ้งหนี้..." : "ออกใบแจ้งหนี้ & ส่งลิงก์"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/invoices")}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────── helpers ──────────────────────────────────── */

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-grey-700 dark:text-grey-300">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
    </div>
  );
}

interface NotifyRowProps {
  icon: "sms" | "email";
  title: string;
  sub: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}

function NotifyRow({ icon, title, sub, checked, disabled, onChange }: NotifyRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border border-[rgba(145,158,171,0.12)] px-4 py-3 transition-colors",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && checked && "border-primary/30 bg-primary/5",
      )}
    >
      {/* Toggle */}
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          checked && !disabled ? "bg-primary" : "bg-grey-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
            checked && !disabled ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", checked && !disabled ? "bg-primary/10 text-primary" : "bg-grey-200 text-grey-500")}>
        {icon === "sms" ? (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        ) : (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[12px] text-grey-500 truncate">{sub}</p>
      </div>
    </label>
  );
}
