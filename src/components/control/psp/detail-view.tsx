"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CircleAlert,
  Clock3,
  FlaskConical,
  Hourglass,
  KeyRound,
  Loader2,
  Pencil,
  Power,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Button } from "@/components/ui/button";
import { PspApiError, testPspConnection } from "@/lib/api/control/psp";
import { formatDateTime } from "@/lib/control/format";
import {
  APPROVAL_LABEL,
  HEALTH_LABEL,
  PROVIDER_LABEL,
  approvalTone,
  beginIdempotencyIntent,
  connectionActionGate,
  enabledLabel,
  enabledTone,
  healthTone,
  lastTestLabel,
  mapPspProblem,
  resolveApprovalState,
  toPspConfigView,
  transitionIdempotencyIntent,
  type IdempotencyIntent,
} from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type {
  ApprovalState,
  CredentialChangeAccepted,
  PspConnection,
} from "@/types/control/psp-connection";
import { CredentialChangeDialog } from "./credential-change-dialog";
import {
  useConnectionResource,
  useMerchantCatalog,
  usePendingApprovals,
} from "./resource-hooks";
import { cancelClass, cardStyle, primaryClass } from "./styles";

function ApprovalIcon({ state }: { state: ApprovalState }) {
  if (state === "pending") return <Hourglass className="size-3.5" />;
  if (state === "unavailable") return <CircleAlert className="size-3.5" />;
  return <Clock3 className="size-3.5" />;
}

/** Identity band at the top of a PSP card: provider, merchant, id + the three status badges. */
export function ConnectionIdentity({
  connection,
  merchantName,
  enabled,
  approvalState,
}: {
  connection: Pick<PspConnection, "pspConnectionId" | "psp" | "health">;
  merchantName: string;
  enabled: boolean;
  approvalState: ApprovalState;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-7 text-foreground">{PROVIDER_LABEL[connection.psp]}</h2>
        <p className="mt-0.5 truncate text-sm text-grey-600">{merchantName}</p>
        <p className="text-data mt-1 break-all text-xs text-grey-500">{connection.pspConnectionId}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ControlStatusBadge
          tone={enabledTone(enabled)}
          label={enabledLabel(enabled)}
          icon={<Power className="size-3.5" />}
        />
        <ControlStatusBadge
          tone={healthTone(connection.health)}
          label={HEALTH_LABEL[connection.health]}
          icon={<Activity className="size-3.5" />}
        />
        <ControlStatusBadge
          tone={approvalTone(approvalState)}
          label={APPROVAL_LABEL[approvalState]}
          icon={<ApprovalIcon state={approvalState} />}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--divider)] p-6 last:border-b-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Header({ id, actions }: { id: string; actions?: React.ReactNode }) {
  return (
    <EditPageHeader
      title="รายละเอียด PSP Connection"
      backHref="/control/psp/list"
      breadcrumbs={[
        { label: "การเชื่อมต่อ PSP", href: "/control/psp/list" },
        { label: id },
      ]}
      actions={actions}
    />
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
      <p className="text-sm text-grey-600" role="status">กำลังโหลด PSP Connection...</p>
    </div>
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
    <div className="rounded-card bg-card px-5 py-12 text-center" style={cardStyle} role="alert">
      <h1 className="text-h6 text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-grey-600">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" />
          ลองใหม่
        </Button>
      ) : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "warning" | "success"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-error/30 bg-error/8 text-error-dark"
          : tone === "warning"
            ? "border-warning/30 bg-warning/8 text-warning-dark"
            : "border-success/30 bg-success/8 text-success-dark",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function PspDetailView({
  id,
  credentialRequested = false,
}: {
  id: string;
  credentialRequested?: boolean;
}) {
  const router = useRouter();
  const { me } = useAuth();
  const permissions = me?.permissions ?? [];
  const hasMerchantView = permissions.includes("merchant.view");
  const resourceState = useConnectionResource(id);
  const approvals = usePendingApprovals(id);
  const merchants = useMerchantCatalog(hasMerchantView);
  const [testing, setTesting] = useState(false);
  const [testOperationInProgress, setTestOperationInProgress] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "warning" | "success"; text: string } | null>(null);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [optimisticPending, setOptimisticPending] = useState(credentialRequested);
  const testIntent = useRef<IdempotencyIntent | null>(null);

  const loadedConnection = resourceState.resource?.connection ?? null;
  const authoritativePending = loadedConnection
    ? resolveApprovalState(
        loadedConnection.pspConnectionId,
        loadedConnection.hasPendingCredentialChange,
        approvals.status === "ready" ? approvals.items : null,
      )
    : "unavailable";

  useEffect(() => {
    if (!optimisticPending || authoritativePending !== "pending") return;
    queueMicrotask(() => setOptimisticPending(false));
    if (credentialRequested) {
      router.replace(`/control/psp/read?id=${encodeURIComponent(id)}`);
    }
  }, [authoritativePending, credentialRequested, id, optimisticPending, router]);

  const merchantNames = useMemo(
    () => new Map(merchants.items.map((merchant) => [merchant.id, merchant.name])),
    [merchants.items],
  );

  if (resourceState.status === "loading") {
    return <><Header id={id} /><LoadingState /></>;
  }
  if (resourceState.status === "not-found") {
    return (
      <>
        <Header id={id} />
        <BlockingState
          title="ไม่พบ PSP Connection"
          message="รายการนี้อาจไม่มีอยู่หรือคุณอาจเข้าถึงไม่ได้"
        />
      </>
    );
  }
  if (resourceState.status === "forbidden") {
    return (
      <>
        <Header id={id} />
        <BlockingState title="ไม่มีสิทธิ์เข้าถึง" message="คุณไม่มีสิทธิ์ดู PSP Connection นี้" />
      </>
    );
  }
  if (resourceState.status === "error") {
    return (
      <>
        <Header id={id} />
        <BlockingState
          title="โหลด PSP Connection ไม่สำเร็จ"
          message="กรุณาลองใหม่อีกครั้ง"
          onRetry={resourceState.refetch}
        />
      </>
    );
  }
  if (!resourceState.resource) {
    return <><Header id={id} /><LoadingState /></>;
  }

  const resource = resourceState.resource;
  const connection = resource.connection;
  const positiveApproval = resolveApprovalState(
    connection.pspConnectionId,
    connection.hasPendingCredentialChange,
    approvals.items,
  );
  const approvalState: ApprovalState =
    optimisticPending || positiveApproval === "pending"
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
  const merchantName = merchantNames.get(connection.merchantId) ?? connection.merchantId;
  const actionContext = { permissions, connection, etag: resource.etag, approvalState };
  const editGate = connectionActionGate("edit", actionContext);
  const testGate = connectionActionGate("test", actionContext);
  const credentialGate = connectionActionGate("credential", actionContext);
  const showEdit = permissions.includes("merchant.manage");
  const config = toPspConfigView(connection.config);
  const configFields = [
    config.accountId !== undefined ? ["Account ID", config.accountId] : null,
    config.card !== undefined ? ["Card", config.card ? "เปิด" : "ปิด"] : null,
    config.installment !== undefined ? ["Installment", config.installment ? "เปิด" : "ปิด"] : null,
    config.enabledSources !== undefined ? ["Enabled sources", config.enabledSources.join(", ")] : null,
    config.returnUrls !== undefined ? ["Return URLs", config.returnUrls.join(", ")] : null,
  ].filter((field): field is [string, string] => field !== null);

  const runTest = async () => {
    if (!testGate.allowed || testing || testOperationInProgress || !resource.etag) return;
    const intent = beginIdempotencyIntent(testIntent.current);
    testIntent.current = intent;
    setTesting(true);
    setNotice(null);
    try {
      const latest = await testPspConnection(
        connection.pspConnectionId,
        { merchantId: connection.merchantId },
        resource.etag,
        intent.key!,
      );
      testIntent.current = transitionIdempotencyIntent(intent, "terminal");
      resourceState.replace(latest);
      setNotice({ tone: "success", text: "ทดสอบ Credential ที่ใช้งานอยู่สำเร็จ" });
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapPspProblem(apiError.status, apiError.code, "test");
      if (mapped.kind === "in-progress") {
        testIntent.current = transitionIdempotencyIntent(intent, "operation-in-progress");
        setTestOperationInProgress(true);
      } else if (mapped.retryable) {
        testIntent.current = transitionIdempotencyIntent(intent, "uncertain");
      } else {
        testIntent.current = transitionIdempotencyIntent(intent, "terminal");
      }
      if (apiError.status === 502 || mapped.kind === "conflict") resourceState.refetch();
      setNotice({ tone: "error", text: mapped.message });
    } finally {
      setTesting(false);
    }
  };

  const credentialAccepted = (_result: CredentialChangeAccepted) => {
    setOptimisticPending(true);
    setNotice({ tone: "success", text: "ส่งคำขอเปลี่ยน Credential แล้ว รอการอนุมัติ" });
    approvals.retry();
    resourceState.refetch();
  };

  const disabledReasons = [...new Set([editGate.reason, testGate.reason, credentialGate.reason].filter(Boolean))];
  const editHref = `/control/psp/edit?id=${encodeURIComponent(connection.pspConnectionId)}`;

  return (
    <>
      <Header
        id={connection.pspConnectionId}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/control/psp/list" className={cancelClass}>
              ยกเลิก
            </Link>
            {showEdit ? (
              editGate.allowed ? (
                <Link href={editHref} className={primaryClass}>
                  <Pencil className="size-4" />
                  แก้ไข
                </Link>
              ) : (
                <button type="button" className={primaryClass} disabled title={editGate.reason ?? undefined}>
                  <Pencil className="size-4" />
                  แก้ไข
                </button>
              )
            ) : null}
          </div>
        }
      />

      <div className="flex flex-col gap-5">
        {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
        {!resource.etag ? (
          <Notice tone="error">
            Response ไม่มี ETag จึงปิด mutation ทั้งหมด กรุณาโหลดข้อมูลใหม่
            <Button type="button" variant="outline" className="ml-3" onClick={resourceState.refetch}>
              โหลดใหม่
            </Button>
          </Notice>
        ) : null}
        {approvals.status === "unavailable" ? (
          <Notice tone="error">
            ตรวจสถานะอนุมัติไม่ได้ จึงปิด Edit, Test และ credential change
            <Button type="button" variant="outline" className="ml-3" onClick={approvals.retry}>
              ลองใหม่
            </Button>
          </Notice>
        ) : null}
        {merchants.status === "partial" || merchants.status === "error" ? (
          <Notice tone="warning">
            โหลดชื่อ Merchant ไม่ครบ; แสดง Merchant ID แทนเมื่อ resolveไม่ได้
            <Button type="button" variant="outline" className="ml-3" onClick={merchants.retry}>
              ลองใหม่
            </Button>
          </Notice>
        ) : null}

        <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
          <ConnectionIdentity
            connection={connection}
            merchantName={merchantName}
            enabled={connection.isEnabled}
            approvalState={approvalState}
          />

          <Section title="ข้อมูลการเชื่อมต่อ">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <ReadField label="Merchant" value={merchantName} />
              <ReadField label="Provider" value={PROVIDER_LABEL[connection.psp]} />
              <ReadField label="Enabled methods" value={connection.enabledMethods.join(", ") || "-"} />
              <ReadField label="ทดสอบล่าสุด" value={formatDateTime(connection.lastTestedAt ?? "")} mono />
              <ReadField label="ผลทดสอบล่าสุด" value={lastTestLabel(connection.lastTestResult)} />
              <ReadField label="สร้างเมื่อ" value={formatDateTime(connection.createdAt)} mono />
              <ReadField label="Version" value={String(connection.version)} mono />
            </div>
          </Section>

          <Section title="Config">
            {configFields.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {configFields.map(([label, value]) => <ReadField key={label} label={label} value={value} />)}
              </div>
            ) : (
              <p className="text-sm text-grey-600">ไม่มี config ที่รองรับสำหรับแสดงผล</p>
            )}
          </Section>

          <Section title="Credential ที่ใช้งานอยู่">
            <ReadField label="secretKey" value={connection.maskedSecrets.secretKey ?? "-"} mono />
            {connection.psp === "2c2p" ? (
              <p className="mt-4 text-sm text-grey-600">
                2C2P Merchant ID เป็น write-only และอ่านกลับจาก backend ไม่ได้
              </p>
            ) : null}
          </Section>

          <div className="flex flex-col gap-4 border-t border-[var(--divider)] p-6">
            <div className="flex flex-wrap gap-2">
              {connection.capabilities.test === true ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={!testGate.allowed || testing || testOperationInProgress}
                  onClick={runTest}
                >
                  {testing ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
                  {testing ? "กำลังทดสอบ..." : "ทดสอบ Credential ที่ใช้งานอยู่"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={!credentialGate.allowed}
                onClick={() => setCredentialOpen(true)}
              >
                <KeyRound className="size-4" />
                ขอเปลี่ยน Credential
              </Button>
            </div>
            {disabledReasons.length ? (
              <ul className="list-disc space-y-1 pl-5 text-xs text-grey-600">
                {disabledReasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <CredentialChangeDialog
        open={credentialOpen}
        onOpenChange={setCredentialOpen}
        resource={resource}
        onAccepted={credentialAccepted}
        onPendingReconciled={() => {
          setOptimisticPending(true);
          approvals.retry();
          resourceState.refetch();
        }}
        onConflict={() => {
          setNotice({ tone: "warning", text: "สถานะ Credential เปลี่ยนแล้ว กำลังโหลดข้อมูลล่าสุด" });
          approvals.retry();
          resourceState.refetch();
        }}
        onUnknownOutcome={() => {
          setNotice({
            tone: "error",
            text: "ตรวจผลลัพธ์ไม่ได้ กรุณาตรวจ approval และโหลดหน้าใหม่ก่อนเริ่ม intent ใหม่",
          });
          approvals.retry();
          resourceState.refetch();
        }}
      />
    </>
  );
}
