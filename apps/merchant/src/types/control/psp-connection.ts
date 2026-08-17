export type PspProvider = "omise" | "2c2p";
export type PspHealth = "healthy" | "degraded" | "error" | "offline";

/**
 * A configured PSP connector for one merchant. Credentials live in a vault —
 * only masked hints are ever exposed to the UI (REQ-5.1). `environment`/
 * `redirectOnly` ของเดิมไม่มีคู่ใน `MerchantConnectionView` เลย — ตัดทิ้ง (REQ-5, ไม่ใช่ UI-only)
 * เพราะ pol-core connection ผูกแค่ psp+merchant ไม่มี concept แยก environment ต่อ connection.
 */
export interface PspConnection {
  pspConnectionId: string;
  psp: PspProvider;
  merchantId: string | null; // MerchantConnectionView.MerchantId เป็น string? (nullable)
  enabledMethods: string[]; // ตรง MerchantConnectionView.EnabledMethods (IReadOnlyList<string>)
  config: Record<string, unknown>; // JsonElement? — object ธรรมดา ห้าม typed field เจาะจง, ห้าม secret ปน (REQ-5.1)
  maskedSecrets: Record<string, string>; // hint เท่านั้น ไม่ใช่ secret จริง
  // UI-only, ไม่มีใน MerchantConnectionView (REQ-5.4) — health ใช้ค่า "offline" แทนค่าเดิมที่ชนคำต้องห้าม (REQ-9.6/9.7):
  health: PspHealth;
  lastWebhookAt: string; // ISO datetime, หรือ "" ถ้ายังไม่มี
}
