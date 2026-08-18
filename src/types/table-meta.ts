// Single source of truth for @tanstack/react-table TableMeta augmentation.
// All columns files that rely on table.options.meta must import this module
// for its side effect: import "@/types/table-meta";

import type { RowData } from "@tanstack/react-table";
import type { Policy } from "@/types/policy";

/** Cart API ส่งเข้า columns ของ Policy Marketplace ผ่าน table.options.meta. */
export interface PolicyCartMeta {
  has(id: string): boolean;
  /** เพิ่ม/นำออก (guard eligibility + กันซ้ำ) */
  toggle(policy: Policy): void;
  /** เปิด checkout ใบเดียว (ซื้อเลย) — ไม่แตะตะกร้า */
  buyNow(policy: Policy): void;
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onRowClick?: (row: TData) => void;
    onResend?: (row: TData) => void;
    cart?: PolicyCartMeta;
  }

  // Generic params TData/TValue must match @tanstack/table-core's original declaration exactly
  // (TypeScript module augmentation requirement). The params are not used in the body intentionally.
  interface ColumnMeta<TData extends RowData, TValue> { // eslint-disable-line @typescript-eslint/no-unused-vars
    headClassName?: string;
    cellClassName?: string;
    /** คลิกในเซลล์คอลัมน์นี้จะไม่ trigger onRowClick (เช่น คอลัมน์ปุ่ม action) */
    ignoreRowClick?: boolean;
  }
}
