"use client";

import type { NotificationRule } from "@/types/notification";
import { NOTIFICATION_RULES } from "@/lib/mock/notifications";
import { createControlStore } from "./store";

export const notificationRulesStore =
  createControlStore<NotificationRule>(NOTIFICATION_RULES);

export function toggleNotificationRule(id: string) {
  notificationRulesStore.update(id, (r) => ({ ...r, enabled: !r.enabled }));
}
