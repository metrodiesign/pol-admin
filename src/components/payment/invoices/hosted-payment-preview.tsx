"use client";

import type { PaymentChannel } from "@/types/transaction";
import { Shield, FileText, Check } from "lucide-react";
import { cn, formatTHBPlain } from "@/lib/utils";

interface PreviewItem {
  policyNo: string;
  type: string;
  period: string;
  amount: number;
}

interface HostedPaymentPreviewProps {
  customerName: string;
  items: PreviewItem[];
  total: number;
  channel: PaymentChannel;
  installmentMonths: number[];
}

const fmtTHB = formatTHBPlain;

export function HostedPaymentPreview({
  customerName,
  items,
  total,
  channel,
  installmentMonths,
}: HostedPaymentPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(145,158,171,0.12)] bg-bg-paper shadow-md">
      {/* Top bar */}
      <div className="flex items-center gap-2.5 bg-gradient-to-br from-blue-700 to-blue-600 px-4 py-3.5 text-white">
        <div className="flex size-7 items-center justify-center rounded-md bg-white/20 text-sm font-bold">
          CP
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">CentroPay</p>
          <p className="text-xs opacity-85">การชำระเงินปลอดภัย · เข้ารหัส SSL</p>
        </div>
        <Shield className="size-4" />
      </div>

      <div className="p-4">
        <p className="text-sm text-grey-500">
          ชำระให้{" "}
          <strong className="text-foreground">บริษัทประกันภัย จำกัด</strong>
        </p>
        <p className="text-sm text-grey-500 mt-0.5">คุณ {customerName}</p>

        <div className="mt-3.5 mb-4">
          <p className="text-sm text-grey-500">ยอดที่ต้องชำระ</p>
          <p className="tabular-nums text-3xl font-bold tracking-tight">
            ฿{fmtTHB(total)}
          </p>
          <p className="text-sm text-grey-500">{items.length} รายการ</p>
        </div>

        {/* Items */}
        <div className="border-t border-[rgba(145,158,171,0.12)] pt-3">
          {items.map((it, i) => (
            <div key={i} className="mb-2.5 flex items-start gap-2">
              <FileText className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{it.type || "ประเภทประกัน"}</p>
                <p className="text-[12px] text-grey-500">
                  {it.policyNo || "POL-—"} · {it.period}
                </p>
              </div>
              <p className="tabular-nums text-sm font-semibold">
                ฿{fmtTHB(Number(it.amount) || 0)}
              </p>
            </div>
          ))}
        </div>

        {/* Channel */}
        <div className="mt-1.5 border-t border-[rgba(145,158,171,0.12)] pt-3.5">
          <p className="mb-2 text-sm font-semibold text-grey-600">วิธีชำระเงิน</p>
          <div className="flex flex-col gap-1.5">
            {channel === "card" && (
              <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-bg-paper text-primary">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <p className="flex-1 text-sm font-semibold">บัตรเครดิต / เดบิต</p>
                <Check className="size-3.5 text-primary" strokeWidth={3} />
              </div>
            )}
            {channel === "qr" && (
              <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-bg-paper text-emerald-600">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM17 17h4v4h-4zM17 15h4"/>
                  </svg>
                </div>
                <p className="flex-1 text-sm font-semibold">PromptPay QR</p>
                <Check className="size-3.5 text-primary" strokeWidth={3} />
              </div>
            )}
            {channel === "installment" && (
              <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-bg-paper text-violet-600">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20M17 7l-5 5-5-5"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    ผ่อน 0% นาน{" "}
                    {installmentMonths.length > 0
                      ? installmentMonths.join("/")
                      : "3/6/10"}{" "}
                    เดือน
                  </p>
                  {installmentMonths.length > 0 && total > 0 && (
                    <p className="text-[12px] text-grey-500">
                      เริ่มต้น ฿
                      {fmtTHB(
                        total / Math.max(...installmentMonths),
                      )}
                      /เดือน
                    </p>
                  )}
                </div>
                <Check className="size-3.5 text-primary" strokeWidth={3} />
              </div>
            )}
          </div>
          <p className="mt-2 text-[12px] text-grey-500">
            ลิงก์นี้รองรับการชำระผ่านช่องทางเดียวเท่านั้น
          </p>
        </div>

        <button
          type="button"
          className={cn(
            "mt-3.5 w-full cursor-default rounded-lg py-3 text-sm font-bold text-white",
            "bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.25)]",
          )}
          tabIndex={-1}
        >
          ดำเนินการชำระเงิน ฿{fmtTHB(total)}
        </button>
        <p className="mt-2 text-center text-[12px] text-grey-500">
          ระบบจะนำคุณไปยังหน้าของผู้ให้บริการชำระเงิน
        </p>
      </div>
    </div>
  );
}
