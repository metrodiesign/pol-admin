# Tasks: Smoke Cleanup Hardening

> Status: approved 2026-08-27

งานนี้แก้เฉพาะ Admin-only smoke process lifecycle ใน `scripts/` พร้อม regression test ที่ตรวจ
observable port conflict และ process leak.

## Tasks

- [x] 1. ทำ port preflight ให้ตรวจ owner บน IPv4 และ IPv6 ก่อน spawn
  - **Satisfies:** F-1, B-5, B-7
  - **Files:** `scripts/lib/workspace-verification.mjs`, `scripts/lib/workspace-verification.test.mjs` และ caller ที่ใช้ `assertPortAvailable()`
  - **Verify:** เพิ่ม fixture ที่ bind `127.0.0.1` และ fixture ที่ bind `::`; รัน test บน implementation เดิมให้ RED เมื่อ IPv6 owner ถูกตรวจไม่พบ; แก้แล้วต้อง GREEN และต้องยืนยันว่า unrelated owner ยังทำงานอยู่
  Evidence: RED 23/1 ก่อนแก้, GREEN 24/0 หลังแก้, logic-only, deviations none
    - test: `rtk proxy node --test scripts/lib/workspace-verification.test.mjs` -> RED ก่อนแก้ 23 ผ่าน / 1 ไม่ผ่าน (`Missing expected rejection` สำหรับ IPv6 owner); GREEN หลังแก้ 24 ผ่าน / 0 ไม่ผ่าน
    - viewports: n/a — logic-only
    - deviations: none

- [x] 2. ทำ cleanup ให้ครอบคลุม process tree และ detached descendant ภายใน deadline
  - **Satisfies:** F-2, F-3, F-4, F-6, B-3, B-4, B-6
  - **Files:** `scripts/lib/workspace-process.mjs`, `scripts/lib/workspace-verification.test.mjs`, `scripts/smoke-workspace-routes.mjs` และ helper ที่เกี่ยวข้อง
  - **Verify:** เพิ่ม fixture ที่สร้าง descendant ด้วย `detached: true`; รัน RED บน implementation เดิมโดยตรวจ `aliveAfterCleanup=true`; แก้แล้วต้อง GREEN, ไม่เหลือ listener/process ที่ smoke สร้าง, timeout error ต้องมี server/PID/phase และ signal exit ต้องคง `130`/`143`
  Evidence: RED detached descendant ก่อนแก้, GREEN 26 Node / 329 root / 26 shared หลังแก้, logic-only, deviations: ต้องรันนอก sandbox เมื่อใช้ `ps`
    - test: `rtk proxy npm test` -> Node 26 ผ่าน, root Vitest 329 ผ่าน, shared 26 ผ่าน; regression RED ก่อนแก้ `Missing expected exception`, GREEN หลังแก้
    - test: detached cleanup ซ้ำ 5 รอบ -> ผ่านทุกครั้ง
    - viewports: n/a — logic-only
    - deviations: `ps` ถูก sandbox ปฏิเสธด้วย `EPERM`; verification รันซ้ำด้วย `dangerouslyDisableSandbox: true`

- [x] 3. ล็อก Admin-only smoke contract และ CI backstop โดยไม่ย้อน Merchant workspace
  - **Satisfies:** F-5, B-1, B-2, B-7, B-8, B-9
  - **Files:** `scripts/smoke-workspace-routes.mjs`, `scripts/verify-smoke-signals.mjs`, `scripts/lib/workspace-verification.test.mjs`, `.github/workflows/ci.yml` และ bugfix evidence ที่เกี่ยวข้อง
  - **Verify:** รัน workspace verification, signal verification และ `npm run smoke:routes`; ตรวจเฉพาะ Admin root, `/dashboard`, `/register` และ port `3001`; ยืนยันว่าไม่มี Merchant route หรือ port `3002`; รัน `npm test` และ `npm run typecheck` โดยไม่แตะ application source, dependency, `Dockerfile` หรือ Organization API work
  Evidence: Admin-only contract, signal cleanup และ route smoke ผ่าน; logic-only, deviations: initial run พบ owner เดิมและ rerun หลังเจ้าของหยุด process ผ่าน
    - test: `rtk proxy npm run verify:workspaces` -> root Admin 114 routes, dependency/test-policy 682 files และ active-reference 749 files ผ่าน
    - test: `rtk proxy node scripts/verify-smoke-signals.mjs` -> SIGINT exit 130 และ SIGTERM exit 143; port 3001 released
    - test: `rtk proxy npm run smoke:routes` -> Admin `/` 307, `/admin/user/list` 200 และ `/register` 404
    - test: `rtk proxy npm test` -> Node 26 ผ่าน, root Vitest 329 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - test: `scripts/spec-trace.sh bugfix-smoke-cleanup-hardening` -> ข้ามตามกติกา bugfix spec ที่ไม่มี `requirements.md`
    - viewports: n/a — logic-only
    - deviations: first smoke/signal run blocked by existing IPv6 wildcard owner; owner was stopped by user before successful rerun

## Verification Notes

Initial smoke and signal commands correctly rejected the existing owner on `*:3001` without touching it. After the
owner was stopped by the user, both commands completed with the expected Admin-only results.

## Execution

ทำ task 1 ก่อน task 2 เพราะ port ownership เป็น precondition ของ lifecycle test; ทำ task 3 หลังสอง task แรก
เพื่อยืนยัน smoke ทั้งเส้นทางบน Admin-only contract.
