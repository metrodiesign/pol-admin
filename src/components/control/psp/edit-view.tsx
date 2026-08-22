"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, RefreshCw } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ReadField } from "@/components/control/shared/read-field";
import { ConfirmDialog } from "@/components/policy/confirm-dialog";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PspApiError, updatePspConnection } from "@/lib/api/control/psp";
import {
  PROVIDER_LABEL,
  beginIdempotencyIntent,
  connectionActionGate,
  mapPspProblem,
  resolveApprovalState,
  toPspConfigView,
  transitionIdempotencyIntent,
  validateEditDraft,
  type IdempotencyIntent,
  type PspValidationErrors,
} from "@/lib/control/psp";
import type {
  ApprovalState,
  ConnectionResource,
  CredentialChangeAccepted,
  PspMethod,
} from "@/types/control/psp-connection";
import { ConnectionHeader } from "./connection-header";
import { CredentialChangeDialog } from "./credential-change-dialog";
import { PspMethodFields } from "./form-fields";
import {
  useConnectionResource,
  useMerchantCatalog,
  usePendingApprovals,
} from "./resource-hooks";

function Header({ id }: { id: string }) {
  return (
    <EditPageHeader
      title="แก้ไข PSP Connection"
      backHref={`/control/psp/read?id=${encodeURIComponent(id)}`}
      breadcrumbs={[
        { label: "Control plane" },
        { label: "PSP Connections", href: "/control/psp/list" },
        { label: id },
      ]}
    />
  );
}

function BlockingState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card px-5 py-12 text-center shadow-card" role="alert">
      <h1 className="text-h6 text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-grey-600">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" />
          โหลดใหม่
        </Button>
      ) : null}
    </div>
  );
}

function PspEditForm({
  resource,
  merchantName,
  merchantWarning,
  retryMerchants,
  credentialNotice,
  setCredentialNotice,
  reload,
}: {
  resource: ConnectionResource;
  merchantName: string;
  merchantWarning: boolean;
  retryMerchants?: () => void;
  credentialNotice: string | null;
  setCredentialNotice: (notice: string | null) => void;
  reload: () => void;
}) {
  const router = useRouter();
  const connection = resource.connection;
  const [methods, setMethods] = useState<PspMethod[]>([...connection.enabledMethods]);
  const [enabled, setEnabled] = useState(connection.isEnabled);
  const [errors, setErrors] = useState<PspValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [retryState, setRetryState] = useState<"idle" | "uncertain" | "in-progress">("idle");
  const intent = useRef<IdempotencyIntent | null>(null);

  const methodsKey = [...methods].sort().join("|");
  const baselineMethodsKey = [...connection.enabledMethods].sort().join("|");
  const dirty = methodsKey !== baselineMethodsKey || enabled !== connection.isEnabled;
  const operationInProgress = retryState === "in-progress";
  const config = toPspConfigView(connection.config);
  const configFields = [
    config.accountId !== undefined ? ["Account ID", config.accountId] : null,
    config.card !== undefined ? ["Card", config.card ? "เปิด" : "ปิด"] : null,
    config.installment !== undefined ? ["Installment", config.installment ? "เปิด" : "ปิด"] : null,
    config.enabledSources !== undefined ? ["Enabled sources", config.enabledSources.join(", ")] : null,
    config.returnUrls !== undefined ? ["Return URLs", config.returnUrls.join(", ")] : null,
  ].filter((field): field is [string, string] => field !== null);

  const resetIntent = () => {
    intent.current = null;
    setRetryState("idle");
    setFormError(null);
    setConflict(false);
    setErrors({});
  };

  const leave = () => router.push(
    `/control/psp/read?id=${encodeURIComponent(connection.pspConnectionId)}`,
  );

  const requestLeave = () => {
    if (dirty) setConfirmCancel(true);
    else leave();
  };

  const save = async () => {
    if (!resource.etag || submitting || operationInProgress) return;
    const nextIntent = beginIdempotencyIntent(intent.current);
    intent.current = nextIntent;
    setSubmitting(true);
    setFormError(null);
    setConflict(false);
    try {
      await updatePspConnection(
        connection.pspConnectionId,
        {
          merchantId: connection.merchantId,
          enabledMethods: methods,
          config: connection.config,
          isEnabled: enabled,
        },
        resource.etag,
        nextIntent.key!,
      );
      intent.current = transitionIdempotencyIntent(nextIntent, "terminal");
      setRetryState("idle");
      leave();
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "update");
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
      setConflict(mapped.kind === "conflict");
      setFormError(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty || submitting || operationInProgress) return;
    const nextErrors = validateEditDraft(connection.psp, methods);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError("กรุณาเลือกช่องทางที่รองรับอย่างน้อยหนึ่งรายการ");
      return;
    }
    if (connection.isEnabled && !enabled) {
      setConfirmDisable(true);
      return;
    }
    void save();
  };

  const submitLabel = submitting
    ? "กำลังบันทึก..."
    : operationInProgress
      ? "คำขอเดิมกำลังประมวลผล"
      : retryState === "uncertain"
        ? "ลองบันทึกอีกครั้ง"
        : "บันทึกการเปลี่ยนแปลง";

  return (
    <>
      <EditPageHeader
        title="แก้ไข PSP Connection"
        backHref={`/control/psp/read?id=${encodeURIComponent(connection.pspConnectionId)}`}
        onBack={requestLeave}
        breadcrumbs={[
          { label: "Control plane" },
          { label: "PSP Connections", href: "/control/psp/list" },
          { label: connection.pspConnectionId },
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
              form="psp-edit-form"
              size="lg"
              className="min-w-0 flex-1 sm:min-w-44"
              disabled={!dirty || submitting || operationInProgress}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-5">
        <ConnectionHeader
          connectionId={connection.pspConnectionId}
          provider={connection.psp}
          merchantName={merchantName}
          enabled={enabled}
          health={connection.health}
          approvalState="clear"
        />

        {merchantWarning ? (
          <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-grey-700 sm:flex-row sm:items-center sm:justify-between" role="status">
            <span>โหลดชื่อ Merchant ไม่ครบ; แสดง Merchant ID โดยไม่บล็อก Edit</span>
            {retryMerchants ? (
              <Button type="button" variant="outline" onClick={retryMerchants}>
                <RefreshCw className="size-4" />
                ลองใหม่
              </Button>
            ) : null}
          </div>
        ) : null}
        {credentialNotice ? (
          <div className="rounded-xl border border-error/30 bg-error/8 px-4 py-3 text-sm text-error-dark" role="alert">
            {credentialNotice}
          </div>
        ) : null}

        <form
          id="psp-edit-form"
          className="rounded-2xl bg-card p-5 shadow-card sm:p-6"
          onSubmit={submit}
          aria-busy={submitting}
          noValidate
        >
          <h1 className="text-h5 text-foreground">การตั้งค่า</h1>
          <p className="mt-1 text-sm text-grey-600">
            แก้เฉพาะช่องทางและ Enabled; Credential เปลี่ยนผ่าน approval flow แยกต่างหาก
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ReadField label="Merchant" value={merchantName} />
            <ReadField label="PSP" value={PROVIDER_LABEL[connection.psp]} />
            <PspMethodFields
              provider={connection.psp}
              value={methods}
              onChange={(value) => {
                setMethods(value);
                resetIntent();
              }}
              error={errors.enabledMethods}
              disabled={submitting}
            />
            <div className="rounded-xl border border-[var(--divider)] p-4 sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-grey-800">Enabled</p>
                  <p className="mt-1 text-xs text-grey-600">
                    ปิดแล้ว connection จะหยุดรับชำระ
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => {
                    setEnabled(checked);
                    resetIntent();
                  }}
                  aria-label="Enabled"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <section className="mt-6 border-t border-[var(--divider)] pt-5">
            <h2 className="text-h6 text-foreground">Config แบบ read-only</h2>
            {configFields.length ? (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {configFields.map(([label, value]) => (
                  <ReadField key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-grey-600">ไม่มี config ที่รองรับสำหรับแสดงผล</p>
            )}
          </section>

          <section className="mt-6 border-t border-[var(--divider)] pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-h6 text-foreground">Credential</h2>
                <p className="mt-1 text-sm text-grey-600">
                  ส่ง Credential ใหม่เข้า maker-checker approval โดยไม่แตะค่าที่ active
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCredentialNotice(null);
                  setCredentialOpen(true);
                }}
                disabled={dirty || submitting}
              >
                <KeyRound className="size-4" />
                ขอเปลี่ยน Credential
              </Button>
            </div>
            {dirty ? (
              <p className="mt-2 text-xs text-grey-600">
                ต้องบันทึกหรือยกเลิกการแก้ไขก่อนเปลี่ยน Credential
              </p>
            ) : null}
          </section>

          {formError ? (
            <div className="mt-5 rounded-xl border border-error/30 bg-error/8 px-4 py-3 text-sm text-error-dark" role="alert">
              {formError}
              {conflict ? (
                <Button type="button" variant="outline" className="ml-3" onClick={reload}>
                  โหลดเวอร์ชันล่าสุด
                </Button>
              ) : null}
            </div>
          ) : null}
        </form>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="ออกจากหน้า Edit?"
        description="การเปลี่ยนแปลงที่ยังไม่บันทึกจะถูกยกเลิก"
        confirmLabel="ออกจากหน้านี้"
        onConfirm={leave}
        onClose={() => setConfirmCancel(false)}
      />
      <ConfirmDialog
        open={confirmDisable}
        title="ปิด PSP Connection?"
        description="Connection นี้จะหยุดรับชำระจนกว่าจะเปิดใช้งานอีกครั้ง"
        confirmLabel="ปิดและบันทึก"
        onConfirm={() => {
          setConfirmDisable(false);
          void save();
        }}
        onClose={() => setConfirmDisable(false)}
      />
      <CredentialChangeDialog
        open={credentialOpen}
        onOpenChange={setCredentialOpen}
        resource={resource}
        onAccepted={(_result: CredentialChangeAccepted) => {
          router.push(
            `/control/psp/read?id=${encodeURIComponent(connection.pspConnectionId)}&notice=credential-requested`,
          );
        }}
        onPendingReconciled={() => {
          router.push(
            `/control/psp/read?id=${encodeURIComponent(connection.pspConnectionId)}&notice=credential-requested`,
          );
        }}
        onConflict={() => {
          setCredentialNotice("สถานะ Credential เปลี่ยนแล้ว โหลดข้อมูลล่าสุดเรียบร้อย");
          reload();
        }}
        onUnknownOutcome={() => {
          setCredentialNotice(
            "ตรวจผลลัพธ์ไม่ได้ กรุณาตรวจ approval และโหลดหน้าใหม่ก่อนเริ่ม intent ใหม่",
          );
          reload();
        }}
      />
    </>
  );
}

export function PspEditView({ id }: { id: string }) {
  const { me } = useAuth();
  const permissions = me?.permissions ?? [];
  const resourceState = useConnectionResource(id);
  const approvals = usePendingApprovals(id);
  const merchants = useMerchantCatalog(permissions.includes("merchant.view"));
  const [credentialNotice, setCredentialNotice] = useState<string | null>(null);

  if (resourceState.status === "loading") {
    return (
      <>
        <Header id={id} />
        <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
          <p className="text-sm text-grey-600" role="status">กำลังโหลด PSP Connection...</p>
        </div>
      </>
    );
  }
  if (resourceState.status === "not-found") {
    return <><Header id={id} /><BlockingState title="ไม่พบ PSP Connection" message="รายการนี้อาจไม่มีอยู่หรือคุณอาจเข้าถึงไม่ได้" /></>;
  }
  if (resourceState.status === "forbidden") {
    return <><Header id={id} /><BlockingState title="ไม่มีสิทธิ์เข้าถึง" message="คุณไม่มีสิทธิ์แก้ไข PSP Connection นี้" /></>;
  }
  if (resourceState.status === "error" || !resourceState.resource) {
    return <><Header id={id} /><BlockingState title="โหลด PSP Connection ไม่สำเร็จ" message="กรุณาลองใหม่อีกครั้ง" onRetry={resourceState.refetch} /></>;
  }

  const resource = resourceState.resource;
  const connection = resource.connection;
  const positiveApproval = resolveApprovalState(
    connection.pspConnectionId,
    connection.hasPendingCredentialChange,
    approvals.items,
  );
  const approvalState: ApprovalState =
    positiveApproval === "pending"
      ? "pending"
      : approvals.status === "loading"
        ? "loading"
        : approvals.status === "unavailable"
          ? "unavailable"
          : resolveApprovalState(
              connection.pspConnectionId,
              connection.hasPendingCredentialChange,
              approvals.items,
            );
  const gate = connectionActionGate("edit", { permissions, connection, etag: resource.etag, approvalState });
  const merchantName = merchants.items.find((merchant) => merchant.id === connection.merchantId)?.name
    ?? connection.merchantId;

  if (!gate.allowed) {
    const retry = approvals.status === "unavailable" ? approvals.retry : resourceState.refetch;
    return (
      <>
        <Header id={id} />
        <div className="flex flex-col gap-5">
          <ConnectionHeader
            connectionId={connection.pspConnectionId}
            provider={connection.psp}
            merchantName={merchantName}
            enabled={connection.isEnabled}
            health={connection.health}
            approvalState={approvalState}
          />
          <BlockingState
            title="ยังเปิด Edit form ไม่ได้"
            message={gate.reason ?? "สถานะ connection ยังไม่พร้อมสำหรับแก้ไข"}
            onRetry={approvalState === "pending" ? undefined : retry}
          />
        </div>
      </>
    );
  }

  return (
    <PspEditForm
      key={`${connection.version}:${resource.etag}`}
      resource={resource}
      merchantName={merchantName}
      merchantWarning={merchants.status !== "ready"}
      credentialNotice={credentialNotice}
      setCredentialNotice={setCredentialNotice}
      retryMerchants={
        merchants.status === "partial" || merchants.status === "error"
          ? merchants.retry
          : undefined
      }
      reload={() => {
        approvals.retry();
        resourceState.refetch();
      }}
    />
  );
}
