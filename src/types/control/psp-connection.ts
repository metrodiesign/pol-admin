export type PspProvider = "2c2p" | "omise";
export type PspMethod = "card" | "promptpay" | "installment";
export type PspHealth = "unknown" | "healthy" | "failed";

export type JsonObject = Record<string, unknown>;

export interface PspConfigView {
  accountId?: string;
  card?: boolean;
  installment?: boolean;
  enabledSources?: string[];
  returnUrls?: string[];
}

/** Wire contract จาก pol-core; credential มีเฉพาะ masked hint จาก backend. */
export interface PspConnection {
  pspConnectionId: string;
  merchantId: string;
  psp: PspProvider;
  enabledMethods: PspMethod[];
  config: JsonObject | null;
  maskedSecrets: Record<string, string>;
  isEnabled: boolean;
  health: PspHealth;
  lastTestedAt: string | null;
  lastTestResult: string | null;
  capabilities: Record<string, boolean>;
  /** Optionalเฉพาะช่วง wire rollout; missingต้อง fail closed. */
  hasPendingCredentialChange?: boolean;
  createdAt: string;
  version: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ConnectionResource {
  connection: PspConnection;
  etag: string | null;
}

export interface CreatePspConnectionInput {
  merchantId: string;
  psp: PspProvider;
  enabledMethods: PspMethod[];
  config: null;
  secrets: { secretKey: string };
  pspMerchantId: string | null;
}

export interface UpdatePspConnectionInput {
  merchantId: string;
  enabledMethods: PspMethod[];
  config: JsonObject | null;
  isEnabled: boolean;
}

export interface CredentialChangeInput {
  merchantId: string;
  secrets: { secretKey: string };
  pspMerchantId: string | null;
}

export interface TestPspConnectionInput {
  merchantId: string;
}

export interface CredentialChangeAccepted {
  approvalId: string;
  candidateVersionId: string;
  status: string;
  replayed: boolean;
}

export type ApprovalState = "loading" | "clear" | "pending" | "unavailable";
export type MerchantCatalogStatus =
  | "loading"
  | "ready"
  | "partial"
  | "forbidden"
  | "error";

export interface MerchantOption {
  id: string;
  name: string;
  code: string;
}

export interface ApprovalListItem {
  approvalId: string;
  merchantId: string | null;
  action: string;
  targetId: string;
  status: string;
}

export interface PspConnectionListRow extends PspConnection {
  merchantName: string;
  approvalState: ApprovalState;
}
