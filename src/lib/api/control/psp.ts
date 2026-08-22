import { adminFetch } from "@/lib/api/admin/auth";
import type {
  ApprovalListItem,
  ConnectionResource,
  CreatePspConnectionInput,
  CredentialChangeAccepted,
  CredentialChangeInput,
  MerchantOption,
  PagedResult,
  PspConnection,
  PspHealth,
  PspProvider,
  TestPspConnectionInput,
  UpdatePspConnectionInput,
} from "@/types/control/psp-connection";

export interface PspListQuery {
  page: number;
  limit: number;
  search?: string;
  merchantId?: string;
  psp?: PspProvider;
  health?: PspHealth;
}

export interface ApprovalListQuery {
  page: number;
  limit: number;
  search?: string;
  action?: string;
  status?: string;
  merchantId?: string;
}

export class PspApiError extends Error {
  constructor(
    public readonly status: number | null,
    public readonly code: string | null,
  ) {
    super(status === null ? "PSP API request failed" : `PSP API request failed (${status})`);
    this.name = "PspApiError";
  }
}

function addQueryValue(params: URLSearchParams, name: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  params.set(name, String(value));
}

function withQuery(path: string, values: object): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(values)) addQueryValue(params, name, value);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readSafeCode(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (!isRecord(body)) return null;
    if (typeof body.code === "string") return body.code;
    return isRecord(body.extensions) && typeof body.extensions.code === "string"
      ? body.extensions.code
      : null;
  } catch {
    return null;
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    const response = await adminFetch(path, init);
    if (!response.ok) throw new PspApiError(response.status, await readSafeCode(response));
    return response;
  } catch (error) {
    if (error instanceof PspApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new PspApiError(null, null);
  }
}

async function responseJson<T>(path: string, init?: RequestInit): Promise<{ value: T; response: Response }> {
  const response = await request(path, init);
  return { value: (await response.json()) as T, response };
}

function mutationInit(
  method: "POST" | "PUT",
  body: unknown,
  idempotencyKey: string,
  etag?: string,
): RequestInit {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
  });
  if (etag !== undefined) headers.set("If-Match", etag);
  return { method, headers, body: JSON.stringify(body) };
}

export async function listPspConnections(
  query: PspListQuery,
  signal?: AbortSignal,
): Promise<PagedResult<PspConnection>> {
  const path = withQuery("/api/v1/payments/psp-connections", query);
  return (await responseJson<PagedResult<PspConnection>>(path, { signal })).value;
}

export async function getPspConnection(
  id: string,
  signal?: AbortSignal,
): Promise<ConnectionResource> {
  const { value, response } = await responseJson<PspConnection>(
    `/api/v1/payments/psp-connections/${encodeURIComponent(id)}`,
    { signal },
  );
  return { connection: value, etag: response.headers.get("ETag") };
}

export async function createPspConnection(
  input: CreatePspConnectionInput,
  idempotencyKey: string,
): Promise<ConnectionResource> {
  const { value, response } = await responseJson<PspConnection>(
    "/api/v1/payments/psp-connections",
    mutationInit("POST", input, idempotencyKey),
  );
  return { connection: value, etag: response.headers.get("ETag") };
}

export async function updatePspConnection(
  id: string,
  input: UpdatePspConnectionInput,
  etag: string,
  idempotencyKey: string,
): Promise<ConnectionResource> {
  const { value, response } = await responseJson<PspConnection>(
    `/api/v1/payments/psp-connections/${encodeURIComponent(id)}`,
    mutationInit("PUT", input, idempotencyKey, etag),
  );
  return { connection: value, etag: response.headers.get("ETag") };
}

export async function testPspConnection(
  id: string,
  input: TestPspConnectionInput,
  etag: string,
  idempotencyKey: string,
): Promise<ConnectionResource> {
  const { value, response } = await responseJson<PspConnection>(
    `/api/v1/payments/psp-connections/${encodeURIComponent(id)}/test`,
    mutationInit("POST", input, idempotencyKey, etag),
  );
  return { connection: value, etag: response.headers.get("ETag") };
}

export async function requestCredentialChange(
  id: string,
  input: CredentialChangeInput,
  etag: string,
  idempotencyKey: string,
): Promise<CredentialChangeAccepted> {
  return (
    await responseJson<CredentialChangeAccepted>(
      `/api/v1/payments/psp-connections/${encodeURIComponent(id)}/credential-change-requests`,
      mutationInit("POST", input, idempotencyKey, etag),
    )
  ).value;
}

interface MerchantWireItem {
  id: string;
  name: string;
  code: string;
}

export async function listMerchantPage(
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<PagedResult<MerchantOption>> {
  const result = (
    await responseJson<PagedResult<MerchantWireItem>>(
      withQuery("/api/v1/merchants", { page, limit }),
      { signal },
    )
  ).value;
  return { ...result, items: result.items.map(({ id, name, code }) => ({ id, name, code })) };
}

interface ApprovalWireItem extends ApprovalListItem {
  [key: string]: unknown;
}

export async function listApprovalPage(
  query: ApprovalListQuery,
  signal?: AbortSignal,
): Promise<PagedResult<ApprovalListItem>> {
  const result = (
    await responseJson<PagedResult<ApprovalWireItem>>(
      withQuery("/api/v1/approvals", query),
      { signal },
    )
  ).value;
  return {
    ...result,
    items: result.items.map(({ approvalId, merchantId, action, targetId, status }) => ({
      approvalId,
      merchantId,
      action,
      targetId,
      status,
    })),
  };
}
