"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, ShieldCheck, X } from "lucide-react";
import { CURRENT_ACTOR } from "@/lib/mock/control/approvals";
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
import { showControlToast } from "@/components/control/shared/toast";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";
import { formatTHB } from "@/lib/utils";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import {
  cancelClass,
  cardStyle,
  primaryClass,
  warningClass,
  controlBadgeClass,
} from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import {
  ApprovalConfirmDialog,
  type ApprovalConfirmMode,
} from "./confirm-dialog";

function Header({ id, actions }: { id?: string; actions?: React.ReactNode }) {
  return (
    <EditPageHeader
      title="รายละเอียดคำขออนุมัติ"
      backHref="/control/approvals"
      breadcrumbs={[
        { label: "การอนุมัติ", href: "/control/approvals" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/control/approvals" className={cancelClass}>
            ยกเลิก
          </Link>
          {actions}
        </div>
      }
    />
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

  if (!req) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบคำขออนุมัตินี้"
          message="รหัสคำขออาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

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
    <>
      <Header
        id={req.id}
        actions={
          <>
            <button
              type="button"
              className={warningClass}
              disabled={!allowed || busy}
              title={allowed ? undefined : reason}
              onClick={() => openConfirm("reject")}
            >
              <X className="size-4" />
              ปฏิเสธ
            </button>
            <button
              type="button"
              className={primaryClass}
              disabled={!allowed || busy}
              title={allowed ? undefined : reason}
              onClick={() => openConfirm("approve")}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              อนุมัติ
            </button>
          </>
        }
      />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={ACTION_LABEL[req.actionType]}
          subtitle={MERCHANT_LABEL[req.merchantId]}
          code={req.target}
          badges={
            <>
              <ControlStatusBadge tone={tone} label={STATUS_LABEL[req.status]} />
              <span className={`${controlBadgeClass} bg-success/12 text-success-dark`}>
                <ShieldCheck className="size-3.5" />
                Maker-checker
              </span>
            </>
          }
        />

        <DetailSection title="ข้อมูลคำขอ">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="รหัสคำขอ" value={req.id} mono />
            <ReadField label="การดำเนินการ" value={ACTION_LABEL[req.actionType]} />
            <ReadField label="เป้าหมาย" value={req.target} mono />
            <ReadField label="ผู้ขอ" value={req.maker} mono />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[req.merchantId]} />
            <ReadField label="ขอเมื่อ" value={formatDateTime(req.requestedAt)} mono />
            <ReadField label="สถานะ" value={STATUS_LABEL[req.status]} />
            <ReadField
              label="อ้างอิง — เงิน settle PSP→บริษัทโดยตรง"
              value={req.refAmount == null ? "—" : formatTHB(req.refAmount)}
              className="sm:col-span-2"
            />
          </div>
        </DetailSection>

        <DetailSection
          title="การตรวจสอบ (maker-checker)"
          description={`ผู้ตรวจสอบคนที่สองเป็นผู้ลงนามอนุมัติหรือปฏิเสธ — ผู้ขอ (${req.maker}) ไม่สามารถอนุมัติคำขอของตนเองได้`}
        >
          <p className="text-sm text-grey-600">
            {allowed
              ? "ใช้ปุ่ม อนุมัติ / ปฏิเสธ ด้านบนเพื่อบันทึกการตัดสินใจ"
              : reason}
          </p>
        </DetailSection>
      </div>

      <ApprovalConfirmDialog
        request={pending ? req : null}
        mode={mode}
        onConfirm={confirm}
        onClose={() => setPending(false)}
      />
    </>
  );
}
