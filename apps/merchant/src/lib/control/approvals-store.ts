"use client";

import type { ApprovalRequest } from "@/types/control/approval";
import { APPROVAL_REQUESTS } from "@/lib/mock/control/approvals";
import { createControlStore } from "./store";

export const approvalsStore = createControlStore<ApprovalRequest>(APPROVAL_REQUESTS);

export function approveRequest(id: string) {
  approvalsStore.update(id, (r) => ({ ...r, status: "approved" }));
}

export function rejectRequest(id: string) {
  approvalsStore.update(id, (r) => ({ ...r, status: "rejected" }));
}
