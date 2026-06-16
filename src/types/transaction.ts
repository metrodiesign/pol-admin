export type TransactionStatus =
  | "succeeded"
  | "pending"
  | "processing"
  | "failed"
  | "voided"
  | "refunded"
  | "authorized";

export type PaymentChannel = "card" | "qr" | "installment" | "wallet" | "bank";

export type PspName = "2C2P" | "Omise";

export interface TransactionCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface TransactionItem {
  policyNo: string;
  type: string;
  period: string;
  amount: number;
}

export interface TransactionOriginator {
  id: string;
  type: "branch" | "agent" | "broker" | "staff" | "app";
  name: string;
  code: string;
  region: string;
}

export interface Transaction {
  id: string;
  ref: string;
  customer: TransactionCustomer;
  originator: TransactionOriginator;
  channel: PaymentChannel;
  psp: PspName;
  status: TransactionStatus;
  amount: number;
  itemCount: number;
  items: TransactionItem[];
  /** ISO string */
  ts: string;
}
