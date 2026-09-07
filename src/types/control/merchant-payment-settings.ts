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

/** GET/PUT psp-connections/{id}/methods/{method} (AccountPaymentCapabilityView). */
export interface AccountMethodState {
  pspConnectionId: string;
  merchantId: string;
  provider: PspProvider;
  method: PspMethod;
  enabled: boolean;
  version: number;
  /** true เมื่อ adapter มีหลักฐาน sandbox รองรับ method นี้ (REQ-5.11). */
  adapterVerified: boolean;
  /** first blocking reason (snake_case) เมื่อเปิดไม่ได้; null = ไม่มีเหตุปฏิเสธ. */
  denial: string | null;
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
  /** first blocking reason (snake_case) จาก MerchantPaymentMethodView; null = ไม่มี. */
  denial: string | null;
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
  minAmount: string | null;
  maxAmount: string | null;
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

/** GET/PUT simple-routing (SimpleRoutingView). `version` = 0 เมื่อยังไม่มี draft. */
export interface SimpleRoutingView {
  merchantId: string;
  rulesetId: string | null;
  status: string;
  version: number;
  rules: SimpleRoutingRow[];
  advancedReadOnly: boolean;
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

/** POST routing-rulesets/{id}/activation-requests (RoutingActivationResult). */
export interface RoutingActivationAccepted {
  approvalId: string;
  ruleset: RoutingRuleset;
  replayed: boolean;
}
