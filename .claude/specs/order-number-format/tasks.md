> Status: approved 2026-07-30 (quick, no gates)

# Tasks — Order Number Format

- [x] 1. Add `src/lib/mock/order-code.ts` (`generateOrderCode`, `currentBeYear2Digit`) + unit test — REQ-1, REQ-2, REQ-3
  Evidence: `npx vitest run src/lib/mock/order-code.test.ts` → 2 tests pass (BE year "69" from CE 2026; `generateOrderCode(1,"69")`="ORD6900000001", `generateOrderCode(48,"69")`="ORD6900000048"). Viewports: n/a (pure logic, no UI). Deviations: none.

- [x] 2. Regenerate `id`/`code` in `src/lib/mock/transactions.ts` using the helper — REQ-4, REQ-5
  Evidence: scripted replace keyed on original running number (not match order) so `id`===`code` per record preserved; `grep -c "TXN-" src/lib/mock/transactions.ts` → 0 remaining. 48 records mapped 1:1, position 1 → `ORD6900000001` .. position 48 → `ORD6900000048`. Viewports: n/a (data-only). Deviations: first script attempt incremented a shared counter across both `id`/`code` matches and produced mismatched pairs — reverted via `git checkout` and redone keyed on the embedded original number.

- [x] 3. Update `ORDER_STATUS_OVERRIDE` keys in `src/lib/mock/orders.ts` to match — REQ-4
  Evidence: `TXN-2026-100020/-100035/-100046` (positions 20/35/46, 0-based) → `ORD6900000021/-36/-47` (sequence = position+1). `npx tsc --noEmit` → no errors. Viewports: n/a. Deviations: none.

- [x] 4. Update comment in `src/types/order-payment.ts:16` — REQ-1
  Evidence: comment now reads `// "ORD6900000001" (ORD + BE year 2 digits + 8-digit running)`. Comment-only change, no runtime effect. Viewports: n/a. Deviations: none.

- [x] 5. Verify: typecheck + vitest green + manual check `/order/list` renders new codes — REQ-6
  Evidence: `npx tsc --noEmit` → "No errors found". `npx vitest run src/lib/mock/order-code.test.ts src/lib/mock/mock-contract.test.ts` → 14 passed, 0 failed. Manual check via chrome-devtools MCP: navigated to `http://localhost:5200/order/list` (existing dev server on :5200), screenshot confirms rows render `ORD6900000001`, `ORD6900000002` in the "รหัสธุรกรรม" column; totals/tabs (48/17/27/4) unchanged. Viewport checked: 1440 desktop only (existing dev server default window; 375/768 not re-checked since this change is data-format-only, no layout/CSS touched). Deviations: none — table column logic (`session?.code ?? id`) untouched per design.md, confirmed by grep showing no matches changed in that file.
