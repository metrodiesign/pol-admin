# Implementation Tasks: User RBAC Module

> Status: approved 2026-06-17

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. Data + pure logic foundation — `src/types/rbac.ts` (Role/Permission/ResourceGroup/RoleColor/
     RoleFormInput), `src/lib/mock/rbac.ts` (RESOURCE_GROUPS 5, PERMISSION_CATALOG 14, RBAC_ROLES 5 seed
     ตรง ui-reference: 14/6/5/3/3), `src/lib/rbac/role-permissions.ts` (pure selectors: grantedCount,
     groupedCatalog, groupGranted, filterRoles, isRoleDeletable, makeCopyCode, validateRoleForm).
     Selectors เขียนแบบ pure/test-ready (no React). Done = type ครบ, catalog key ไม่ซ้ำ, seed counts ถูก.
     Satisfies: REQ-5 (all). Verify: `npm run build` (typecheck) ผ่าน; ตรวจ seed granted = 14/6/5/3/3.
     Evidence: `npm run build` -> compiled OK (typecheck pass, exit 0); catalog keys 14/14 unique (REQ-5.3); seed granted super_admin 14/14 | ops_admin 6 | finance 5 | support 3 | auditor 3 (ตรง ui-reference); viewports n/a — logic-only; deviations none

- [x] 2. Nav menu + active-menu fix (D1-C) — เพิ่ม item `บทบาทและสิทธิ์` (path `/user/rbac`, icon `lock`,
     match `/user/rbac`) ต่อท้าย `ผู้ใช้งาน` ใน **ทั้ง** `nav-config.ts` และ `minimals-nav-config.ts`;
     เพิ่ม optional `exclude?: string[]` ใน `NavItem`; guard ใน `sidebar-nav.tsx:isActivePath` (ข้าม
     deep-match ถ้า pathname ขึ้นต้นด้วย prefix ใน exclude); ใส่ `exclude:["/user/rbac"]` ที่ item
     `ผู้ใช้งาน`. ห้ามแตะ behaviour อื่นของ `ผู้ใช้งาน`. Done = บน `/user/rbac` เฉพาะ `บทบาทและสิทธิ์`
     active; บน `/user/list,new,edit,read` `ผู้ใช้งาน` ยัง active ครบ.
     Satisfies: REQ-1 (all). Verify: `npm run build`; manual — เดินทั้งสอง layout + ทุกหน้า /user/*.
     Evidence: `npm run build` -> Compiled successfully (exit 0); เพิ่ม item ทั้ง `nav-config.ts`+`minimals-nav-config.ts` (REQ-1.1/1.2), `exclude?:string[]` ใน NavItem + guard ใน `sidebar-nav.tsx:isActivePath` (return false เมื่อ pathname อยู่ใน exclude prefix) -> บน `/user/rbac` `ผู้ใช้งาน` ไม่ active, `บทบาทและสิทธิ์` active (REQ-1.3); `ผู้ใช้งาน` ยัง active บน /user/list,new,edit,read (REQ-1.4 — base `/user` ยังคลุม, ตัดเฉพาะ /user/rbac); horizontal nav ใช้ item.path ไม่ใช้ match -> /user/rbac ไม่ทำให้ ผู้ใช้งาน สว่าง อยู่แล้ว; browser nav-active walkthrough ทำรวมใน task 3 (route เพิ่งมีใน T3); viewports n/a — nav logic ไม่เปลี่ยน layout; deviations: browser confirm เลื่อนไป T3

- [x] 3. Route + roles list — `src/app/user/rbac/page.tsx` (PageHeader heading+breadcrumb เท่านั้น, ไม่ส่ง
     action) + `src/components/rbac/` : `rbac-roles-view.tsx` (client container, seed จาก mock, state
     search/selected), `rbac-roles-toolbar.tsx` (subtitle `{N} บทบาท · ...`, ช่องค้นหา, ปุ่ม `+ เพิ่มบทบาทใหม่`),
     `rbac-roles-table.tsx` (badge/คำอธิบาย/progress/users/actions, cell บทบาท = `<button>` เปิด detail,
     actions stopPropagation, empty + no-result), `rbac-role-badge.tsx`, `rbac-permission-progress.tsx`
     (`value/max`). ห้าม import `components/user/*`. Done = ตาราง+subtitle+footer+search ทำงาน, แยกไฟล์ครบ.
     Satisfies: REQ-2 (all), REQ-3 (all), REQ-11 (all), REQ-12 (all). Depends on: 1, 2.
     Verify: `npm run build`; manual — list/subtitle/footer/search/no-result + keyboard reach + focus.
     Evidence: `npm run build` -> Compiled successfully (exit 0), route `○ /user/rbac` prerendered; สร้าง `app/user/rbac/page.tsx` (PageHeader heading+breadcrumb Console>บทบาทи สิทธิ์ เท่านั้น, ไม่ส่ง action — C2) + `components/rbac/`: rbac-roles-view (client, seed RBAC_ROLES คงที่ + filterRoles), rbac-roles-toolbar (subtitle `{N} บทบาท...` จาก seed length REQ-3.2/12.4 + search + ปุ่มเพิ่ม), rbac-roles-table (badge เหนือ mono code = `<button>` keyboard-reachable + focus-visible ring REQ-11.1, progress `{g}/{total}` REQ-3.5, users icon, actions edit/copy/delete มี aria-label REQ-11.2 + stopPropagation, empty REQ-3.9 + no-result REQ-12.3, footer note REQ-3.8), rbac-role-badge (REQ-3.4/11.3), rbac-permission-progress (REQ-3.5); ไม่ import `components/user/*` (REQ-2.4); viewports: browser sweep รวมที่ T7 (UI ยัง evolve ใน T4-T6 — วัดครั้งเดียวกับ UI สุดท้าย) — pending; deviations: browser viewport check เลื่อนไป T7 consolidated walkthrough

- [x] 4. Detail drawer — `src/components/rbac/rbac-role-detail-sheet.tsx` (`<Sheet side=right
     showCloseButton={false}>` + custom header close/สำเนา/แก้ไข, stat cards สิทธิ์/ผู้ใช้, สิทธิ์จัดกลุ่ม
     ตาม resource + `{granted}/{total}` ต่อกลุ่ม, footer ลบบทบาท/ปิด) wired เข้า view. Done = คลิกบทบาท
     เปิด drawer แสดงสิทธิ์ครบตาม groupGranted, ปิดได้ทุกทาง.
     Satisfies: REQ-4 (all). Depends on: 3. Verify: manual — เปิด super_admin เห็น 14/14 จัดกลุ่ม 5 หมวด.
     Evidence: `npm run build` -> Compiled successfully (exit 0); `rbac-role-detail-sheet.tsx` = `<Sheet side=right showCloseButton={false}>` + custom header (RbacRoleBadge+ชื่อ ใน SheetTitle sr-only, `รหัสบทบาท: {code}`, ปุ่ม สำเนา/แก้ไข + close x — REQ-4.2/M2), stat cards สิทธิ์ที่ได้รับ `{granted}/{total}` + ผู้ใช้ที่ผูก `{count}` (REQ-4.3), สิทธิ์จัดกลุ่มตาม resource ผ่าน groupedCatalog+groupGranted หัวกลุ่ม `{g}/{total}` (REQ-4.4), แต่ละ row = check + label ไทย (ซ้าย) + mono key (ขวา) REQ-4.5, footer ลบบทบาท + ปิด (REQ-4.6); wired: table onSelect -> setDetailRole -> Sheet open; ปิดได้ทาง x/ปิด/คลิกนอก (base-ui backdrop) -> onOpenChange clear (REQ-4.1/4.7); super_admin -> granted 14/14, ทั้ง 5 หมวดเต็ม; viewports: browser sweep รวมที่ T7 — pending; deviations: แสดงเฉพาะกลุ่มที่ได้รับสิทธิ์ >=1 (กลุ่ม 0 granted ซ่อน) เป็น UI choice ของ "สิทธิ์ที่ได้รับ"; browser viewport check เลื่อนไป T7

- [x] 5. Create / edit / duplicate form — `rbac-role-form-dialog.tsx` (`<Dialog>` 3 mode) +
     `rbac-permission-matrix.tsx` (checkbox จัดกลุ่ม + เลือก/ยกเลิกทั้ง group) + validateRoleForm wiring.
     edit: code read-only (REQ-7.3). duplicate: pre-fill + makeCopyCode + userCount 0. Done = ฟอร์มเปิดจาก
     add/แก้ไข/สำเนา, validation บล็อกชื่อ/รหัสว่าง+รหัสซ้ำ, save ปิดฟอร์ม (UI-shell, ไม่ mutate).
     Satisfies: REQ-6 (all), REQ-7 (all), REQ-8 (all). Depends on: 3. Verify: manual — ทุก mode + ทุกเคส validation.
     Evidence: `npm run build` -> Compiled successfully (exit 0); `rbac-role-form-dialog.tsx` = `<Dialog>` 3 mode (create/edit/duplicate, title ต่าง mode), fields ชื่อ/รหัส/คำอธิบาย/สี badge + `rbac-permission-matrix.tsx` (checkbox จัดกลุ่ม resource + เลือก/ยกเลิกทั้งกลุ่ม indeterminate REQ-6.2); key=`${mode}:${code}` -> remount state สดทุกครั้งเปิด; เปิดจาก toolbar add (create), table+detail แก้ไข (edit pre-fill REQ-7.1), สำเนา (duplicate pre-fill + makeCopyCode + ชื่อ `(สำเนา)` REQ-8.1); edit code read-only ผ่าน `disabled` (REQ-7.3) + validateRoleForm ไม่เช็ค code ตอน edit; validation: ชื่อว่าง (ทุก mode REQ-6.4/7.4) / รหัสว่าง (create,duplicate) / รหัสซ้ำ (create,duplicate REQ-6.5/8.1) -> error ใต้ field, ไม่ submit; save valid -> onSubmit + onOpenChange(false) ปิด (UI-shell ไม่ mutate — REQ-6.3/7.2, toast ผูกใน T7); ยกเลิก = DialogClose ไม่เปลี่ยนข้อมูล (REQ-7.5); viewports: browser sweep รวมที่ T7 — pending; deviations: onSubmit เป็น no-op ใน T5 (toast wiring มาใน T7); browser viewport check เลื่อนไป T7

- [x] 6. Delete + guard — `rbac-delete-dialog.tsx` (confirm) wired เข้า table+detail. userCount>0 → ปุ่มลบ
     disabled + tooltip เหตุผล (REQ-9.2/9.3); =0 → confirm แล้วปิด (UI-shell, ไม่ลบจริง). Done = guard ถูก,
     confirm flow ครบ.
     Satisfies: REQ-9 (all). Depends on: 3. Verify: manual — ลบ auditor(0?) vs role ที่ users>0 (disabled).
     Evidence: `npm run build` -> Compiled successfully (exit 0); `rbac-delete-dialog.tsx` = `<Dialog>` confirm (ชื่อบทบาท + ปุ่ม ยกเลิก/ลบบทบาท), onConfirm -> ปิด dialog + ปิด detail drawer (REQ-9.1) ไม่ลบจริง (REQ-10.2); guard ผ่าน `isRoleDeletable` (userCount===0): table + detail footer -> ถ้า userCount>0 ปุ่มลบ `disabled` + `<Tooltip>` "มีผู้ใช้ผูกอยู่ — ลบบทบาทนี้ไม่ได้" (REQ-9.2/9.3), wrap span trigger ให้ tooltip โชว์ตอน disabled; viewports: browser sweep รวมที่ T7 — pending; deviations: seed ทั้ง 5 บทบาทมี userCount>0 (1/2/2/2/1) -> ปุ่มลบ disabled ทุกแถว (ตรง REQ-9.3); confirm path (userCount===0) wired ครบแต่ไม่ reachable จาก seed (UI-shell ไม่เพิ่ม role userCount 0 เข้ารายการ) — บันทึกตามจริง; browser viewport check เลื่อนไป T7

- [x] 7. Toast + UI-shell semantics — `use-rbac-toast.ts` (hook + fixed container, ไม่มี dep ใหม่) +
     ผูกให้ create/edit/duplicate/delete แสดง toast `<action> บทบาท "<name>" สำเร็จ` (REQ-13.1), validation
     block ไม่ toast (REQ-13.2); ยืนยัน subtitle `{N}`/ตาราง = seed คงที่ ไม่เปลี่ยนจาก CRUD, ไม่เรียก
     network/storage (REQ-10). Done = toast ครบทุก action, reload กลับ seed, ไม่มี mutation จริง.
     Satisfies: REQ-10 (all), REQ-13 (all). Depends on: 5, 6. Verify: manual — ทุก action เห็น toast; reload คงที่.
     Evidence: `npm run build` -> Compiled successfully (exit 0) + `scripts/spec-trace.sh` -> OK 57 เกณฑ์ครบ EARS lint ผ่าน; `use-rbac-toast.ts` (state array + auto-dismiss 3s, ไม่มี dep ใหม่) + `rbac-toaster.tsx` (fixed container, role=status aria-live); browser walkthrough (production build `next start`, hydrated fiber=true) — บันทึกรวมทุก viewport ที่นี่ (UI evolve T3-T7 -> วัดครั้งเดียวกับ UI สุดท้าย):
       - viewports: 375 clientWidth===375 OK (emulate mobile) | 768 clientWidth===768 OK | 1440 clientWidth===1440 OK — ทุก viewport `scrollWidth===innerWidth` ไม่มี horizontal overflow
       - REQ-13.1 toast: กรอกชื่อ+รหัส valid -> save -> toaster "สร้างบทบาท “บทบาทเงินสด” สำเร็จ" + dialog ปิด (action+ชื่อบทบาทครบ)
       - REQ-13.2: save ฟอร์มว่าง -> errors "กรุณากรอกชื่อบทบาท"+"กรุณากรอกรหัสบทบาท", dialog ยังเปิด, ไม่มี toast
       - REQ-10 UI-shell: หลัง save valid -> ตารางยัง 5 แถว, subtitle ยัง "5 บทบาท", code ใหม่ไม่เข้ารายการ (seed คงที่ ไม่ mutate); ไม่มี network/storage write
       - REQ-12: search "finance" -> 1 แถว, subtitle ยัง 5; "zzzzz" -> no-result + 0 แถว, subtitle ยัง 5; ล้าง -> กลับ 5 แถว (REQ-12.4 subtitle = seed คงที่)
       - REQ-4 detail (super_admin): stat 14/14 + ผู้ใช้ 1, group tallies 3/3·2/2·3/3·3/3·3/3 = 14 ใน 5 หมวด, 14 perm rows, ปุ่ม แก้ไข/สำเนา/ลบ ครบ, ปิดด้วยปุ่ม ปิด ได้
       - REQ-9 guard: ปุ่มลบ disabled ครบทั้ง 5 แถว + detail footer (seed userCount>0 ทุกบทบาท) — REQ-9.3
       - REQ-1 nav (1440 sidebar): บน /user/rbac -> `บทบาทและสิทธิ์` semibold+primary bg active, `ผู้ใช้งาน` medium/transparent ไม่ active (REQ-1.3); บน /user/list -> `ผู้ใช้งาน` active, `บทบาทและสิทธิ์` ไม่ active (REQ-1.4) — D1-C exclude ทำงานถูก
       - deviations: container แยกเป็น `rbac-toaster.tsx` (.ts มี JSX ไม่ได้) ต่างจาก design ที่รวมใน `use-rbac-toast.ts` — แยก hook/JSX เท่านั้น ไม่กระทบ behaviour; nav active /user/new,/edit,/read ยืนยันด้วย logic (base `/user` คลุม, exclude แค่ /user/rbac) + ตัวแทน /user/list สังเกตจริง; เจอ dev server ค้างบน 5200 (HMR ทำ hydration ไม่ทำงาน) จึ serve production build บนพอร์ตว่าง 5411 verify แล้วปิด server

## Suggested execution batches

> COUPLED feature (ทุก task แชร์ `types/rbac` + `lib/rbac` selectors + `lib/mock/rbac` + RbacRolesView state +
> primitive เดียวกัน). DEFAULT = รัน **ทั้งหมดใน session เดียว**: `scripts/pane-loop.sh user-rbac-module all-in-one`
> (หรือ `/spec-implement all`). แยก session จ่าย cold-cache ซ้ำ ~30-40% แพงกว่า สำหรับงาน coupled แบบนี้.
> ลำดับ: 1 → 2 → 3 → (4, 5, 6) → 7. task 4/5/6 ขึ้นกับ 3 ร่วมกัน, task 7 ปิดท้าย (ผูก toast/UI-shell).
