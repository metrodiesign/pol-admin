"use client";

import type { ApprovalRequest } from "@/types/approval";
import { APPROVAL_REQUESTS } from "@/lib/mock/approvals";
import { createControlStore } from "./store";

export const approvalsStore = createControlStore<ApprovalRequest>(APPROVAL_REQUESTS);

export function approveRequest(id: string) {
  approvalsStore.update(id, (r) => ({ ...r, status: "approved" }));
}

export function rejectRequest(id: string) {
  approvalsStore.update(id, (r) => ({ ...r, status: "rejected" }));
}
