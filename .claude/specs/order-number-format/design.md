> Status: approved 2026-07-30 (quick, no gates)

# Design — Order Number Format

## Data shape
No type changes. `PaymentSession.id` / `.code` stay `string`; only the value format
changes. Update the inline comment in `src/types/order-payment.ts:16`.

## Key function
New pure helper, `src/lib/mock/order-code.ts`:

```ts
export function generateOrderCode(sequence: number, beYear2Digit: string): string {
  return `ORD${beYear2Digit}${String(sequence).padStart(8, "0")}`;
}

export function currentBeYear2Digit(date: Date = new Date()): string {
  return String(date.getFullYear() + 543).slice(-2);
}
```

`sequence` is 1-based per record (resets per BE year — mock only has one year's
worth of data, so no rollover logic needed for the mock itself).

## Mock data changes
- `src/lib/mock/transactions.ts`: replace each `id: "TXN-2026-NNNNNN"` /
  `code: "TXN-2026-NNNNNN"` pair with `generateOrderCode(i + 1, YEAR)` where `i` is
  the record's 0-based position in `PAYMENT_SESSIONS` and `YEAR` is computed once
  via `currentBeYear2Digit()` at module load. Old running `100000..100047` maps
  1:1 by position to new `1..48`.
- `src/lib/mock/orders.ts`: `ORDER_STATUS_OVERRIDE` keys `TXN-2026-100020` /
  `-100035` / `-100046` map to positions 20/35/46 (0-based) → new codes at
  `sequence = 21/36/47`. Recompute the literal strings to match.

## Requirement Traceability

| REQ | File / function |
|-----|------------------|
| REQ-1, REQ-3 | `src/lib/mock/order-code.ts` → `generateOrderCode` |
| REQ-2 | `src/lib/mock/order-code.ts` → `currentBeYear2Digit` |
| REQ-4 | `src/lib/mock/transactions.ts`, `src/lib/mock/orders.ts` |
| REQ-5 | `src/lib/mock/transactions.ts` (unchanged: `id` = `code`) |
| REQ-6 | no change to `src/components/order/order-table-columns.tsx` (verified by manual check, no test needed) |
