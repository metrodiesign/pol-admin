# Design: Control Plane UI Parity

> Status: approved 2026-08-31 (quick, no gates); badge parity และความสูง 30px approved 2026-08-31

## แนวทาง

Presentation-only refactor ต่อยอดจาก `psp-ui-parity`: ดึง pattern ที่ PSP ทำไว้ขึ้นเป็น shared kit ใต้
`src/components/control/shared/` แล้วให้ทุก screen ใน scope ใช้ kit เดียวกัน ไม่แตะ lib/store/types/mock

## Shared kit

| ไฟล์ | export | หน้าที่ |
|---|---|---|
| `shared/styles.ts` | `cancelClass`, `primaryClass`, `warningClass`, `cardStyle`, `controlBadgeClass` | shared visual tokens จาก merchant role/user |
| `shared/toolbar.tsx` | `ControlToolbar` | grid toolbar: `search?`, `filters?` (SelectField clearable), `rowsPerPage?` |
| `shared/detail-shell.tsx` | `DetailIdentity`, `DetailSection`, `DetailNotFound` | identity band / section / not-found ใน card เดียว |
| `shared/stat-card.tsx` | `StatCard` | `rounded-card bg-card p-6` + `cardStyle`, รับ `trailing` สำหรับ sparkline |
| `shared/row-action.tsx` | `RowActions`, `RowActionLink`, `RowActionButton` | ปุ่มไอคอน + Tooltip แบบ merchant user columns |

```ts
interface ControlToolbarProps {
  search?: { value: string; onChange: (v: string) => void; placeholder: string };
  filters?: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }[];
  rowsPerPage?: { value: number; onChange: (n: number) => void; options: number[] };
}
```

## โครงต่อ screen

```text
List:  PageHeader(breadcrumbs [menu -> list, "รายชื่อ"], ไม่มี description)
       [stat/kpi/endpoint cards -> StatCard shell]  [banner คงเดิม]
       card: [tabs strip] -> ControlToolbar -> DataTable
Read:  EditPageHeader(actions: ยกเลิก [+ primary/warning ตาม REQ-2.2])
       card: DetailIdentity -> DetailSection* -> footer actions (revoke / toggle)
```

Columns: ลบ `spine` + `chevron`; เพิ่ม `actions` = `RowActions` (Eye link + domain icons)

Detail actions per screen:

| screen | header | footer |
|---|---|---|
| routing | ยกเลิก | section สถานะ + Switch |
| api-client | ยกเลิก | เพิกถอน (destructive) + Dialog |
| webhook | ยกเลิก, ส่ง event ซ้ำ (primary) | - |
| approval | ยกเลิก, ปฏิเสธ (warning), อนุมัติ (primary) | - |
| audit / notification / tenant / originator | ยกเลิก | - |

Notifications tabs: local `notification/tabs.tsx` (ลอก strip จาก merchant user list-tabs) ควบ state `tab` ใน `NotificationsView`; RulesTab/LogTab render ใต้ strip ใน card เดียว

## Badge parity amendment

`controlBadgeClass` กำหนด geometry กลางเป็น `inline-flex h-[30px] items-center rounded-full px-4 py-1 text-sm font-semibold` เพื่อบังคับความสูง 30px โดย consumer ยังคง semantic color, variant และ icon ของ domain เดิม

| กลุ่ม | แนวทาง |
|---|---|
| Lifecycle status | `ControlStatusBadge` ใช้ pill geometry และไม่ render default dot |
| PSP status | ใช้ pill geometry แต่คง Enabled/Health/Approval icon และ label แยกกัน |
| Scope/channel/type/SAQ/PSP | เพิ่ม `controlBadgeClass` ให้ `Badge` ที่ consumer โดยไม่แก้ global primitive |
| Signature/protocol/auth/read-only/legal | เปลี่ยน raw marker เป็น pill geometry และคง icon/tone/text เดิม |
| Notification tab count | คง compact geometry จาก merchant user tabs |

Regression coverage เพิ่มใน `control-parity.test.ts`: shared geometry, no default dot, semantic icon preservation และ compact tab count จาก SSR markup

## ไฟล์ที่แตะ

- shared: `styles.ts`, `status-badge.tsx`, `toolbar.tsx`, `detail-shell.tsx`, `stat-card.tsx`, `row-action.tsx`
- badge consumers: API client, approval, audit, notification, originator, PSP, routing, reconciliation, tenant และ webhook columns/detail views
- psp: `styles.ts` -> re-export
- ทุก view/columns/detail-view ในตาราง scope + `stat-cards.tsx` (approval, api-client), `kpi-cards.tsx`, `notification/tabs.tsx` (ใหม่)
- pages: `src/app/control/<route>/page.tsx` (ถอด description, breadcrumbs), `src/app/control/<route>/read/page.tsx` (ถอด EditPageHeader)
- tests: `src/components/control/control-parity.test.ts`
- `.claude/specs/control-plane/design.md` note

## Requirement Traceability

| Design element | satisfies |
|---|---|
| `src/app/control/*/page.tsx` PageHeader breadcrumbs ไม่มี description | REQ-1.1 |
| `shared/toolbar.tsx` `ControlToolbar` ใช้ในทุก list view | REQ-1.2, REQ-3.2 |
| view files คง DataTable props/initialState | REQ-1.3 |
| columns files ลบ spine/chevron | REQ-1.4 |
| `shared/row-action.tsx` + คอลัมน์ `actions` | REQ-1.5, REQ-3.5 |
| `shared/stat-card.tsx` + kpi/endpoint/info cards | REQ-1.6, REQ-3.4 |
| `notification/tabs.tsx` + `notification/view.tsx` | REQ-1.7 |
| detail-view files EditPageHeader + cancel | REQ-2.1 |
| webhook/approval detail header actions | REQ-2.2 |
| `shared/detail-shell.tsx` DetailIdentity/DetailSection | REQ-2.3, REQ-3.3 |
| detail-view files ลบ overline/spine/aside | REQ-2.4 |
| `DetailNotFound` + header ใน not-found branch | REQ-2.5 |
| detail-view files คง revoke/toggle/replay/approve | REQ-2.6 |
| `shared/styles.ts` + `psp/styles.ts` re-export | REQ-3.1 |
| ลบ `list-toolbar.tsx`, `status-spine.tsx` | REQ-3.6 |
| ไม่มี import merchant ใน control | REQ-4.1 |
| ไฟล์ที่แตะจำกัดตามรายการด้านบน | REQ-4.2 |
| typecheck/eslint/npm test/spec-trace | REQ-4.3 |
| `control-parity.test.ts` | REQ-4.4 |
| `.claude/specs/control-plane/design.md` note | REQ-4.5 |
| `shared/styles.ts` + `shared/status-badge.tsx` + `lib/control/status.ts` | REQ-4.2, REQ-5.1, REQ-5.2 |
| Control badge consumers + raw semantic markers | REQ-5.3 |
| `notification/tabs.tsx` compact count | REQ-5.4 |
| `control-parity.test.ts` + browser matrix | REQ-5.5 |
