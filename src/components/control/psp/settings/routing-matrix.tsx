"use client";

import Link from "next/link";
import { useState } from "react";

import { cardStyle } from "@/components/control/shared/styles";
import {
  putSimpleRouting,
  requestRoutingActivation,
} from "@/lib/api/control/merchant-payment-settings";
import { PspApiError } from "@/lib/api/control/psp";
import { METHOD_LABEL } from "@/lib/control/psp";
import {
  hasAdvancedRules,
  mapSettingsProblem,
  resolveActivationTarget,
  routingCandidates,
  simpleRowsFromRuleset,
  validateSimpleRouting,
  type RoutingCandidate,
} from "@/lib/control/merchant-psp-settings";
import { cn } from "@/lib/utils";
import type {
  RoutingRuleset,
  SimpleRoutingRow,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type {
  AccountMethodResource,
  MerchantMethodResource,
} from "@/types/control/merchant-payment-settings";
import type { PaymentEnvironment, PspConnection, PspMethod } from "@/types/control/psp-connection";

interface RoutingMatrixProps {
  connections: PspConnection[];
  accountMethods: AccountMethodResource[];
  merchantMethods: MerchantMethodResource[];
  routing: SimpleRoutingView | null;
  routingEtag: string | null;
  ruleset: RoutingRuleset | null;
  environment: PaymentEnvironment;
  permissions: readonly string[];
  merchantId: string;
  onChanged: () => void;
}

function candidateLabel(candidate: RoutingCandidate): string {
  return candidate.disabledReason
    ? `${candidate.label} (${candidate.disabledReason})`
    : candidate.label;
}

export function RoutingMatrix({
  connections,
  accountMethods,
  merchantMethods,
  routing,
  routingEtag,
  ruleset,
  environment,
  permissions,
  merchantId,
  onChanged,
}: RoutingMatrixProps) {
  const canManage = permissions.includes("settings.manage");
  const activationTarget = resolveActivationTarget(routing, ruleset);
  const advancedReadOnly = routing?.advancedRoutingReadOnly === true || hasAdvancedRules(ruleset);
  const initialRows = routing?.rows ?? simpleRowsFromRuleset(ruleset);
  const [rows, setRows] = useState<SimpleRoutingRow[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [notice, setNotice] = useState<
    { tone: "error" | "success"; text: string; canRefetch?: boolean } | null
  >(null);

  // component คงอยู่ระหว่าง refetch (AC-6) จึงต้อง re-seed draft จาก props ที่โหลดใหม่
  // เมื่อ ruleset/version เปลี่ยน (เช่นหลังกด "โหลดข้อมูลใหม่") ไม่งั้น select ค้างค่าเดิม
  const routingSignature = routing ? `${routing.rulesetId}:${routing.version}` : "none";
  const [syncedFrom, setSyncedFrom] = useState(routingSignature);
  if (syncedFrom !== routingSignature) {
    // re-seed rows เท่านั้น — คง notice ไว้ให้ข้อความ conflict/success อยู่หลัง refetch (AC-6)
    setSyncedFrom(routingSignature);
    setRows(routing?.rows ?? simpleRowsFromRuleset(ruleset));
  }

  const enabledMethods = merchantMethods
    .filter((resource) => resource.state.enabled)
    .map((resource) => resource.state.method);

  const accountStates = accountMethods.map((resource) => resource.state);
  const validation = validateSimpleRouting(rows, enabledMethods);

  const rowFor = (method: PspMethod): SimpleRoutingRow =>
    rows.find((row) => row.method === method) ?? {
      method,
      primaryConnectionId: null,
      fallbackConnectionId: null,
    };

  const setPrimary = (method: PspMethod, value: string) => {
    setRows((current) =>
      applyRow(current, method, (row) => ({
        ...row,
        primaryConnectionId: value || null,
        fallbackConnectionId:
          row.fallbackConnectionId === value ? null : row.fallbackConnectionId,
      })),
    );
    setNotice(null);
  };

  const setFallback = (method: PspMethod, value: string) => {
    setRows((current) =>
      applyRow(current, method, (row) => ({ ...row, fallbackConnectionId: value || null })),
    );
    setNotice(null);
  };

  const saveDraft = async () => {
    if (saving || !routingEtag) return;
    if (validation.code === "routing_incomplete") {
      setNotice({ tone: "error", text: "ยังมีช่องทางที่ยังไม่กำหนดการเชื่อมต่อหลัก" });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await putSimpleRouting(merchantId, rows, routingEtag, crypto.randomUUID());
      setNotice({ tone: "success", text: "บันทึก draft แล้ว" });
      onChanged();
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapSettingsProblem(apiError.status, apiError.code, "routing");
      setNotice({ tone: "error", text: mapped.message, canRefetch: mapped.refetch });
      if (mapped.refetch) onChanged();
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    if (activating || !activationTarget || !routingEtag) return;
    setActivating(true);
    setNotice(null);
    try {
      await requestRoutingActivation(activationTarget, routingEtag, crypto.randomUUID());
      setNotice({ tone: "success", text: "ส่งคำขอเปิดใช้เส้นทางแล้ว รอการอนุมัติ" });
      onChanged();
    } catch (error) {
      const apiError = error instanceof PspApiError ? error : new PspApiError(null, null);
      const mapped = mapSettingsProblem(apiError.status, apiError.code, "routing");
      setNotice({ tone: "error", text: mapped.message, canRefetch: mapped.refetch });
      if (mapped.refetch) onChanged();
    } finally {
      setActivating(false);
    }
  };

  return (
    <section className="rounded-card bg-card p-6" style={cardStyle} aria-label="การกำหนดเส้นทาง">
      <h2 className="text-lg font-bold leading-7 text-foreground">การกำหนดเส้นทาง</h2>
      <p className="mt-1 text-sm text-grey-600">
        เลือกการเชื่อมต่อหลักและสำรองต่อช่องทางที่เปิดใช้ระดับร้านค้า
      </p>

      {advancedReadOnly ? (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning/8 p-4" role="status">
          <p className="text-sm text-warning-dark">
            พบกฎขั้นสูง (เงื่อนไขยอดเงิน/Originator) จึงแสดงแบบอ่านอย่างเดียว
          </p>
          {ruleset ? (
            <Link
              href={`/control/routing/read?id=${encodeURIComponent(ruleset.rulesetId)}`}
              className="mt-2 inline-flex text-sm font-semibold text-primary underline"
            >
              เปิดหน้ารายละเอียด ruleset
            </Link>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            {enabledMethods.map((method) => {
              const row = rowFor(method);
              return (
                <div key={method} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{METHOD_LABEL[method]}</span>
                  <span className="text-grey-700">
                    หลัก: {providerName(connections, row.primaryConnectionId)} / สำรอง:{" "}
                    {providerName(connections, row.fallbackConnectionId)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {notice ? (
            <div
              className={cn(
                "mt-3 flex flex-wrap items-center gap-3 text-sm",
                notice.tone === "error" ? "text-error" : "text-success-dark",
              )}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              <span>{notice.text}</span>
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

          <div className="mt-4 flex flex-col gap-4">
            {enabledMethods.length === 0 ? (
              <p className="text-sm text-grey-600">ยังไม่มีช่องทางที่เปิดใช้ระดับร้านค้า</p>
            ) : null}
            {enabledMethods.map((method) => {
              const row = rowFor(method);
              const incomplete = validation.incompleteMethods.includes(method);
              const primaryOptions = routingCandidates({
                method,
                connections,
                accountMethods: accountStates,
                environment,
              });
              const fallbackOptions = routingCandidates({
                method,
                connections,
                accountMethods: accountStates,
                environment,
                primaryConnectionId: row.primaryConnectionId,
              });
              return (
                <div
                  key={method}
                  className={cn(
                    "rounded-xl border p-4",
                    incomplete ? "border-error/40 bg-error/4" : "border-[var(--divider)]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{METHOD_LABEL[method]}</p>
                    {incomplete ? (
                      <span className="text-xs text-error">ยังไม่กำหนดหลัก</span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <RoutingSelect
                      label={`เส้นทางหลัก ${METHOD_LABEL[method]}`}
                      value={row.primaryConnectionId ?? ""}
                      options={primaryOptions}
                      onChange={(value) => setPrimary(method, value)}
                    />
                    <RoutingSelect
                      label={`เส้นทางสำรอง ${METHOD_LABEL[method]}`}
                      value={row.fallbackConnectionId ?? ""}
                      options={fallbackOptions}
                      onChange={(value) => setFallback(method, value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {canManage ? (
          <>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving || !routingEtag}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-grey-600/8 px-3 text-sm font-bold text-grey-800 hover:bg-grey-600/16 disabled:pointer-events-none disabled:opacity-50"
            >
              บันทึก draft
            </button>
            <button
              type="button"
              onClick={() => void activate()}
              disabled={activating || !activationTarget || !routingEtag || validation.code !== null}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              ส่งคำขอเปิดใช้
            </button>
          </div>
          {routingEtag && !activationTarget ? (
            <p className="mt-2 text-xs text-grey-600">
              ยังไม่มี ruleset ให้เปิดใช้ กรุณาบันทึก draft ก่อน
            </p>
          ) : null}
          </>
          ) : null}
        </>
      )}
    </section>
  );
}

function applyRow(
  rows: SimpleRoutingRow[],
  method: PspMethod,
  update: (row: SimpleRoutingRow) => SimpleRoutingRow,
): SimpleRoutingRow[] {
  const exists = rows.some((row) => row.method === method);
  if (!exists) {
    return [...rows, update({ method, primaryConnectionId: null, fallbackConnectionId: null })];
  }
  return rows.map((row) => (row.method === method ? update(row) : row));
}

function providerName(connections: PspConnection[], connectionId: string | null): string {
  if (!connectionId) return "-";
  const connection = connections.find((item) => item.pspConnectionId === connectionId);
  return connection ? connection.psp.toUpperCase() : connectionId;
}

function RoutingSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: RoutingCandidate[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-grey-800">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-control border border-[var(--divider)] bg-transparent px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary"
      >
        <option value="">ไม่กำหนด</option>
        {options.map((option) => (
          <option
            key={option.connectionId}
            value={option.connectionId}
            disabled={option.disabledReason !== null}
          >
            {candidateLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
