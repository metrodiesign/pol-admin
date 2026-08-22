"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  PspApiError,
  getPspConnection,
  listApprovalPage,
  listMerchantPage,
} from "@/lib/api/control/psp";
import type {
  ApprovalListItem,
  ConnectionResource,
  MerchantCatalogStatus,
  MerchantOption,
} from "@/types/control/psp-connection";

const PAGE_LIMIT = 100;

function aborted(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export interface MerchantCatalogResult {
  status: Exclude<MerchantCatalogStatus, "loading">;
  items: MerchantOption[];
}

export async function loadMerchantCatalog(signal?: AbortSignal): Promise<MerchantCatalogResult> {
  const items: MerchantOption[] = [];
  const ids = new Set<string>();
  let page = 1;
  let expectedTotal: number | null = null;

  try {
    while (expectedTotal === null || items.length < expectedTotal) {
      const result = await listMerchantPage(page, PAGE_LIMIT, signal);
      const validMetadata =
        result.page === page &&
        result.limit === PAGE_LIMIT &&
        Number.isInteger(result.total) &&
        result.total >= 0 &&
        (expectedTotal === null || result.total === expectedTotal);
      if (!validMetadata) return { status: items.length ? "partial" : "error", items };
      expectedTotal ??= result.total;
      if (result.items.length === 0 && items.length < expectedTotal) {
        return { status: items.length ? "partial" : "error", items };
      }
      for (const item of result.items) {
        if (ids.has(item.id)) return { status: "partial", items };
        ids.add(item.id);
        items.push(item);
      }
      if (items.length > expectedTotal) return { status: "partial", items };
      page += 1;
    }
    return { status: "ready", items };
  } catch (error) {
    if (aborted(error)) throw error;
    if (error instanceof PspApiError && error.status === 403 && items.length === 0) {
      return { status: "forbidden", items: [] };
    }
    return { status: items.length ? "partial" : "error", items };
  }
}

export interface PendingApprovalResult {
  status: "ready" | "unavailable";
  items: ApprovalListItem[];
}

export async function loadPendingApprovals(
  signal?: AbortSignal,
  search?: string,
): Promise<PendingApprovalResult> {
  const items: ApprovalListItem[] = [];
  const ids = new Set<string>();
  let page = 1;
  let expectedTotal: number | null = null;

  try {
    while (expectedTotal === null || items.length < expectedTotal) {
      const result = await listApprovalPage(
        {
          page,
          limit: PAGE_LIMIT,
          search,
          action: "psp.credential.change",
          status: "pending",
        },
        signal,
      );
      const validMetadata =
        result.page === page &&
        result.limit === PAGE_LIMIT &&
        Number.isInteger(result.total) &&
        result.total >= 0 &&
        (expectedTotal === null || result.total === expectedTotal);
      if (!validMetadata) return { status: "unavailable", items };
      expectedTotal ??= result.total;
      if (result.items.length === 0 && items.length < expectedTotal) {
        return { status: "unavailable", items };
      }
      for (const item of result.items) {
        if (ids.has(item.approvalId)) return { status: "unavailable", items };
        ids.add(item.approvalId);
        items.push(item);
      }
      if (items.length > expectedTotal) return { status: "unavailable", items };
      page += 1;
    }
    return { status: "ready", items };
  } catch (error) {
    if (aborted(error)) throw error;
    return { status: "unavailable", items };
  }
}

export function useMerchantCatalog(enabled: boolean) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<{
    status: MerchantCatalogStatus;
    items: MerchantOption[];
  }>({ status: enabled ? "loading" : "forbidden", items: [] });

  useEffect(() => {
    const controller = new AbortController();
    if (!enabled) {
      queueMicrotask(() => {
        if (!controller.signal.aborted) setState({ status: "forbidden", items: [] });
      });
      return () => controller.abort();
    }
    queueMicrotask(() => {
      if (!controller.signal.aborted) setState({ status: "loading", items: [] });
    });
    loadMerchantCatalog(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setState(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && !aborted(error)) {
          setState({ status: "error", items: [] });
        }
      });
    return () => controller.abort();
  }, [enabled, retryKey]);

  return { ...state, retry: () => setRetryKey((key) => key + 1) };
}

export function usePendingApprovals(search?: string) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<{
    status: "loading" | "ready" | "unavailable";
    items: ApprovalListItem[];
  }>({ status: "loading", items: [] });

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) setState({ status: "loading", items: [] });
    });
    loadPendingApprovals(controller.signal, search)
      .then((result) => {
        if (!controller.signal.aborted) setState(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && !aborted(error)) {
          setState({ status: "unavailable", items: [] });
        }
      });
    return () => controller.abort();
  }, [retryKey, search]);

  return { ...state, retry: () => setRetryKey((key) => key + 1) };
}

export type ConnectionResourceState =
  | { status: "loading"; resource: null }
  | { status: "ready"; resource: ConnectionResource }
  | { status: "not-found" | "forbidden" | "error"; resource: null };

export function useConnectionResource(connectionId: string) {
  const [retryKey, setRetryKey] = useState(0);
  const generation = useRef(0);
  const [state, setState] = useState<ConnectionResourceState>({
    status: "loading",
    resource: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const requestGeneration = ++generation.current;
    queueMicrotask(() => {
      if (!controller.signal.aborted && requestGeneration === generation.current) {
        setState({ status: "loading", resource: null });
      }
    });
    getPspConnection(connectionId, controller.signal)
      .then((resource) => {
        if (requestGeneration === generation.current) setState({ status: "ready", resource });
      })
      .catch((error: unknown) => {
        if (aborted(error) || requestGeneration !== generation.current) return;
        const status =
          error instanceof PspApiError && error.status === 404
            ? "not-found"
            : error instanceof PspApiError && error.status === 403
              ? "forbidden"
              : "error";
        setState({ status, resource: null });
      });
    return () => controller.abort();
  }, [connectionId, retryKey]);

  const refetch = useCallback(() => setRetryKey((key) => key + 1), []);
  const replace = useCallback((resource: ConnectionResource) => {
    generation.current += 1;
    setState({ status: "ready", resource });
  }, []);
  return { ...state, refetch, replace };
}
