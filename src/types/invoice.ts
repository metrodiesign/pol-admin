import type { PaymentChannel } from "./transaction";

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "partial"
  | "paid"
  | "overdue"
  | "expired"
  | "voided";

export interface InvoiceCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface InvoiceItem {
  policyNo: string;
  description: string;
  type: string;
  period: string;
  amount: number;
}

export interface Invoice {
  id: string;
  /** Public payment link URL */
  url: string;
  channel: PaymentChannel;
  /** Number of link views */
  views: number;
  /** ISO string */
  expiresAt: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  customer: InvoiceCustomer;
  /** Originator ID (branch/agent/broker/app) */
  originatorId: string;
  /** External reference numbers */
  refs: string[];
  discount: number;
  total: number;
  /** ISO string */
  createdAt: string;
}
