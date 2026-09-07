import {
  mutationInit,
  responseJson,
  withQuery,
} from "@/lib/api/control/psp";
import type {
  AccountMethodResource,
  AccountMethodState,
  CandidateTestResult,
  EnvironmentChangeAccepted,
  EnvironmentChangeInput,
  MerchantMethodResource,
  MerchantMethodState,
  MerchantPaymentSettings,
  MerchantPaymentSettingsResource,
  RoutingActivationAccepted,
  RoutingRuleset,
  SimpleRoutingResource,
  SimpleRoutingRow,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type {
  PagedResult,
  PspConnection,
  PspMethod,
} from "@/types/control/psp-connection";

const BASE = "/api/v1/payments";
const PAGE_LIMIT = 100;

function enc(value: string): string {
  return encodeURIComponent(value);
}

export async function getMerchantPaymentSettings(
  merchantId: string,
  signal?: AbortSignal,
): Promise<MerchantPaymentSettingsResource> {
  const { value, response } = await responseJson<MerchantPaymentSettings>(
    `${BASE}/merchant-settings/${enc(merchantId)}`,
    { signal },
  );
  return { settings: value, etag: response.headers.get("ETag") };
}

export async function requestEnvironmentChange(
  merchantId: string,
  input: EnvironmentChangeInput,
  etag: string,
  idempotencyKey: string,
): Promise<EnvironmentChangeAccepted> {
  return (
    await responseJson<EnvironmentChangeAccepted>(
      `${BASE}/merchant-settings/${enc(merchantId)}/environment-change-requests`,
      mutationInit("POST", input, idempotencyKey, etag),
    )
  ).value;
}

export async function getAccountMethod(
  connectionId: string,
  method: PspMethod,
  signal?: AbortSignal,
): Promise<AccountMethodResource> {
  const { value, response } = await responseJson<AccountMethodState>(
    `${BASE}/psp-connections/${enc(connectionId)}/methods/${enc(method)}`,
    { signal },
  );
  return { state: value, etag: response.headers.get("ETag") };
}

export async function setAccountMethod(
  connectionId: string,
  method: PspMethod,
  enabled: boolean,
  etag: string,
  idempotencyKey: string,
): Promise<AccountMethodResource> {
  const { value, response } = await responseJson<AccountMethodState>(
    `${BASE}/psp-connections/${enc(connectionId)}/methods/${enc(method)}`,
    mutationInit("PUT", { enabled }, idempotencyKey, etag),
  );
  return { state: value, etag: response.headers.get("ETag") };
}

export async function getMerchantMethod(
  merchantId: string,
  method: PspMethod,
  signal?: AbortSignal,
): Promise<MerchantMethodResource> {
  const { value, response } = await responseJson<MerchantMethodState>(
    `${BASE}/merchants/${enc(merchantId)}/methods/${enc(method)}`,
    { signal },
  );
  return { state: value, etag: response.headers.get("ETag") };
}

export async function setMerchantMethod(
  merchantId: string,
  method: PspMethod,
  enabled: boolean,
  etag: string,
  idempotencyKey: string,
): Promise<MerchantMethodResource> {
  const { value, response } = await responseJson<MerchantMethodState>(
    `${BASE}/merchants/${enc(merchantId)}/methods/${enc(method)}`,
    mutationInit("PUT", { enabled }, idempotencyKey, etag),
  );
  return { state: value, etag: response.headers.get("ETag") };
}

interface EffectiveMethodsWire {
  methods: string[];
}

export async function listEffectiveMethods(
  merchantId: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const { value } = await responseJson<EffectiveMethodsWire | string[]>(
    `${BASE}/merchants/${enc(merchantId)}/methods`,
    { signal },
  );
  return Array.isArray(value) ? value : (value.methods ?? []);
}

export async function listRoutingRulesets(
  merchantId: string,
  signal?: AbortSignal,
): Promise<RoutingRuleset[]> {
  const items: RoutingRuleset[] = [];
  const ids = new Set<string>();
  let page = 1;
  let expectedTotal: number | null = null;
  while (expectedTotal === null || items.length < expectedTotal) {
    const path = withQuery(`${BASE}/routing-rulesets`, {
      merchantId,
      page,
      limit: PAGE_LIMIT,
    });
    const result = (await responseJson<PagedResult<RoutingRuleset>>(path, { signal })).value;
    const validMetadata =
      result.page === page &&
      result.limit === PAGE_LIMIT &&
      Number.isInteger(result.total) &&
      result.total >= 0 &&
      (expectedTotal === null || result.total === expectedTotal);
    if (!validMetadata) break;
    expectedTotal ??= result.total;
    if (result.items.length === 0) break;
    let advanced = false;
    for (const item of result.items) {
      if (ids.has(item.rulesetId)) {
        advanced = false;
        break;
      }
      ids.add(item.rulesetId);
      items.push(item);
      advanced = true;
    }
    if (!advanced) break;
    page += 1;
  }
  return items;
}

export async function getSimpleRouting(
  merchantId: string,
  signal?: AbortSignal,
): Promise<SimpleRoutingResource> {
  const { value, response } = await responseJson<SimpleRoutingView>(
    `${BASE}/merchant-settings/${enc(merchantId)}/simple-routing`,
    { signal },
  );
  return { routing: value, etag: response.headers.get("ETag") };
}

export async function putSimpleRouting(
  merchantId: string,
  rows: SimpleRoutingRow[],
  etag: string,
  idempotencyKey: string,
): Promise<SimpleRoutingResource> {
  const { value, response } = await responseJson<SimpleRoutingView>(
    `${BASE}/merchant-settings/${enc(merchantId)}/simple-routing`,
    mutationInit("PUT", { rows }, idempotencyKey, etag),
  );
  return { routing: value, etag: response.headers.get("ETag") };
}

export async function requestRoutingActivation(
  rulesetId: string,
  etag: string,
  idempotencyKey: string,
): Promise<RoutingActivationAccepted> {
  return (
    await responseJson<RoutingActivationAccepted>(
      `${BASE}/routing-rulesets/${enc(rulesetId)}/activation-requests`,
      mutationInit("POST", {}, idempotencyKey, etag),
    )
  ).value;
}

export async function testCandidateCredential(
  connectionId: string,
  approvalId: string,
  etag: string,
  idempotencyKey: string,
): Promise<CandidateTestResult> {
  return (
    await responseJson<CandidateTestResult>(
      `${BASE}/psp-connections/${enc(connectionId)}/credential-change-requests/${enc(approvalId)}/test`,
      mutationInit("POST", {}, idempotencyKey, etag),
    )
  ).value;
}

/** Scoped connection list ต่อร้าน (design.md 589) — reuse core list endpoint. */
export async function listMerchantConnections(
  merchantId: string,
  signal?: AbortSignal,
): Promise<PspConnection[]> {
  const path = withQuery(`${BASE}/psp-connections`, {
    merchantId,
    page: 1,
    limit: PAGE_LIMIT,
  });
  const result = (await responseJson<PagedResult<PspConnection>>(path, { signal })).value;
  return result.items;
}
