import type { MockSession } from "@/types/auth";

/**
 * Storage adapter ของ mock session (client-only, thin) — แยกจาก pure logic ให้ session.ts คง node-testable.
 * ponytail: DEV-only localStorage; prod = httpOnly cookie set โดย backend (ดู trust boundary ใน design).
 */

const KEY = "pol.mock_session";

/** อ่าน session + guard shape ขั้นต่ำ; พัง/ไม่ครบ -> null. */
export function readSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockSession;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed.audience !== "admin" && parsed.audience !== "producer") ||
      typeof parsed.name !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: MockSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // localStorage อาจ throw (private mode/quota) — เงียบไว้, mock UI เท่านั้น
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // เงียบไว้เช่นกัน
  }
}
