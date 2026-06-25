"use client";

import type { ApiClient } from "@/types/api-client";
import { API_CLIENTS } from "@/lib/mock/api-clients";
import { createControlStore } from "./store";

export const apiClientsStore = createControlStore<ApiClient>(API_CLIENTS);

export function revokeClient(id: string) {
  apiClientsStore.update(id, (c) => ({ ...c, status: "revoked" }));
}
