import { codeChallengeOf, randomToken } from "@/lib/auth/pkce";
import { clearTokens, getTokens, setTokens, type TokenPair } from "@/lib/auth/token-store";
import type { AdminMe, AuthBootstrapResult, AuthStatus } from "@/types/auth";

// Employee auth client — OAuth authorization code + PKCE ผ่าน OpenIddict ของ pol-core (client_id pol-admin).
// SPA ถือ access token (15 นาที) + refresh token (หมุนทุกครั้ง) ใน memory + sessionStorage; ไม่มี cookie/CSRF.
// contract: pol-core PR #261 (feature/employee-jwt-auth) — /oauth/authorize, /oauth/token, /api/v1/auth/logout, /api/v1/me*

// authorize เป็น top-level navigation ตรงไป API origin (callback ของ Entra ลงที่ API host) —
// ส่วน /oauth/token ยิงผ่าน Next rewrite (/oauth/token -> API) เหมือน /api/* ไม่ต้องตั้ง CORS.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";
const AUTHORIZE_PATH = `${API_ORIGIN}/oauth/authorize`;
const TOKEN_PATH = "/oauth/token";
const CLIENT_ID = "pol-admin";
const CALLBACK_PATH = "/auth/callback";
const PKCE_STORAGE_KEY = "pol_pkce";
/** refresh ล่วงหน้าเมื่อ access token เหลืออายุน้อยกว่านี้ (กัน request ตกขอบ expires_in). */
const REFRESH_SKEW_MS = 60_000;

// returnTo หลัง login สำเร็จ — clamp ฝั่ง FE กัน open-redirect-ish path ที่ไม่ใช่ landing ของแอป.
const RETURN_TO_ALLOWLIST: readonly string[] = ["/", "/minimals", "/dashboard"];
const DEFAULT_RETURN_TO = "/dashboard";

// --- pure helpers (node-testable) ---

/** clamp returnTo เข้า allowlist ฝั่ง FE. */
export function clampReturnTo(returnTo: string): string {
  return RETURN_TO_ALLOWLIST.includes(returnTo) ? returnTo : DEFAULT_RETURN_TO;
}

export interface AuthorizeParams {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}

/** URL เริ่ม authorization code + PKCE (scope openid offline_access เพื่อได้ refresh token). */
export function buildAuthorizeUrl({ state, codeChallenge, redirectUri }: AuthorizeParams): string {
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid offline_access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTHORIZE_PATH}?${query}`;
}

/** payload 200 ของ POST /oauth/token (OAuth มาตรฐาน; id_token ไม่ใช้). */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export function toTokenPair(body: TokenResponse, now: number = Date.now()): TokenPair {
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: now + body.expires_in * 1000,
  };
}

/** แนบ Authorization: Bearer ลง RequestInit (ไม่มี credentials/cookie). */
export function withBearer(opts: RequestInit, accessToken: string): RequestInit {
  const headers = new Headers(opts.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...opts, headers };
}

/** state ที่เก็บระหว่าง authorize -> callback (sessionStorage). */
interface PkceState {
  verifier: string;
  state: string;
  returnTo: string;
}

// --- browser bindings ---

function callbackUri(): string {
  // ต้องตรงกับ redirect URI ที่ลงทะเบียนฝั่ง API แบบ byte-match (dev: https://localhost:3001/auth/callback)
  return `${window.location.origin}${CALLBACK_PATH}`;
}

/** เริ่ม login: gen PKCE + state เก็บใน sessionStorage แล้ว full-page navigate ไป /oauth/authorize. */
export async function beginLogin(returnTo: string = DEFAULT_RETURN_TO): Promise<void> {
  const pkce: PkceState = { verifier: randomToken(), state: randomToken(), returnTo: clampReturnTo(returnTo) };
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkce));
  window.location.href = buildAuthorizeUrl({
    state: pkce.state,
    codeChallenge: await codeChallengeOf(pkce.verifier),
    redirectUri: callbackUri(),
  });
}

function tokenRequest(params: Record<string, string>): Promise<Response> {
  return fetch(TOKEN_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...params, client_id: CLIENT_ID }),
  });
}

/** อ่าน `error` จาก OAuth error body (400 {error, error_description}) หรือ http_<status>. */
async function oauthErrorOf(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `http_${res.status}`;
  } catch {
    return `http_${res.status}`;
  }
}

export type LoginCompletion = { ok: true; returnTo: string } | { ok: false; reason: string };

/**
 * หน้า /auth/callback: แลก code เป็น token คู่. consume PKCE state ออกจาก sessionStorage ก่อนยิง
 * (code ใช้ซ้ำ = OpenIddict revoke ทั้ง login — กัน effect รันซ้ำ/refresh หน้า).
 */
export async function completeLogin(search: string): Promise<LoginCompletion> {
  const params = new URLSearchParams(search);
  const raw = sessionStorage.getItem(PKCE_STORAGE_KEY);
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
  if (!raw) return { ok: false, reason: "pkce_missing" };
  const pkce = JSON.parse(raw) as PkceState;

  const error = params.get("error");
  if (error) return { ok: false, reason: error };
  const code = params.get("code");
  if (!code || params.get("state") !== pkce.state) return { ok: false, reason: "state_mismatch" };

  try {
    const res = await tokenRequest({
      grant_type: "authorization_code",
      code,
      code_verifier: pkce.verifier,
      redirect_uri: callbackUri(),
    });
    if (res.status !== 200) return { ok: false, reason: await oauthErrorOf(res) };
    setTokens(toTokenPair((await res.json()) as TokenResponse));
    return { ok: true, returnTo: clampReturnTo(pkce.returnTo) };
  } catch {
    return { ok: false, reason: "network" };
  }
}

// refresh token หมุนทุกครั้งและใช้ซ้ำไม่ได้ (ซ้ำ = revoke ทั้ง login) จึงต้อง single-flight เสมอ
let refreshInFlight: Promise<TokenPair | null> | null = null;

/**
 * POST /oauth/token grant_type=refresh_token (dedupe). คืนคู่ใหม่ หรือ null เมื่อต่อไม่ได้:
 * 400 invalid_grant = login ตาย -> ล้าง token; network/5xx = คง token เดิม (ไม่ logout เพราะเน็ตหลุด).
 */
export function refreshTokens(): Promise<TokenPair | null> {
  refreshInFlight ??= (async () => {
    const current = getTokens();
    if (!current) return null;
    try {
      const res = await tokenRequest({ grant_type: "refresh_token", refresh_token: current.refreshToken });
      if (res.status === 200) {
        const pair = toTokenPair((await res.json()) as TokenResponse);
        setTokens(pair);
        return pair;
      }
      if (res.status === 400) clearTokens();
      return null;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** access token ที่ยังใช้ได้ (refresh ล่วงหน้าเมื่อใกล้หมด) หรือ null เมื่อไม่มี login. */
async function currentAccessToken(): Promise<string | null> {
  const pair = getTokens();
  if (!pair) return null;
  if (pair.expiresAt - Date.now() > REFRESH_SKEW_MS) return pair.accessToken;
  await refreshTokens();
  return getTokens()?.accessToken ?? null; // refresh ล้มเพราะเน็ต -> ใช้ token เดิม ให้ 401 ตัดสิน
}

export interface AdminFetchOptions extends RequestInit {
  /** default true; false = ไม่เด้งไป login เมื่อเจอ 401 (ใช้โดย getMe ให้ guard เป็นคนตัดสิน). */
  redirectOnUnauthorized?: boolean;
}

/** fetch API ด้วย Bearer; 401 -> refresh 1 ครั้ง (single-flight) แล้ว retry; ยัง 401 -> ล้าง token (+เด้ง /login). */
export async function adminFetch(
  path: string,
  opts: AdminFetchOptions = {},
): Promise<Response> {
  const { redirectOnUnauthorized = true, ...init } = opts;
  const token = await currentAccessToken();
  let res = token ? await fetch(path, withBearer(init, token)) : new Response(null, { status: 401 });
  if (res.status === 401 && token) {
    const fresh = await refreshTokens();
    if (fresh) res = await fetch(path, withBearer(init, fresh.accessToken));
  }
  if (res.status === 401) {
    clearTokens();
    if (redirectOnUnauthorized) window.location.href = "/login"; // login ตาย -> ผู้ใช้เริ่ม SSO เอง
  }
  return res;
}

/** payload GET /api/v1/me (เฉพาะ field ที่ใช้). */
interface MeResponse {
  accountId: string;
  displayName: string | null;
  email: string | null;
}

/** payload GET /api/v1/me/access (เฉพาะ field ที่ใช้). */
interface AccessResponse {
  hasPlatformAccess: boolean;
  permissions: string[];
}

/** ประกอบ AdminMe จาก /me + /me/access (permissions ใช้ vocabulary Iam Keys เดียวกับ stack เก่า). */
export function toAdminMe(me: MeResponse, access: AccessResponse): AdminMe {
  return {
    adminId: me.accountId,
    displayName: me.displayName,
    email: me.email ?? null,
    hasPlatformAccess: access.hasPlatformAccess,
    permissions: access.permissions,
  };
}

/** GET /api/v1/me + /api/v1/me/access — ไม่มี token = anon ทันที; แยก auth failure ออกจาก bootstrap/system failure. */
export async function getMe(): Promise<AuthBootstrapResult> {
  if (!getTokens()) return { status: "anon", me: null };
  try {
    const [meRes, accessRes] = await Promise.all([
      adminFetch("/api/v1/me", { redirectOnUnauthorized: false }),
      adminFetch("/api/v1/me/access", { redirectOnUnauthorized: false }),
    ]);
    const status = meRes.status === 200 ? accessRes.status : meRes.status;
    if (status === 401) return { status: "anon", me: null };
    if (status === 403) return { status: "forbidden", me: null };
    if (status !== 200) return { status: "error", me: null };
    const [me, access] = (await Promise.all([meRes.json(), accessRes.json()])) as [MeResponse, AccessResponse];
    return { status: "authed", me: toAdminMe(me, access) };
  } catch {
    return { status: "error", me: null };
  }
}

export function shouldRedirectToLogin(status: AuthStatus): boolean {
  return status === "anon";
}

/** authenticated session ที่ไม่มี effective permission ต้องแสดง Inline 403 โดยไม่ mount protected child. */
export function shouldShowForbidden(status: AuthStatus, me: AdminMe | null): boolean {
  return status === "forbidden" || (status === "authed" && me !== null && me.permissions.length === 0);
}

/** 204 = logout สำเร็จ (revoke ทั้ง access/refresh), 401 = token ตายอยู่แล้ว (terminal logged-out). */
export function isLogoutSuccessStatus(status: number): boolean {
  return status === 204 || status === 401;
}

/** ออกจากระบบ POST /api/v1/auth/logout พร้อม Bearer แล้วล้าง token ฝั่ง SPA; ไม่มี token = logged-out อยู่แล้ว. */
export async function logout(): Promise<Response> {
  const pair = getTokens();
  if (!pair) return new Response(null, { status: 401 });
  const response = await fetch("/api/v1/auth/logout", withBearer({ method: "POST" }, pair.accessToken));
  if (!isLogoutSuccessStatus(response.status)) throw new Error("admin-logout-failed");
  clearTokens();
  return response;
}
