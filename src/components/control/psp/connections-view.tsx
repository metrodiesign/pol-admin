"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCoreRowModel, type PaginationState, type Updater } from "@tanstack/react-table";
import {
  Activity,
  CircleAlert,
  Clock3,
  Eye,
  Hourglass,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ControlListToolbar } from "@/components/control/shared/list-toolbar";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { TablePagination } from "@/components/table/table-pagination";
import { useDataTable } from "@/hooks/use-data-table";
import { PspApiError, listPspConnections } from "@/lib/api/control/psp";
import { formatDateTime } from "@/lib/control/format";
import {
  APPROVAL_LABEL,
  HEALTH_LABEL,
  METHOD_LABEL,
  PROVIDER_LABEL,
  approvalTone,
  enabledLabel,
  enabledTone,
  healthTone,
  lastTestLabel,
  resolveApprovalState,
} from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type {
  ApprovalState,
  PagedResult,
  PspConnection,
  PspConnectionListRow,
  PspHealth,
  PspProvider,
} from "@/types/control/psp-connection";
import { useMerchantCatalog, usePendingApprovals } from "./resource-hooks";
import { pspColumns } from "./table-columns";
import "@/types/table-meta";

const PAGE_SIZE = 25;

type ListState =
  | { status: "loading"; result: null }
  | { status: "ready"; result: PagedResult<PspConnection> }
  | { status: "forbidden" | "error"; result: null };

function ApprovalIcon({ state }: { state: ApprovalState }) {
  if (state === "pending") return <Hourglass className="size-3.5" />;
  if (state === "unavailable") return <CircleAlert className="size-3.5" />;
  return <Clock3 className="size-3.5" />;
}

function StatusCell({ row }: { row: PspConnectionListRow }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <ControlStatusBadge
        tone={enabledTone(row.isEnabled)}
        label={enabledLabel(row.isEnabled)}
        icon={<Power className="size-3.5" />}
      />
      <ControlStatusBadge
        tone={healthTone(row.health)}
        label={HEALTH_LABEL[row.health]}
        icon={<Activity className="size-3.5" />}
      />
      <ControlStatusBadge
        tone={approvalTone(row.approvalState)}
        label={APPROVAL_LABEL[row.approvalState]}
        icon={<ApprovalIcon state={row.approvalState} />}
      />
    </div>
  );
}

function ConnectionCard({ row }: { row: PspConnectionListRow }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-card">
      <StatusSpine
        tone={healthTone(row.health)}
        className="absolute inset-y-0 left-0 h-auto rounded-none"
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="text-overline text-grey-500">{PROVIDER_LABEL[row.psp]}</p>
          <h2 className="truncate text-base font-bold text-foreground">{row.merchantName}</h2>
          <p className="text-data mt-1 break-all text-xs text-grey-500">{row.pspConnectionId}</p>
        </div>
      </div>
      <div className="mt-4 pl-2">
        <StatusCell row={row} />
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-dashed border-[var(--divider)] pt-4 pl-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-grey-500">ช่องทาง</dt>
          <dd className="mt-1 text-sm text-grey-700">
            {row.enabledMethods.map((method) => METHOD_LABEL[method]).join(", ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-grey-500">ทดสอบล่าสุด</dt>
          <dd className="mt-1 text-sm font-semibold text-grey-700">
            {lastTestLabel(row.lastTestResult)}
          </dd>
          <dd className="text-data text-xs text-grey-500">
            {formatDateTime(row.lastTestedAt ?? "")}
          </dd>
        </div>
      </dl>
      <Link
        href={`/control/psp/read?id=${encodeURIComponent(row.pspConnectionId)}`}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-4 w-full")}
      >
        <Eye className="size-4" />
        ดูข้อมูล
      </Link>
    </article>
  );
}

function InlineNotice({
  tone,
  message,
  onRetry,
}: {
  tone: "warning" | "error";
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        tone === "error" ? "border-error/30 bg-error/8" : "border-warning/30 bg-warning/8",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <p className="text-sm text-grey-700">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          ลองใหม่
        </Button>
      ) : null}
    </div>
  );
}

export function PspConnectionsView() {
  const router = useRouter();
  const { me } = useAuth();
  const permissions = useMemo(() => new Set(me?.permissions ?? []), [me?.permissions]);
  const hasMerchantView = permissions.has("merchant.view");
  const canSeeCreate = permissions.has("settings.manage") && permissions.has("merchant.manage");
  const catalog = useMerchantCatalog(hasMerchantView);
  const approvals = usePendingApprovals();

  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [psp, setPsp] = useState<PspProvider | "">("");
  const [health, setHealth] = useState<PspHealth | "">("");
  const [page, setPage] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [list, setList] = useState<ListState>({ status: "loading", result: null });
  const generation = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestGeneration = ++generation.current;
    queueMicrotask(() => {
      if (!controller.signal.aborted && requestGeneration === generation.current) {
        setList({ status: "loading", result: null });
      }
    });
    listPspConnections(
      {
        page: page + 1,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        merchantId: merchantId || undefined,
        psp: psp || undefined,
        health: health || undefined,
      },
      controller.signal,
    )
      .then((result) => {
        if (requestGeneration === generation.current) setList({ status: "ready", result });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        if (requestGeneration !== generation.current) return;
        setList({
          status: error instanceof PspApiError && error.status === 403 ? "forbidden" : "error",
          result: null,
        });
      });
    return () => controller.abort();
  }, [health, merchantId, page, psp, retryKey, search]);

  const merchantNames = useMemo(
    () => new Map(catalog.items.map((merchant) => [merchant.id, merchant.name])),
    [catalog.items],
  );

  const rows = useMemo<PspConnectionListRow[]>(() => {
    if (list.status !== "ready") return [];
    return list.result.items.map((connection) => {
      const positive = resolveApprovalState(
        connection.pspConnectionId,
        connection.hasPendingCredentialChange,
        approvals.items,
      );
      const approvalState =
        positive === "pending"
          ? "pending"
          : approvals.status === "loading"
            ? "loading"
            : approvals.status === "unavailable"
              ? "unavailable"
              : resolveApprovalState(
                  connection.pspConnectionId,
                  connection.hasPendingCredentialChange,
                  approvals.items,
                );
      return {
        ...connection,
        merchantName: merchantNames.get(connection.merchantId) ?? connection.merchantId,
        approvalState,
      };
    });
  }, [approvals.items, approvals.status, list, merchantNames]);

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page, pageSize: PAGE_SIZE }),
    [page],
  );
  const table = useDataTable<PspConnectionListRow>({
    data: rows,
    columns: pspColumns,
    getRowId: (row) => row.pspConnectionId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: list.status === "ready" ? list.result.total : 0,
    state: { pagination },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPage(next.pageIndex);
    },
    meta: {
      onRowClick: (row) =>
        router.push(`/control/psp/read?id=${encodeURIComponent(row.pspConnectionId)}`),
    },
  });

  const resetPage = () => setPage(0);
  const canCreate = canSeeCreate && hasMerchantView && catalog.status === "ready";
  const total = list.status === "ready" ? list.result.total : 0;
  const catalogReason =
    catalog.status === "loading"
      ? "กำลังโหลด Merchant catalog"
      : catalog.status === "forbidden"
        ? "ไม่มีสิทธิ์ merchant.view จึงโหลด Merchant catalog ไม่ได้"
        : catalog.status === "partial"
          ? "โหลด Merchant catalog ได้ไม่ครบ"
          : catalog.status === "error"
            ? "โหลด Merchant catalog ไม่สำเร็จ"
            : undefined;

  return (
    <div className="flex flex-col gap-4">
      {catalog.status === "partial" || catalog.status === "error" ? (
        <InlineNotice tone="warning" message={catalogReason ?? "Merchant catalog ไม่พร้อม"} onRetry={catalog.retry} />
      ) : catalog.status === "forbidden" ? (
        <InlineNotice tone="warning" message={catalogReason ?? "ไม่มีสิทธิ์โหลด Merchant"} />
      ) : null}
      {approvals.status === "unavailable" ? (
        <InlineNotice
          tone="error"
          message="ตรวจสถานะอนุมัติไม่ได้ ทุก connection จะปิด action ที่อาจเปลี่ยน target version"
          onRetry={approvals.retry}
        />
      ) : null}

      <section className="overflow-hidden rounded-2xl bg-card shadow-card">
        <ControlListToolbar
          search={search}
          searchLabel="ค้นหา Connection ID"
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          searchPlaceholder="ค้นหา Connection ID"
          filters={[
            {
              label: "Merchant",
              value: merchantId,
              onChange: (value) => {
                setMerchantId(value);
                resetPage();
              },
              options: [...catalog.items]
                .sort((a, b) => a.name.localeCompare(b.name, "th"))
                .map((merchant) => ({ value: merchant.id, label: merchant.name })),
              disabled: !hasMerchantView || catalog.status !== "ready",
            },
            {
              label: "PSP",
              value: psp,
              onChange: (value) => {
                setPsp(value as PspProvider | "");
                resetPage();
              },
              options: Object.entries(PROVIDER_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              label: "Health",
              value: health,
              onChange: (value) => {
                setHealth(value as PspHealth | "");
                resetPage();
              },
              options: Object.entries(HEALTH_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
          actions={
            canSeeCreate ? (
              <Button
                type="button"
                size="lg"
                disabled={!canCreate}
                onClick={() => router.push("/control/psp/create")}
              >
                <Plus className="size-4" />
                เพิ่มการเชื่อมต่อ
              </Button>
            ) : null
          }
        />
        {canSeeCreate && !canCreate && catalogReason ? (
          <p className="px-5 pb-4 text-xs text-warning-dark" role="status">
            ปิดการเพิ่มการเชื่อมต่อ: {catalogReason}
          </p>
        ) : null}

        {list.status === "loading" ? (
          <div className="flex min-h-64 items-center justify-center px-5 py-12" aria-busy="true">
            <p className="text-sm text-grey-600" role="status">กำลังโหลด PSP Connections...</p>
          </div>
        ) : list.status === "forbidden" ? (
          <div className="min-h-64 px-5 py-12 text-center" role="alert">
            <h2 className="text-h6 text-foreground">ไม่มีสิทธิ์ดู PSP Connections</h2>
            <p className="mt-2 text-sm text-grey-600">สิทธิ์อาจเปลี่ยนหลังจากเปิดหน้านี้</p>
          </div>
        ) : list.status === "error" ? (
          <div className="min-h-64 px-5 py-12 text-center" role="alert">
            <h2 className="text-h6 text-foreground">โหลด PSP Connections ไม่สำเร็จ</h2>
            <p className="mt-2 text-sm text-grey-600">กรุณาลองใหม่อีกครั้ง</p>
            <Button type="button" variant="outline" className="mt-5" onClick={() => setRetryKey((key) => key + 1)}>
              <RefreshCw className="size-4" />
              ลองใหม่
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="min-h-64 px-5 py-12 text-center">
            <h2 className="text-h6 text-foreground">ไม่พบ PSP Connection</h2>
            <p className="mt-2 text-sm text-grey-600">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            {canSeeCreate ? (
              <Button
                type="button"
                className="mt-5"
                disabled={!canCreate}
                onClick={() => router.push("/control/psp/create")}
              >
                <Plus className="size-4" />
                เพิ่มการเชื่อมต่อ
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden mmd:block">
              <DataTable
                table={table}
                total={total}
                hidePagination
                showSelectionAction={false}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 bg-grey-100/50 p-4 mmd:hidden">
              {rows.map((row) => <ConnectionCard key={row.pspConnectionId} row={row} />)}
            </div>
            <TablePagination
              page={page}
              rowsPerPage={PAGE_SIZE}
              count={total}
              onPageChange={setPage}
              onRowsPerPageChange={() => undefined}
            />
          </>
        )}
      </section>
    </div>
  );
}
