# Implementation Tasks: User Management Module (isolated /user)

> Status: approved 2026-06-17

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. View components namespace ใหม่ — copy 6 ไฟล์ `dashboard/user/*` -> `src/components/user/*`
     (`user-list-view`, `user-list-tabs`, `user-list-toolbar`, `user-table-columns`,
     `user-edit-form-card`, `user-edit-profile-card`). relative cross-import คงเดิม;
     แก้จุดเดียว: `user-table-columns` ลิงก์ edit `/minimals/user/${u.id}/edit` ->
     `/user/${u.id}/edit`. shared (`@/components/{form,ui,table,shared}`, `@/lib`,
     `@/types/user`, `@/hooks`) อ้างของเดิม ไม่ copy.
     Satisfies: REQ-2 (all). Verify: `ls src/components/user` = 6 ไฟล์;
     `grep -rn "dashboard/user" src/components/user` = 0.
     Evidence: test pass — `ls src/components/user/*.tsx` = 6 files; `grep -rn "dashboard/user" src/components/user` = 0 (exit 1); edit `user-table-columns.tsx:72` -> `/user/${u.id}/edit`; viewports n/a (logic/structure-only, typecheck รวมที่ task 4); deviations none

- [x] 2. Route module `src/app/user` (list/new/edit) — copy page+layout จาก 3 หน้า
     (`list/page`, `new/{layout,page}`, `edit/{layout,page}`); rewrite ทุก path
     `/minimals/user*` -> `/user*`; แก้ import view -> `@/components/user/*`;
     breadcrumb root -> `ผู้ใช้งาน & สิทธิ์` href `/user/list`; metadata title ->
     รูปแบบ POL (`... | POL`). ไม่สร้าง profile/cards/account.
     Satisfies: REQ-1 (all), REQ-3 (all). Depends on: 1.
     Verify: route `/user/{list,new,edit}` มีไฟล์ครบ; ไม่มีโฟลเดอร์
     profile/cards/account ใต้ `src/app/user`;
     `grep -rn "dashboard/user" src/app/user` = 0.
     Evidence: test pass — `find src/app/user -type f` = 5 files (list/page, new/{layout,page}, edit/{layout,page}); ไม่มี profile/cards/account; `grep -rn "dashboard/user" src/app/user` = 0 (exit 1); rewrite breadcrumb root `ผู้ใช้งาน & สิทธิ์` /user/list, action /user/new, edit backHref /user/list, import `@/components/user/*`, metadata `... | POL`; viewports 1440 OK (sidebar+breadcrumb render, no console err); deviations เพิ่ม `src/app/user/layout.tsx` (wrap `MinimalsLayout`) — ของเดิมอาศัย group shell จาก parent `minimals/layout.tsx` ที่ไม่ได้ copy per-page; ไม่มี shell -> ไม่มี sidebar. พบตอน browser verify, แก้แล้ว

- [x] 3. เมนู `UserManagement` — แทรก NavGroup ใหม่ใน `src/components/layout/nav-config.ts`
     หลังกลุ่ม `Main` (ก่อน `Demo`): subheader `"UserManagement"`, item เดียว
     title `"ผู้ใช้งาน & สิทธิ์"` path `/user/list` icon `user` `deepMatch: true`,
     ไม่มี children. ไม่แตะกลุ่ม Main/Demo เดิม.
     Satisfies: REQ-4 (all). Verify: `navConfig[1].subheader === "UserManagement"`
     และ items.length === 1; กลุ่ม Demo>User เดิมไม่เปลี่ยน.
     Evidence: test pass — `tsx` import: `navConfig[1].subheader` = "UserManagement", `items.length` = 1, item = {title:"ผู้ใช้งาน & สิทธิ์", path:"/user/list", icon:"user", deepMatch:true}, ไม่มี children; `navConfig[2]` = Demo, Demo>User เดิม path `/minimals/user` + 6 children ไม่เปลี่ยน; viewports 1440 OK (เมนู "ผู้ใช้งาน & สิทธิ์" ใต้ USERMANAGEMENT, active state เขียว ทำงาน); deviations live sidebar consume `minimalsNavConfig` (จาก `minimals-nav-config.ts`) ไม่ใช่ `navConfig` — design ระบุไฟล์ผิด. เพิ่ม group เดียวกันใน `minimals-nav-config.ts` (live, render จริง) + คงใน `nav-config.ts` ไว้ feed breadcrumb/search. พบตอน browser verify

- [x] 4. ยืนยัน coexist + ของเดิมไม่ถูกแตะ + build เขียว — ตรวจว่า `/minimals/user/list`
     และ `/user/list` เข้าถึงได้พร้อมกัน, `git diff --name-only` ไม่มีไฟล์ใต้
     `src/app/minimals/user` หรือ `src/components/dashboard/user`, type-check/build ผ่าน.
     Satisfies: REQ-5 (all). Depends on: 1, 2, 3.
     Verify: `git diff --name-only` สะอาดต่อ dashboard/user; `npm run build`
     (หรือ type-check ผ่าน gate-task.sh) ผ่านไม่มี error.
     Evidence: test pass — `npx tsc --noEmit` = No errors found; coexist: `src/app/minimals/user/list/page.tsx` + `src/app/user/list/page.tsx` มีทั้งคู่; `git status --porcelain` แตะแค่ `nav-config.ts` + untracked `src/app/user/`, `src/components/user/` — ไม่มีไฟล์ใต้ dashboard/user เปลี่ยน; `spec-trace.sh` = 26 เกณฑ์ครบ; viewports n/a (ยังไม่รัน dev server — structural+typecheck only); deviations none

## Suggested execution batches

> Coupled feature — tasks 1-4 แชร์ context เดียวกัน (mock data/types/path mapping ชุดเดียว).
> DEFAULT: รันทั้งหมดใน session เดียว — `/spec-implement all` หรือ
> `scripts/pane-loop.sh user-management-module all-in-one`.
> ลำดับธรรมชาติ: 1 -> 2 -> 3 -> 4 (4 เป็น verify รวบ). ไม่มี task อิสระพอจะคุ้มแยก session.
