"use client";

import { ListChecks, Scale } from "lucide-react";
import {
  PSP_LABEL,
  STATUS_LABEL,
  statusTone,
  variance,
} from "@/lib/control/settlement";
import { useControlStore } from "@/lib/control/store";
import { settlementStore } from "@/lib/control/settlement-store";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { formatDateTime } from "@/lib/control/format";
import { cn, formatTHB } from "@/lib/utils";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";

function signedTHB(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${formatTHB(Math.abs(v), 2)}`;
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-5 flex items-center gap-2 text-h6 text-foreground">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <div
      className="rounded-2xl bg-card p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-h6 text-foreground">ไม่พบชุดการกระทบยอดนี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสชุดอาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function SettlementDetailView({ id }: { id?: string }) {
  const batches = useControlStore(settlementStore);
  const batch = id ? batches.find((b) => b.id === id) : undefined;
  if (!batch) return <NotFound />;

  const tone = statusTone(batch.matchStatus);
  const reconciled = batch.matchStatus !== "unreconciled";
  const v = variance(batch);

  return (
    <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
      {/* Summary */}
      <div className="mmd:col-span-4">
        <div
          className="flex flex-col gap-5 rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-stretch gap-3">
            <StatusSpine tone={tone} className="h-auto" />
            <div className="min-w-0">
              <span className="text-overline text-grey-500">
                Control plane · Settlement batch
              </span>
              <h1 className="text-h5 text-foreground">
                {PSP_LABEL[batch.psp]} · {TENANT_LABEL[batch.tenantId]}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {batch.batchRef}
              </p>
            </div>
          </div>

          <div>
            <ControlStatusBadge
              tone={tone}
              label={STATUS_LABEL[batch.matchStatus]}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="บริษัท" value={TENANT_LABEL[batch.tenantId]} />
            <ReadField label="PSP" value={PSP_LABEL[batch.psp]} />
            <ReadField label="รหัสชุด" value={batch.id} mono />
            <ReadField
              label="Settle เมื่อ"
              value={formatDateTime(batch.settledAt)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ยอดการกระทบยอด"
          icon={<Scale className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="ยอดที่คาดไว้"
              value={formatTHB(batch.expected, 2)}
              mono
            />
            <ReadField
              label="ยอดที่ PSP แจ้ง"
              value={reconciled ? formatTHB(batch.reported, 2) : "—"}
              mono
            />
            <ReadField
              label="ส่วนต่าง"
              value={
                reconciled ? (
                  <span
                    className={cn(
                      v > 0 && "text-warning-dark",
                      v < 0 && "text-error-dark",
                      v === 0 && "text-grey-600",
                    )}
                  >
                    {signedTHB(v)}
                  </span>
                ) : (
                  "—"
                )
              }
              mono
            />
            <ReadField
              label="สถานะ"
              value={STATUS_LABEL[batch.matchStatus]}
            />
          </div>

          {reconciled && v !== 0 ? (
            <div className="mt-5 rounded-xl border border-[var(--divider)] bg-warning/12 p-4">
              <p className="text-xs font-bold text-warning-dark">
                ส่วนต่างการกระทบยอด
              </p>
              <p className="mt-1 text-xs text-grey-700">
                PSP แจ้ง{" "}
                <span className="text-data font-semibold">
                  {formatTHB(batch.reported, 2)}
                </span>{" "}
                เทียบกับที่คาดไว้{" "}
                <span className="text-data font-semibold">
                  {formatTHB(batch.expected, 2)}
                </span>{" "}
                ต่างกัน{" "}
                <span
                  className={cn(
                    "text-data font-semibold",
                    v > 0 ? "text-warning-dark" : "text-error-dark",
                  )}
                >
                  {signedTHB(v)}
                </span>{" "}
                — ต้องตรวจสอบรายการก่อนปิดงวด
              </p>
            </div>
          ) : null}
        </DetailCard>

        <DetailCard
          title={`รายการในชุด (${batch.lineItems.length})`}
          icon={<ListChecks className="size-5 text-grey-600" />}
        >
          {batch.lineItems.length > 0 ? (
            <div className="flex flex-col divide-y divide-[var(--divider)]">
              <div className="flex items-center justify-between gap-3 pb-2 text-xs font-medium text-grey-600">
                <span>Reference</span>
                <span>ยอด settle</span>
              </div>
              {batch.lineItems.map((item) => (
                <div
                  key={item.ref}
                  className="flex items-center justify-between gap-3 py-2.5 last:pb-0"
                >
                  <span className="text-data text-xs text-grey-700">
                    {item.ref}
                  </span>
                  <span className="text-data text-xs font-semibold text-foreground">
                    {formatTHB(item.amount, 2)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 pt-3 text-sm">
                <span className="font-semibold text-foreground">รวม</span>
                <span className="text-data font-semibold text-foreground">
                  {formatTHB(batch.reported, 2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-grey-600">
              ยังไม่ได้รับรายงาน settle จาก PSP สำหรับชุดนี้
            </p>
          )}
        </DetailCard>

        <div
          className="rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-xs text-grey-600">
            เงิน settle จาก PSP เข้าบัญชีบริษัทโดยตรง — แพลตฟอร์มติดตามสถานะ
            ไม่ถือเงิน
          </p>
        </div>
      </div>
    </div>
  );
}
