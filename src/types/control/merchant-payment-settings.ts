import type {
  PaymentEnvironment,
  PspMethod,
  PspProvider,
} from "@/types/control/psp-connection";

export type { PaymentEnvironment } from "@/types/control/psp-connection";

/** GET merchant-settings/{merchantId} (design.md 587). */
export interface MerchantPaymentSettings {
  merchantId: string;
  environment: PaymentEnvironment;
  pendingEnvironment: PaymentEnvironment | null;
  pendingApprovalId: string | null;
  updatedAt: string;
  version: number;
}

export interface MerchantPaymentSettingsResource {
  settings: MerchantPaymentSettings;
  etag: string | null;
}

/** GET/PUT psp-connections/{id}/methods/{method} (account-level capability). */
export interface AccountMethodState {
  pspConnectionId: string;
  merchantId: string;
  provider: PspProvider;
  method: PspMethod;
  enabled: boolean;
  version: number;
  /** Backend reason เมื่อเปิดไม่ได้ (adapter ยังไม่ verify ฯลฯ); optional จน backend task 3. */
  reason?: string | null;
}

export interface AccountMethodResource {
  state: AccountMethodState;
  etag: string | null;
}

/** GET/PUT merchants/{merchantId}/methods/{method} (merchant policy). */
export interface MerchantMethodState {
  merchantId: string;
  method: PspMethod;
  enabled: boolean;
  effective: boolean;
  version: number;
}

export interface MerchantMethodResource {
  state: MerchantMethodState;
  etag: string | null;
}

export interface RoutingRuleView {
  ruleId: string;
  priority: number;
  method: PspMethod | "any";
  originatorId: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  targetConnectionId: string | null;
  fallbackConnectionId: string | null;
  enabled: boolean;
}

export type RoutingRulesetStatus = "draft" | "active" | "pending" | "superseded";

export interface RoutingRuleset {
  rulesetId: string;
  merchantId: string;
  name: string;
  status: RoutingRulesetStatus;
  approvalId: string | null;
  rules: RoutingRuleView[];
  version: number;
}

export interface SimpleRoutingRow {
  method: PspMethod;
  primaryConnectionId: string | null;
  fallbackConnectionId: string | null;
}

/**
 * GET/PUT simple-routing (design.md 644-647). `advancedRoutingReadOnly` เป็น
 * assumption จนกว่า backend จะยืนยัน contract — plan.md Assumptions.
 */
export interface SimpleRoutingView {
  rulesetId: string | null;
  status: RoutingRulesetStatus | null;
  version: number;
  rows: SimpleRoutingRow[];
  advancedRoutingReadOnly: boolean;
}

export interface SimpleRoutingResource {
  routing: SimpleRoutingView;
  etag: string | null;
}

export interface EnvironmentChangeConnectionInput {
  pspConnectionId: string;
  psp: PspProvider;
  pspMerchantId?: string;
  secrets: Record<string, string>;
}

export interface EnvironmentChangeInput {
  targetEnvironment: PaymentEnvironment;
  omiseWebhookRegistered: boolean;
  connections: EnvironmentChangeConnectionInput[];
}

export interface EnvironmentChangeAccepted {
  approvalId: string;
  merchantId: string;
  targetEnvironment: PaymentEnvironment;
  connectionCount: number;
  status: string;
  replayed: boolean;
}

export interface RoutingActivationAccepted {
  approvalId: string;
  rulesetId: string;
  status: string;
  replayed: boolean;
}

/** Sanitized candidate credential test result (POST .../{approvalId}/test). */
export interface CandidateTestResult {
  result: string;
  testedAt: string | null;
  message?: string | null;
}
