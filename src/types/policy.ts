export type PolicyStatus = "active" | "pending" | "expired" | "cancelled" | "due" | "lapsed";

export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue";

export type PaymentTerm = "รายปี" | "ราย 6 เดือน" | "ราย 3 เดือน" | "รายเดือน";

export interface Policy {
  id: string;
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl: string;
  productName: string;
  premium: number;
  sumInsured: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  totalAmount: number;
  lastPaymentDate: string;
  paymentMethod: string;
  /** CentroPay additions (optional — won't break existing policy/list usage) */
  insuranceType?: string;
  plan?: string;
  /** ISO string */
  nextDueDate?: string;
  term?: PaymentTerm;
  currentPeriod?: number;
  originatorId?: string;
}
