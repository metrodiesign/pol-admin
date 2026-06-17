# UI Reference — user-role-module

> Durable capture of the two design screenshots provided at /spec-new (ephemeral images).
> Authoritative for the main screen layout, copy, seed data, and permission catalog.
> Style note: custom polished design (NOT generic Minimals demo) — honor at design gate
> (see memory: no-minimals-template-aesthetic).

## Decisions locked at /spec-new

- Persistence: **read-only mock** — data seeded from typed mock; CRUD controls are present
  as UI (button / drawer / form) but do NOT mutate or persist (frontend-only, no backend).
- Scope: Roles list + permission-matrix detail drawer + create/edit (per screenshots).
- Permission model: **Resource x Action** — permission = key `resource.action` (e.g. `txn.view`),
  grouped by resource in the UI.
- Menu: label `บทบาทและสิทธิ์`, path `/user/role`, placed right after `ผู้ใช้งาน` in the
  existing subheader `ผู้ใช้งาน & สิทธิ์` (nav-config.ts).
- Module is isolated: new route `src/app/user/role/*` + new components; MUST NOT share with
  or modify existing `src/app/user/*` / `src/components/user/*`.

## Screen 1 — Roles list

- Breadcrumb: `Console > บทบาทและสิทธิ์`
- Page title: `บทบาทและสิทธิ์`
- Subtitle: `RBAC แบบ Dynamic · 5 บทบาท · สร้าง แก้ไข และลบได้เอง ไม่จำกัดจำนวน`
  (the "5 บทบาท" count is dynamic from the role list length)
- Primary action button (top-right): `+ เพิ่มบทบาทใหม่`
- Table columns: `บทบาท` | `คำอธิบาย` | `สิทธิ์` | `ผู้ใช้` | (row actions)
  - บทบาท cell = colored role badge (dot + Thai name) over a mono role code
  - สิทธิ์ cell = horizontal progress bar + `granted/total` (e.g. `14/14`)
  - ผู้ใช้ cell = people icon + bound-user count
  - row actions = edit (pencil), duplicate (copy), delete (trash) icons
- Footer note: `สิทธิ์รวมของผู้ใช้ = union ของสิทธิ์จากทุกบทบาทที่ได้รับ · บทบาทที่มีผู้ใช้ผูกอยู่จะลบไม่ได้`

### Seed roles (5)

| code        | name (th)            | badge color | granted/total | users | description |
|-------------|----------------------|-------------|---------------|-------|-------------|
| super_admin | ผู้ดูแลระบบสูงสุด     | red         | 14/14         | 1     | เข้าถึงได้ทุกส่วนของระบบ รวมถึงการตั้งค่าความปลอดภัย |
| ops_admin   | ผู้ดูแลฝ่ายปฏิบัติการ | blue        | 6/14          | 2     | ดูแลธุรกรรมและร้านค้าประจำวัน |
| finance     | ผู้ดูแลการเงิน        | green       | 5/14          | 2     | จัดการใบแจ้งหนี้และรอบ Settlement |
| support     | เจ้าหน้าที่ซัพพอร์ต    | amber       | 3/14          | 2     | ตอบคำถามลูกค้า ดูข้อมูลได้อย่างเดียว |
| auditor     | ผู้ตรวจสอบ            | gray        | 3/14          | 1     | เข้าถึงบันทึกกิจกรรมและรายงานแบบอ่านอย่างเดียว |

## Screen 2 — Role detail drawer (right slide-over)

- Header: close (x), role badge + title (e.g. `ผู้ดูแลระบบสูงสุด`), sub `รหัสบทบาท: super_admin`,
  buttons `สำเนา` (duplicate) + `แก้ไข` (edit, primary)
- Body: role badge + description repeated
- Two stat cards: `สิทธิ์ที่ได้รับ` `14/14` · `ผู้ใช้ที่ผูก` `1`
- Section `สิทธิ์ที่ได้รับ` = permission list grouped by resource; each group header shows
  `granted/total` for that group (e.g. `ธุรกรรม 3/3`)
- Each permission row = check icon + Thai label (left) + mono key (right)
- Footer: `ลบบทบาท` (left, destructive) · `ปิด` (right)

## Permission catalog (Resource x Action) — 14 total

Confirmed from screenshot (resource group : key — th label):

- ธุรกรรม (txn): `txn.view` ดูรายการธุรกรรม · `txn.refund` สั่งคืนเงิน · `txn.export` ส่งออกข้อมูลธุรกรรม
- ร้านค้า (merchant): `merchant.view` ดูข้อมูลร้านค้า · `merchant.manage` เพิ่ม/แก้ไข/ระงับร้านค้า
- การเงิน: `invoice.view` ดูใบแจ้งหนี้ · `invoice.manage` ออก/ยกเลิกใบแจ้งหนี้ · `settlement.run` สั่ง Settlement รอบพิเศษ
- ผู้ใช้งาน (user): `user.view` ดูรายชื่อผู้ใช้งาน · `user.manage` เปิด/แก้ไข/ปิดบัญชีผู้ใช้ · `user.<3rd, cut off in image>`

Subtotal above = 11. Remaining ~3 permissions to define during /spec-requirements or /spec-design
so total = 14 (candidates aligned to POL domain: role/RBAC management, reports, audit, settings —
e.g. `role.view` / `role.manage`, `report.view`, `audit.view`, `settings.manage`). Final catalog
to be locked in design.md. The `granted/total` denominator (14) must equal the catalog size.
