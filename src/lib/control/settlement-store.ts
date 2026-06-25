"use client";

import type { SettlementBatch } from "@/types/settlement";
import { SETTLEMENTS } from "@/lib/mock/settlements";
import { matchSettlement } from "./settlement";
import { createControlStore } from "./store";

export const settlementStore = createControlStore<SettlementBatch>(SETTLEMENTS);

/**
 * Run reconciliation: for each unreconciled batch, simulate receiving the PSP
 * report (reported = expected) and recompute match status. Already-reconciled
 * batches keep their status. `settledAt` stamped by the caller at action time.
 */
export function runReconciliation(settledAt: string) {
  settlementStore.set(
    settlementStore.get().map((b) => {
      if (b.matchStatus !== "unreconciled") return b;
      const reported = b.expected;
      return {
        ...b,
        reported,
        matchStatus: matchSettlement(b.expected, reported),
        settledAt,
      };
    }),
  );
}
