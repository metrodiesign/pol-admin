/**
 * decode payload ของ Google ID token (JWT) — DEV-only, ไม่ verify ลายเซ็น (REQ-3.1, 3.3).
 *
 * ขั้นตอน base64url ที่ต้อง isomorphic (รันได้ทั้ง node test และ browser):
 *   1) แยก 3 ส่วนด้วย "."; ไม่ครบ 3 -> null
 *   2) ส่วน payload: replace "-"->"+", "_"->"/", เติม "=" ให้ len หาร 4 ลงตัว
 *   3) atob -> bytes -> TextDecoder("utf-8") (รองรับชื่อ UTF-8/ไทย) -> JSON.parse
 *   4) JSON.parse fail / ไม่ใช่ object -> null
 *
 * ponytail: trust boundary = DEV-only hint ไม่ใช่ security control; prod ต้อง verify ลายเซ็นที่ backend.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = parts[1];
  if (!payload) return null;
  try {
    const json = base64UrlToString(payload);
    const obj: unknown = JSON.parse(json);
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return null;
    return obj as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** base64url -> UTF-8 string. throw ถ้า input พัง (ตัวเรียกจับเป็น null). */
function base64UrlToString(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const rem = b64.length % 4;
  if (rem === 2) b64 += "==";
  else if (rem === 3) b64 += "=";
  else if (rem === 1) throw new Error("invalid base64url length");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}
