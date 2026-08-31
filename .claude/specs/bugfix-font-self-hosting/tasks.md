# Tasks: Self-hosted Admin Fonts

> Status: approved 2026-08-27

งานนี้เปลี่ยนเฉพาะ font pipeline ของ Admin ให้ build ไม่พึ่ง Google Fonts network โดยไม่เปลี่ยน
route, auth, API หรือ backend.

## Tasks

- [x] 1. ตรวจ license และย้าย family/weight ที่ใช้ไปเป็น local font assets
  - **Satisfies:** F-1, F-4, F-5, B-4, B-7, B-8, B-9
  - **Files:** `src/app/layout.tsx`, local font asset directory, license evidence และไฟล์ config ที่จำเป็นต่อ loader
  - **Verify:** ตรวจ asset และ license ของ `Public Sans`, `Inter`, `DM Sans`, `Nunito Sans` และ `Noto Sans Thai` ตามที่ source ใช้; build/typecheck ต้องตรวจได้ว่า CSS variables, weight mapping และ Thai fallback ยังมีชื่อและความหมายเดิม; ห้ามเพิ่ม dependency ถ้าไม่จำเป็น
  Evidence: 11 local font assets และ 7 SIL OFL 1.1 license notices ผ่าน; logic-only, deviations none
    - test: `rtk proxy node --test scripts/lib/workspace-verification.test.mjs` -> 31 tests ผ่าน รวม local asset/license mapping
    - test: `rtk proxy npm run build` -> production build สำเร็จ, generate 115 routes, TypeScript ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - test: `file src/app/fonts/*.ttf` และ `rg -n "SIL Open Font License|Copyright" src/app/fonts/LICENSE-*.txt` -> ทุก asset เป็น TrueType และทุก license เป็น SIL OFL 1.1 พร้อม copyright notice
    - viewports: n/a — logic-only
    - deviations: none

- [x] 2. เพิ่ม offline build regression และกำจัด Google Fonts dependency จาก build path
  - **Satisfies:** F-2, F-3, F-6, B-5, B-7, B-8, B-9
  - **Files:** `src/app/layout.tsx`, build regression test/script และ evidence ของ generated font output
  - **Verify:** รัน RED ขณะ source ยังใช้ `next/font/google` โดยปิด outbound Google Fonts หรือดัก request; หลังแก้ต้อง GREEN ทั้ง clean cache และ stale `.next/cache/turbopack`; assert ไม่มี request ไป `fonts.googleapis.com`/`fonts.gstatic.com`, ไม่มี virtual Google font module และ build สำเร็จ
  Evidence: clean Turbopack cache build ผ่านโดยไม่มี remote Google font request; logic-only, deviations none
    - test: `rtk proxy node --test scripts/lib/workspace-verification.test.mjs` -> 31 tests ผ่าน รวม clean-cache offline build และ no-remote-font assertion
    - test: `if rg -n --glob '!*.map' --glob '!.next/dev/**' --glob '!.next/cache/**' 'fonts\\.googleapis|fonts\\.gstatic|internal/font/google' .next/server .next/static; then exit 1; else printf 'production build contains no Google font references\\n'; fi` -> ไม่พบ reference ใน production artifacts
    - viewports: n/a — logic-only
    - deviations: ล้างเฉพาะ `.next/cache/turbopack` ตามที่ผู้ใช้อนุญาตก่อน build

- [x] 3. ตรวจ production runtime, route, auth และ computed font family หลัง build
  - **Satisfies:** F-7, B-1, B-2, B-3, B-5, B-6, B-8, B-9
  - **Files:** production runtime verification และ font/browser regression test
  - **Verify:** build ด้วย dependency ตาม lockfile แล้ว start production server; ตรวจ `/` ไป `/dashboard`, protected route, `/login`, local font asset response และ computed family/Thai fallback ใน browser; รัน `npm test`, `npm run typecheck`, `npm run lint` และ build โดยไม่อ่าน `.env.local` หรือทำ mutation
  Evidence: production runtime ใช้ local fonts และ auth/route contract คงเดิม; browser, no mutation, deviations: standalone harness ต้องซิงก์ generated static/public assets
    - test: `ADMIN_API_ORIGIN=https://localhost:5001 rtk proxy npm run build` -> production build สำเร็จ, generate 115 routes, TypeScript ผ่าน
    - test: `PORT=3102 node .next/standalone/server.js` -> standalone runtime พร้อมที่ `http://127.0.0.1:3102`
    - test: `rtk proxy npm test` -> Node 31 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - test: `rtk proxy npm run lint` -> root และ workspaces ผ่าน
    - browser: `/` redirect ไป `/dashboard`; การเปิด `/control/psp/list` โดยไม่มี session ได้ `GET /admin/me` status 401 และ redirect ไป `/login`; login page แสดงผลครบ
    - browser: ตรวจ `document.fonts.load` ครบ `publicSans`, `barlow`, `inter`, `dmSans`, `nunitoSans`, `notoSansThai`, `ibmPlexMono` ที่ weight หลัก ได้ `loaded=true` ทุก family; font resources เป็น local `.ttf` 11 รายการ และ remote Google font 0 รายการ
    - browser: computed body family มี `publicSans`, `notoSansThai`; measured `clientWidth=1200`, `innerWidth=1200`; console errors 0 และ warnings 0
    - test: `scripts/spec-trace.sh bugfix-font-self-hosting` -> ข้ามตามกติกา bugfix spec ที่ไม่มี `requirements.md`
    - viewports: 1200 OK (`clientWidth=1200`, `innerWidth=1200`); redirect/font evidence ไม่ใช่ responsive layout test
    - deviations: copy generated `.next/static` และ `public` เข้า `.next/standalone` ก่อน standalone smoke; no source dependency or auth changes

## Execution

ทำ task 1 ก่อน task 2 เพื่อยืนยัน asset/license และ mapping; ทำ task 3 หลัง offline build ผ่านเพื่อไม่ตรวจ
ผลจาก generated state เก่า.
