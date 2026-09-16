# งาน: ปรับสเกลตัวอักษรทั้งระบบ

> Status: approved 2026-09-16 (quick, no gates)

- [x] 1. ปรับ typography token และ semantic utilities ให้ base เป็น 1.25rem — line-height และ calendar ต้องสอดคล้องกับสเกลใหม่
  - Satisfies: REQ-1.1-1.4, REQ-2.1-2.3. Verify: `npm test`, `npm run typecheck`, `npm run build` และตรวจ diff ว่าแตะเฉพาะไฟล์ใน design

  Evidence:

  - test: `npx vitest run src/app/typography.test.ts` -> ผ่าน 3 tests ใน 1 test file
  - typecheck: `npm run typecheck` -> exit 0; root และทั้ง 2 workspaces ผ่าน
  - build: `npm run build` -> compiled successfully และสร้าง static pages ครบ 101 routes
  - generated CSS: `grep -r -E -o --include='*.css' -- '--text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl):[^;}]+' .next/static/chunks` -> พบ token ใหม่ครบ โดย `--text-base:1.25rem`
  - viewports: n/a — token/CSS change; Pi session ไม่มี browser verification runtime
  - deviations: ไม่มี functional deviation; browser visual verification ยังไม่ได้รันใน Pi

- [x] 2. ตรวจสอบผลรวมของสเกลและขอบเขตการเปลี่ยนแปลง — ยืนยันว่าไม่มี route, auth, API หรือ behavior ที่ไม่เกี่ยวข้องถูกแก้
  - Satisfies: REQ-2.2-2.3. Verify: `npm run lint`, `npm test`, `npm run typecheck` และ `scripts/spec-trace.sh typography-base-scale`

  Evidence:

  - test: `npm test` -> node tests ผ่าน 39/39, root Vitest ผ่าน 341/341 และ `@pol/shared` ผ่าน 26/26
  - lint: `npm run lint` -> exit 0; root และทั้ง 2 workspaces ผ่าน
  - typecheck: `npm run typecheck` -> exit 0; root และทั้ง 2 workspaces ผ่าน
  - trace: `scripts/spec-trace.sh typography-base-scale` -> เกณฑ์ 7 ข้อถูกอ้างครบและ EARS lint ผ่าน
  - diff: `git diff --check` -> ไม่พบ whitespace error; source change อยู่ที่ `src/app/globals.css` และ regression test ตาม design
  - viewports: n/a — token/CSS change; Pi session ไม่มี browser verification runtime
  - deviations: ไม่มี functional deviation; browser visual verification ยังไม่ได้รันใน Pi
