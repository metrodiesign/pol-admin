"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { SelectField } from "@/components/form/select-field";
import { ConfirmDialog } from "@/components/policy/confirm-dialog";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Button } from "@/components/ui/button";
import { PspApiError, createPspConnection } from "@/lib/api/control/psp";
import {
  beginIdempotencyIntent,
  mapPspProblem,
  resetProviderFields,
  transitionIdempotencyIntent,
  validateCreateDraft,
  type IdempotencyIntent,
  type PspValidationErrors,
} from "@/lib/control/psp";
import type { PspMethod, PspProvider } from "@/types/control/psp-connection";
import { ConnectionHeader } from "./connection-header";
import { PspCredentialFields, PspMethodFields } from "./form-fields";
import { useMerchantCatalog } from "./resource-hooks";

interface CreateDraft {
  merchantId: string;
  provider: PspProvider | "";
  enabledMethods: PspMethod[];
  secretKey: string;
  pspMerchantId: string;
}

const INITIAL_DRAFT: CreateDraft = {
  merchantId: "",
  provider: "",
  enabledMethods: [],
  secretKey: "",
  pspMerchantId: "",
};

const PROVIDER_OPTIONS = [
  { value: "2c2p", label: "2C2P" },
  { value: "omise", label: "Omise" },
];

export function PspCreateView() {
  const router = useRouter();
  const merchants = useMerchantCatalog(true);
  const [draft, setDraft] = useState<CreateDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<PspValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [retryState, setRetryState] = useState<"idle" | "uncertain" | "in-progress">("idle");
  const intent = useRef<IdempotencyIntent | null>(null);

  const merchant = merchants.items.find((item) => item.id === draft.merchantId);
  const dirty =
    draft.merchantId !== "" ||
    draft.provider !== "" ||
    draft.enabledMethods.length > 0 ||
    draft.secretKey !== "" ||
    draft.pspMerchantId !== "";
  const operationInProgress = retryState === "in-progress";
  const catalogReady = merchants.status === "ready";

  const update = (patch: Partial<CreateDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
    setFormError(null);
    setRetryState("idle");
    intent.current = null;
  };

  const changeProvider = (value: string) => {
    const provider: PspProvider | "" = value === "2c2p" || value === "omise" ? value : "";
    const reset = resetProviderFields();
    update({
      provider,
      enabledMethods: provider === "omise" ? ["card"] : reset.enabledMethods,
      pspMerchantId: reset.pspMerchantId,
      secretKey: reset.secretKey,
    });
  };

  const leave = () => {
    setDraft(INITIAL_DRAFT);
    setRetryState("idle");
    intent.current = null;
    router.push("/control/psp/list");
  };

  const requestLeave = () => {
    if (dirty) setConfirmCancel(true);
    else leave();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || operationInProgress) return;
    const nextErrors = validateCreateDraft(draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }
    if (!catalogReady || !draft.provider) {
      setFormError("Merchant catalog ยังไม่พร้อม กรุณาลองโหลดใหม่");
      return;
    }

    const nextIntent = beginIdempotencyIntent(intent.current);
    intent.current = nextIntent;
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createPspConnection(
        {
          merchantId: draft.merchantId,
          psp: draft.provider,
          enabledMethods: draft.enabledMethods,
          config: null,
          secrets: { secretKey: draft.secretKey },
          pspMerchantId: draft.provider === "2c2p" ? draft.pspMerchantId.trim() : null,
        },
        nextIntent.key!,
      );
      intent.current = transitionIdempotencyIntent(nextIntent, "terminal");
      setRetryState("idle");
      setDraft(INITIAL_DRAFT);
      router.push(
        `/control/psp/read?id=${encodeURIComponent(created.connection.pspConnectionId)}`,
      );
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "create");
      const transitioned =
        mapped.kind === "in-progress"
          ? transitionIdempotencyIntent(nextIntent, "operation-in-progress")
          : mapped.kind === "key-reused"
            ? transitionIdempotencyIntent(nextIntent, "key-reused")
            : mapped.retryable
              ? transitionIdempotencyIntent(nextIntent, "uncertain")
              : transitionIdempotencyIntent(nextIntent, "terminal");
      intent.current = transitioned;
      setRetryState(
        transitioned?.status === "uncertain"
          ? "uncertain"
          : transitioned?.status === "in-progress"
            ? "in-progress"
            : "idle",
      );
      setFormError(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = submitting
    ? "กำลังสร้าง..."
    : operationInProgress
      ? "คำขอเดิมกำลังประมวลผล"
      : retryState === "uncertain"
        ? "ลองสร้างอีกครั้ง"
        : "สร้างการเชื่อมต่อ";

  return (
    <>
      <EditPageHeader
        title="เพิ่ม PSP Connection"
        backHref="/control/psp/list"
        onBack={requestLeave}
        breadcrumbs={[
          { label: "Control plane" },
          { label: "PSP Connections", href: "/control/psp/list" },
          { label: "เพิ่มการเชื่อมต่อ" },
        ]}
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-w-0 flex-1 sm:min-w-28"
              onClick={requestLeave}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="psp-create-form"
              size="lg"
              className="min-w-0 flex-1 sm:min-w-40"
              disabled={submitting || operationInProgress || !catalogReady}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-5">
        <ConnectionHeader
          provider={draft.provider || null}
          merchantName={merchant?.name ?? null}
          enabled
          health="unknown"
          approvalState="clear"
        />

        {merchants.status === "loading" ? (
          <p className="rounded-xl border border-[var(--divider)] bg-card px-4 py-3 text-sm text-grey-600" role="status">
            กำลังโหลด Merchant catalog...
          </p>
        ) : null}
        {merchants.status === "partial" || merchants.status === "error" ? (
          <div className="flex flex-col gap-3 rounded-xl border border-error/30 bg-error/8 px-4 py-3 text-sm text-error-dark sm:flex-row sm:items-center sm:justify-between" role="alert">
            <span>โหลด Merchant catalog ไม่ครบ จึงยังสร้าง connection ไม่ได้</span>
            <Button type="button" variant="outline" onClick={merchants.retry}>
              <RefreshCw className="size-4" />
              ลองใหม่
            </Button>
          </div>
        ) : null}
        {merchants.status === "forbidden" ? (
          <p className="rounded-xl border border-error/30 bg-error/8 px-4 py-3 text-sm text-error-dark" role="alert">
            ไม่มีสิทธิ์ merchant.view จึงโหลด Merchant catalog ไม่ได้
          </p>
        ) : null}

        <form
          id="psp-create-form"
          className="rounded-2xl bg-card p-5 shadow-card sm:p-6"
          onSubmit={submit}
          aria-busy={submitting}
          noValidate
        >
          <h1 className="text-h5 text-foreground">ข้อมูลการเชื่อมต่อ</h1>
          <p className="mt-1 text-sm text-grey-600">
            เลือก Merchant และ PSP แล้วกำหนด Credential เริ่มต้นแบบ write-only
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Merchant"
              value={draft.merchantId}
              onChange={(merchantId) => update({ merchantId })}
              options={merchants.items.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.code})`,
              }))}
              placeholder="เลือก Merchant"
              disabled={!catalogReady || submitting}
              required
              error={errors.merchantId}
              helperText={!catalogReady ? "Merchant catalog ต้องโหลดครบก่อนสร้าง" : undefined}
            />
            <SelectField
              label="PSP"
              value={draft.provider}
              onChange={changeProvider}
              options={PROVIDER_OPTIONS}
              placeholder="เลือก PSP"
              disabled={submitting}
              required
              error={errors.provider}
            />
            <PspMethodFields
              provider={draft.provider}
              value={draft.enabledMethods}
              onChange={(enabledMethods) => update({ enabledMethods })}
              error={errors.enabledMethods}
              disabled={submitting}
            />
            <PspCredentialFields
              provider={draft.provider}
              secretKey={draft.secretKey}
              pspMerchantId={draft.pspMerchantId}
              onSecretKeyChange={(secretKey) => update({ secretKey })}
              onPspMerchantIdChange={(pspMerchantId) => update({ pspMerchantId })}
              errors={errors}
              disabled={submitting}
            />
          </div>

          <p className="mt-5 text-xs text-grey-600">
            Config เริ่มต้นถูกส่งเป็น null; ระบบไม่เก็บ Credential ใน URL หรือ browser storage
          </p>
          {formError ? <p className="mt-4 text-sm text-error" role="alert">{formError}</p> : null}
        </form>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="ออกจากหน้าสร้าง PSP Connection?"
        description="ข้อมูลที่กรอกและ Credential จะไม่ถูกบันทึก"
        confirmLabel="ออกจากหน้านี้"
        onConfirm={leave}
        onClose={() => setConfirmCancel(false)}
      />
    </>
  );
}
