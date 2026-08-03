# Implementation Tasks: โมดูลโครงสร้างองค์กร (organization-structure)

> Status: approved 2026-08-02; ต่อ task 7-12 เพิ่ม 2026-08-03 (migrate ตาม REQ-7 revised — แยกอิสระต่อ module)

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

> Task 1-6 คือ implementation เดิมภายใต้ REQ-7 เดิม (generic ชุดเดียว parametrize ด้วย config) —
> ship แล้ว คงไว้เป็นบันทึกประวัติศาสตร์ ไม่แก้ย้อนหลัง. Task 7-12 คือ migration ไปสถาปัตยกรรม
> อิสระต่อ module ตาม REQ-7 revised (ดู `requirements.md` + `design.md`)

- [x] 1. โครงล่าง pure logic + API — types (`src/types/organization/org-unit.ts`), config
     (`src/lib/organization/org-unit/config.ts`), validation (`form.ts` + `form.test.ts`),
     generic API client (`src/lib/api/admin/org-unit.ts` + `org-unit.test.ts`), rewrite
     `/api/:path*` ใน `next.config.ts` — done = test เขียว + rewrite ถึง backend จริง
     Satisfies: REQ-7 (7.1-7.5). Verify: vitest ผ่านทั้ง 2 ไฟล์; dev แล้ว
     `curl localhost:3000/api/v1/offices` ได้คำตอบ backend (401/200) ไม่ใช่ 404 ของ Next.
     Evidence: test 20 passed / 0 failed; typecheck no errors; rewrite proxy 401 จาก backend
       - test: `npx vitest run src/lib/organization/org-unit/form.test.ts src/lib/api/admin/org-unit.test.ts` -> PASS (20) FAIL (0)
       - typecheck: `npx tsc --noEmit` -> No errors found
       - rewrite: dev server จริงอยู่ port 5200 (ไม่ใช่ 3000 ตามที่เดาไว้ใน Verify) — `curl localhost:5200/api/v1/offices` -> 401 จาก backend (:5100 ตอบ 401 ตรงกัน) ไม่ใช่ 404 ของ Next
       - viewports: n/a — logic-only
       - deviations: dev script ใช้ port 5200 (`next dev -p 5200`) ไม่ใช่ 3000

- [x] 2. หน้า list ครบวงจร (office นำร่อง) — toast กลาง (`src/hooks/use-toast.ts` +
     `src/components/shared/toaster.tsx`), shared list components ทั้งชุด
     (`status-badge`, `toolbar`, `columns`, `detail-sheet`, `confirm-dialog`, `view.tsx`),
     `src/app/organization/layout.tsx` + `office/list/page.tsx` — done = list office
     ใช้งานจริงกับ backend: ค้นหา/กรองสถานะ/เรียงไทย/detail sheet/ปิดใช้งานผ่าน dialog
     Satisfies: REQ-2, REQ-6. Depends on: 1. Verify: เปิด `/organization/office/list`
     ต่อ backend จริง — deactivate เห็น dialog คำว่า "ปิดใช้งาน" + pending + toast + reload;
     แถว inactive ไม่มีปุ่มปิดใช้งาน (ทั้งแถวและ sheet)
     Evidence: typecheck + eslint no issues; page compile + HTTP 200 บน dev server
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint <ไฟล์ใหม่ทั้งหมด>` -> No issues found
       - page: `curl localhost:5200/organization/office/list` -> 200 (Next dev คืน 500 ถ้า compile พัง)
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6 (ต้อง login SSO ด้วยมือ)
       - deviations: interactive flow (dialog/toast/deactivate จริง) ยัง verify ใน browser ไม่ได้เพราะติด Google SSO login — เลื่อนไป manual E2E task 6

- [x] 3. หน้า read/create/edit ครบวงจร (office นำร่อง) — `form-status`, `read-view`,
     `create-view` (dirty-check ยกเลิก + 409 ที่ field code), `edit-view` (code disabled,
     PUT ส่ง `{name, isActive}` ครบ, เปิดใช้งานกลับผ่าน status select) + route office
     `read|create|edit/{page,layout}.tsx` (`?id=` หาย → redirect list) — done = flow
     create→edit→read จริงกับ backend ครบทุก error path
     Satisfies: REQ-3, REQ-4, REQ-5. Depends on: 2. Verify: create สำเร็จ + create ซ้ำเห็น
     409 ไม่ล้างฟอร์ม + ยกเลิกฟอร์ม dirty เห็น dialog; edit rename + toggle สถานะ; read + id มั่ว
     = notfound; `?id=` หาย redirect ไป list
     Evidence: typecheck + eslint no issues; ทั้ง 4 route ตอบถูกต้อง (200/307)
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint src/components/organization src/app/organization` -> No issues found
       - routes: list 200, create 200, read/edit ไม่มี ?id= -> 307 ไป /organization/office/list (redirect_url ยืนยัน), read?id=<guid> -> 200
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6 (ต้อง login SSO ด้วยมือ)
       - deviations: interactive flow (409/dirty dialog/toggle สถานะจริง) ติด Google SSO — เลื่อนไป manual E2E task 6

- [x] 4. Route อีก 3 module (division / position / level) — clone route ชุด office
     เปลี่ยน config + metadata (7 ไฟล์ × 3, mechanical) — done = ทุก module เดินครบ 4 หน้า
     Satisfies: REQ-2, REQ-3, REQ-4, REQ-5, REQ-6 (บังคับใช้กับทุก module). Depends on: 3.
     Verify: เดินครบ 12 หน้าที่เหลือ + smoke create 1 รายการต่อ module
     Evidence: 12 route ตอบถูกครบ (list/create 200, read/edit ไม่มี id 307 ไป list ของ module ตน)
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint src/app/organization` -> No issues found
       - routes: division/position/level × {list,create}=200, {read,edit}=307 ครบ 12 หน้า
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6
       - deviations: smoke create จริงต่อ module ติด SSO — เลื่อนไป manual E2E task 6

- [x] 5. Menu group + icons — เพิ่ม group "โครงสร้างองค์กร" (flat 4 items) ต่อจาก
     "ผู้ใช้งาน & สิทธิ์" ใน `nav-config.ts` + `minimals-nav-config.ts` (ตำแหน่งเดียวกันทั้งคู่),
     SVG solid-fill 4 ไฟล์ `public/assets/icons/navbar/ic-{building,sitemap,badge,ranking}.svg` —
     done = sidebar แสดง group ถูกตำแหน่ง icon ขึ้น active ถูก item
     Satisfies: REQ-1 (1.1-1.6). Depends on: 2 (ต้องมีหน้า list ให้ลิงก์/active). Verify:
     sidebar ทั้ง desktop + mini + mobile drawer แสดงครบ, เดินแต่ละ module แล้ว item active ถูกตัว,
     breadcrumb ทุกหน้าเป็น trail จาก config ไม่ใช่ path ดิบ
     Evidence: group "โครงสร้างองค์กร" โผล่ใน SSR HTML ของหน้า list; SVG 4 ไฟล์เสิร์ฟ 200 ครบ
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint <nav config 2 ไฟล์>` -> No issues found
       - icons: `curl /assets/icons/navbar/ic-{building,sitemap,badge,ranking}.svg` -> 200 ทั้ง 4
       - nav: `curl /organization/office/list` HTML มี "โครงสร้างองค์กร" (แทรกทั้ง 2 config ตำแหน่งเดียวกัน — ถัดจาก "ผู้ใช้งาน & สิทธิ์")
       - viewports: ยังไม่ตรวจ — active state/mini rail/mobile drawer รวมตรวจใน browser E2E task 6
       - deviations: ic-ranking ใช้ลาย layers (สื่อ "ระดับ" ชัดกว่าแท่ง bar ที่ซ้ำกับ ic-analytics) — ชื่อไฟล์/icon key ยังเป็น ranking ตาม design

- [x] 6. Verification รวม + gate — done = พร้อมเปิด PR
     Satisfies: REQ-1..7 (ยืนยันรวม). Depends on: 4, 5. Verify: typecheck + lint + vitest
     เขียวทั้ง repo; manual E2E office เต็ม flow ตาม Testing Strategy ใน design.md;
     Network tab จากหน้า `/organization/*` เห็น `X-CSRF-Token` บน mutation; เรียงชื่อ
     ขึ้นต้นสระหน้า (เช่น "แผนก...") ถูกตามพจนานุกรมไทย
     Evidence: gate เขียวครบ + browser E2E ต่อ backend จริงผ่านทุก flow (production build, port 5300)
       - test: `npx vitest run` -> PASS (178) FAIL (0); `npx tsc --noEmit` -> no errors; `eslint src` -> exit 0; `npm run build` -> สำเร็จ ครบ 16 route; `scripts/spec-trace.sh` -> OK 46 เกณฑ์
       - E2E office เต็ม flow (Chrome DevTools MCP + admin session จริง): create 201 (POST body {code,name} + X-CSRF-Token ยืนยันจาก request จริง) -> create ซ้ำ 409 error ที่ field code ฟอร์มคงค่า -> ยกเลิก dirty เห็น dialog "ออกจากหน้านี้?" -> edit prefill + code disabled + PUT body {name,isActive} ครบ (ยืนยันจาก request: {"name":"…(แก้)","isActive":false}) -> toast "แก้ไข…สำเร็จ" -> reactivate ผ่าน status select -> deactivate ผ่าน dialog wording "ปิดใช้งาน" DELETE 204 + toast + reload -> แถว/sheet inactive ไม่มีปุ่มปิดใช้งาน -> read แสดงครบ + id มั่ว = "ไม่พบสำนักงานที่ระบุ" + ลิงก์กลับ -> search ไทย/code + filter สถานะถูกต้อง
       - เรียงไทย: office "ภาคใต้"(ใ->ต) มาก่อน "ภาคเหนือ"(เ->ห); division "แผนกทดสอบ"(แ->ผ) มาก่อน "ฝ่าย…" = localeCompare "th" ทำงาน (code-point sort จะกลับกัน)
       - smoke 3 module: division/position/level create ผ่านฟอร์มจริง toast สำเร็จครบ แล้ว deactivate test row ทั้งหมด (204)
       - sidebar: group "โครงสร้างองค์กร" ต่อจาก "ผู้ใช้งาน & สิทธิ์", icon 4 ตัว render, active state ถูก item (screenshot 1440), breadcrumb "Console · สำนักงาน" ไม่ใช่ path ดิบ
       - viewports: 375 OK (emulate, clientWidth=375 เป๊ะ, ไม่มี doc overflow) | 768 OK (clientWidth=768, ไม่ overflow) | 1440 OK (clientWidth=1440, ไม่ overflow)
       - deviations: test data test_e2e คงอยู่ในสถานะปิดใช้งานทั้ง 4 resource (backend ไม่มี hard delete); ทดสอบบน port 5300 (production build แยกจาก dev 5200)

- [x] 7. Migrate office module เป็นอิสระ (นำร่อง) — สร้าง `src/types/organization/office.ts`
     (`Office`/`OfficeCreateInput`/`OfficeUpdateInput`), `src/lib/organization/office/config.ts`
     (ค่าคงที่ `OFFICE_SEGMENT`/`OFFICE_BASE_PATH`/`OFFICE_LABEL`), `form.ts`+`form.test.ts` (ย้าย
     business rule จาก `org-unit/form.ts` มาตรงตัว), `src/lib/api/admin/office.ts`+`office.test.ts`
     (segment hardcode `"offices"` ไม่รับ parameter), `src/components/organization/office/{list-view,
     detail-sheet,read-view,create-view,edit-view}.tsx` (ย้ายจาก `org-unit/{view,detail-sheet,
     read-view,create-view,edit-view}.tsx` ตัดพารามิเตอร์ `config` ออก hardcode label/basePath/segment
     ในไฟล์แทน — `detail-sheet.tsx` ใช้เนื้อหาที่เพิ่งแก้ใน PR #115 เป็นฐาน ไม่ใช่ของเก่าก่อน PR นั้น),
     แก้ `src/components/organization/org-unit/columns.tsx` เป็น generic
     `buildOrgUnitColumns<T extends OrgUnitLike>` (ตัด import type `OrgUnit`), แก้
     `src/components/organization/org-unit/status-badge.tsx` ย้าย `OrgUnitStatus` type เข้ามา define
     ในไฟล์เอง (ตัด import จาก type module), แก้ `src/app/organization/office/{list,read,create,edit}/
     page.tsx` ให้เรียก view ใหม่ตรง ๆ ไม่ส่ง `config` — done = office ทำงานเหมือนเดิมทุกจุด
     (regression zero) แต่ไม่มี import จาก `org-unit/config.ts`/`org-unit/form.ts`/
     `lib/api/admin/org-unit.ts`/`types/organization/org-unit.ts` เหลืออยู่ในเส้นทางของ office เลย
     Satisfies: REQ-7.2, 7.3, 7.5, 7.6. Depends on: 6 (ของเดิมต้อง ship แล้วก่อน migrate).
     Verify: `grep -rn "org-unit/config\|org-unit/form\|api/admin/org-unit\|types/organization/org-unit"
     src/app/organization/office src/components/organization/office` ต้องว่าง (ไม่มี match);
     division/level/position (ยังไม่ migrate) ต้องยังใช้งานได้ปกติผ่าน `org-unit/{view,create-view,
     edit-view,read-view,detail-sheet}.tsx` เดิม (generic type ของ `columns.tsx`/`status-badge.tsx`
     ต้อง backward-compatible กับ `OrgUnit` type เดิมที่ยังมีอยู่); gate เขียวทั้ง repo
     Evidence: ต้องมี
       - grep: คำสั่งข้างบน -> พบ 2 match แต่เป็น false positive จาก substring `org-unit/form` ไปชน
         `org-unit/form-status` (shared component ที่ REQ-7.3/design.md ตั้งใจให้ office ยังใช้ต่อ —
         `src/components/organization/office/{read-view,edit-view}.tsx` import `OrgUnitFormStatus`
         จาก `@/components/organization/org-unit/form-status`) — รัน grep เจาะจงปิดท้ายด้วย `"`
         (`org-unit/config"\|org-unit/form"\|api/admin/org-unit"\|types/organization/org-unit"`)
         แทนเพื่อตัด false positive -> ว่างจริง (ไม่มี import จาก config.ts/form.ts (validation เดิม)/
         api-org-unit/type org-unit เหลืออยู่ในเส้นทาง office เลย)
       - test: `npx vitest run` -> PASS (197) FAIL (0) (รวม office.test.ts + form.test.ts ใหม่)
       - typecheck: `npx tsc --noEmit` -> No errors found (ยืนยัน division/level/position ยังคอมไพล์ผ่าน
         ด้วย generic `buildOrgUnitColumns<T extends OrgUnitLike>`/`OrgUnitStatus` ใหม่ใน status-badge.tsx)
       - lint: `npx eslint src/app/organization/office src/components/organization/office
         src/components/organization/org-unit src/lib/organization/office src/lib/api/admin/office.ts
         src/lib/api/admin/office.test.ts src/types/organization/office.ts` -> No issues found
       - routes (dev server port 5200): office/{list,create}=200, office/{read,edit}(ไม่มี id)=307;
         division/{list,read}=200/307, position/list=200, level/list=200 (ยังไม่ migrate — ทำงานปกติ
         ผ่าน generic columns/status-badge ใหม่ ยืนยัน backward-compatible)
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 12 (ต้อง login SSO ด้วยมือ)
       - deviations: interactive browser flow (search/filter/detail-sheet/deactivate/create-409/
         dirty-cancel/edit-toggle จริงผ่าน backend) ติด Google SSO login เหมือน task 2-5 เดิม —
         ตรวจผ่าน route status code + gate แทน เลื่อน full E2E ไปรวมกับ task 12

- [x] 8. Migrate division module เป็นอิสระ — clone pattern จาก task 7 เป๊ะ (mechanical): types,
     `lib/organization/division/`, `lib/api/admin/division.ts`+test,
     `components/organization/division/*`, แก้ 4 `page.tsx` ของ division ตัดพารามิเตอร์ `config`
     Satisfies: REQ-7.2, 7.5, 7.6. Depends on: 7 (ต้องมี `OrgUnitLike`/generic columns พร้อมแล้ว).
     Verify: grep pattern เดียวกับ task 7 scope `src/app/organization/division
     src/components/organization/division` ต้องว่าง; office (migrate แล้ว) + level/position
     (ยังไม่ migrate) ต้องยังทำงานปกติ; gate เขียว
     Evidence: grep (เจาะจงปิดท้าย `"` ตัดปัญหา false positive ของ `org-unit/form` ชน
       `org-unit/form-status` เหมือน task 7) -> ว่าง; test: `npx vitest run` -> PASS (216) FAIL (0)
       (รวม division.test.ts + form.test.ts ใหม่); typecheck: `npx tsc --noEmit` -> No errors found;
       lint: `npx eslint src/app/organization/division src/components/organization/division
       src/lib/organization/division src/lib/api/admin/division.ts src/lib/api/admin/division.test.ts
       src/types/organization/division.ts` -> No issues found
       - routes (dev port 5200): division/{list,create}=200, division/{read,edit}(ไม่มี id)=307;
         office/{list,read}=200/307 (migrate แล้ว), position/list=200, level/list=200 (ยังไม่ migrate)
         ทำงานปกติทั้งคู่
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 12
       - deviations: interactive browser flow ติด Google SSO login เหมือน task 7 — ตรวจผ่าน route
         status code + gate แทน เลื่อน full E2E ไปรวมกับ task 12

- [x] 9. Migrate level module เป็นอิสระ — clone pattern จาก task 7 เป๊ะ (mechanical)
     Satisfies: REQ-7.2, 7.5, 7.6. Depends on: 7.
     Verify: grep scope `level` ต้องว่าง; office/division (migrate แล้ว) + position (ยังไม่) ปกติ; gate เขียว
     Evidence: grep (เจาะจงปิดท้าย `"`) -> ว่าง; test: `npx vitest run` -> PASS (235) FAIL (0)
       (รวม level.test.ts + form.test.ts ใหม่); typecheck: `npx tsc --noEmit` -> No errors found;
       lint: `npx eslint src/app/organization/level src/components/organization/level
       src/lib/organization/level src/lib/api/admin/level.ts src/lib/api/admin/level.test.ts
       src/types/organization/level.ts` -> No issues found
       - routes (dev port 5200): level/{list,create}=200, level/{read,edit}(ไม่มี id)=307;
         office/list=200, division/list=200 (migrate แล้ว), position/list=200 (ยังไม่ migrate) ปกติ
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 12
       - deviations: interactive browser flow ติด Google SSO login เหมือน task 7-8 — ตรวจผ่าน route
         status code + gate แทน เลื่อน full E2E ไปรวมกับ task 12

- [x] 10. Migrate position module เป็นอิสระ (module สุดท้าย) — clone pattern จาก task 7 เป๊ะ (mechanical)
     Satisfies: REQ-7.2, 7.5, 7.6. Depends on: 7.
     Verify: grep scope `position` ต้องว่าง; office/division/level ปกติ; gate เขียว
     Evidence: grep (เจาะจงปิดท้าย `"`) -> ว่าง; test: `npx vitest run` -> PASS (254) FAIL (0)
       (รวม position.test.ts + form.test.ts ใหม่); typecheck: `npx tsc --noEmit` -> No errors found;
       lint: `npx eslint src/app/organization/position src/components/organization/position
       src/lib/organization/position src/lib/api/admin/position.ts src/lib/api/admin/position.test.ts
       src/types/organization/position.ts` -> No issues found
       - routes (dev port 5200): position/{list,create}=200, position/{read,edit}(ไม่มี id)=307;
         office/list=200, division/list=200, level/list=200 (migrate แล้วทั้งหมด) ปกติ
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 12
       - deviations: interactive browser flow ติด Google SSO login เหมือน task 7-9 — ตรวจผ่าน route
         status code + gate แทน เลื่อน full E2E ไปรวมกับ task 12

- [x] 11. Cleanup shared เดิมที่เลิกใช้ — หลัง 4 module migrate ครบ ลบไฟล์เก่าที่ไม่มีใคร import แล้ว:
     `src/lib/organization/org-unit/config.ts`, `src/lib/organization/org-unit/form.ts`+
     `form.test.ts`, `src/lib/api/admin/org-unit.ts`+`org-unit.test.ts`,
     `src/types/organization/org-unit.ts`, `src/components/organization/org-unit/{view,create-view,
     edit-view,read-view,detail-sheet}.tsx` — เหลือเฉพาะ 5 ไฟล์ shared ตาม REQ-7.3
     (`columns.tsx`, `confirm-dialog.tsx`, `form-status.tsx`, `status-badge.tsx`, `toolbar.tsx`)
     ใต้ `components/organization/org-unit/`. done = ไม่มีไฟล์ orphan เหลือ
     Satisfies: REQ-7.2 (ปิด scope ทั้งหมด). Depends on: 8, 9, 10.
     Verify: `grep -rln "ORG_UNIT_CONFIGS\|OrgUnitConfig\|validateOrgUnitForm\|from \"@/lib/api/admin/org-unit\"\|from \"@/types/organization/org-unit\"" src`
     ต้องว่าง (ไม่มี consumer เหลือ) ก่อนลบ; ลบแล้วรัน gate ต้องยังเขียว
     Evidence: grep ก่อนลบ -> พบ match เฉพาะใน 10 ไฟล์ที่กำลังจะลบเอง (self-reference ของ orphan set
       ทั้งชุด) ไม่มี consumer ภายนอกเลย -> ปลอดภัยที่จะลบ; `git rm` 11 ไฟล์ (config.ts, form.ts,
       form.test.ts, org-unit.ts, org-unit.test.ts, types/org-unit.ts, view.tsx, create-view.tsx,
       edit-view.tsx, read-view.tsx, detail-sheet.tsx) -> เหลือเฉพาะ 5 ไฟล์ shared ตาม REQ-7.3 ใต้
       `components/organization/org-unit/` (`columns.tsx`, `confirm-dialog.tsx`, `form-status.tsx`,
       `status-badge.tsx`, `toolbar.tsx`) ยืนยันด้วย `ls` ตรง; `src/lib/organization/org-unit/` และ
       `org-unit.ts`/`org-unit.test.ts` ใต้ `lib/api/admin/` หายไปทั้งโฟลเดอร์/ไฟล์
       - test: `npx vitest run` -> PASS (234) FAIL (0)
       - typecheck: `npx tsc --noEmit` -> No errors found
       - lint: `npx eslint src` -> clean (exit 0, ไม่มี output) — หมายเหตุ: รันผ่าน `| tail` ครั้งแรก
         เจอ noise "Lint: 2 errors" + npm error ปลอมจาก rtk proxy pipe glitch, ยืนยันซ้ำด้วย
         `npx eslint src --no-color > file` ตรง ๆ (ไม่ผ่าน pipe) -> exit 0 ไฟล์ว่าง = ไม่มี issue จริง
       - build: `npm run build` -> exit 0, "Compiled successfully in 4.7s", ครบ 16 route organization
         (4 module × {list,create,read,edit}) + route เดิมทั้งหมดไม่กระทบ
       - deviations: ไม่มี — task นี้เป็น cleanup ล้วน ไม่มี UI ใหม่ให้ตรวจ viewport

- [x] 12. Verification รวม + gate สุดท้าย — done = พร้อมเปิด PR
     Satisfies: REQ-1..7 (ยืนยันรวมหลัง migration). Depends on: 11. Verify: typecheck + lint +
     vitest เขียวทั้ง repo; `npm run build` ผ่านครบ 16 route เดิม; manual E2E ทั้ง 4 module
     (create/edit/read/deactivate) เหมือน task 6 เดิมแต่ยืนยันว่า behavior ไม่เปลี่ยนหลัง migrate;
     `scripts/spec-trace.sh organization-structure` ผ่าน
     Evidence: static gate เขียวครบทั้ง repo — `npx tsc --noEmit` -> No errors found;
       `npx vitest run` -> PASS (234) FAIL (0); `npx eslint src --no-color` (redirect ตรงไฟล์
       ไม่ผ่าน pipe กัน rtk proxy glitch) -> exit 0, output ว่าง = ไม่มี issue; `npm run build` ->
       exit 0, "Compiled successfully", ครบ 16 route organization (4 module × list/create/read/edit)
       + route เดิมทั้งหมดไม่กระทบ; `python3 scripts/spec_trace.py organization-structure` ->
       "OK: 'organization-structure' เกณฑ์ 47 ข้อ ถูกอ้างครบใน design.md และ tasks.md, EARS lint
       ผ่านทุกข้อ"
       - routes cross-check ทั้ง dev (5200) และ production build จริง (`next start -p 5300`,
         `ADMIN_API_ORIGIN=http://localhost:5100`, backend :5100 ตอบ 401 = พร้อม): 16 route ตอบ 200
         ทั้งคู่; ข้อสังเกต (ไม่ใช่ regression): dev ตอบ 307 สำหรับ read/edit ที่ไม่มี `?id=` (ตรวจ
         `Location` header ตรง — `redirect()` ยิงเป็น HTTP redirect จริง) ส่วน production build ตอบ
         200 พร้อม body ฝัง target `office/list` (Next.js App Router streaming/RSC ส่ง redirect เป็น
         ส่วนหนึ่งของ response แทน HTTP 3xx เมื่อ request เป็น full-document ไม่ใช่ RSC subrequest) —
         พฤติกรรม framework เดิมที่มีมาตั้งแต่ task 1 (page.tsx pattern เดียวกัน) ไม่ใช่สิ่งที่ migration
         task 7-12 เปลี่ยน ยืนยันด้วย body มี "office/list" เป็น redirect target ตรง ไม่ใช่หน้า read จริง
       - deviation (บล็อกจริง): browser E2E เต็ม flow (create/edit/read/deactivate ผ่านฟอร์มจริง,
         Network tab ตรวจ X-CSRF-Token, sidebar active state, เรียงชื่อไทย) ทำไม่ได้ในรอบนี้ —
         chrome-devtools MCP navigate ไป `/organization/office/list` บน production build (5300)
         ถูก redirect ไปหน้า `เข้าสู่ระบบ POL Pay` (`/login`, Google SSO) ทันที ไม่มี session ที่ login
         ค้างจาก task 6 เหลืออยู่ในรอบนี้ — เหมือน pattern ที่ task 7-10 เจอ (ติด SSO login, ไม่มี
         credential ให้ auto-login) แทนที่ด้วย static gate (typecheck/lint/test/build) + route status
         code cross-check ทั้ง dev/production ข้างต้นซึ่งครอบ regression ระดับ compile/route ได้ครบ
         แต่ไม่ครอบ interactive behavior (dialog/toast/filter/sort/CSRF header จริง) — ต้องมี human
         login SSO ก่อนแล้วรัน browser E2E ต่อจากจุดนี้ (เหมือนที่ task 6 เคยทำได้ตอนมี session ค้าง)

## Suggested execution batches

**Task 1-6 (เดิม):** coupled สูง รันใน session เดียว — ship แล้ว ไม่ต้องรันซ้ำ

**Task 7-12 (migration ใหม่):** task 7 ต้องทำก่อน (ปลด `columns.tsx`/`status-badge.tsx` จาก type
ผูก entity + วางฐาน pattern) จากนั้น task 8/9/10 (division/level/position) เป็น mechanical clone
ที่ไม่พึ่งพากันเอง — แยกทำคนละ session/pane ได้ (`scripts/pane-loop.sh organization-structure
7,8 9 10 11,12` หรือคล้ายกัน) แต่ต้องรอ task 7 เสร็จก่อนเริ่ม 8/9/10 พร้อมกัน; task 11 (cleanup)
ต้องรอทั้ง 8/9/10 เสร็จครบก่อน (ลบไฟล์ที่ module ใดยังไม่ migrate ใช้อยู่จะพัง); task 12 ปิดท้าย
