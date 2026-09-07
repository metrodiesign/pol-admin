"use client";

import { useState } from "react";

import { cardStyle } from "@/components/control/shared/styles";
import { Switch } from "@/components/ui/switch";
import {
  setAccountMethod,
  setMerchantMethod,
} from "@/lib/api/control/merchant-payment-settings";
import { PspApiError } from "@/lib/api/control/psp";
import {
  METHOD_LABEL,
  PROVIDER_LABEL,
} from "@/lib/control/psp";
import {
  SETTINGS_PROVIDERS,
  buildMethodMatrix,
  mapSettingsProblem,
  methodToggleGate,
  type ProviderMethodCell,
} from "@/lib/control/merchant-psp-settings";
import { cn } from "@/lib/utils";
import type {
  AccountMethodResource,
  MerchantMethodResource,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type { PspConnection, PspMethod, PspProvider } from "@/types/control/psp-connection";

const CELL_LABEL: Record<ProviderMethodCell["status"], string> = {
  "not-connected": "ยังไม่เชื่อมต่อ",
  enabled: "เปิดใช้",
  disabled: "ปิดใช้",
  unavailable: "ยังไม่พร้อม",
};

interface MethodMatrixProps {
  connections: PspConnection[];
  merchantMethods: MerchantMethodResource[];
  accountMethods: AccountMethodResource[];
  routing: SimpleRoutingView | null;
  permissions: readonly string[];
  merchantId: string;
  onChanged: () => void;
}

export function MethodMatrix({
  connections,
  merchantMethods,
  accountMethods,
  routing,
  permissions,
  merchantId,
  onChanged,
}: MethodMatrixProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; canRefetch: boolean } | null>(null);
  const canManage = permissions.includes("merchant.manage");

  const rows = buildMethodMatrix({
    connections,
    merchantMethods: merchantMethods.map((resource) => resource.state),
    accountMethods: accountMethods.map((resource) => resource.state),
    routing,
  });

  const merchantEtag = (method: PspMethod): string | null =>
    merchantMethods.find((resource) => resource.state.method === method)?.etag ?? null;
  const accountEtag = (connectionId: string, method: PspMethod): string | null =>
    accountMethods.find(
      (resource) =>
        resource.state.pspConnectionId === connectionId && resource.state.method === method,
    )?.etag ?? null;
  const connectionByProvider = (provider: PspProvider): PspConnection | undefined =>
    connections.find((connection) => connection.psp === provider);

  const runToggle = async (key: string, action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(key);
    setNotice(null);
    try {
      await action();
      onChanged();
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapSettingsProblem(apiError.status, apiError.code, "method");
      setNotice({ message: mapped.message, canRefetch: mapped.refetch });
      if (mapped.refetch) onChanged();
    } finally {
      setBusy(null);
    }
  };

  const toggleMerchant = (method: PspMethod, enabled: boolean) => {
    const etag = merchantEtag(method);
    const gate = methodToggleGate(permissions, etag);
    if (!gate.allowed || !etag) return;
    void runToggle(`m:${method}`, () =>
      setMerchantMethod(merchantId, method, !enabled, etag, crypto.randomUUID()),
    );
  };

  const toggleAccount = (connectionId: string, method: PspMethod, enabled: boolean) => {
    const etag = accountEtag(connectionId, method);
    const gate = methodToggleGate(permissions, etag);
    if (!gate.allowed || !etag) return;
    void runToggle(`a:${connectionId}:${method}`, () =>
      setAccountMethod(connectionId, method, !enabled, etag, crypto.randomUUID()),
    );
  };

  return (
    <section className="rounded-card bg-card p-6" style={cardStyle} aria-label="ช่องทางชำระเงิน">
      <h2 className="text-lg font-bold leading-7 text-foreground">ช่องทางชำระเงิน</h2>
      <p className="mt-1 text-sm text-grey-600">
        แยกนโยบายระดับร้านค้าออกจากความพร้อมของแต่ละผู้ให้บริการ
      </p>
      {notice ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-error" role="alert">
          <span>{notice.message}</span>
          {notice.canRefetch ? (
            <button
              type="button"
              onClick={onChanged}
              className="inline-flex h-8 items-center rounded-control bg-grey-600/8 px-3 text-xs font-semibold text-grey-800 hover:bg-grey-600/16"
            >
              โหลดข้อมูลใหม่
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-medium text-grey-600">
              <th className="py-2 pr-4">ช่องทาง</th>
              <th className="py-2 pr-4">ร้านค้า</th>
              {SETTINGS_PROVIDERS.map((provider) => (
                <th key={provider} className="py-2 pr-4">
                  {PROVIDER_LABEL[provider]}
                </th>
              ))}
              <th className="py-2 pr-4">หลัก</th>
              <th className="py-2">สำรอง</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.method} className="border-t border-[var(--divider)] align-top">
                <td className="py-3 pr-4 font-semibold text-foreground">{METHOD_LABEL[row.method]}</td>
                <td className="py-3 pr-4">
                  <MerchantToggle
                    method={row.method}
                    enabled={row.merchant?.enabled ?? false}
                    canManage={canManage}
                    hasEtag={merchantEtag(row.method) !== null}
                    busy={busy === `m:${row.method}`}
                    onToggle={() => toggleMerchant(row.method, row.merchant?.enabled ?? false)}
                  />
                </td>
                {SETTINGS_PROVIDERS.map((provider) => {
                  const cell = row.providers[provider];
                  const connection = connectionByProvider(provider);
                  return (
                    <td key={provider} className="py-3 pr-4">
                      <ProviderCell
                        cell={cell}
                        canManage={canManage}
                        hasEtag={
                          connection ? accountEtag(connection.pspConnectionId, row.method) !== null : false
                        }
                        busy={
                          connection ? busy === `a:${connection.pspConnectionId}:${row.method}` : false
                        }
                        onToggle={() =>
                          connection &&
                          toggleAccount(
                            connection.pspConnectionId,
                            row.method,
                            cell.status === "enabled",
                          )
                        }
                      />
                    </td>
                  );
                })}
                <td className="py-3 pr-4 text-grey-700">
                  {row.primaryConnectionId ? providerName(connections, row.primaryConnectionId) : "-"}
                </td>
                <td className="py-3 text-grey-700">
                  {row.fallbackConnectionId ? providerName(connections, row.fallbackConnectionId) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 flex flex-col gap-4 md:hidden">
        {rows.map((row) => (
          <div key={row.method} className="rounded-xl border border-[var(--divider)] p-4">
            <p className="font-semibold text-foreground">{METHOD_LABEL[row.method]}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-grey-600">ร้านค้า</span>
              <MerchantToggle
                method={row.method}
                enabled={row.merchant?.enabled ?? false}
                canManage={canManage}
                hasEtag={merchantEtag(row.method) !== null}
                busy={busy === `m:${row.method}`}
                onToggle={() => toggleMerchant(row.method, row.merchant?.enabled ?? false)}
              />
            </div>
            {SETTINGS_PROVIDERS.map((provider) => {
              const cell = row.providers[provider];
              const connection = connectionByProvider(provider);
              return (
                <div key={provider} className="mt-3 flex items-start justify-between gap-3">
                  <span className="text-sm text-grey-600">{PROVIDER_LABEL[provider]}</span>
                  <ProviderCell
                    cell={cell}
                    canManage={canManage}
                    hasEtag={
                      connection ? accountEtag(connection.pspConnectionId, row.method) !== null : false
                    }
                    busy={connection ? busy === `a:${connection.pspConnectionId}:${row.method}` : false}
                    onToggle={() =>
                      connection &&
                      toggleAccount(connection.pspConnectionId, row.method, cell.status === "enabled")
                    }
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function providerName(connections: PspConnection[], connectionId: string): string {
  const connection = connections.find((item) => item.pspConnectionId === connectionId);
  return connection ? PROVIDER_LABEL[connection.psp] : connectionId;
}

function MerchantToggle({
  method,
  enabled,
  canManage,
  hasEtag,
  busy,
  onToggle,
}: {
  method: PspMethod;
  enabled: boolean;
  canManage: boolean;
  hasEtag: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  if (!canManage) {
    return <span className="text-sm text-grey-700">{enabled ? "เปิดใช้" : "ปิดใช้"}</span>;
  }
  return (
    <Switch
      checked={enabled}
      disabled={!hasEtag || busy}
      onCheckedChange={onToggle}
      aria-label={`สลับช่องทาง ${METHOD_LABEL[method]} ระดับร้านค้า`}
    />
  );
}

function ProviderCell({
  cell,
  canManage,
  hasEtag,
  busy,
  onToggle,
}: {
  cell: ProviderMethodCell;
  canManage: boolean;
  hasEtag: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  if (cell.status === "not-connected") {
    return <span className="text-sm text-grey-500">{CELL_LABEL["not-connected"]}</span>;
  }
  const showToggle = canManage && cell.status !== "unavailable";
  return (
    <div className="flex flex-col gap-1">
      {showToggle ? (
        <Switch
          checked={cell.status === "enabled"}
          disabled={!hasEtag || busy}
          onCheckedChange={onToggle}
          aria-label="สลับช่องทางระดับบัญชี"
        />
      ) : (
        <span
          className={cn(
            "text-sm",
            cell.status === "enabled" ? "text-success-dark" : "text-grey-600",
          )}
        >
          {CELL_LABEL[cell.status]}
        </span>
      )}
      {cell.status !== "enabled" && cell.reason ? (
        <span className="text-xs text-grey-500">{cell.reason}</span>
      ) : null}
    </div>
  );
}
