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
  - diff: `git diff --check` -> ไม่พบ whitespace error; ณ task boundary นี้ source change อยู่ที่ `src/app/globals.css` และ regression test ตาม design (การเลื่อน component ถูกบันทึกใน task 3)
  - viewports: n/a — token/CSS change; Pi session ไม่มี browser verification runtime
  - deviations: ไม่มี functional deviation; browser visual verification ยังไม่ได้รันใน Pi

- [x] 3. เลื่อน utility ตั้งแต่ text-xl ขึ้นไปลงหนึ่งระดับใน app และ shared UI โดยคง text-base ลงไปไว้เดิม
  - Satisfies: REQ-1.5-1.6. Verify: `npx vitest run src/app/typography.test.ts`, `npm test`, `npm run typecheck`, `npm run lint` และ `npm run build`

  Evidence:

  - repro: diagnostic utility count ก่อนแก้ -> ล้มด้วยจำนวนเดิม `xl:66, 2xl:63, 3xl:11, 4xl:25, 5xl:15`; หลังแก้ regression test ผ่านด้วย `lg:73, xl:63, 2xl:14, 3xl:25, 4xl:15, 5xl:0`
  - test: `npx vitest run src/app/typography.test.ts` -> ผ่าน 5 tests ใน 1 test file
  - test: `npm test` -> node tests ผ่าน 39/39, root Vitest ผ่าน 343/343 และ `@pol/shared` ผ่าน 26/26
  - typecheck: `npm run typecheck` -> exit 0; root และทั้ง 2 workspaces ผ่าน
  - lint: `npm run lint` -> exit 0; root และทั้ง 2 workspaces ผ่าน
  - build: `npm run build` -> compiled successfully และสร้าง static pages ครบ 101 routes
  - scope: `git diff --unified=0 origin/develop -- 'src/**/*.tsx' 'packages/**/*.tsx' | grep -E '^[+-][^+-].*text-(xs|sm|base)([^[:alnum:]_-]|$)' || true` -> ไม่พบการเปลี่ยน `text-base`, `text-sm` หรือ `text-xs`
  - viewports: n/a — typography utility/source change; Pi session ไม่มี browser verification runtime
  - deviations: ไม่มี functional deviation; browser visual verification ยังไม่ได้รันใน Pi
