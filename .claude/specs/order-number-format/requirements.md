> Status: approved 2026-07-30 (quick, no gates)

# Requirements — Order Number Format

## Context
เลขที่ออเดอร์ปัจจุบัน (`PaymentSession.code` / `.id`) เป็น mock hardcode รูปแบบ
`TXN-YYYY-NNNNNN` (ค.ศ. 4 หลัก, running 6 หลัก) ใน `src/lib/mock/transactions.ts`
ต้องเปลี่ยนเป็นรูปแบบใหม่ `ORD` + ปี พ.ศ. 2 หลัก + running 8 หลัก ไม่มีขีดคั่น
เช่น `ORD6900000001`.

## Requirements (EARS)

- **REQ-1**: ระบบต้องสร้างเลขที่ออเดอร์ในรูปแบบ `ORD{YY}{NNNNNNNN}` โดยไม่มีตัวคั่น
  โดยที่ `YY` คือเลขปี พ.ศ. 2 หลักท้าย และ `NNNNNNNN` คือ running number 8 หลัก
  zero-padded.
- **REQ-2**: เมื่อคำนวณปี พ.ศ. ระบบต้องใช้ `ค.ศ.ปัจจุบัน + 543` แล้วนำ 2 หลักท้ายมาใช้
  (เช่น ปี ค.ศ. 2026 → พ.ศ. 2569 → `"69"`).
- **REQ-3**: Running number ต้องเริ่มที่ `1` (แสดงผลเป็น `00000001`) และรีเซ็ตใหม่ทุกปี พ.ศ.
  (แต่ละปีเริ่มนับจาก 1 ใหม่ — ไม่ใช่ running ต่อเนื่องข้ามปี).
- **REQ-4**: Mock data ที่มีอยู่เดิมทั้งหมด (`PAYMENT_SESSIONS` ใน `transactions.ts`
  และ `ORDER_STATUS_OVERRIDE` key ใน `orders.ts`) ต้องถูกแปลงเป็นรูปแบบใหม่ทั้งหมด
  โดยคงลำดับ (sequence) เดิมไว้ — record ที่เคยเป็น `TXN-2026-100000` (ลำดับที่ 1)
  ต้องกลายเป็น `ORD6900000001`.
- **REQ-5**: `PaymentSession.id` และ `PaymentSession.code` ต้องมีค่าเท่ากันเสมอ
  (คงพฤติกรรมเดิม — `id` = `code`).
- **REQ-6**: การแสดงผลเลขที่ออเดอร์ในตาราง `/order/list`
  (`src/components/order/order-table-columns.tsx`) ต้องไม่เปลี่ยนแปลง logic
  (ยังคง fallback `session?.code ?? id` เหมือนเดิม) — เปลี่ยนแค่ค่าข้อมูล ไม่เปลี่ยน component.

## Out of scope
- ไม่แตะ `src/types/order.ts` / `src/lib/mock/order.ts` (ระบบ `orderNumber: "#NNNN"`
  เดิม ไม่ได้ใช้ใน `/order/list` จริง — ยืนยันแล้วว่าไม่มีจุดอื่นอ้างอิง `TXN-` นอกเหนือ
  3 ไฟล์ที่ระบุ).
- ไม่มี real backend/API endpoint สำหรับ order number generation (ระบบนี้เป็น mock
  ทั้งหมด, ดู `REQ-7.2`/`REQ-8` comment ใน mock files).
