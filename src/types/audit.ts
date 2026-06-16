export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "capture"
  | "void"
  | "refund"
  | "export"
  | "send";

export type AuditEntity =
  | "payment_link"
  | "transaction"
  | "policy"
  | "user"
  | "role"
  | "apiclient"
  | "psp"
  | "webhook"
  | "report"
  | "config";

export interface AuditActor {
  id: string;
  name: string;
  portal: "admin" | "merchant";
}

export interface AuditLog {
  id: string;
  /** ISO string */
  ts: string;
  actor: AuditActor;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  ip: string;
  ua: string;
  summary: string;
}
