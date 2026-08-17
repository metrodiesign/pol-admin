"use client";

import { useState, useMemo, useCallback } from "react";
import type { OrderStatus } from "@/types/order";
import { ORDERS } from "@/lib/mock/order";
import { OrderListTabs } from "./order-list-tabs";
import { OrderListToolbar } from "./order-list-toolbar";
import { OrderTable } from "./order-table";
import { OrderTableFooter } from "./order-table-footer";

type TabValue = OrderStatus | "all";
type SortKey = "orderNumber" | "customer" | "date" | "items" | "price" | "status";
type SortDir = "asc" | "desc";

const TABS: Array<{ label: string; value: TabValue }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

function getStatusCount(status: TabValue): number {
  if (status === "all") return ORDERS.length;
  return ORDERS.filter((o) => o.status === status).length;
}

export function OrderListView() {
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("orderNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);

  const tabs = useMemo(
    () => TABS.map((t) => ({ ...t, count: getStatusCount(t.value) })),
    [],
  );

  const filtered = useMemo(() => {
    let list = [...ORDERS];

    if (tab !== "all") list = list.filter((o) => o.status === tab);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer.name.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortKey) {
        case "orderNumber":
          aVal = a.orderNumber;
          bVal = b.orderNumber;
          break;
        case "customer":
          aVal = a.customer.name;
          bVal = b.customer.name;
          break;
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "items":
          aVal = a.items;
          bVal = b.items;
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.orderNumber;
          bVal = b.orderNumber;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [tab, search, sortKey, sortDir]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelected(new Set(paginated.map((o) => o.id)));
      } else {
        setSelected(new Set());
      }
    },
    [paginated],
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleTabChange = useCallback((value: TabValue) => {
    setTab(value);
    setPage(0);
    setSelected(new Set());
  }, []);

  return (
    <div
      className="rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <OrderListTabs tabs={tabs} active={tab} onChange={handleTabChange} />
      <OrderListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />
      <OrderTable
        orders={paginated}
        selected={selected}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        dense={dense}
        allSelected={
          paginated.length > 0 && paginated.every((o) => selected.has(o.id))
        }
        someSelected={paginated.some((o) => selected.has(o.id))}
        expanded={expanded}
        onToggleExpand={handleToggleExpand}
      />
      <OrderTableFooter
        dense={dense}
        onDenseChange={setDense}
        page={page}
        rowsPerPage={rowsPerPage}
        total={filtered.length}
        onPageChange={setPage}
        onRowsPerPageChange={(v) => {
          setRowsPerPage(v);
          setPage(0);
        }}
      />
    </div>
  );
}
