# Tasks: Admin Auth Evidence and Documentation

> Status: approved 2026-08-27

งานนี้เติม evidence ของ Admin logout และทำเอกสารให้ตรง implementation ปัจจุบัน โดยไม่แก้
merchant auth, `pol-core` source หรือทำ real auth mutation.

## Tasks

- [x] 1. เพิ่ม component regression tests สำหรับ logout success และ failure
  - **Satisfies:** F-1, F-2, F-3, B-1, B-3, B-5, B-8, B-10
  - **Files:** `src/app/logout/page.tsx`, `src/components/layout/account-drawer.tsx`, caller tests และ `src/lib/api/admin/auth.test.ts`
  - **Verify:** test harness ต้อง RED หาก `401`, `403`, `500` หรือ network rejection ยัง navigate เหมือน success; หลังแก้ต้อง GREEN โดย `204` navigate ไป `/login`, failure คงหน้าเดิม, rendered failure state และ retry action มองเห็นได้ และ navigation ไม่ถูกเรียกเมื่อ reject
  Evidence: logout failure คงหน้าเดิมพร้อม retry และ 204 ไป login; browser, deviations: ใช้ safe contract fixture
    - test: `rtk proxy npm test` -> Node 31 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - browser: fixture `logout-failure` แสดง `ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง`, URL คง `/logout`, retry ยังคงหน้าเดิม; Account drawer ยังคงเปิดและแสดง alert กับ `ลองออกจากระบบอีกครั้ง`
    - browser: fixture `logout-success` คืน POST `/admin/auth/logout` status 204 และ `/logout` ไป `/login`
    - viewports: n/a — interaction-only
    - deviations: browser verification ใช้ HTTPS dev runtime และ fixture ไม่แตะ auth state จริง

- [x] 2. สร้าง isolated authenticated logout evidence โดยไม่เปลี่ยน session จริง
  - **Satisfies:** F-4, B-1, B-2, B-3, B-5, B-6, B-8, B-10
  - **Files:** isolated backend/contract test หรือ test harness และ auth evidence artifact
  - **Verify:** ใช้ fixture ที่จำลอง authenticated session และผล `204`; ตรวจผลลัพธ์ที่ test seam รองรับได้ ได้แก่ session revoke, audit, session/CSRF cookie cleanup และ status; ห้ามเรียก real logout mutation, ห้ามแสดง cookie/token และต้องแยก logout-all behavior
  Evidence: isolated fixture คืน 204 และล้าง session/CSRF cookies; logic-only, no real mutation
    - test: `curl --max-time 5 -sS -X POST -D - -o /dev/null 'http://127.0.0.1:5100/api/v1/admins/auth/logout'` -> HTTP 204 และ `Set-Cookie` ล้าง `adm_session` กับ `adm_csrf`
    - test: `rtk proxy npx vitest run src/lib/api/admin/auth.test.ts` -> 1 file, 29 tests ผ่าน; 204 success และ non-2xx/network failure reject
    - evidence: existing backend contract source review คง `RequireAuthorization`, session-family revoke, audit และ cookie cleanup; ไม่มีการแก้ `pol-core`
    - viewports: n/a — logic-only
    - deviations: session revoke และ audit ไม่ยิง real mutation; ยืนยันผ่าน existing backend contract evidence และ isolated fixture เท่านั้น

- [x] 3. แก้เอกสารและ refresh SSO/evidence ให้ตรง provider ปัจจุบัน
  - **Satisfies:** F-5, F-6, B-4, B-5, B-7, B-9, B-10
  - **Files:** `docs/dev-setup.md`, `.claude/specs/login-google-sso/design.md`, auth bugfix evidence และ test output ที่เกี่ยวข้อง
  - **Verify:** ตรวจ Admin Microsoft authorize request มี `prompt=select_account`, Authorization Code, PKCE S256, state และ nonce; ตรวจเอกสารไม่อ้าง Admin Google หรือ `.finally` redirect; refresh test count/version จาก command ที่รันจริงโดยไม่ใส่ secret และไม่แก้ `pol-core`
  Evidence: เอกสารระบุ Admin Microsoft และ logout branch ปัจจุบัน; SSO security parameters และ test/version evidence refreshed; documentation/interaction-only, no real mutation
    - test: `if rg -n --glob 'docs/dev-setup.md' --glob '.claude/specs/login-google-sso/design.md' 'Admin Google|logout\\(\\)\\.finally|finally.*(/login|router\\.replace)' .; then exit 1; else printf 'auth docs contain no stale Admin Google or finally redirect references\\n'; fi` -> ไม่พบ contract เก่า
    - test: `rtk proxy npm test` -> Node 31 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` และ `rtk proxy npm run lint` -> root และ workspaces ผ่าน
    - evidence: Admin Microsoft authorization request มี `prompt=select_account`, `response_type=code`, minimal scope, PKCE S256, state และ nonce; ไม่บันทึกค่า token/state จริง
    - evidence: `package.json` ใช้ Next `16.3.1`; auth tasks evidence ใช้ผลรันปัจจุบัน ไม่ใช้จำนวน test เก่า
    - viewports: n/a — documentation/interaction-only
    - deviations: ไม่แก้หรือ rerun `pol-core`; browser/auth checks ใช้ safe fixture หรือ sanitized evidence และไม่ทำ real mutation

## Execution

ทำ task 1 ก่อน task 2 เพื่อปิด caller seam; ทำ task 3 หลัง evidence ปัจจุบันถูกตรวจแล้ว เพื่อไม่บันทึก
เอกสารจากผลรันเก่า.
