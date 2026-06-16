"use client";

import { EntityDrawer } from "@/components/payment/entity-drawer";
import { LifecycleTrack } from "@/components/payment/lifecycle-track";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { useToast } from "@/components/payment/toast/toast-provider";
import { Button } from "@/components/ui/button";
import type { Transaction, TransactionStatus } from "@/types/transaction";
import type { LifecycleStepConfig } from "@/components/payment/lifecycle-track";

function buildSteps(status: TransactionStatus): LifecycleStepConfig[] {
  switch (status) {
    case "succeeded":
      return [
        { step: "authorize", state: "done", label: "Authorize" },
        { step: "capture",   state: "done", label: "Capture" },
        { step: "void",      state: "idle", label: "Void" },
        { step: "refund",    state: "idle", label: "Refund" },
      ];
    case "refunded":
      return [
        { step: "authorize", state: "done", label: "Authorize" },
        { step: "capture",   state: "done", label: "Capture" },
        { step: "void",      state: "idle", label: "Void" },
        { step: "refund",    state: "done", label: "Refund" },
      ];
    case "voided":
      return [
        { step: "authorize", state: "done",   label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "void",      state: "done",   label: "Void" },
        { step: "refund",    state: "idle",   label: "Refund" },
      ];
    case "failed":
      return [
        { step: "authorize", state: "failed", label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "void",      state: "idle",   label: "Void" },
        { step: "refund",    state: "idle",   label: "Refund" },
      ];
    case "authorized":
      return [
        { step: "authorize", state: "done",   label: "Authorize" },
        { step: "capture",   state: "active", label: "Capture" },
        { step: "void",      state: "idle",   label: "Void" },
        { step: "refund",    state: "idle",   label: "Refund" },
      ];
    case "processing":
      return [
        { step: "authorize", state: "active", label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "void",      state: "idle",   label: "Void" },
        { step: "refund",    state: "idle",   label: "Refund" },
      ];
    default: // pending
      return [
        { step: "authorize", state: "active", label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "void",      state: "idle",   label: "Void" },
        { step: "refund",    state: "idle",   label: "Refund" },
      ];
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[rgba(145,158,171,0.12)] last:border-0">
      <span className="w-32 shrink-0 text-xs text-grey-600">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

interface TxnDrawerProps {
  txn: Transaction | null;
  onClose: () => void;
}

export function TxnDrawer({ txn, onClose }: TxnDrawerProps) {
  const open = txn !== null;
  const toast = useToast();

  const tsFormatted = txn
    ? new Date(txn.ts).toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <EntityDrawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={txn?.id ?? ""}
      description={txn ? `อ้างอิง: ${txn.ref}` : undefined}
      width="sm:max-w-lg"
    >
      {txn && (
        <div className="flex flex-col gap-5">
          {/* Lifecycle */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-grey-500">
              สถานะกระบวนการ
            </p>
            <LifecycleTrack steps={buildSteps(txn.status)} />
          </section>

          {/* Actions */}
          {(txn.status === "authorized" || txn.status === "succeeded") && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-grey-500">
                การดำเนินการ
              </p>
              <div className="flex flex-wrap gap-2">
                {txn.status === "authorized" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.success("Capture สำเร็จ", {
                        description: `ธุรกรรม ${txn.id} ถูก capture แล้ว`,
                      });
                    }}
                  >
                    Capture
                  </Button>
                )}
                {txn.status === "authorized" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.success("Void สำเร็จ", {
                        description: `ธุรกรรม ${txn.id} ถูก void แล้ว`,
                      });
                    }}
                  >
                    Void
                  </Button>
                )}
                {txn.status === "succeeded" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.success("Refund สำเร็จ", {
                        description: `ธุรกรรม ${txn.id} คืนเงินแล้ว`,
                      });
                    }}
                  >
                    Refund
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Summary */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
              สรุปธุรกรรม
            </p>
            <div>
              <Row label="สถานะ">
                <StatusBadge status={txn.status} />
              </Row>
              <Row label="จำนวนเงิน">
                <span className="tabular-nums font-bold">
                  ฿{txn.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </Row>
              <Row label="ช่องทาง">
                <ChannelTag channel={txn.channel} />
              </Row>
              <Row label="PSP">{txn.psp}</Row>
              <Row label="เวลา">{tsFormatted}</Row>
            </div>
          </section>

          {/* Customer */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
              ลูกค้า
            </p>
            <div>
              <Row label="ชื่อ">{txn.customer.name}</Row>
              <Row label="อีเมล">{txn.customer.email}</Row>
              <Row label="โทร">{txn.customer.phone}</Row>
            </div>
          </section>

          {/* Originator */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
              ผู้สร้างรายการ
            </p>
            <div>
              <Row label="รหัส">
                <span className="font-mono">{txn.originator.code}</span>
              </Row>
              <Row label="ชื่อ">{txn.originator.name}</Row>
              <Row label="ประเภท">{txn.originator.type}</Row>
            </div>
          </section>

          {/* Items */}
          {txn.items.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
                รายการกรมธรรม์ ({txn.items.length} รายการ)
              </p>
              <div className="flex flex-col gap-2">
                {txn.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-control border border-[rgba(145,158,171,0.12)] bg-grey-50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-grey-600">{item.policyNo}</p>
                        <p className="text-sm font-semibold">{item.type}</p>
                        <p className="text-xs text-grey-500">{item.period}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums">
                        ฿{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </EntityDrawer>
  );
}
