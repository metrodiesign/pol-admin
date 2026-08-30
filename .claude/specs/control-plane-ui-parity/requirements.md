# Requirements: Control Plane UI Parity (4 nav group ให้เหมือน merchant user/role)

> Status: approved 2026-08-31 (quick, no gates)

## บริบท

หน้าใต้ nav group `Control plane · การเชื่อมต่อ / การกำกับดูแล / การเงิน / องค์กร` (10 screens, 8 read pages)
ยังใช้ภาษาภาพแบบ "control room" (StatusSpine, overline, summary/aside grid, `ControlListToolbar` sentinel)
ขณะที่ PSP (PR #125, spec `psp-ui-parity`) ถูกแปลงให้เหมือน `/merchant/user/*` และ `/merchant/role/*` แล้ว
งานนี้ขยาย pattern เดียวกันให้ครบทุก screen โดยไม่แตะ mock data, store, filter/sort/pagination logic, action handler

การตัดสินใจที่ล็อกตอน /spec-quick:

| ประเด็น | ตัดสินใจ |
|---|---|
| Stat/KPI/chart/endpoint cards | คงไว้ เปลี่ยนเฉพาะ shell เป็น `rounded-card bg-card p-6` + `cardStyle` |
| PR | PR เดียวครบ 4 group, checkpoint commit ต่อ group |
| Badge สถานะ | คง `ControlStatusBadge` (tone ร่วม) |
| Toolbar | shared `ControlToolbar` ใหม่ (grid + clearable + จำนวนต่อหน้า) แทน `ControlListToolbar` เพื่อไม่ซ้ำ 10 ที่ |

Screens ใน scope:

| group | route | view | detail |
|---|---|---|---|
| การเชื่อมต่อ | `/control/routing` | `routing/rules-view.tsx` | `routing/detail-view.tsx` |
| การเชื่อมต่อ | `/control/api-clients` | `api-client/view.tsx` | `api-client/detail-view.tsx` |
| การเชื่อมต่อ | `/control/webhooks` | `webhook/view.tsx` | `webhook/detail-view.tsx` |
| การกำกับดูแล | `/control/approvals` | `approval/view.tsx` | `approval/detail-view.tsx` |
| การกำกับดูแล | `/control/audit` | `audit/log-view.tsx` | `audit/detail-view.tsx` |
| การกำกับดูแล | `/control/notifications` | `notification/view.tsx` | `notification/log-detail-view.tsx` |
| การเงิน | `/control/reconciliation` | `reconciliation/view.tsx` | - |
| การเงิน | `/control/reports` | `reports/view.tsx` | - |
| องค์กร | `/control/tenants` | `tenant/view.tsx` | `tenant/detail-view.tsx` |
| องค์กร | `/control/originators` | `originator/view.tsx` | `originator/detail-view.tsx` |

## REQ-1: หน้า List ใช้โครงเดียวกับ merchant user list

- 1.1 WHEN เปิด list route ใด ๆ ใน scope THE SYSTEM SHALL แสดง `PageHeader` โดยไม่มี prop `description` และ breadcrumbs รูป `[{ label: <ชื่อเมนู>, href: <list route> }, { label: "รายชื่อ" }]`
- 1.2 THE SYSTEM SHALL แสดง toolbar เป็น grid `grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3` ที่มี `TextField` "ค้นหา" (เมื่อ screen มี search), `SelectField` แบบ `clearable` placeholder "ทั้งหมด" ต่อ filter และ `SelectField` "จำนวนต่อหน้า" (เมื่อ screen มี pagination) ผูก `table.setPageSize` และรีเซ็ตหน้าแรก
- 1.3 THE SYSTEM SHALL คง `DataTable` เดิมพร้อม `dense`, `rowsPerPageOptions`, `searchQuery`, `showSelectionAction={false}` และค่า pageSize/sorting เริ่มต้นเดิม
- 1.4 THE SYSTEM SHALL ไม่แสดงคอลัมน์ `StatusSpine` และคอลัมน์ chevron ในทุกตาราง
- 1.5 WHEN แถวมีหน้า read THE SYSTEM SHALL แสดงคอลัมน์ action ท้ายแถวเป็นไอคอน "ดูรายละเอียด" (Eye + Tooltip) ด้วย class เดียวกับ `merchant/user/table-columns.tsx`; action เฉพาะ domain (replay, approve/reject, reorder) แสดงเป็นไอคอนชุดเดียวกัน
- 1.6 THE SYSTEM SHALL คง stat/KPI/chart/endpoint cards และ info card ที่มีอยู่ โดยเปลี่ยน shell เป็น `rounded-card bg-card p-6` + `cardStyle`
- 1.7 WHEN เปิด `/control/notifications` THE SYSTEM SHALL แสดง tab strip แบบ `merchant/user/list-tabs.tsx` (ปุ่มบน `bg-grey-200 p-2` + count badge) ภายใน card เดียว แทน base-ui `Tabs`

## REQ-2: หน้า Read ใช้โครงเดียวกับ merchant user/role read

- 2.1 WHEN เปิด read route ใด ๆ THE SYSTEM SHALL แสดง `EditPageHeader` จากภายใน detail view พร้อม actions ที่มี "ยกเลิก" (`cancelClass`) กลับ list เสมอ
- 2.2 WHEN read เป็น webhook THE SYSTEM SHALL แสดง "ส่ง event ซ้ำ" เป็นปุ่มหลัก (`primaryClass`) ใน header; WHEN read เป็น approval THE SYSTEM SHALL แสดง "ปฏิเสธ" (`warningClass`) และ "อนุมัติ" (`primaryClass`) ใน header โดยคง `canApprove` gate และ confirm dialog เดิม
- 2.3 THE SYSTEM SHALL แสดงเนื้อหาใน card เดียว `overflow-hidden rounded-card bg-card` + `cardStyle` ประกอบด้วย identity band (title, subtitle, id mono, badges) และ sections `border-b p-6`
- 2.4 THE SYSTEM SHALL ไม่แสดง overline "Control plane · ...", `StatusSpine`, `<aside>` หรือ grid `mmd:grid-cols-12`
- 2.5 IF ไม่พบรายการ THEN THE SYSTEM SHALL ยังแสดง `EditPageHeader` และ card แจ้งไม่พบด้วย shell เดียวกัน
- 2.6 THE SYSTEM SHALL คง action เฉพาะ domain (revoke + dialog ของ api-client, toggle switch ของ routing, replay ของ webhook, approve/reject ของ approval) และ toast message เดิม

## REQ-3: Shared kit ของ control plane

- 3.1 THE SYSTEM SHALL ย้าย `cancelClass`, `primaryClass`, `cardStyle` ไป `src/components/control/shared/styles.ts` เพิ่ม `warningClass` (ลอกจาก `merchant/role/read-view.tsx`) และให้ `psp/styles.ts` re-export
- 3.2 THE SYSTEM SHALL มี `ControlToolbar` (`shared/toolbar.tsx`) ที่ render grid ตาม REQ-1.2 รับ `search?`, `filters?`, `rowsPerPage?`
- 3.3 THE SYSTEM SHALL มี `DetailIdentity`, `DetailSection`, `DetailNotFound` (`shared/detail-shell.tsx`) ตาม REQ-2.3/2.5
- 3.4 THE SYSTEM SHALL มี `StatCard` (`shared/stat-card.tsx`) แทน StatCard ที่ซ้ำใน approval, api-client, reconciliation, reports
- 3.5 THE SYSTEM SHALL มี `RowActions`, `RowActionLink`, `RowActionButton` (`shared/row-action.tsx`) ตาม REQ-1.5
- 3.6 WHEN ไม่มีผู้ใช้เหลือ THE SYSTEM SHALL ลบ `shared/list-toolbar.tsx` และ `shared/status-spine.tsx`

## REQ-4: ขอบเขตและคุณภาพ

- 4.1 THE SYSTEM SHALL ไม่ import จาก `src/components/merchant/**` เข้า `src/components/control/**`
- 4.2 THE SYSTEM SHALL ไม่แก้ `src/lib/**`, `src/types/**`, `src/components/{merchant,shared,table,ui,charts,layout}/**`, `globals.css` และ `src/components/control/psp/**` นอกจาก `styles.ts`
- 4.3 THE SYSTEM SHALL ผ่าน `npm run typecheck`, `npx eslint src/components/control src/app/control`, `npm test` และ `scripts/spec-trace.sh control-plane-ui-parity`
- 4.4 THE SYSTEM SHALL มี SSR markup test ครอบทุก list view และ detail view ใน scope (มี "จำนวนต่อหน้า"/`lg:grid-cols-3` เมื่อเกี่ยวข้อง, "ยกเลิก" ก่อน `rounded-card`, ไม่มี `<aside`/`mmd:grid-cols-12`/`status-spine`)
- 4.5 THE SYSTEM SHALL บันทึก note superseded ใน `.claude/specs/control-plane/design.md` ส่วน Signature design language

## Self-check (5 หมวดของ /spec-analyze)

| หมวด | ผลตรวจ |
|---|---|
| Logical inconsistency | REQ-1.4/3.6 ขัดกับ "Signature design language" ใน control-plane/design.md — แก้ด้วย REQ-4.5 |
| Ambiguity | "ปุ่มหลัก" ระบุต่อ screen ใน REQ-2.2; screen อื่นมีเฉพาะ "ยกเลิก" |
| Conflicting constraints | REQ-1.3 คง pageSize 10 ขณะ merchant ใช้ 25 — ตัดสินใจคงค่าเดิม (ห้ามเปลี่ยน default) |
| Gaps | reports/reconciliation ไม่มี read page จึงไม่เข้า REQ-2; notification rules tab ไม่มี pagination จึงไม่มี "จำนวนต่อหน้า" |
| Unstated assumptions | revoke ของ api-client เป็น destructive จึงอยู่ท้าย card (variant destructive) ไม่ใช่ปุ่มหลักใน header |
