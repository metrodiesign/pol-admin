"use client";

import { useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PspApiError,
  getPspConnection,
  requestCredentialChange,
} from "@/lib/api/control/psp";
import {
  beginIdempotencyIntent,
  mapPspProblem,
  resolveCredentialReconciliation,
  transitionIdempotencyIntent,
  validateCredentialDraft,
  type IdempotencyIntent,
  type PspValidationErrors,
} from "@/lib/control/psp";
import type { ConnectionResource, CredentialChangeAccepted } from "@/types/control/psp-connection";
import { PspCredentialFields } from "./form-fields";
import { loadPendingApprovals } from "./resource-hooks";

interface CredentialChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ConnectionResource;
  onAccepted: (result: CredentialChangeAccepted) => void;
  onPendingReconciled: (resource: ConnectionResource) => void;
  onConflict: () => void;
  onUnknownOutcome: () => void;
}

function CredentialChangeDialogContent({
  onOpenChange,
  resource,
  onAccepted,
  onPendingReconciled,
  onConflict,
  onUnknownOutcome,
}: Omit<CredentialChangeDialogProps, "open">) {
  const [secretKey, setSecretKey] = useState("");
  const [pspMerchantId, setPspMerchantId] = useState("");
  const [errors, setErrors] = useState<PspValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [phase, setPhase] = useState<"editing" | "needs-reconcile" | "retry-safe">("editing");
  const intent = useRef<IdempotencyIntent | null>(null);
  const submissionResource = useRef(resource);
  const busy = submitting || reconciling;

  const changeSecret = (value: string) => {
    setSecretKey(value);
    setErrors((current) => ({ ...current, secretKey: undefined }));
    setFormError(null);
    setPhase("editing");
    intent.current = null;
  };

  const changeMerchantId = (value: string) => {
    setPspMerchantId(value);
    setErrors((current) => ({ ...current, pspMerchantId: undefined }));
    setFormError(null);
    setPhase("editing");
    intent.current = null;
  };

  const close = () => {
    if (!busy) onOpenChange(false);
  };

  const reconcile = async () => {
    const currentIntent = intent.current;
    const original = submissionResource.current;
    if (!currentIntent || !original.etag || reconciling) return;
    setReconciling(true);
    setFormError("กำลังตรวจ resource และ approval ล่าสุด...");
    try {
      const [latest, approvals] = await Promise.all([
        getPspConnection(original.connection.pspConnectionId),
        loadPendingApprovals(undefined, original.connection.pspConnectionId),
      ]);
      if (approvals.status !== "ready") {
        setFormError("ตรวจผลลัพธ์ไม่ได้ เพราะ approval state ยังไม่พร้อม กรุณาลองตรวจอีกครั้ง");
        return;
      }
      const resolution = resolveCredentialReconciliation(
        original.etag,
        latest,
        approvals.items,
      );
      if (resolution === "retry-safe") {
        setPhase("retry-safe");
        setFormError("สถานะล่าสุดยืนยันว่า request ยังไม่ถูก commit; ส่งคำขอเดิมซ้ำได้อย่างปลอดภัย");
        return;
      }

      setSecretKey("");
      setPspMerchantId("");
      if (resolution === "pending") {
        intent.current = transitionIdempotencyIntent(currentIntent, "terminal");
        onOpenChange(false);
        onPendingReconciled(latest);
        return;
      }

      intent.current = transitionIdempotencyIntent(currentIntent, "credential-resource-changed");
      onOpenChange(false);
      onUnknownOutcome();
    } catch {
      setFormError("ตรวจผลลัพธ์ไม่ได้ กรุณาลองตรวจสถานะล่าสุดอีกครั้ง");
    } finally {
      setReconciling(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || phase === "needs-reconcile") return;
    const original = submissionResource.current;
    const nextErrors = validateCredentialDraft(
      original.connection.psp,
      secretKey,
      pspMerchantId,
    );
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (!original.etag) {
      setFormError("ไม่มี ETag ล่าสุด กรุณาโหลดข้อมูลใหม่");
      return;
    }

    const nextIntent = beginIdempotencyIntent(intent.current);
    intent.current = nextIntent;
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await requestCredentialChange(
        original.connection.pspConnectionId,
        {
          merchantId: original.connection.merchantId,
          secrets: { secretKey },
          pspMerchantId:
            original.connection.psp === "2c2p" ? pspMerchantId.trim() : null,
        },
        original.etag,
        nextIntent.key!,
      );
      intent.current = transitionIdempotencyIntent(nextIntent, "terminal");
      setSecretKey("");
      setPspMerchantId("");
      onOpenChange(false);
      onAccepted(result);
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "credential");
      if (mapped.kind === "conflict") {
        intent.current = transitionIdempotencyIntent(nextIntent, "terminal");
        setSecretKey("");
        setPspMerchantId("");
        onOpenChange(false);
        onConflict();
      } else if (mapped.kind === "in-progress" || mapped.retryable) {
        intent.current = transitionIdempotencyIntent(
          nextIntent,
          mapped.kind === "in-progress" ? "operation-in-progress" : "uncertain",
        );
        setPhase("needs-reconcile");
        setFormError("ตรวจผลลัพธ์ไม่ได้ ต้องตรวจ resource และ approval ล่าสุดก่อน retry");
      } else {
        intent.current = transitionIdempotencyIntent(
          nextIntent,
          mapped.kind === "key-reused" ? "key-reused" : "terminal",
        );
        setPhase("editing");
        setFormError(mapped.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>ขอเปลี่ยน Credential</DialogTitle>
          <DialogDescription>
            Credential ใหม่จะรอ maker-checker approval; Credential ที่ใช้งานอยู่ยังไม่เปลี่ยน
          </DialogDescription>
        </DialogHeader>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit} aria-busy={busy}>
          <PspCredentialFields
            provider={resource.connection.psp}
            secretKey={secretKey}
            pspMerchantId={pspMerchantId}
            onSecretKeyChange={changeSecret}
            onPspMerchantIdChange={changeMerchantId}
            errors={errors}
            disabled={busy || phase === "needs-reconcile"}
          />
          {formError ? (
            <p className="text-sm text-error sm:col-span-2" role="alert">{formError}</p>
          ) : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={close} disabled={busy}>
              ยกเลิก
            </Button>
            {phase === "needs-reconcile" ? (
              <Button type="button" onClick={() => void reconcile()} disabled={busy}>
                {reconciling ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {reconciling ? "กำลังตรวจ..." : "ตรวจสถานะล่าสุด"}
              </Button>
            ) : (
              <Button type="submit" disabled={busy}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitting
                  ? "กำลังส่ง..."
                  : phase === "retry-safe"
                    ? "ส่งคำขอเดิมอีกครั้ง"
                    : "ส่งคำขออนุมัติ"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CredentialChangeDialog(props: CredentialChangeDialogProps) {
  if (!props.open) return null;
  const { open: _open, ...contentProps } = props;
  return <CredentialChangeDialogContent {...contentProps} />;
}
