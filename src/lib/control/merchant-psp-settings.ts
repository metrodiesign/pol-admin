import { PROVIDER_LABEL } from "@/lib/control/psp";
import type {
  AccountMethodState,
  MerchantMethodState,
  MerchantPaymentSettings,
  RoutingRuleset,
  SimpleRoutingRow,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type {
  PaymentEnvironment,
  PspConnection,
  PspMethod,
  PspProvider,
} from "@/types/control/psp-connection";

/** Sาม canonical method เสมอ (design.md 139) — ไม่ hardcode ต่อ provider. */
export const CANONICAL_METHODS: readonly PspMethod[] = ["card", "promptpay", "installment"];
export const SETTINGS_PROVIDERS: readonly PspProvider[] = ["2c2p", "omise"];

/** Approval action names (plan.md Assumptions — ยืนยันกับ backend ตอน wire). */
export const CREDENTIAL_CHANGE_ACTION = "psp.credential.change";
export const ENVIRONMENT_CHANGE_ACTION = "payment.environment.change";
export const ROUTING_ACTIVATE_ACTION = "routing.activate";
export const SETTINGS_APPROVAL_ACTIONS: readonly string[] = [
  CREDENTIAL_CHANGE_ACTION,
  ENVIRONMENT_CHANGE_ACTION,
  ROUTING_ACTIVATE_ACTION,
];

export const OMISE_UNVERIFIED_MESSAGE = "รอ integration ผ่าน sandbox";
const FIELD_MAX_LENGTH = 4096;

function connectionByProvider(
  connections: readonly PspConnection[],
  provider: PspProvider,
): PspConnection | undefined {
  return connections.find((connection) => connection.psp === provider);
}

function accountMethodFor(
  accountMethods: readonly AccountMethodState[],
  connectionId: string,
  method: PspMethod,
): AccountMethodState | undefined {
  return accountMethods.find(
    (state) => state.pspConnectionId === connectionId && state.method === method,
  );
}

// ---------------------------------------------------------------------------
// Readiness rail
// ---------------------------------------------------------------------------

export type ReadinessStepId =
  | "environment"
  | "connections"
  | "methods"
  | "routing"
  | "ready";
export type ReadinessState = "done" | "attention" | "blocked" | "pending";

export interface ReadinessStep {
  id: ReadinessStepId;
  state: ReadinessState;
  label: string;
  detail: string;
}

export interface ReadinessInput {
  settings: MerchantPaymentSettings | null;
  connections: readonly PspConnection[];
  merchantMethods: readonly MerchantMethodState[];
  routing: SimpleRoutingView | null;
}

function enabledMerchantMethods(
  merchantMethods: readonly MerchantMethodState[],
): PspMethod[] {
  return CANONICAL_METHODS.filter((method) =>
    merchantMethods.some((state) => state.method === method && state.enabled),
  );
}

export function deriveReadiness(input: ReadinessInput): ReadinessStep[] {
  const { settings, connections, merchantMethods, routing } = input;

  const environment: ReadinessStep = settings
    ? settings.pendingEnvironment
      ? {
          id: "environment",
          state: "pending",
          label: "สภาพแวดล้อม",
          detail: `รออนุมัติเปลี่ยนเป็น ${settings.pendingEnvironment.toUpperCase()}`,
        }
      : {
          id: "environment",
          state: "done",
          label: "สภาพแวดล้อม",
          detail: settings.environment.toUpperCase(),
        }
    : {
        id: "environment",
        state: "blocked",
        label: "สภาพแวดล้อม",
        detail: "โหลดสภาพแวดล้อมไม่ได้",
      };

  const connectedCount = SETTINGS_PROVIDERS.filter((provider) =>
    connectionByProvider(connections, provider),
  ).length;
  const connectionsStep: ReadinessStep = {
    id: "connections",
    state:
      connectedCount === 0
        ? "blocked"
        : connectedCount < SETTINGS_PROVIDERS.length
          ? "attention"
          : "done",
    label: "การเชื่อมต่อ",
    detail: `เชื่อมต่อแล้ว ${connectedCount}/${SETTINGS_PROVIDERS.length}`,
  };

  const enabledMethods = enabledMerchantMethods(merchantMethods);
  const methodsStep: ReadinessStep = {
    id: "methods",
    state: enabledMethods.length === 0 ? "attention" : "done",
    label: "ช่องทางชำระเงิน",
    detail: `เปิดใช้ ${enabledMethods.length}/${CANONICAL_METHODS.length}`,
  };

  const withPrimary = enabledMethods.filter((method) =>
    routing?.rules.some((row) => row.method === method && row.primaryConnectionId),
  ).length;
  const routingStep: ReadinessStep = {
    id: "routing",
    state:
      enabledMethods.length === 0
        ? "attention"
        : withPrimary < enabledMethods.length
          ? "blocked"
          : "done",
    label: "การกำหนดเส้นทาง",
    detail: `กำหนดหลักแล้ว ${withPrimary}/${enabledMethods.length}`,
  };

  const prior = [environment, connectionsStep, methodsStep, routingStep];
  const allDone = prior.every((step) => step.state === "done");
  const anyPending = prior.some((step) => step.state === "pending");
  const readyStep: ReadinessStep = {
    id: "ready",
    state: allDone ? "done" : anyPending ? "pending" : "attention",
    label: "พร้อมรับชำระ",
    detail: allDone ? "พร้อมใช้งาน" : "ยังมีขั้นตอนที่ต้องทำ",
  };

  return [...prior, readyStep];
}

/** ขั้นแรกที่ยังไม่ done — ใช้ทำ aria-current. */
export function currentReadinessStep(steps: readonly ReadinessStep[]): ReadinessStepId | null {
  return steps.find((step) => step.state !== "done")?.id ?? null;
}

// ---------------------------------------------------------------------------
// Method matrix
// ---------------------------------------------------------------------------

export type ProviderMethodCell =
  | { status: "not-connected" }
  | { status: "enabled" | "disabled" | "unavailable"; reason: string | null };

export interface MethodMatrixRow {
  method: PspMethod;
  merchant: { enabled: boolean; effective: boolean } | null;
  providers: Record<PspProvider, ProviderMethodCell>;
  primaryConnectionId: string | null;
  fallbackConnectionId: string | null;
}

export interface MethodMatrixInput {
  connections: readonly PspConnection[];
  merchantMethods: readonly MerchantMethodState[];
  accountMethods: readonly AccountMethodState[];
  routing: SimpleRoutingView | null;
}

function providerCell(
  connection: PspConnection | undefined,
  accountMethods: readonly AccountMethodState[],
  method: PspMethod,
): ProviderMethodCell {
  if (!connection) return { status: "not-connected" };
  const state = accountMethodFor(accountMethods, connection.pspConnectionId, method);
  if (!state) {
    return {
      status: "unavailable",
      reason: connection.psp === "omise" ? OMISE_UNVERIFIED_MESSAGE : null,
    };
  }
  if (state.enabled) return { status: "enabled", reason: null };
  return {
    status: "disabled",
    reason:
      state.denial ??
      (connection.psp === "omise" ? OMISE_UNVERIFIED_MESSAGE : null),
  };
}

export function buildMethodMatrix(input: MethodMatrixInput): MethodMatrixRow[] {
  const { connections, merchantMethods, accountMethods, routing } = input;
  return CANONICAL_METHODS.map((method) => {
    const merchant = merchantMethods.find((state) => state.method === method);
    const row = routing?.rules.find((candidate) => candidate.method === method);
    const providers = {} as Record<PspProvider, ProviderMethodCell>;
    for (const provider of SETTINGS_PROVIDERS) {
      providers[provider] = providerCell(
        connectionByProvider(connections, provider),
        accountMethods,
        method,
      );
    }
    return {
      method,
      merchant: merchant
        ? { enabled: merchant.enabled, effective: merchant.effective }
        : null,
      providers,
      primaryConnectionId: row?.primaryConnectionId ?? null,
      fallbackConnectionId: row?.fallbackConnectionId ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Method toggle gate (separate from connectionActionGate)
// ---------------------------------------------------------------------------

export interface MethodToggleGate {
  allowed: boolean;
  reason: string | null;
}

/**
 * Gate สำหรับ toggle method (ระดับร้านค้า/บัญชี): ต้องมี merchant.manage และ ETag
 * ของ capability นั้น — pending credential change ไม่บล็อก method toggle.
 */
export function methodToggleGate(
  permissions: readonly string[],
  etag: string | null,
): MethodToggleGate {
  if (!new Set(permissions).has("merchant.manage")) {
    return { allowed: false, reason: "ไม่มีสิทธิ์ merchant.manage" };
  }
  if (!etag) {
    return { allowed: false, reason: "ไม่มี ETag ล่าสุด กรุณาโหลดข้อมูลใหม่" };
  }
  return { allowed: true, reason: null };
}

// ---------------------------------------------------------------------------
// Routing candidates
// ---------------------------------------------------------------------------

export interface RoutingCandidate {
  connectionId: string;
  provider: PspProvider;
  label: string;
  disabledReason: string | null;
}

export interface RoutingCandidateInput {
  method: PspMethod;
  connections: readonly PspConnection[];
  accountMethods: readonly AccountMethodState[];
  environment: PaymentEnvironment;
  /** สำหรับ fallback: ตัด connection ที่ซ้ำกับ primary. */
  primaryConnectionId?: string | null;
}

export function routingCandidates(input: RoutingCandidateInput): RoutingCandidate[] {
  const { method, connections, accountMethods, environment, primaryConnectionId } = input;
  return connections.map((connection) => {
    const label = PROVIDER_LABEL[connection.psp];
    let disabledReason: string | null = null;
    const accountMethod = accountMethodFor(
      accountMethods,
      connection.pspConnectionId,
      method,
    );
    if (!connection.isEnabled) {
      disabledReason = "ไม่เปิดใช้";
    } else if (!accountMethod || !accountMethod.enabled) {
      disabledReason = "ช่องทางระดับบัญชีไม่เปิด";
    } else if (
      connection.credentialEnvironment !== undefined &&
      connection.credentialEnvironment !== environment
    ) {
      disabledReason = "credential ไม่ตรง environment";
    } else if (primaryConnectionId && connection.pspConnectionId === primaryConnectionId) {
      disabledReason = "ซ้ำกับหลัก";
    }
    return { connectionId: connection.pspConnectionId, provider: connection.psp, label, disabledReason };
  });
}

// ---------------------------------------------------------------------------
// Advanced-rule detection + simple routing
// ---------------------------------------------------------------------------

export function hasAdvancedRules(ruleset: RoutingRuleset | null): boolean {
  if (!ruleset) return false;
  return ruleset.rules.some(
    (rule) =>
      rule.method === "any" ||
      rule.originatorId !== null ||
      rule.minAmount !== null ||
      rule.maxAmount !== null,
  );
}

// เป้าของ requestRoutingActivation: view เดียวกับที่เพิ่งบันทึกคือ routing.rulesetId
// (มาจาก GET simple-routing แหล่งเดียวกับ routingEtag) ยิงไปที่ rulesets[0] ผิดตัวได้เมื่อ
// list มี active ก่อน draft; fallback ไป ruleset เฉพาะเมื่อยังเป็น draft/pending เท่านั้น
export function resolveActivationTarget(
  routing: SimpleRoutingView | null,
  ruleset: RoutingRuleset | null,
): string | null {
  if (routing?.rulesetId != null) return routing.rulesetId;
  if (ruleset && (ruleset.status === "draft" || ruleset.status === "pending")) {
    return ruleset.rulesetId;
  }
  return null;
}

export function simpleRowsFromRuleset(
  ruleset: RoutingRuleset | null,
  methods: readonly PspMethod[] = CANONICAL_METHODS,
): SimpleRoutingRow[] {
  return methods.map((method) => {
    const rule = ruleset?.rules.find((candidate) => candidate.method === method);
    return {
      method,
      primaryConnectionId: rule?.targetConnectionId ?? null,
      fallbackConnectionId: rule?.fallbackConnectionId ?? null,
    };
  });
}

export interface SimpleRoutingValidation {
  code: "routing_incomplete" | null;
  incompleteMethods: PspMethod[];
}

export function validateSimpleRouting(
  rows: readonly SimpleRoutingRow[],
  enabledMerchantMethods: readonly PspMethod[],
): SimpleRoutingValidation {
  const incompleteMethods = enabledMerchantMethods.filter((method) => {
    const row = rows.find((candidate) => candidate.method === method);
    return !row || !row.primaryConnectionId;
  });
  return {
    code: incompleteMethods.length > 0 ? "routing_incomplete" : null,
    incompleteMethods,
  };
}

// ---------------------------------------------------------------------------
// Environment change validation
// ---------------------------------------------------------------------------

export interface EnvironmentConnectionDraft {
  pspConnectionId: string;
  psp: PspProvider;
  pspMerchantId: string;
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
}

export interface EnvironmentConnectionErrors {
  pspMerchantId?: string;
  secretKey?: string;
  publicKey?: string;
  webhookSecret?: string;
}

export interface EnvironmentChangeValidation {
  valid: boolean;
  connectionErrors: Record<string, EnvironmentConnectionErrors>;
  formError: string | null;
}

function tooLong(value: string): boolean {
  return value.length > FIELD_MAX_LENGTH;
}

export function validateEnvironmentChange(
  drafts: readonly EnvironmentConnectionDraft[],
  target: PaymentEnvironment,
  omiseWebhookRegistered: boolean,
): EnvironmentChangeValidation {
  const connectionErrors: Record<string, EnvironmentConnectionErrors> = {};
  let formError: string | null = null;
  let hasOmise = false;

  for (const draft of drafts) {
    const errors: EnvironmentConnectionErrors = {};
    if (draft.psp === "omise") hasOmise = true;

    if (draft.psp === "2c2p" && !draft.pspMerchantId.trim()) {
      errors.pspMerchantId = "กรอก 2C2P Merchant ID";
    }
    if (!draft.secretKey.trim()) {
      errors.secretKey = "กรอก secretKey";
    }
    if (tooLong(draft.pspMerchantId)) {
      errors.pspMerchantId = `ยาวเกิน ${FIELD_MAX_LENGTH} ตัวอักษร`;
    }
    if (tooLong(draft.secretKey)) {
      errors.secretKey = `ยาวเกิน ${FIELD_MAX_LENGTH} ตัวอักษร`;
    }
    if (tooLong(draft.publicKey)) {
      errors.publicKey = `ยาวเกิน ${FIELD_MAX_LENGTH} ตัวอักษร`;
    }
    if (tooLong(draft.webhookSecret)) {
      errors.webhookSecret = `ยาวเกิน ${FIELD_MAX_LENGTH} ตัวอักษร`;
    }

    if (Object.keys(errors).length > 0) connectionErrors[draft.pspConnectionId] = errors;
  }

  if (target === "live" && hasOmise && !omiseWebhookRegistered) {
    formError = "ยืนยันว่าลงทะเบียน callback URL ของ Omise แล้วก่อนเปลี่ยนเป็น live";
  }

  return {
    valid: Object.keys(connectionErrors).length === 0 && formError === null,
    connectionErrors,
    formError,
  };
}

/** แปลง draft เป็น request body — ตัด field ว่างออก (secrets เป็น write-only). */
export function buildEnvironmentChangeConnections(
  drafts: readonly EnvironmentConnectionDraft[],
): {
  pspConnectionId: string;
  psp: PspProvider;
  pspMerchantId?: string;
  secrets: Record<string, string>;
}[] {
  return drafts.map((draft) => {
    const secrets: Record<string, string> = { secretKey: draft.secretKey };
    if (draft.psp === "omise") {
      if (draft.publicKey.trim()) secrets.publicKey = draft.publicKey;
      if (draft.webhookSecret.trim()) secrets.webhookSecret = draft.webhookSecret;
    }
    return {
      pspConnectionId: draft.pspConnectionId,
      psp: draft.psp,
      ...(draft.psp === "2c2p" ? { pspMerchantId: draft.pspMerchantId.trim() } : {}),
      secrets,
    };
  });
}

// ---------------------------------------------------------------------------
// Problem mapping
// ---------------------------------------------------------------------------

export type SettingsOperation =
  | "settings"
  | "environment"
  | "method"
  | "routing"
  | "candidate-test";

export type SettingsProblemKind =
  | "validation"
  | "forbidden"
  | "auth-stale"
  | "not-found"
  | "conflict"
  | "approval-pending"
  | "credentials-incomplete"
  | "webhook-not-ready"
  | "routing-incomplete"
  | "advanced-read-only"
  | "too-large"
  | "legacy-blocked"
  | "test-failed"
  | "unknown";

export interface SettingsProblemView {
  kind: SettingsProblemKind;
  message: string;
  retryable: boolean;
  /** true = โหลดข้อมูลใหม่ก่อนลองอีกครั้ง (conflict/approval). */
  refetch: boolean;
}

/** Mapเฉพาะ status/code ที่ปลอดภัย; ไม่ echo Problem Details detail (design.md 806-833). */
export function mapSettingsProblem(
  status: number | null,
  code: string | null,
  operation: SettingsOperation,
): SettingsProblemView {
  if (status === 403 && code === "authorization_stale") {
    return {
      kind: "auth-stale",
      message: "สิทธิ์หมดอายุ กรุณาเข้าสู่ระบบใหม่",
      retryable: false,
      refetch: false,
    };
  }
  if (status === 403 && code === "merchant_scope_forbidden") {
    return {
      kind: "forbidden",
      message: "ไม่มีสิทธิ์เข้าถึงร้านค้านี้",
      retryable: false,
      refetch: false,
    };
  }
  if (status === 403) {
    return { kind: "forbidden", message: "ไม่มีสิทธิ์ดำเนินการ", retryable: false, refetch: false };
  }
  if (status === 404) {
    return { kind: "not-found", message: "ไม่พบรายการ", retryable: false, refetch: false };
  }
  if (status === 413 || code === "request_too_large") {
    return {
      kind: "too-large",
      message: "ข้อมูลรับรองยาวเกินกำหนด กรุณาตรวจแล้วกรอกใหม่",
      retryable: false,
      refetch: false,
    };
  }
  if (status === 409) {
    if (code === "approval_pending") {
      return {
        kind: "approval-pending",
        message: "มีคำขอรออนุมัติอยู่แล้ว กรุณาเปิดดูรายละเอียดคำขอ",
        retryable: false,
        refetch: true,
      };
    }
    if (code === "environment_credentials_incomplete") {
      return {
        kind: "credentials-incomplete",
        message: "ข้อมูลรับรองไม่ครบทุก connection กรุณาตรวจ provider ที่ขาด",
        retryable: false,
        refetch: false,
      };
    }
    if (code === "webhook_not_ready") {
      return {
        kind: "webhook-not-ready",
        message: "ต้องยืนยันการลงทะเบียน callback URL ของ Omise ก่อน",
        retryable: false,
        refetch: false,
      };
    }
    if (code === "routing_incomplete") {
      return {
        kind: "routing-incomplete",
        message: "การกำหนดเส้นทางยังไม่ครบทุกช่องทาง กรุณากำหนดการเชื่อมต่อหลัก",
        retryable: false,
        refetch: false,
      };
    }
    if (code === "advanced_routing_read_only") {
      return {
        kind: "advanced-read-only",
        message: "มีกฎขั้นสูงอยู่ หน้านี้จึงแก้ไม่ได้ กรุณาใช้หน้ารายละเอียด ruleset",
        retryable: false,
        refetch: true,
      };
    }
    if (code === "legacy_snapshot_blocked") {
      return {
        kind: "legacy-blocked",
        message: "ไม่พบ snapshot เดิม ต้องแก้ไขก่อนจึงจะดำเนินการต่อได้",
        retryable: false,
        refetch: false,
      };
    }
    if (code === "state_conflict") {
      return {
        kind: "conflict",
        message: "ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดเวอร์ชันล่าสุด",
        retryable: false,
        refetch: true,
      };
    }
    if (code === "idempotency_key_reused") {
      return {
        kind: "conflict",
        message: "คำขอนี้ใช้ซ้ำไม่ได้ กรุณาเริ่มรายการใหม่",
        retryable: false,
        refetch: true,
      };
    }
    return {
      kind: "conflict",
      message: "สถานะเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุด",
      retryable: false,
      refetch: true,
    };
  }
  if (status === 502 && code === "psp_test_failed") {
    return {
      kind: "test-failed",
      message:
        operation === "candidate-test"
          ? "ทดสอบชุดใหม่ล้มเหลว (คำขออนุมัติยังดำเนินต่อได้)"
          : "ทดสอบ Credential ที่ใช้งานอยู่ล้มเหลว",
      retryable: false,
      refetch: false,
    };
  }
  if (status === 400) {
    return {
      kind: "validation",
      message: "ตรวจข้อมูลที่กรอกแล้วลองอีกครั้ง",
      retryable: false,
      refetch: false,
    };
  }
  return {
    kind: "unknown",
    message: "ระบบขัดข้องชั่วคราว กรุณาลองใหม่",
    retryable: status === null || status >= 500,
    refetch: false,
  };
}
