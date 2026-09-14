// ที่เก็บ token คู่ (access + refresh) ของ employee login — localStorage เพื่อให้ทุกแท็บของ origin เดียวกัน
// เห็นคู่ล่าสุดเสมอ (refresh token หมุนทุกครั้ง ใช้ซ้ำ = login ถูก revoke ทั้งชุด) อ่านสดจาก storage ทุกครั้ง
// ไม่ cache ใน memory เพราะแท็บอื่นอาจเขียนทับ; memory ใช้เฉพาะเมื่อ storage ใช้ไม่ได้ (SSR/test/blocked).

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** epoch ms ที่ access token หมดอายุ (Date.now() + expires_in*1000). */
  expiresAt: number;
}

export const TOKEN_STORAGE_KEY = "pol_tokens";

let memoryFallback: TokenPair | null = null;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null; // localStorage โยน SecurityError ได้ (storage ถูก block)
  }
}

/** คู่ token ปัจจุบัน (ล่าสุดจากทุกแท็บ) หรือ null เมื่อไม่มี. */
export function getTokens(): TokenPair | null {
  const store = storage();
  if (!store) return memoryFallback;
  try {
    const raw = store.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenPair) : null;
  } catch {
    return null;
  }
}

/** เก็บคู่ใหม่ทันที — แท็บอื่นอ่านเจอในการเรียก getTokens ครั้งถัดไป. */
export function setTokens(pair: TokenPair): void {
  memoryFallback = pair;
  storage()?.setItem(TOKEN_STORAGE_KEY, JSON.stringify(pair));
}

export function clearTokens(): void {
  memoryFallback = null;
  storage()?.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * รัน `work` ภายใต้ lock ข้ามแท็บ (Web Locks API) — ใช้ล้อม refresh ให้แท็บเดียวหมุน token ทีละครั้ง.
 * browser ที่ไม่มี navigator.locks รันตรง ๆ (best-effort).
 */
export function withCrossTabLock<T>(name: string, work: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  return locks ? (locks.request(name, work) as Promise<T>) : work();
}
