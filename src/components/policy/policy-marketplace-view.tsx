"use client";

import { useMemo, useState } from "react";
import type { Policy, PolicyStatus } from "@/types/policy";
import { CATEGORY_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/policy/policy";
import {
  usePolicyTableWithCart,
  ROWS_PER_PAGE_OPTIONS,
} from "@/hooks/use-policy-table-with-cart";
import { DataTable } from "@/components/table/data-table";
import { PolicyListToolbar } from "./policy-list-toolbar";
import { PremiumCartPanel } from "./premium-cart-panel";
import { PremiumCartSheet } from "./premium-cart-sheet";
import { PremiumCheckoutDialog } from "./premium-checkout-dialog";
import { PolicyToaster } from "./policy-toaster";
import { usePolicyToast } from "./use-policy-toast";

interface CheckoutState {
  policies: Policy[];
  /** ยืนยันแล้วเคลียร์ตะกร้าไหม — cart mode = true, ซื้อเลย = false (REQ-7.4) */
  clearCart: boolean;
}

export function PolicyMarketplaceView() {
  const [dense, setDense] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PolicyStatus | "all">("all");
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);

  const { toasts, show, dismiss } = usePolicyToast();

  const globalFilter = useMemo(
    () => ({ search, category, customerName, startDate, endDate, status }),
    [search, category, customerName, startDate, endDate, status],
  );

  const { table, filteredCount, cart } = usePolicyTableWithCart({
    globalFilter,
    onBuyNow: (policy) => setCheckout({ policies: [policy], clearCart: false }),
  });

  function resetToFirstPage() {
    table.setPageIndex(0);
  }

  function openCartCheckout() {
    setCheckout({ policies: cart.items, clearCart: true });
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 mlg:grid-cols-[1fr_360px]">
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

        <div className="hidden mlg:sticky mlg:top-24 mlg:block">
          <PremiumCartPanel
            items={cart.items}
            count={cart.count}
            total={cart.total}
            onRemove={cart.remove}
            onProceed={openCartCheckout}
          />
        </div>
      </div>

      <PremiumCartSheet
        items={cart.items}
        count={cart.count}
        total={cart.total}
        onRemove={cart.remove}
        onProceed={openCartCheckout}
      />

      <PremiumCheckoutDialog
        open={checkout !== null}
        policies={checkout?.policies ?? []}
        onConfirm={() => {
          if (checkout?.clearCart) cart.clear();
        }}
        onSuccess={show}
        onClose={() => setCheckout(null)}
      />

      <PolicyToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
