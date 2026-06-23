# Implementation Tasks: Login + Dual Google SSO

> Status: approved 2026-06-23, amended 2026-06-23

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

อ้างอิง: requirements.md + design.md (approved 2026-06-23). Stack: Next 16 / React 19 / Tailwind v4 /
@base-ui / vitest (node). Frontend-only, mock, ไม่มี dependency ใหม่.

- [x] 1. Config, types & env foundation — สร้าง `src/types/auth.ts` (`Audience`, `GoogleIdTokenClaims`,
     `MockSession`), `src/lib/auth/auth-config.ts` (`getClientId(audience)` อ่าน `NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN`/`_PRODUCER`
     คืน `null` ถ้าไม่ตั้ง; `LANDING_BY_AUDIENCE` = `{admin:"/main",producer:"/main"}`; `ALLOWED_HOSTED_DOMAINS` default ว่าง),
     และ `.env.example` (placeholder 2 client_id, committed). ไม่ hardcode id; ไม่มี secret ฝั่ง frontend.
     Satisfies: REQ-6 (6.1-6.5); feeds REQ-2.5, REQ-4.1. Verify: `npx tsc --noEmit` เขียว; `.env.example` มี 2 ตัวแปร;
     `git check-ignore .env.local` ผ่าน; grep ยืนยันไม่มี client_id literal ในซอร์ส.
     Evidence: T1 config/types/env เขียว — รายละเอียดด้านล่าง
       - typecheck: `npx tsc --noEmit` -> ไฟล์ใหม่ (types/auth.ts, auth-config.ts) 0 error
       - env: `grep -c NEXT_PUBLIC_GOOGLE_CLIENT_ID .env.example` -> 2; `git check-ignore -v .env.local` -> matched `.gitignore:17 .env.*` (exit 0)
       - no-hardcode: `grep -rn apps.googleusercontent.com src/` -> ไม่พบ (exit 1) — client_id อ่านจาก env เท่านั้น
       - viewports: n/a — config/logic-only
       - deviations: tsc มี 1 error PRE-EXISTING ใน `src/lib/policy/checkout.test.ts` (referenceType optional vs required) — ไม่เกี่ยวงานนี้, ไม่แก้ (surgical). flag ให้ user.

- [x] 2. Pure auth logic + unit tests (CORE) — `src/lib/auth/jwt.ts` (`decodeJwtPayload`: split 3 ส่วน,
     base64url `-_`->`+/` + pad, `atob`->bytes->`TextDecoder("utf-8")`->`JSON.parse`, malformed->`null`) และ
     `src/lib/auth/session.ts` (`validateClaims` ตรวจ aud/exp/email_verified[normalize bool|"true"]/hd + missing-claim->`missing_claims`;
     `verifyAndBuildSession`; `chooseLanding`; `isSessionValid`). เขียน co-located `jwt.test.ts` + `session.test.ts` ให้ครบเคส
     (รวม `-_`/pad, ชื่อไทย UTF-8, claim ขาด, exp อดีต/อนาคต, aud ไม่ตรง, hd block, `email_verified` string).
     Satisfies: REQ-3 (3.1-3.6, 3.8, 3.9), REQ-4.1, REQ-4.4, REQ-4.5. Depends on: 1. Verify: `npm run test` GREEN (vitest node);
     `npx tsc --noEmit`.
     Evidence: T2 core logic เขียว — 18/18 tests pass, รายละเอียดด้านล่าง
       - test: `npx vitest run src/lib/auth` -> 2 files, 18 passed / 0 failed (jwt 7, session 11)
       - typecheck: `npx tsc --noEmit` -> auth files 0 error (repo เหลือ 1 pre-existing ใน checkout.test.ts เท่าเดิม)
       - cases: -_/pad/UTF-8 ไทย, ไม่ครบ 3 ส่วน, atob พัง, non-JSON, non-object; aud_mismatch, expired(<=now), email_verified bool|"true"|"false", missing_claims x6, hd_blocked, malformed, chooseLanding, isSessionValid
       - viewports: n/a — pure logic
       - deviations: เพิ่ม name/sub/email เข้า required-claims (design list อ้าง aud/exp/email_verified) เพราะ MockSession.name จำเป็น + design ระบุอ่าน sub/email เพื่อ check — superset, ไม่กระทบเคสที่ระบุ

- [ ] 3. GIS dual-client spike — พิสูจน์ว่า `google.accounts.id.initialize({client_id})` + `renderButton(slot)`
     แบบ render-on-demand 1 client/ครั้ง คืน credential ผ่าน callback ที่ผูก `client_id` ถูกตัวเมื่อสลับ audience (admin<->producer),
     และ `aud` ใน ID token ตรง client_id ที่ตั้งใจ. ใช้ client_id จริงใน `.env.local` (ไม่ commit). บันทึกลำดับ init/render ที่ใช้ได้จริง
     ลงท้าย design.md (หรือ note ในงาน) ก่อนล็อก T4. ถ้า binding ไม่ reliable -> สลับ pattern ตาม ceiling ใน design.
     Satisfies: REQ-2.6 (spike validation; full impl ใน T4). Depends on: 1. Verify: manual `npm run dev` :5200 — กดสลับ 2 audience,
     console ยืนยัน `aud`=client_id ที่เลือกทุกครั้ง (อย่า log token เต็ม — log เฉพาะ `aud`).
     Progress (2026-06-23, option 1): เขียน `src/lib/auth/gis.ts` (`renderAudienceButton` render-on-demand + `getGisApi`) + `gis.test.ts`.
     binding concern (callback ผูก client_id ถูกตัวเมื่อสลับ audience, no singleton clobber B3) พิสูจน์ด้วย unit test (mock GIS) — 3 tests pass.
     ค้าง (manual, รอ real client_id ใน .env.local): ยืนยัน `aud` จริง = client_id ผ่าน GIS popup ที่ :5200. คง `[ ]` จนกว่า verify จริง.
     Live verify (2026-06-23, browser :5200, .env.local จริง): คลิก Admin -> iframe `client_id=888188...`; สลับ Producer -> `client_id=331131...` (คนละตัว, ปุ่มเดิมถูก `replaceChildren`) = render-on-demand binding จริงผ่าน, no clobber. ค้างจริง: `aud` จาก token ต้อง sign-in (ติด origin config — ดู flag). binding goal ของ spike = ผ่าน (unit + live distinct client_id).

- [ ] 4. Login page + GIS wiring + toast — `src/app/login/page.tsx` (shell-free, render `<LoginView/>`),
     `src/components/auth/login-view.tsx` (`"use client"`: โหลด GIS ผ่าน `next/script` + ready/error/retry[bump key];
     initial `checking` กัน flash; อ่าน session เดิม -> redirect ตาม `chooseLanding`; 2 ปุ่ม audience + slot renderButton;
     `getClientId` null -> ปุ่ม disabled + inline config error, หายทั้งคู่ -> empty-state; callback -> `verifyAndBuildSession`
     -> สำเร็จ writeSession + toast + `router.replace`; fail -> toast `เข้าสู่ระบบไม่สำเร็จ` ไม่ redirect; ไม่ log token/PII),
     `src/lib/auth/session-storage.ts` (read/write/clear localStorage), `src/components/auth/use-auth-toast.ts` +
     `auth-toaster.tsx` (extend pattern `use-role-toast.ts` + `variant` success/error). reuse Button `@/components/ui/button`,
     token จาก `globals.css`, `cn()`. Satisfies: REQ-1, REQ-2, REQ-3.6, REQ-3.7, REQ-4.2, REQ-4.3, REQ-4.4, REQ-4.5, REQ-5, REQ-7.
     Depends on: 1, 2, 3. Verify: `npm run dev` :5200 — `/login` ไม่มี shell, 2 ปุ่ม + label, GIS popup, redirect ถูกตาม aud,
     error toast เป็นสีแดง/ไอคอน X, มี session แล้วเข้า /login เด้งออก, keyboard tab + focus มองเห็น, ไม่มี horizontal scroll @320px,
     ไม่มี token/PII ใน console/network; `npx tsc --noEmit` + `npm run lint`.
     Progress (2026-06-23, option 1): เขียนครบ — `login/page.tsx`, `login-view.tsx`, `session-storage.ts`, `use-auth-toast.ts`, `auth-toaster.tsx`.
     verify อัตโนมัติเขียว: `npx tsc --noEmit` (ไฟล์ใหม่ 0 error), `npm run lint` clean, `npm test` 66 pass, `npm run build` -> `/login` prerender ○ Static.
     ใช้ `useSyncExternalStore` (hydrated flag) แทน sessionChecked-setState-in-effect (lint rule `react-hooks/set-state-in-effect`); slot เคลียร์ด้วย `replaceChildren()` (เลี่ยง innerHTML).
     ค้าง (manual browser + real client_id): GIS popup จริง, redirect ตาม aud, toast แดง/เขียว, focus/contrast, no-scroll @320px, no token/PII ใน console. คง `[ ]`.
     Live verify (2026-06-23, browser :5200): /login no-shell + 2 ปุ่ม+aria-label (1.1-1.4); GIS โหลด (`google.accounts.id`=true) + ปุ่ม enabled (1.5); ปุ่ม Google render ต่อ audience (2.1-2.4,2.6); session ใช้ได้ -> เด้ง /main (4.4); หมดอายุ -> ล้าง+คง /login (4.5); responsive 320/375/768/1440 clientWidth===target no h-scroll (7.3); Tab -> focus ring 3px ทั้ง 2 ปุ่ม (7.1); ก่อน sign-in ไม่มี token/PII ใน localStorage (3.7). ค้าง: happy-path sign-in สำเร็จ + error/cancel toast (5.x) + config-error/empty-state (2.5) + script-fail retry (1.6) — ต้อง Google login จริง/force-fail; ติด origin config.
     2-card amend (2026-06-23): `login-view` เป็น **2 card**, ปุ่ม Google โชว์พร้อมกันต่อ card (ไม่ต้องเลือกก่อน); config error ต่อ card. verified live :5200: 2 region + h2, ปุ่มทั้งคู่ render client_id ถูกตัว, 375 no h-scroll, ไม่มี error ใหม่. tsc/lint/build เขียว, 29 unit tests pass.

- [ ] 5. Sign-out (logout route) — `src/app/logout/page.tsx` (`"use client"`: `clearSession()` -> `router.replace("/login")`).
     Satisfies: REQ-8 (8.1-8.3). Depends on: 4 (session-storage). Verify: `npm run dev` — เข้า `/logout` ล้าง session + เด้ง `/login`;
     หลังจากนั้นเข้า `/login` แสดงหน้า login (ไม่เด้งออก) จนกว่า login ใหม่.
     Progress (2026-06-23, option 1): เขียน `src/app/logout/page.tsx` (`clearSession()` -> `router.replace("/login")`). `npm run build` -> `/logout` prerender ○ Static.
     ค้าง (manual): เข้า `/logout` จริงแล้ว session ถูกล้าง + เด้ง `/login` ที่ :5200. คง `[ ]`.
     Live verify (2026-06-23, browser :5200): set session -> นำทาง `/logout` -> `pathname=/login` + `pol.mock_session=null` = ล้าง+เด้งผ่านครบ (8.1-8.3). ไม่พึ่ง sign-in — พร้อม flip `[x]`.

## Suggested execution batches

> Feature นี้ **coupled** (ทุก task แชร์ `src/lib/auth/*`, types, session-storage). DEFAULT = รันทั้งหมดใน session เดียว:
> `scripts/pane-loop.sh login-google-sso all-in-one` (หรือ `/spec-implement all`) — ถูกกว่าเพราะ cache ร่วม.
>
> ทางเลือกเพื่อ accuracy (แลก cost): แยก **T2 (CORE pure logic)** ออก session เดียวเพื่อกัน context drift ของ
> security path, และ **T3 (spike)** เป็น session สั้นแยก (ต้องใช้ client_id จริง + ตา manual) ก่อนเริ่ม T4.
> ลำดับบังคับ: 1 -> 2 -> 3 -> 4 -> 5 (T3 รันหลัง T1 ได้ ขนานกับ T2).

ไม่มี `Batch:` tag — แต่ละ task เป็น slice ที่ verify แยกได้ ไม่มีคลัสเตอร์เล็กชนิดเดียวกันให้ batch.
