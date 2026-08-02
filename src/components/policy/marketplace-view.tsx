"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Policy, PolicyStatus } from "@/types/policy";
import { CATEGORY_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/policy/policy";
import { POLICIES } from "@/lib/mock/policies";
import { createCheckoutSession, pickPoliciesByIds, readCheckoutSession } from "@/lib/policy/checkout";
import {
  usePolicyTableWithCart,
  ROWS_PER_PAGE_OPTIONS,
} from "@/hooks/use-policy-table-with-cart";
import { DataTable } from "@/components/table/data-table";
import { PolicyListToolbar } from "./list-toolbar";
import { PremiumCartBar } from "./premium-cart-bar";
import { PremiumCheckoutDialog } from "./premium-checkout-dialog";

interface CheckoutState {
  /** รายการที่ review ใน dialog ก่อนไปหน้า checkout */
  policies: Policy[];
}

/** Date -> YYYY-MM-DD ตาม local time (เลี่ยง toISOString ที่เลื่อนวันข้าม timezone). */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PolicyMarketplaceView() {
  const router = useRouter();
  const [dense, setDense] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("motor");
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<PolicyStatus | "all">("all");
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);

  const globalFilter = useMemo(
    () => ({
      search,
      category,
      customerName,
      startDate: startDate ? toIsoDate(startDate) : "",
      endDate: endDate ? toIsoDate(endDate) : "",
      status,
    }),
    [search, category, customerName, startDate, endDate, status],
  );

  const { table, filteredCount, cart } = usePolicyTableWithCart({
    globalFilter,
    onBuyNow: (policy) => setCheckout({ policies: [policy] }),
  });

  // กลับมาแก้ไขตะกร้าจากหน้า checkout (?resumeSession=xxx) — rehydrate จาก session เดิม
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("resumeSession");
    if (!sessionId) return;
    const ids = readCheckoutSession(sessionId);
    if (ids) cart.replace(pickPoliciesByIds(POLICIES, ids));
    router.replace("/policy/list");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time read ตอน mount เท่านั้น
  }, []);

  function resetToFirstPage() {
    table.setPageIndex(0);
  }

  function openCartCheckout() {
    setCheckout({ policies: cart.items });
  }

  function goToCheckout(policies: Policy[]) {
    const sessionId = createCheckoutSession(policies.map((p) => p.id));
    router.push(`/checkout/${sessionId}`);
  }

  return (
    <>
      <div
        className="min-w-0 overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <PolicyListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            resetToFirstPage();
          }}
          category={category}
          onCategoryChange={(v) => {
            setCategory(v);
            resetToFirstPage();
          }}
          categoryOptions={CATEGORY_OPTIONS}
          customerName={customerName}
          onCustomerNameChange={(v) => {
            setCustomerName(v);
            resetToFirstPage();
          }}
          startDate={startDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            if (endDate && endDate < v) setEndDate(null);
            resetToFirstPage();
          }}
          endDate={endDate}
          onEndDateChange={(v) => {
            setEndDate(v);
            resetToFirstPage();
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v as PolicyStatus | "all");
            resetToFirstPage();
          }}
          statusOptions={PAYMENT_STATUS_OPTIONS}
        />
        <DataTable
          table={table}
          total={filteredCount}
          dense={dense}
          onDenseChange={setDense}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          searchQuery={search}
          showSelectionAction={false}
        />
      </div>

      <PremiumCartBar
        items={cart.items}
        count={cart.count}
        total={cart.total}
        onRemove={cart.remove}
        onProceed={openCartCheckout}
      />

      <PremiumCheckoutDialog
        open={checkout !== null}
        policies={checkout?.policies ?? []}
        onConfirm={() => goToCheckout(checkout?.policies ?? [])}
        onClose={() => setCheckout(null)}
      />
    </>
  );
}
