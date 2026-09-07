"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Activity, Copy, FlaskConical, KeyRound, Loader2, Power } from "lucide-react";

import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { ReadField } from "@/components/control/shared/read-field";
import { cardStyle } from "@/components/control/shared/styles";
import { CredentialChangeDialog } from "@/components/control/psp/credential-change-dialog";
import { useConnectionResource } from "@/components/control/psp/resource-hooks";
import {
  PspApiError,
  testPspConnection,
  updatePspConnection,
} from "@/lib/api/control/psp";
import {
  HEALTH_LABEL,
  PROVIDER_LABEL,
  beginIdempotencyIntent,
  connectionActionGate,
  enabledLabel,
  enabledTone,
  healthTone,
  lastTestLabel,
  mapPspProblem,
  resolveApprovalState,
  transitionIdempotencyIntent,
  type IdempotencyIntent,
} from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type { ApprovalListItem, PspConnection, PspProvider } from "@/types/control/psp-connection";
import { CandidateTestButton } from "./candidate-test-button";

const CARD_CLASS = "overflow-hidden rounded-card bg-card";

function CardShell({
  title,
  subtitle,
  badges,
  children,
}: {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_CLASS} style={cardStyle} aria-label={`ผู้ให้บริการ ${title}`}>
      <div className="flex flex-col gap-3 border-b border-[var(--divider)] p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-7 text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-grey-600">{subtitle}</p> : null}
        </div>
        {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function UnconnectedCard({
  provider,
  merchantId,
  canManage,
}: {
  provider: PspProvider;
  merchantId: string;
  canManage: boolean;
}) {
  const href = `/control/psp/create?merchantId=${encodeURIComponent(merchantId)}&psp=${provider}&returnTo=settings`;
  return (
    <CardShell title={PROVIDER_LABEL[provider]} subtitle="ยังไม่เชื่อมต่อ">
      <p className="text-sm text-grey-600">สร้างการเชื่อมต่อเพื่อเริ่มใช้ {PROVIDER_LABEL[provider]}</p>
      {canManage ? (
        <Link
          href={href}
          className="mt-4 inline-flex h-11 min-w-[180px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          สร้างการเชื่อมต่อ
        </Link>
      ) : (
        <p className="mt-4 text-sm text-grey-600">ต้องมีสิทธิ์ merchant.manage เพื่อสร้างการเชื่อมต่อ</p>
      )}
    </CardShell>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex h-8 items-center gap-1 rounded-control bg-grey-600/8 px-2 text-xs font-semibold text-grey-700 hover:bg-grey-600/16"
      aria-label="คัดลอก callback URL"
    >
      <Copy className="size-3.5" aria-hidden />
      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
    </button>
  );
}

function ConnectedCard({
  connection,
  merchantName,
  permissions,
  approvals,
}: {
  connection: PspConnection;
  merchantName: string;
  permissions: readonly string[];
  approvals: readonly ApprovalListItem[] | null;
}) {
  const resourceState = useConnectionResource(connection.pspConnectionId);
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const testIntent = useRef<IdempotencyIntent | null>(null);
  const toggleIntent = useRef<IdempotencyIntent | null>(null);

  const resource = resourceState.status === "ready" ? resourceState.resource : null;
  const canManage = permissions.includes("merchant.manage");
  // candidate credential test ใช้ settings.manage ตามตาราง permission ของ design.md (AC-7)
  const canManageSettings = permissions.includes("settings.manage");
  const approvalState = resolveApprovalState(
    connection.pspConnectionId,
    connection.hasPendingCredentialChange,
    approvals,
  );
  const actionContext = resource
    ? { permissions, connection: resource.connection, etag: resource.etag, approvalState }
    : null;
  const testGate = actionContext ? connectionActionGate("test", actionContext) : null;
  const credentialGate = actionContext ? connectionActionGate("credential", actionContext) : null;

  const runTest = async () => {
    if (!resource?.etag || !testGate?.allowed || testing) return;
    const intent = beginIdempotencyIntent(testIntent.current);
    testIntent.current = intent;
    setTesting(true);
    setNotice(null);
    try {
      const latest = await testPspConnection(
        resource.connection.pspConnectionId,
        { merchantId: resource.connection.merchantId },
        resource.etag,
        intent.key!,
      );
      testIntent.current = transitionIdempotencyIntent(intent, "terminal");
      resourceState.replace(latest);
      setNotice({ tone: "success", text: "ทดสอบ Credential ที่ใช้งานอยู่สำเร็จ" });
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "test");
      testIntent.current = transitionIdempotencyIntent(
        intent,
        mapped.retryable ? "uncertain" : "terminal",
      );
      if (apiError.status === 502 || mapped.kind === "conflict") resourceState.refetch();
      setNotice({ tone: "error", text: mapped.message });
    } finally {
      setTesting(false);
    }
  };

  const toggleEnabled = async () => {
    if (!resource?.etag || !canManage || toggling) return;
    const intent = beginIdempotencyIntent(toggleIntent.current);
    toggleIntent.current = intent;
    setToggling(true);
    setNotice(null);
    try {
      const latest = await updatePspConnection(
        resource.connection.pspConnectionId,
        {
          merchantId: resource.connection.merchantId,
          enabledMethods: resource.connection.enabledMethods,
          config: resource.connection.config,
          isEnabled: !resource.connection.isEnabled,
        },
        resource.etag,
        intent.key!,
      );
      toggleIntent.current = transitionIdempotencyIntent(intent, "terminal");
      resourceState.replace(latest);
      setNotice({
        tone: "success",
        text: latest.connection.isEnabled ? "เปิดใช้งาน connection แล้ว" : "ปิดใช้งาน connection แล้ว",
      });
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "update");
      toggleIntent.current = transitionIdempotencyIntent(
        intent,
        mapped.retryable ? "uncertain" : "terminal",
      );
      if (mapped.kind === "conflict") resourceState.refetch();
      setNotice({ tone: "error", text: mapped.message });
    } finally {
      setToggling(false);
    }
  };

  const pendingCredentialApproval = approvals?.find(
    (item) =>
      item.action === "psp.credential.change" &&
      item.status === "pending" &&
      item.targetId.toLowerCase() === connection.pspConnectionId.toLowerCase(),
  );

  return (
    <CardShell
      title={PROVIDER_LABEL[connection.psp]}
      subtitle={merchantName}
      badges={
        <>
          <ControlStatusBadge
            tone={enabledTone(connection.isEnabled)}
            label={enabledLabel(connection.isEnabled)}
            icon={<Power className="size-3.5" />}
          />
          <ControlStatusBadge
            tone={healthTone(connection.health)}
            label={HEALTH_LABEL[connection.health]}
            icon={<Activity className="size-3.5" />}
          />
          {connection.environment ? (
            <ControlStatusBadge
              tone={connection.environment === "live" ? "warn" : "muted"}
              label={connection.environment.toUpperCase()}
            />
          ) : null}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ReadField label="secretKey" value={connection.maskedSecrets.secretKey ?? "-"} mono />
        <ReadField label="ทดสอบล่าสุด" value={lastTestLabel(connection.lastTestResult)} />
        {connection.callbackUrl ? (
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-grey-600">Callback URL</span>
              <CopyButton value={connection.callbackUrl} />
            </div>
            <p className="text-data mt-1 break-all text-sm text-grey-700">{connection.callbackUrl}</p>
          </div>
        ) : null}
      </div>

      {connection.pendingCredentialTest ? (
        <div className="mt-4 rounded-xl border border-[var(--divider)] p-3">
          <p className="text-sm font-semibold text-foreground">มีชุด credential รออนุมัติ</p>
          <p className="text-xs text-grey-600">
            ผลทดสอบล่าสุด: {lastTestLabel(connection.pendingCredentialTest.result)}
          </p>
          {pendingCredentialApproval && canManageSettings ? (
            <div className="mt-2">
              <CandidateTestButton
                connectionId={connection.pspConnectionId}
                merchantId={connection.merchantId}
                approvalId={pendingCredentialApproval.approvalId}
                onTested={(latest) => resourceState.replace(latest)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {notice ? (
        <p
          className={cn("mt-4 text-sm", notice.tone === "error" ? "text-error" : "text-success-dark")}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void runTest()}
          disabled={!testGate?.allowed || testing}
          title={testGate?.reason ?? undefined}
          className="inline-flex h-10 items-center gap-1.5 rounded-control bg-grey-600/8 px-3 text-sm font-semibold text-grey-800 hover:bg-grey-600/16 disabled:pointer-events-none disabled:opacity-50"
        >
          {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FlaskConical className="size-4" aria-hidden />}
          ทดสอบ
        </button>
        {canManage ? (
          <>
            <button
              type="button"
              onClick={() => setCredentialOpen(true)}
              disabled={!credentialGate?.allowed}
              title={credentialGate?.reason ?? undefined}
              className="inline-flex h-10 items-center gap-1.5 rounded-control bg-grey-600/8 px-3 text-sm font-semibold text-grey-800 hover:bg-grey-600/16 disabled:pointer-events-none disabled:opacity-50"
            >
              <KeyRound className="size-4" aria-hidden />
              ขอเปลี่ยนข้อมูล
            </button>
            <button
              type="button"
              onClick={() => void toggleEnabled()}
              disabled={!resource?.etag || toggling}
              className="inline-flex h-10 items-center gap-1.5 rounded-control bg-grey-600/8 px-3 text-sm font-semibold text-grey-800 hover:bg-grey-600/16 disabled:pointer-events-none disabled:opacity-50"
            >
              {toggling ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Power className="size-4" aria-hidden />}
              {connection.isEnabled ? "ปิดใช้งาน" : "เปิดใช้งาน"}
            </button>
          </>
        ) : null}
        <Link
          href={`/control/psp/read?id=${encodeURIComponent(connection.pspConnectionId)}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-sm font-semibold text-primary hover:underline"
        >
          รายละเอียด
        </Link>
      </div>

      {resource && credentialOpen ? (
        <CredentialChangeDialog
          open={credentialOpen}
          onOpenChange={setCredentialOpen}
          resource={resource}
          onAccepted={() => {
            setNotice({ tone: "success", text: "ส่งคำขอเปลี่ยน Credential แล้ว รอการอนุมัติ" });
            resourceState.refetch();
          }}
          onPendingReconciled={(latest) => resourceState.replace(latest)}
          onConflict={() => resourceState.refetch()}
          onUnknownOutcome={() => resourceState.refetch()}
        />
      ) : null}
    </CardShell>
  );
}

export function ProviderCard({
  provider,
  connection,
  merchantId,
  merchantName,
  permissions,
  approvals,
}: {
  provider: PspProvider;
  connection: PspConnection | undefined;
  merchantId: string;
  merchantName: string;
  permissions: readonly string[];
  approvals: readonly ApprovalListItem[] | null;
}) {
  const canManage = permissions.includes("merchant.manage");
  if (!connection) {
    return <UnconnectedCard provider={provider} merchantId={merchantId} canManage={canManage} />;
  }
  return (
    <ConnectedCard
      connection={connection}
      merchantName={merchantName}
      permissions={permissions}
      approvals={approvals}
    />
  );
}
