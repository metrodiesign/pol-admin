"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PspApiError } from "@/lib/api/control/psp";
import {
  getMerchantPaymentSettings,
  getSimpleRouting,
  listEffectiveMethods,
  listMerchantConnections,
  listRoutingRulesets,
  getAccountMethod,
  getMerchantMethod,
} from "@/lib/api/control/merchant-payment-settings";
import { CANONICAL_METHODS, SETTINGS_APPROVAL_ACTIONS } from "@/lib/control/merchant-psp-settings";
import { loadPendingApprovals } from "@/components/control/psp/resource-hooks";
import type {
  AccountMethodResource,
  MerchantMethodResource,
  MerchantPaymentSettings,
  RoutingRuleset,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type { ApprovalListItem, PspConnection } from "@/types/control/psp-connection";

function aborted(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export type SectionStatus = "ready" | "unavailable";

export interface MerchantPaymentSettingsData {
  settings: MerchantPaymentSettings;
  settingsEtag: string | null;
  connections: PspConnection[];
  merchantMethods: MerchantMethodResource[];
  accountMethods: AccountMethodResource[];
  effectiveMethods: string[];
  ruleset: RoutingRuleset | null;
  routing: SimpleRoutingView | null;
  routingEtag: string | null;
  approvals: ApprovalListItem[] | null;
  sections: {
    connections: SectionStatus;
    methods: SectionStatus;
    routing: SectionStatus;
    approvals: SectionStatus;
  };
}

type State =
  | { status: "loading"; data: null }
  | { status: "ready"; data: MerchantPaymentSettingsData }
  | { status: "not-found" | "forbidden" | "error"; data: null };

async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (aborted(error)) throw error;
    return null;
  }
}

export async function loadData(
  merchantId: string,
  signal: AbortSignal,
): Promise<State> {
  let settingsResource;
  try {
    settingsResource = await getMerchantPaymentSettings(merchantId, signal);
  } catch (error) {
    if (aborted(error)) throw error;
    if (error instanceof PspApiError && error.status === 404) return { status: "not-found", data: null };
    if (error instanceof PspApiError && error.status === 403) return { status: "forbidden", data: null };
    return { status: "error", data: null };
  }

  const [connections, merchantMethodResults, effectiveMethods, rulesets, routingResource, approvals] =
    await Promise.all([
      settled(listMerchantConnections(merchantId, signal)),
      Promise.all(
        CANONICAL_METHODS.map((method) => settled(getMerchantMethod(merchantId, method, signal))),
      ),
      settled(listEffectiveMethods(merchantId, signal)),
      settled(listRoutingRulesets(merchantId, signal)),
      settled(getSimpleRouting(merchantId, signal)),
      loadPendingApprovals(signal, undefined, { action: null, merchantId }).catch((error: unknown) => {
        if (aborted(error)) throw error;
        return { status: "unavailable" as const, items: [] };
      }),
    ]);

  const connectionList = connections ?? [];
  const accountMethodResults = connectionList.length
    ? await Promise.all(
        connectionList.flatMap((connection) =>
          CANONICAL_METHODS.map((method) =>
            settled(getAccountMethod(connection.pspConnectionId, method, signal)),
          ),
        ),
      )
    : [];

  const merchantMethods = merchantMethodResults.filter(
    (result): result is MerchantMethodResource => result !== null,
  );
  const accountMethods = accountMethodResults.filter(
    (result): result is AccountMethodResource => result !== null,
  );

  const methodsAvailable =
    connections !== null &&
    effectiveMethods !== null &&
    merchantMethods.length === CANONICAL_METHODS.length &&
    accountMethods.length === connectionList.length * CANONICAL_METHODS.length;

  const routingAvailable = routingResource !== null && rulesets !== null;
  const approvalItems = approvals.status === "ready" ? approvals.items : null;
  const scopedApprovals = approvalItems
    ? approvalItems.filter((item) => SETTINGS_APPROVAL_ACTIONS.includes(item.action))
    : null;

  return {
    status: "ready",
    data: {
      settings: settingsResource.settings,
      settingsEtag: settingsResource.etag,
      connections: connectionList,
      merchantMethods,
      accountMethods,
      effectiveMethods: effectiveMethods ?? [],
      ruleset: rulesets?.[0] ?? null,
      routing: routingResource?.routing ?? null,
      routingEtag: routingResource?.etag ?? null,
      approvals: scopedApprovals,
      sections: {
        connections: connections !== null ? "ready" : "unavailable",
        methods: methodsAvailable ? "ready" : "unavailable",
        routing: routingAvailable ? "ready" : "unavailable",
        approvals: scopedApprovals !== null ? "ready" : "unavailable",
      },
    },
  };
}

export function useMerchantPaymentSettings(merchantId: string) {
  const [retryKey, setRetryKey] = useState(0);
  const generation = useRef(0);
  const loadedMerchant = useRef<string | null>(null);
  const [state, setState] = useState<State>({ status: "loading", data: null });

  useEffect(() => {
    const controller = new AbortController();
    const requestGeneration = ++generation.current;
    // refetch ของ merchant เดิมที่มี data แล้วต้องคง subtree ไว้ (ไม่กลับไป loading)
    // เพื่อไม่ให้ notice conflict/refetch ถูก unmount ก่อนผู้ใช้เห็น (AC-6)
    const isNewMerchant = loadedMerchant.current !== merchantId;
    loadedMerchant.current = merchantId;
    queueMicrotask(() => {
      if (!controller.signal.aborted && requestGeneration === generation.current) {
        setState((current) =>
          isNewMerchant || current.status !== "ready" ? { status: "loading", data: null } : current,
        );
      }
    });
    loadData(merchantId, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted && requestGeneration === generation.current) setState(next);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && requestGeneration === generation.current && !aborted(error)) {
          setState({ status: "error", data: null });
        }
      });
    return () => controller.abort();
  }, [merchantId, retryKey]);

  const refetch = useCallback(() => setRetryKey((key) => key + 1), []);

  const replaceConnection = useCallback((connection: PspConnection) => {
    setState((current) => {
      if (current.status !== "ready") return current;
      return {
        status: "ready",
        data: {
          ...current.data,
          connections: current.data.connections.map((existing) =>
            existing.pspConnectionId === connection.pspConnectionId ? connection : existing,
          ),
        },
      };
    });
  }, []);

  return { ...state, refetch, replaceConnection };
}
