/**
 * GIS binding — แยกจาก React ให้ unit-test ได้ (mock api).
 * ใช้เฉพาะ `google.accounts.id` (ID-token credential flow); ห้าม `google.accounts.oauth2` (REQ-2.6).
 *
 * โชว์ปุ่ม Google ของทั้ง 2 audience พร้อมกัน: แต่ละ iframe bake client_id ของตัวเอง (จาก initialize
 * ก่อน renderButton). callback เป็น "audience-agnostic" ตัวเดียวใช้ร่วม -> เลี่ยงปัญหา singleton ของ
 * `accounts.id.initialize` (ตัวสุดท้ายชนะ); audience ถูก derive จาก `aud` ใน token ภายหลัง.
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
  clientId: string;
  slot: HTMLElement;
  /** shared callback (audience-agnostic) — audience derive จาก `aud` ใน token ภายหลัง */
  onCredential: (response: GisCredentialResponse) => void;
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
 * init GIS ด้วย client_id ที่ส่ง + วาดปุ่ม Google ลง slot (REQ-2.3, 2.4, 2.6).
 * เรียกครั้งละ audience: iframe ที่ได้ผูก client_id นั้น; callback ที่ส่งมาเป็นตัวร่วม (ตัวสุดท้ายที่ init
 * ชนะ — ปลอดภัยเพราะเป็นฟังก์ชันเดียวกัน). ผู้ใช้ปิด popup = ไม่มี callback = idle (REQ-5.1).
 */
export function renderAudienceButton(args: RenderAudienceButtonArgs): void {
  const { api, clientId, slot, onCredential, buttonOptions } = args;
  api.initialize({ client_id: clientId, callback: onCredential });
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
