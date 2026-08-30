"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoreRowModel, type PaginationState, type Updater } from "@tanstack/react-table";
import { Plus, RefreshCw, Search } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PspApiError, listPspConnections } from "@/lib/api/control/psp";
import { HEALTH_LABEL, PROVIDER_LABEL, resolveApprovalState } from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type {
  PagedResult,
  PspConnection,
  PspConnectionListRow,
  PspHealth,
  PspProvider,
} from "@/types/control/psp-connection";
import { useMerchantCatalog, usePendingApprovals } from "./resource-hooks";
import { pspColumns } from "./table-columns";
import "@/types/table-meta";

const ROWS_OPTIONS = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const PROVIDER_OPTIONS = Object.entries(PROVIDER_LABEL).map(([value, label]) => ({ value, label }));
const HEALTH_OPTIONS = Object.entries(HEALTH_LABEL).map(([value, label]) => ({ value, label }));

type ListState =
  | { status: "loading"; result: null }
  | { status: "ready"; result: PagedResult<PspConnection> }
  | { status: "forbidden" | "error"; result: null };

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

interface PspListHeaderProps {
  canSeeCreate: boolean;
  canCreate: boolean;
  createDisabledReason?: string;
}

export function PspListHeader({
  canSeeCreate,
  canCreate,
  createDisabledReason,
}: PspListHeaderProps) {
  const createDisabledAction =
    canSeeCreate && !canCreate ? (
      <Button
        type="button"
        disabled
        aria-describedby={createDisabledReason ? "psp-create-disabled-reason" : undefined}
        className="h-11 min-w-[140px] rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-4" />
        เพิ่มการเชื่อมต่อ
      </Button>
    ) : undefined;

  return (
    <PageHeader
      title="รายชื่อการเชื่อมต่อ PSP"
      breadcrumbs={[
        { label: "การเชื่อมต่อ PSP", href: "/control/psp/list" },
        { label: "รายชื่อ" },
      ]}
      action={
        canSeeCreate && canCreate
          ? { label: "เพิ่มการเชื่อมต่อ", href: "/control/psp/create" }
          : undefined
      }
      actions={createDisabledAction}
    />
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
  const [pageSize, setPageSize] = useState(25);
  const [dense, setDense] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [list, setList] = useState<ListState>({ status: "loading", result: null });
  const generation = useRef(0);

  useEffect(() => {
    if (list.status === "forbidden") router.replace("/error/403");
  }, [list.status, router]);

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
        limit: pageSize,
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
  }, [health, merchantId, page, pageSize, psp, retryKey, search]);

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
    () => ({ pageIndex: page, pageSize }),
    [page, pageSize],
  );
  const total = list.status === "ready" ? list.result.total : 0;
  const table = useDataTable<PspConnectionListRow>({
    data: rows,
    columns: pspColumns,
    getRowId: (row) => row.pspConnectionId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    state: { pagination },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPage(next.pageIndex);
      setPageSize(next.pageSize);
    },
    meta: {
      onRowClick: (row) =>
        router.push(`/control/psp/read?id=${encodeURIComponent(row.pspConnectionId)}`),
    },
  });

  const resetPage = () => setPage(0);
  const canCreate = canSeeCreate && hasMerchantView && catalog.status === "ready";
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
  const merchantOptions = useMemo(
    () =>
      [...catalog.items]
        .sort((a, b) => a.name.localeCompare(b.name, "th"))
        .map((merchant) => ({ value: merchant.id, label: merchant.name })),
    [catalog.items],
  );

  const emptyState = (
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
  );

  return (
    <>
      <PspListHeader
        canSeeCreate={canSeeCreate}
        canCreate={canCreate}
        createDisabledReason={catalogReason}
      />
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

        <div
          className="overflow-hidden rounded-2xl bg-card"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="ค้นหา"
              placeholder="ค้นหา Connection ID..."
              value={search}
              onChange={(value) => {
                setSearch(value);
                resetPage();
              }}
              startAdornment={<Search className="size-5 text-grey-500" />}
            />
            <SelectField
              label="Merchant"
              value={merchantId}
              onChange={(value) => {
                setMerchantId(value);
                resetPage();
              }}
              options={merchantOptions}
              placeholder="ทั้งหมด"
              clearable
              disabled={!hasMerchantView || catalog.status !== "ready"}
            />
            <SelectField
              label="PSP"
              value={psp}
              onChange={(value) => {
                setPsp(value as PspProvider | "");
                resetPage();
              }}
              options={PROVIDER_OPTIONS}
              placeholder="ทั้งหมด"
              clearable
            />
            <SelectField
              label="Health"
              value={health}
              onChange={(value) => {
                setHealth(value as PspHealth | "");
                resetPage();
              }}
              options={HEALTH_OPTIONS}
              placeholder="ทั้งหมด"
              clearable
            />
            <SelectField
              label="จำนวนต่อหน้า"
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                resetPage();
              }}
              options={ROWS_OPTIONS}
            />
          </div>
          {canSeeCreate && !canCreate && catalogReason ? (
            <p
              id="psp-create-disabled-reason"
              className="px-5 pb-4 text-xs text-warning-dark"
              role="status"
            >
              ปิดการเพิ่มการเชื่อมต่อ: {catalogReason}
            </p>
          ) : null}

          {list.status === "loading" ? (
            <div className="flex min-h-64 items-center justify-center px-5 py-12" aria-busy="true">
              <p className="text-sm text-grey-600" role="status">กำลังโหลด PSP Connections...</p>
            </div>
          ) : list.status === "forbidden" ? (
            <div className="flex min-h-64 items-center justify-center px-5 py-12" aria-busy="true">
              <p className="text-sm text-grey-600" role="status">กำลังเปิดหน้า 403...</p>
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
          ) : (
            <DataTable
              table={table}
              total={total}
              dense={dense}
              onDenseChange={setDense}
              rowsPerPageOptions={[25, 50, 100]}
              searchQuery={search}
              emptyState={emptyState}
              showSelectionAction={false}
            />
          )}
        </div>
      </div>
    </>
  );
}
