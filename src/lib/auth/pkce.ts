// PKCE (RFC 7636) ด้วย WebCrypto — ไม่มี dependency. ใช้ใน browser เท่านั้น (globalThis.crypto).

/** bytes -> base64url (ไม่มี padding) ตาม RFC 7636 §4.1/4.2. */
export function base64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** random string 43 ตัวอักษร (32 bytes) ใช้เป็น code_verifier และ state. */
export function randomToken(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

/** code_challenge = base64url(SHA-256(verifier)). */
export async function codeChallengeOf(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}
