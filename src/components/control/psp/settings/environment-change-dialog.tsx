"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { PspApiError } from "@/lib/api/control/psp";
import { requestEnvironmentChange } from "@/lib/api/control/merchant-payment-settings";
import { PROVIDER_LABEL, beginIdempotencyIntent, transitionIdempotencyIntent, type IdempotencyIntent } from "@/lib/control/psp";
import {
  buildEnvironmentChangeConnections,
  mapSettingsProblem,
  validateEnvironmentChange,
  type EnvironmentConnectionDraft,
} from "@/lib/control/merchant-psp-settings";
import type { EnvironmentChangeAccepted } from "@/types/control/merchant-payment-settings";
import type { PaymentEnvironment, PspConnection } from "@/types/control/psp-connection";

interface EnvironmentChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId: string;
  settingsEtag: string | null;
  connections: PspConnection[];
  currentEnvironment: PaymentEnvironment;
  onAccepted: (result: EnvironmentChangeAccepted) => void;
  /** เรียกเมื่อ backend ตอบ conflict/approval (mapped.refetch) เพื่อรีเฟรช settings ETag โดยไม่ reload หน้า */
  onRefetch: () => void;
}

function emptyDraft(connection: PspConnection): EnvironmentConnectionDraft {
  return {
    pspConnectionId: connection.pspConnectionId,
    psp: connection.psp,
    pspMerchantId: "",
    secretKey: "",
    publicKey: "",
    webhookSecret: "",
  };
}

function DialogBody({
  onOpenChange,
  merchantId,
  settingsEtag,
  connections,
  currentEnvironment,
  onAccepted,
  onRefetch,
}: Omit<EnvironmentChangeDialogProps, "open">) {
  const target: PaymentEnvironment = currentEnvironment === "live" ? "sandbox" : "live";
  const [drafts, setDrafts] = useState<EnvironmentConnectionDraft[]>(() =>
    connections.map(emptyDraft),
  );
  const [webhookConfirmed, setWebhookConfirmed] = useState(false);
  const [errors, setErrors] = useState<
    Record<string, ReturnType<typeof validateEnvironmentChange>["connectionErrors"][string]>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const intent = useRef<IdempotencyIntent | null>(null);

  const hasOmise = connections.some((connection) => connection.psp === "omise");

  const patch = (id: string, next: Partial<EnvironmentConnectionDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.pspConnectionId === id ? { ...draft, ...next } : draft)),
    );
    setErrors({});
    setFormError(null);
    intent.current = null;
  };

  const close = () => {
    if (submitting) return;
    setDrafts(connections.map(emptyDraft));
    setWebhookConfirmed(false);
    onOpenChange(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validateEnvironmentChange(drafts, target, webhookConfirmed);
    if (!validation.valid) {
      setErrors(validation.connectionErrors);
      setFormError(validation.formError);
      return;
    }
    if (!settingsEtag) {
      setFormError("ไม่มี ETag ล่าสุด กรุณาโหลดข้อมูลใหม่");
      return;
    }
    const nextIntent = beginIdempotencyIntent(intent.current);
    intent.current = nextIntent;
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await requestEnvironmentChange(
        merchantId,
        {
          targetEnvironment: target,
          omiseWebhookRegistered: webhookConfirmed,
          connections: buildEnvironmentChangeConnections(drafts),
        },
        settingsEtag,
        nextIntent.key!,
      );
      intent.current = transitionIdempotencyIntent(nextIntent, "terminal");
      setDrafts(connections.map(emptyDraft));
      setWebhookConfirmed(false);
      onOpenChange(false);
      onAccepted(result);
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapSettingsProblem(apiError.status, apiError.code, "environment");
      intent.current = transitionIdempotencyIntent(
        nextIntent,
        mapped.retryable ? "uncertain" : "terminal",
      );
      if (mapped.kind === "too-large") setDrafts(connections.map(emptyDraft));
      if (mapped.refetch) onRefetch();
      setFormError(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="sm:max-w-xl" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>ขอเปลี่ยนสภาพแวดล้อมเป็น {target.toUpperCase()}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลรับรองแบบ write-only ต่อทุก connection; คำขอจะรอ maker-checker approval
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5" onSubmit={submit} aria-busy={submitting} noValidate>
          {drafts.map((draft) => {
            const connectionErrors = errors[draft.pspConnectionId] ?? {};
            return (
              <fieldset
                key={draft.pspConnectionId}
                className="flex flex-col gap-4 rounded-xl border border-[var(--divider)] p-4"
                disabled={submitting}
              >
                <legend className="px-1 text-sm font-semibold text-foreground">
                  {PROVIDER_LABEL[draft.psp]}
                </legend>
                {draft.psp === "2c2p" ? (
                  <TextField
                    label="2C2P Merchant ID"
                    type="text"
                    value={draft.pspMerchantId}
                    onChange={(value) => patch(draft.pspConnectionId, { pspMerchantId: value })}
                    error={connectionErrors.pspMerchantId}
                    autoComplete="off"
                    spellCheck={false}
                    required
                  />
                ) : null}
                <TextField
                  label="secretKey"
                  type="password"
                  value={draft.secretKey}
                  onChange={(value) => patch(draft.pspConnectionId, { secretKey: value })}
                  error={connectionErrors.secretKey}
                  autoComplete="new-password"
                  spellCheck={false}
                  required
                />
                {draft.psp === "omise" ? (
                  <>
                    <TextField
                      label="publicKey (ไม่บังคับ)"
                      type="password"
                      value={draft.publicKey}
                      onChange={(value) => patch(draft.pspConnectionId, { publicKey: value })}
                      error={connectionErrors.publicKey}
                      autoComplete="new-password"
                      spellCheck={false}
                    />
                    <TextField
                      label="webhookSecret (ไม่บังคับ)"
                      type="password"
                      value={draft.webhookSecret}
                      onChange={(value) => patch(draft.pspConnectionId, { webhookSecret: value })}
                      error={connectionErrors.webhookSecret}
                      autoComplete="new-password"
                      spellCheck={false}
                    />
                  </>
                ) : null}
              </fieldset>
            );
          })}

          {target === "live" && hasOmise ? (
            <label className="flex items-start gap-2 text-sm text-grey-800">
              <Checkbox
                checked={webhookConfirmed}
                onChange={(checked) => {
                  setWebhookConfirmed(checked);
                  setFormError(null);
                }}
                aria-label="ยืนยันลงทะเบียน callback URL ของ Omise"
              />
              <span>ยืนยันว่าได้ลงทะเบียน callback URL ใน Omise Dashboard แล้ว</span>
            </label>
          ) : null}

          {formError ? (
            <p className="text-sm text-error" role="alert">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? "กำลังส่ง..." : "ส่งคำขออนุมัติ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EnvironmentChangeDialog(props: EnvironmentChangeDialogProps) {
  if (!props.open) return null;
  const { open: _open, ...rest } = props;
  return <DialogBody {...rest} />;
}
