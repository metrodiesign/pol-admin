"use client";

import type { NotificationRule } from "@/types/control/notification";
import { NOTIFICATION_RULES } from "@/lib/mock/control/notifications";
import { createControlStore } from "./store";

export const notificationRulesStore =
  createControlStore<NotificationRule>(NOTIFICATION_RULES);

export function toggleNotificationRule(id: string) {
  notificationRulesStore.update(id, (r) => ({ ...r, enabled: !r.enabled }));
}
