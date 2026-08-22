import type { Tone } from "@/lib/control/status";
import type {
  ApprovalListItem,
  ApprovalState,
  ConnectionResource,
  JsonObject,
  PspConfigView,
  PspConnection,
  PspHealth,
  PspMethod,
  PspProvider,
} from "@/types/control/psp-connection";

export const PROVIDER_LABEL: Record<PspProvider, string> = {
  "2c2p": "2C2P",
  omise: "Omise",
};

export const SUPPORTED_METHODS: Record<PspProvider, readonly PspMethod[]> = {
  "2c2p": ["card", "promptpay", "installment"],
  omise: ["card"],
};

export const METHOD_LABEL: Record<PspMethod, string> = {
  card: "บัตร",
  promptpay: "PromptPay",
  installment: "ผ่อนชำระ",
};

export const HEALTH_LABEL: Record<PspHealth, string> = {
  unknown: "Unknown",
  healthy: "Healthy",
  failed: "Failed",
};

export const APPROVAL_LABEL: Record<ApprovalState, string> = {
  loading: "กำลังตรวจสถานะอนุมัติ",
  clear: "ไม่มีคำขอที่รออนุมัติ",
  pending: "รออนุมัติ",
  unavailable: "ตรวจสถานะอนุมัติไม่ได้",
};

export function healthTone(health: PspHealth): Tone {
  if (health === "healthy") return "ok";
  if (health === "failed") return "error";
  return "muted";
}

export function approvalTone(state: ApprovalState): Tone {
  if (state === "pending") return "warn";
  if (state === "unavailable") return "error";
  return "muted";
}

export function enabledLabel(enabled: boolean): string {
  return enabled ? "เปิดใช้งาน" : "ปิดใช้งาน";
}

export function enabledTone(enabled: boolean): Tone {
  return enabled ? "ok" : "muted";
}

export function lastTestLabel(result: string | null): string {
  if (result === "authenticated") return "สำเร็จ";
  if (result === "probe_failed") return "ล้มเหลว";
  if (result === null) return "ยังไม่เคยทดสอบ";
  return "ไม่ทราบผล";
}

export function supportedMethods(provider: PspProvider): readonly PspMethod[] {
  return SUPPORTED_METHODS[provider];
}

export function isSupportedMethod(provider: PspProvider, method: string): method is PspMethod {
  return SUPPORTED_METHODS[provider].some((candidate) => candidate === method);
}

export function resetProviderFields(): {
  enabledMethods: PspMethod[];
  pspMerchantId: string;
  secretKey: string;
} {
  return { enabledMethods: [], pspMerchantId: "", secretKey: "" };
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? [...value]
    : undefined;
}

/** Allowlisted renderer view; raw configต้องเก็บแยกสำหรับ immutable Update round-trip. */
export function toPspConfigView(raw: JsonObject | null): PspConfigView {
  if (!isObject(raw)) return {};
  const view: PspConfigView = {};
  if (typeof raw.accountId === "string") view.accountId = raw.accountId;
  if (typeof raw.card === "boolean") view.card = raw.card;
  if (typeof raw.installment === "boolean") view.installment = raw.installment;
  const enabledSources = stringArray(raw.enabledSources);
  if (enabledSources) view.enabledSources = enabledSources;
  const returnUrls = stringArray(raw.returnUrls);
  if (returnUrls) view.returnUrls = returnUrls;
  return view;
}

export interface PspDraft {
  merchantId: string;
  provider: PspProvider | "";
  enabledMethods: string[];
  secretKey?: string;
  pspMerchantId?: string;
}

export type PspValidationErrors = Partial<
  Record<"merchantId" | "provider" | "enabledMethods" | "secretKey" | "pspMerchantId", string>
>;

function validateMethods(provider: PspProvider | "", methods: readonly string[]): string | undefined {
  if (methods.length === 0) return "เลือกช่องทางอย่างน้อยหนึ่งรายการ";
  if (!provider || methods.some((method) => !isSupportedMethod(provider, method))) {
    return "ช่องทางไม่รองรับโดยผู้ให้บริการนี้";
  }
}

export function validateCreateDraft(draft: PspDraft): PspValidationErrors {
  const errors: PspValidationErrors = {};
  if (!draft.merchantId) errors.merchantId = "เลือก Merchant";
  if (!draft.provider) errors.provider = "เลือก PSP";
  const methods = validateMethods(draft.provider, draft.enabledMethods);
  if (methods) errors.enabledMethods = methods;
  if (!draft.secretKey?.trim()) errors.secretKey = "กรอก secretKey";
  if (draft.provider === "2c2p" && !draft.pspMerchantId?.trim()) {
    errors.pspMerchantId = "กรอก 2C2P Merchant ID";
  }
  return errors;
}

export function validateEditDraft(
  provider: PspProvider,
  enabledMethods: readonly string[],
): PspValidationErrors {
  const error = validateMethods(provider, enabledMethods);
  return error ? { enabledMethods: error } : {};
}

export function validateCredentialDraft(
  provider: PspProvider,
  secretKey: string,
  pspMerchantId: string,
): PspValidationErrors {
  const errors: PspValidationErrors = {};
  if (!secretKey.trim()) errors.secretKey = "กรอก secretKey";
  if (provider === "2c2p" && !pspMerchantId.trim()) {
    errors.pspMerchantId = "กรอก 2C2P Merchant ID";
  }
  return errors;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizePspConnectionId(value: string | undefined): string | null {
  if (!value || !UUID.test(value)) return null;
  return value.toLowerCase();
}

export function resolveApprovalState(
  connectionId: string,
  pendingField: boolean | undefined,
  approvals: readonly ApprovalListItem[] | null,
): ApprovalState {
  const canonical = normalizePspConnectionId(connectionId);
  const exactPending =
    canonical !== null &&
    approvals?.some(
      (item) =>
        item.action === "psp.credential.change" &&
        item.status === "pending" &&
        normalizePspConnectionId(item.targetId) === canonical,
    );
  if (pendingField === true || exactPending) return "pending";
  if (pendingField === false && approvals !== null) return "clear";
  return "unavailable";
}

export function pspById(
  list: readonly PspConnection[],
  id: string | undefined,
): PspConnection | undefined {
  const canonical = normalizePspConnectionId(id);
  return canonical
    ? list.find((connection) => connection.pspConnectionId.toLowerCase() === canonical)
    : undefined;
}

export type PspOperation = "list" | "read" | "create" | "update" | "test" | "credential";
export type PspProblemKind =
  | "validation"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "key-reused"
  | "in-progress"
  | "test-failed"
  | "unknown";

export interface PspProblemView {
  kind: PspProblemKind;
  message: string;
  retryable: boolean;
}

/** Mapเฉพาะ status/codeที่ปลอดภัย; ไม่รับหรือ echo Problem Details detail. */
export function mapPspProblem(
  status: number | null,
  code: string | null,
  operation: PspOperation,
): PspProblemView {
  if (status === 403) return { kind: "forbidden", message: "ไม่มีสิทธิ์ดำเนินการ", retryable: false };
  if (status === 404) return { kind: "not-found", message: "ไม่พบรายการ", retryable: false };
  if (status === 400 && (code === "validation_failed" || code === "invalid_psp_config")) {
    return { kind: "validation", message: "ตรวจข้อมูลที่กรอกแล้วลองอีกครั้ง", retryable: false };
  }
  if (status === 400) {
    return { kind: "validation", message: "บันทึกไม่สำเร็จ กรุณาตรวจข้อมูล", retryable: false };
  }
  if (status === 409 && code === "state_conflict") {
    return { kind: "conflict", message: "ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดเวอร์ชันล่าสุด", retryable: false };
  }
  if (status === 409 && code === "idempotency_key_reused") {
    return { kind: "key-reused", message: "คำขอนี้ใช้ซ้ำไม่ได้ กรุณาเริ่มรายการใหม่", retryable: false };
  }
  if (status === 409 && code === "operation_in_progress") {
    return { kind: "in-progress", message: "คำขอเดิมกำลังประมวลผล", retryable: false };
  }
  if (status === 409 && operation === "create") {
    return { kind: "conflict", message: "Merchant มี connection สำหรับ PSP นี้แล้ว", retryable: false };
  }
  if (status === 409 && operation === "credential") {
    return { kind: "conflict", message: "สถานะ Credential เปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุด", retryable: false };
  }
  if (status === 502 && operation === "test") {
    return { kind: "test-failed", message: "ทดสอบ Credential ที่ใช้งานอยู่ล้มเหลว", retryable: false };
  }
  return {
    kind: "unknown",
    message: "ระบบขัดข้องชั่วคราว กรุณาลองใหม่",
    retryable: status === null || status >= 500,
  };
}

export type IdempotencyStatus = "in-flight" | "uncertain" | "in-progress" | "quarantined";
export interface IdempotencyIntent {
  key: string | null;
  status: IdempotencyStatus;
}
export type IdempotencyEvent =
  | "uncertain"
  | "operation-in-progress"
  | "terminal"
  | "key-reused"
  | "payload-changed"
  | "resource-changed"
  | "credential-resource-changed";

export function beginIdempotencyIntent(
  current: IdempotencyIntent | null,
  keyFactory: () => string = () => crypto.randomUUID(),
): IdempotencyIntent {
  if (current && (current.status === "uncertain" || current.status === "in-progress")) {
    return { ...current, status: "in-flight" };
  }
  return { key: keyFactory(), status: "in-flight" };
}

export function transitionIdempotencyIntent(
  current: IdempotencyIntent,
  event: IdempotencyEvent,
): IdempotencyIntent | null {
  if (event === "uncertain") return { ...current, status: "uncertain" };
  if (event === "operation-in-progress") return { ...current, status: "in-progress" };
  if (event === "credential-resource-changed") return { key: null, status: "quarantined" };
  return null;
}

export type CredentialReconciliationState = "retry-safe" | "pending" | "unknown";

export function resolveCredentialReconciliation(
  originalEtag: string,
  latest: ConnectionResource,
  approvals: readonly ApprovalListItem[] | null,
): CredentialReconciliationState {
  const approvalState = resolveApprovalState(
    latest.connection.pspConnectionId,
    latest.connection.hasPendingCredentialChange,
    approvals,
  );
  if (approvalState === "pending") return "pending";
  if (approvalState === "clear" && latest.etag === originalEtag) return "retry-safe";
  return "unknown";
}

export type ConnectionAction = "edit" | "test" | "credential";

export interface ConnectionActionContext {
  permissions: readonly string[];
  connection: PspConnection;
  etag: string | null;
  approvalState: ApprovalState;
}

export interface ConnectionActionGate {
  allowed: boolean;
  reason: string | null;
}

export function connectionActionGate(
  action: ConnectionAction,
  context: ConnectionActionContext,
): ConnectionActionGate {
  const permissions = new Set(context.permissions);
  if (!permissions.has("settings.manage")) {
    return { allowed: false, reason: "ไม่มีสิทธิ์ settings.manage" };
  }
  if (action === "edit" && !permissions.has("merchant.manage")) {
    return { allowed: false, reason: "ไม่มีสิทธิ์ merchant.manage" };
  }
  if (action === "test" && context.connection.capabilities.test !== true) {
    return { allowed: false, reason: "Backend ไม่เปิด capability test" };
  }
  if (!context.etag) {
    return { allowed: false, reason: "ไม่มี ETag ล่าสุด กรุณาโหลดข้อมูลใหม่" };
  }
  if (context.connection.hasPendingCredentialChange !== false) {
    return context.connection.hasPendingCredentialChange
      ? { allowed: false, reason: "Credential change รออนุมัติ" }
      : { allowed: false, reason: "ตรวจ pending state จาก connection ไม่ได้" };
  }
  if (context.approvalState !== "clear") {
    return {
      allowed: false,
      reason:
        context.approvalState === "pending"
          ? "Credential change รออนุมัติ"
          : context.approvalState === "loading"
            ? "กำลังตรวจสถานะอนุมัติ"
            : "ตรวจสถานะอนุมัติไม่ได้",
    };
  }
  return { allowed: true, reason: null };
}
