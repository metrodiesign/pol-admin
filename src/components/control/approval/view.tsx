"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { ApprovalRequest } from "@/types/control/approval";
import { CURRENT_ACTOR } from "@/lib/mock/control/approvals";
import { ACTION_LABEL } from "@/lib/control/approval";
import { useControlStore } from "@/lib/control/store";
import {
  approvalsStore,
  approveRequest,
  rejectRequest,
} from "@/lib/control/approvals-store";
import { showControlToast } from "@/components/control/shared/toast";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/list-toolbar";
import { ApprovalStatCards } from "./stat-cards";
import { approvalColumns } from "./columns";
import {
  ApprovalConfirmDialog,
  type ApprovalConfirmMode,
} from "./confirm-dialog";
import "@/types/table-meta";

export function ApprovalsView() {
  const router = useRouter();
  const requests = useControlStore(approvalsStore);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);

  const [pending, setPending] = useState<ApprovalRequest | null>(null);
  const [mode, setMode] = useState<ApprovalConfirmMode>("approve");
  // Per-id in-flight set so the row's approve/reject buttons spin + disable
  // while the (simulated async) decision is committing to the shared store.
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());

  const openConfirm = (req: ApprovalRequest, m: ApprovalConfirmMode) => {
    setMode(m);
    setPending(req);
  };

  const confirm = () => {
    if (!pending) return;
    const { id } = pending;
    const m = mode;
    setPending(null);
    setInFlight((prev) => new Set(prev).add(id));
    setTimeout(() => {
      if (m === "approve") {
        approveRequest(id);
        showControlToast("อนุมัติคำขอแล้ว", "ok");
      } else {
        rejectRequest(id);
        showControlToast("ปฏิเสธคำขอแล้ว", "error");
      }
      setInFlight((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 600);
  };

  const columns = useMemo(
    () =>
      approvalColumns({
        actorId: CURRENT_ACTOR,
        inFlight,
        onApprove: (r) => openConfirm(r, "approve"),
        onReject: (r) => openConfirm(r, "reject"),
      }),
    [inFlight],
  );

  const globalFilter = useMemo(
    () => ({ search, actionType, status }),
    [search, actionType, status],
  );

  const table = useDataTable<ApprovalRequest>({
    data: requests,
    columns,
    getRowId: (r) => r.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: { onRowClick: (r) => router.push(`/control/approvals/read?id=${r.id}`) },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; actionType: string; status: string };
      const r = row.original;
      if (f.actionType && r.actionType !== f.actionType) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !r.target.toLowerCase().includes(q) &&
          !r.maker.toLowerCase().includes(q) &&
          !r.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "status", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <ApprovalStatCards rows={requests} />

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <ControlListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            resetPage();
          }}
          searchPlaceholder="ค้นหาเป้าหมาย, ผู้ขอ, รหัสคำขอ..."
          filters={[
            {
              label: "การดำเนินการ",
              value: actionType,
              onChange: (v) => {
                setActionType(v);
                resetPage();
              },
              options: Object.entries(ACTION_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "สถานะ",
              value: status,
              onChange: (v) => {
                setStatus(v);
                resetPage();
              },
              options: [
                { value: "pending", label: "รออนุมัติ" },
                { value: "approved", label: "อนุมัติแล้ว" },
                { value: "rejected", label: "ปฏิเสธแล้ว" },
              ],
            },
          ]}
        />
        <DataTable
          table={table}
          total={filteredCount}
          dense={dense}
          onDenseChange={setDense}
          rowsPerPageOptions={[10, 25, 50]}
          searchQuery={search}
          showSelectionAction={false}
        />
      </div>

      <ApprovalConfirmDialog
        request={pending}
        mode={mode}
        onConfirm={confirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
