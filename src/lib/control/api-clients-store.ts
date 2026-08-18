"use client";

import type { ApiClient } from "@/types/control/api-client";
import { API_CLIENTS } from "@/lib/mock/control/api-clients";
import { createControlStore } from "./store";

export const apiClientsStore = createControlStore<ApiClient>(API_CLIENTS);

export function revokeClient(id: string) {
  apiClientsStore.update(id, (c) => ({ ...c, status: "revoked" }));
}
