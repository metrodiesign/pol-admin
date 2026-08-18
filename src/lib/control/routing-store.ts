"use client";

import type { RoutingRule } from "@/types/control/routing-rule";
import { ROUTING_RULES } from "@/lib/mock/control/routing-rules";
import { createControlStore } from "./store";

export const routingStore = createControlStore<RoutingRule>(ROUTING_RULES);

export function toggleRule(id: string) {
  routingStore.update(id, (r) => ({ ...r, enabled: !r.enabled }));
}

/** Reorder by swapping the priority value with the adjacent rule (sorted asc). */
export function moveRule(id: string, dir: "up" | "down") {
  const sorted = [...routingStore.get()].sort((a, b) => a.priority - b.priority);
  const i = sorted.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= sorted.length) return;
  const a = sorted[i];
  const b = sorted[j];
  if (!a || !b) return;
  routingStore.set(
    routingStore.get().map((r) => {
      if (r.id === a.id) return { ...r, priority: b.priority };
      if (r.id === b.id) return { ...r, priority: a.priority };
      return r;
    }),
  );
}
