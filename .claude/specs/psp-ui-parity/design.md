# Design: PSP UI Parity

> Status: approved 2026-08-30 (quick, no gates)

## แนวทาง

Presentation-only refactor ของ `src/components/control/psp/*` ให้ mirror pattern ของ merchant user/role
ไม่แตะ hooks, API client, lib logic หรือ types

## ไฟล์ที่แตะ

| ไฟล์ | การเปลี่ยน |
|---|---|
| `src/components/control/psp/styles.ts` | ใหม่: `cancelClass`, `primaryClass`, `cardStyle` (ลอก verbatim จาก merchant role) |
| `src/components/control/psp/connections-view.tsx` | ลบ ConnectionCard/StatusCell/StatusSpine/mobile grid; toolbar inline (TextField + SelectField clearable + จำนวนต่อหน้า); state `pageSize`; ใช้ pagination ของ `DataTable` แทน `TablePagination` แยก; empty state ส่งผ่าน prop `emptyState` |
| `src/components/control/psp/table-columns.tsx` | ลบคอลัมน์ spine; คอลัมน์ action เป็นไอคอน Eye + Tooltip แบบ user columns |
| `src/components/control/psp/detail-view.tsx` | ย้าย `EditPageHeader` เข้ามาใน view พร้อม actions ยกเลิก/แก้ไข; card เดียวแบบ role read-view (header band + sections + footer actions) |
| `src/app/control/psp/read/page.tsx` | ถอด `EditPageHeader` (ย้ายเข้า view) |
| `src/components/control/psp/create-view.tsx` | `PageHeader` + actions; ลบ ConnectionHeader; form card `rounded-card bg-card p-6` |
| `src/components/control/psp/edit-view.tsx` | actions ใช้ class ต้นแบบ; ลบ ConnectionHeader; identity + badge ใน card |
| `src/components/control/psp/connection-header.tsx` | ลบไฟล์ |
| `src/app/control/psp/list/page.test.ts` | เพิ่ม assertion parity ของ list และ detail |
| `.claude/specs/psp-connections/design.md` | บันทึก superseded ข้อ Layout |

## โครง component

```text
List:  PageHeader
       card
         toolbar grid (ค้นหา | Merchant | PSP | Health | จำนวนต่อหน้า)
         DataTable (pagination ในตัว, emptyState ของ PSP)
Read:  EditPageHeader(actions: ยกเลิก, แก้ไข)
       notices
       card
         header band: provider / merchant / id + badges
         section ข้อมูลการเชื่อมต่อ | Config | Credential
         footer: ทดสอบ | ขอเปลี่ยน Credential + reasons
Create: PageHeader(actions: ยกเลิก, สร้าง) + notices + form card
Edit:  EditPageHeader(actions: ยกเลิก, บันทึก) + notices + form card (identity band ด้านบน)
```

## Pagination

`pageSize` เป็น state ใน view; `useDataTable` รับ `state.pagination = {pageIndex, pageSize}`,
`manualPagination`, `rowCount = total`; `onPaginationChange` อัปเดตทั้ง `page` และ `pageSize`
`DataTable` ส่ง `total` เพื่อให้ pagination ในตัวทำงาน; `TablePagination` เดิมไม่ render ตัวเลือก rows
(prop ถูกละเว้น) จึงให้ toolbar เป็นตัวเปลี่ยนจำนวนต่อหน้าเหมือน merchant user

## Requirement Traceability

| Design element | satisfies |
|---|---|
| `connections-view.tsx` PageHeader + card + toolbar grid | REQ-1.1, 1.2 |
| `connections-view.tsx` state `pageSize` + `onPaginationChange` | REQ-1.3 |
| `connections-view.tsx` ลบ mobile grid/ConnectionCard; `table-columns.tsx` ลบ spine | REQ-1.4 |
| `table-columns.tsx` คอลัมน์ + action icon | REQ-1.5 |
| `connections-view.tsx` คง PspRouteGate/hooks/InlineNotice | REQ-1.6 |
| `detail-view.tsx` EditPageHeader actions | REQ-2.1, 2.2 |
| `detail-view.tsx` card header band + sections | REQ-2.3 |
| `detail-view.tsx` footer actions + gate | REQ-2.4 |
| ลบ `connection-header.tsx` | REQ-2.5, 4.4 |
| `create-view.tsx` PageHeader actions + card | REQ-3.1 |
| `edit-view.tsx` EditPageHeader actions + card | REQ-3.2 |
| `create-view.tsx`/`edit-view.tsx` identity band | REQ-3.3 |
| คง ConfirmDialog/intent/validation/CredentialChangeDialog | REQ-3.4 |
| `styles.ts` ลอก class แทน import ข้าม module | REQ-4.1 |
| ไฟล์ที่แตะจำกัดตามตารางด้านบน | REQ-4.2 |
| `page.test.ts` + typecheck/lint/test | REQ-4.3 |
