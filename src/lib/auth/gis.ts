import type { Audience } from "@/types/auth";

/**
 * GIS binding (render-on-demand, 1 client_id/ครั้ง) — แยกจาก React ให้ unit-test ได้ (mock api).
 * ใช้เฉพาะ `google.accounts.id` (ID-token credential flow); ห้าม `google.accounts.oauth2` (REQ-2.6).
 */

export interface GisCredentialResponse {
  /** Google ID token (JWT); ไม่มี = error/ไม่มี credential (REQ-5.2) */
  credential?: string;
}

/** subset ของ `window.google.accounts.id` ที่เราใช้ — inject ได้ใน test. */
export interface GisIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GisCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  cancel?(): void;
}

export interface RenderAudienceButtonArgs {
  api: GisIdApi;
  audience: Audience;
  clientId: string;
  slot: HTMLElement;
  onCredential: (
    audience: Audience,
    clientId: string,
    response: GisCredentialResponse,
  ) => void;
  buttonOptions?: Record<string, unknown>;
}

const DEFAULT_BUTTON_OPTIONS: Record<string, unknown> = {
  type: "standard",
  theme: "outline",
  text: "signin_with",
  shape: "pill",
  width: 280,
};

/**
 * init GIS ด้วย client_id ของ audience นี้ + วาดปุ่ม Google ลง slot (REQ-2.3, 2.4, 2.6).
 * callback ปิด closure ผูก (audience, clientId) -> สลับ audience แล้ว credential route ถูกตัว ไม่ stale (B3).
 * ผู้ใช้ปิด popup = ไม่มี callback = idle (REQ-5.1, จัดการที่ caller).
 */
export function renderAudienceButton(args: RenderAudienceButtonArgs): void {
  const { api, audience, clientId, slot, onCredential, buttonOptions } = args;
  api.initialize({
    client_id: clientId,
    callback: (response) => onCredential(audience, clientId, response),
  });
  api.renderButton(slot, { ...DEFAULT_BUTTON_OPTIONS, ...buttonOptions });
}

/** อ่าน GIS api จาก window (client-only); null เมื่อไม่มี (node/ยังไม่โหลด). */
export function getGisApi(): GisIdApi | null {
  if (typeof window === "undefined") return null;
  const g = (window as unknown as {
    google?: { accounts?: { id?: GisIdApi } };
  }).google;
  return g?.accounts?.id ?? null;
}
