import type { TransactionStatus } from "@/types/transaction";
import type { StepState, LifecycleStepConfig } from "@/components/payment/lifecycle-track";

/**
 * Maps a transaction status to 3 MiniLifecycle dot states:
 * [authorize, capture/void, settled/refund]
 */
export function statusToMiniStates(status: TransactionStatus): StepState[] {
  switch (status) {
    case "succeeded":
      return ["done", "done", "done"];
    case "processing":
      return ["done", "active", "idle"];
    case "authorized":
      return ["done", "active", "idle"];
    case "pending":
      return ["active", "idle", "idle"];
    case "failed":
      return ["failed", "idle", "idle"];
    case "refunded":
      return ["done", "done", "active"];
    case "voided":
      return ["done", "failed", "idle"];
    default:
      return ["idle", "idle", "idle"];
  }
}

/**
 * Maps a transaction status to LifecycleTrack step configs.
 * The three-step flow adapts label for voided/refunded paths.
 */
export function statusToLifecycleSteps(status: TransactionStatus): LifecycleStepConfig[] {
  switch (status) {
    case "voided":
      return [
        { step: "authorize", state: "done",   label: "Authorize" },
        { step: "void",      state: "failed",  label: "Void" },
        { step: "capture",   state: "idle",    label: "ปิดรายการ" },
      ];
    case "refunded":
      return [
        { step: "authorize", state: "done",   label: "Authorize" },
        { step: "capture",   state: "done",   label: "Capture" },
        { step: "refund",    state: "active", label: "Refund" },
      ];
    case "failed":
      return [
        { step: "authorize", state: "failed", label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "capture",   state: "idle",   label: "Settled" },
      ];
    case "succeeded":
      return [
        { step: "authorize", state: "done", label: "Authorize" },
        { step: "capture",   state: "done", label: "Capture" },
        { step: "capture",   state: "done", label: "Settled" },
      ];
    case "processing":
    case "authorized":
      return [
        { step: "authorize", state: "done",   label: "Authorize" },
        { step: "capture",   state: "active", label: "Capture" },
        { step: "capture",   state: "idle",   label: "Settled" },
      ];
    default:
      // pending
      return [
        { step: "authorize", state: "active", label: "Authorize" },
        { step: "capture",   state: "idle",   label: "Capture" },
        { step: "capture",   state: "idle",   label: "Settled" },
      ];
  }
}
