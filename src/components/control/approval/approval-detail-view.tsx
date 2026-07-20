"use client";

import { useState } from "react";
import { ClipboardCheck, ShieldCheck, Loader2 } from "lucide-react";
import { CURRENT_ACTOR } from "@/lib/mock/approvals";
import {
  ACTION_LABEL,
  STATUS_LABEL,
  statusTone,
  canApprove,
} from "@/lib/control/approval";
import { useControlStore } from "@/lib/control/store";
import {
  approvalsStore,
  approveRequest,
  rejectRequest,
} from "@/lib/control/approvals-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import { MERCHANT_LABEL } from "@/lib/mock/merchants";
import { formatDateTime } from "@/lib/control/format";
import { formatTHB } from "@/lib/utils";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { Button } from "@/components/ui/button";
import {
  ApprovalConfirmDialog,
  type ApprovalConfirmMode,
} from "./approval-confirm-dialog";

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
      <p className="text-h6 text-foreground">ไม่พบคำขออนุมัตินี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสคำขออาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function ApprovalDetailView({ id }: { id?: string }) {
  // Read from the shared store so the decision taken here (or on the list)
  // persists and is reflected on navigation back.
  const req = useControlStore(approvalsStore).find((r) => r.id === id);

  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<ApprovalConfirmMode>("approve");
  // Boolean in-flight flag — the approve button spins + disables while the
  // (simulated async) decision commits to the shared store.
  const [busy, setBusy] = useState(false);

  if (!req) return <NotFound />;

  const tone = statusTone(req.status);

  const allowed = canApprove(req, CURRENT_ACTOR);
  const reason =
    req.maker === CURRENT_ACTOR
      ? "ไม่สามารถอนุมัติคำขอของตนเอง"
      : "คำขอนี้ดำเนินการแล้ว";

  const openConfirm = (m: ApprovalConfirmMode) => {
    setMode(m);
    setPending(true);
  };

  const confirm = () => {
    const m = mode;
    const reqId = req.id;
    setPending(false);
    setBusy(true);
    setTimeout(() => {
      if (m === "approve") {
        approveRequest(reqId);
        showControlToast("อนุมัติคำขอแล้ว", "ok");
      } else {
        rejectRequest(reqId);
        showControlToast("ปฏิเสธคำขอแล้ว", "error");
      }
      setBusy(false);
    }, 600);
  };

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
                Control plane · การอนุมัติ
              </span>
              <h1 className="text-h5 text-foreground">
                {ACTION_LABEL[req.actionType]}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {req.target}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge tone={tone} label={STATUS_LABEL[req.status]} />
            <span className="inline-flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-1 text-xs font-semibold text-success-dark">
              <ShieldCheck className="size-3.5" />
              Maker-checker
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="รหัสคำขอ" value={req.id} mono />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[req.merchantId]} />
            <ReadField
              label="ขอเมื่อ"
              value={formatDateTime(req.requestedAt)}
              mono
            />
            <ReadField label="สถานะ" value={STATUS_LABEL[req.status]} />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ข้อมูลคำขอ"
          icon={<ClipboardCheck className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="การดำเนินการ"
              value={ACTION_LABEL[req.actionType]}
            />
            <ReadField label="เป้าหมาย" value={req.target} mono />
            <ReadField label="ผู้ขอ" value={req.maker} mono />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[req.merchantId]} />
            <ReadField
              label="ขอเมื่อ"
              value={formatDateTime(req.requestedAt)}
              mono
            />
            <ReadField
              label="อ้างอิง — เงิน settle PSP→บริษัทโดยตรง"
              value={req.refAmount == null ? "—" : formatTHB(req.refAmount)}
              className="sm:col-span-2"
            />
          </div>
        </DetailCard>

        <DetailCard
          title="การตรวจสอบ (maker-checker)"
          icon={<ShieldCheck className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            ผู้ตรวจสอบคนที่สองเป็นผู้ลงนามอนุมัติหรือปฏิเสธ — ผู้ขอ
            ({req.maker}) ไม่สามารถอนุมัติคำขอของตนเองได้
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              disabled={!allowed || busy}
              onClick={() => openConfirm("approve")}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "อนุมัติ"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={!allowed || busy}
              onClick={() => openConfirm("reject")}
            >
              ปฏิเสธ
            </Button>
            {!allowed ? (
              <span className="text-xs text-grey-600">{reason}</span>
            ) : null}
          </div>
        </DetailCard>
      </div>

      <ApprovalConfirmDialog
        request={pending ? req : null}
        mode={mode}
        onConfirm={confirm}
        onClose={() => setPending(false)}
      />
    </div>
  );
}
