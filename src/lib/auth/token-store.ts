// ที่เก็บ token คู่ (access + refresh) ของ employee login — memory + sessionStorage (user เลือกทางนี้ รับ XSS reach).
// ponytail: sessionStorage ถูก copy ตอน duplicate tab ทำให้สองแท็บแชร์ refresh token เดียว
// แท็บที่ refresh ทีหลังโดน revoke ทั้งคู่ — ถ้าเจอจริงค่อยย้ายไป localStorage + storage event แชร์คู่ล่าสุด.

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** epoch ms ที่ access token หมดอายุ (Date.now() + expires_in*1000). */
  expiresAt: number;
}

const STORAGE_KEY = "pol_tokens";

let memory: TokenPair | null | undefined; // undefined = ยังไม่ hydrate จาก sessionStorage

function storage(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null; // sessionStorage โยน SecurityError ได้ (cookie/storage ถูก block)
  }
}

/** คู่ token ปัจจุบัน หรือ null เมื่อไม่มี (hydrate จาก sessionStorage ครั้งแรกหลัง full reload). */
export function getTokens(): TokenPair | null {
  if (memory === undefined) {
    const raw = storage()?.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as TokenPair) : null;
  }
  return memory;
}

/** เก็บคู่ใหม่ทันที (refresh token หมุนทุกครั้ง — คู่เก่าใช้ซ้ำ = login ถูก revoke). */
export function setTokens(pair: TokenPair): void {
  memory = pair;
  storage()?.setItem(STORAGE_KEY, JSON.stringify(pair));
}

export function clearTokens(): void {
  memory = null;
  storage()?.removeItem(STORAGE_KEY);
}

/** สำหรับ test: ลืมค่าใน memory ให้ hydrate ใหม่. */
export function resetTokenStoreForTest(): void {
  memory = undefined;
}
