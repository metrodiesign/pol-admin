# Stack profile: Next.js (POL Admin root app)

> Optional stack profile — complements the neutral canon, ไม่แทนที่. กฎทั่วไปอยู่ใน
> `../CODING_STANDARDS.md` / `../ARCHITECTURE.md` / `../TESTING_PROTOCOL.md`; ไฟล์นี้เก็บเฉพาะ
> idiom ที่เจาะจง stack ของโปรเจกต์นี้. ground truth คือโค้ดจริง — แก้ที่นี่เมื่อ stack เปลี่ยน.

ในไฟล์นี้ path `src/...` หมายถึง app-local path ใต้ `src/...` เว้นแต่ระบุ package ชัดเจน.

## Versions (จาก package manifests)

- **next** 16.3.1 (App Router), **react** / **react-dom** 19.2.4, **typescript** ^5
- **tailwindcss** ^4 + **@tailwindcss/postcss** ^4 (Tailwind v4, CSS-first — ไม่มี `tailwind.config.*`)
- UI primitives: **shadcn** style `base-nova` build บน **@base-ui/react** ^1.5.0 — **ไม่ใช่ @radix-ui**
- **lucide-react** ^1.16, **recharts** ^3.8, **@tanstack/react-table** ^8.21
- **class-variance-authority** ^0.7, **clsx** ^2.1, **tailwind-merge** ^3.6, **tw-animate-css** ^1.4
- **simplebar** ^6.3 / **simplebar-react** ^3.3 (custom scrollbar ใน popover/drawer)

## Application and Package Model

- Repository root = `pol-admin` application; HTTPS dev 3001, HTTP production local 3001.
- `packages/ui` = `@pol/ui`; shared presentation exports ที่ใช้จริงร่วมกัน.
- `packages/shared` = `@pol/shared`; pure types/validation/utilities.
- Workspace graph ระบุ explicitเฉพาะสอง package paths; root packageเป็น Admin application.
- Admin มี route tree, auth/API, navigation, config, `public` และ `.next` ของตัวเอง.
- ห้าม package-to-app imports และ import source จาก Merchant workspace เดิม.
- Merchant frontend อยู่ใน canonical [pol-merchant](https://github.com/metrodiesign/pol-merchant.git).
- ไม่มี source synchronization ระหว่างสอง repository.

## Server vs client boundary

- App Router: **server component เป็น default**; `"use client"` ใส่เฉพาะส่วน interactive
  (ui primitive, form, dialog, table, settings). มี `"use client"` ~252 จุด กระจุกใน
  `src/components/ui/*` และหน้า form. layout เป็น server.
- หลักการ: ดัน client boundary ให้ต่ำที่สุดเท่าที่ interactivity ต้องการ — ลด JS payload.
  ไม่ใช้ async server component ฟetch จริง (ยังเป็น mock-only, ดู Data layer).

## Styling (Tailwind v4 CSS-first)

- Admin มี `src/app/globals.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, และ `@theme {}`
  เป็น **single source ของ design token** (color/typography/shadow/radius/breakpoint).
  ไม่มีไฟล์ config — token อยู่ใน CSS ล้วน; `@source` scan `packages/ui/src` สำหรับ shared UI.
- breakpoint custom: `--breakpoint-mmd` (900px), `--breakpoint-mlg` (1200px) เพื่อ parity กับ MUI;
  เรียงเป็น rem ให้มาก่อน sm/md/lg เพื่อ override precedence.
- **`cn()` = `clsx` + `tailwind-merge`** อยู่ใน `src/lib/utils.ts` — ใช้รวม className ทุกที่.
- variant ของ component ใช้ **`cva`** (class-variance-authority).
- runtime theming ผ่าน CSS variable: `.theme-minimals[data-preset="cyan|purple|blue|orange|red"]`
  override `--color-primary`/`--primary`/`--ring` โดยไม่ใช้ JS; dark mode = class `.dark` บน `<html>`.
- **Tailwind default palette ยังเปิดอยู่** ควบคู่ custom `@theme --color-*` (ไม่ได้ reset ด้วย
  `--color-*: initial`) — ใช้ `bg-orange-500`/`text-teal-700`/`bg-violet-500` ฯลฯ ได้เลยโดยไม่ต้อง
  นิยาม token เอง. เกินจาก 6 semantic families (`primary/secondary/info/success/warning/error`+grey)
  ก็หยิบ default scale มาใช้.
- ยืนยันว่า utility class ที่เพิ่งใช้ถูก **generate จริง**: grep substring (เช่น `orange`, `teal`) ใน
  prod CSS ก้อนใหญ่ `.next/static/chunks/*.css` — **build เขียวไม่การันตี** (unknown utility = เงียบ
  ไม่ error). อย่าใช้ fixed-string grep ชื่อ class เต็มข้ามหลายไฟล์ — minification/`$VAR` expansion
  ให้ 0 หลอกได้.

## UI primitives (shadcn-on-base-ui)

- App-local primitive ใน `src/components/ui/*` wrap **@base-ui/react** (ไม่ใช่ radix) + `cn()` +
  `data-slot="*"` บน subcomponent เพื่อ scope CSS โดยไม่ class-drill. ตั้งค่าใน `components.json`
  (style `base-nova`, base color `neutral`, icon `lucide`).
- เพิ่ม primitive ใหม่: ทำตาม pattern เดิม (wrap base-ui + cva + cn + data-slot) — **อย่า import @radix-ui**.
- `@pol/ui` ปัจจุบัน export `avatar-upload`, `fieldset`, `logo`; เพิ่มเมื่อ Admin หรือ retained package ต้องใช้ร่วมจริง.

## Domain wrappers

- **Icons**: `lucide-react` — import เป็นชื่อ icon ตรง ๆ (`ChevronDownIcon`, `CheckIcon`, ...).
- **Charts**: `recharts` ห่อใน `src/components/charts/*` (donut/radial/stacked-bar/sparkline + legend/tooltip).
  อย่าเรียก recharts ตรงในหน้า — ใช้ wrapper.
- **Tables**: `@tanstack/react-table` ห่อใน `src/components/table/data-table.tsx` + hook
  `src/hooks/use-data-table.ts`; table เฉพาะโดเมนต่อยอดเป็น hook (`use-policy-table-with-cart`,
  `use-invoices-table`).

## Data layer (domain = mock; auth = real BFF)

- **Domain data ยัง mock**: typed mock ใน `src/lib/mock/*` ที่ implement interface ใน `src/types/*`
  (เช่น `export const POLICIES: Policy[]`). transaction/policy/merchant-user/admin-user ยังไม่มี backend endpoint.
- data flow: `lib/mock/*` -> hook (filter/sort/paginate ผ่าน TanStack) -> page container spread
  เป็น props -> child component render. ไม่มี global store (ไม่มี Redux/Zustand) — React hook + context.
- **Auth = real backend แล้ว** (ดู section "Auth" ล่าง): app-local `src/lib/api/admin/*` คือ API client จริง;
  `/admin/me` เป็น real fetch. swap domain mock->real: เพิ่ม module `src/lib/api/<domain>.ts` คืน Promise,
  `const ENDPOINT: string|null = null` (null=mock, set=adminFetch) — migrate consumer ต่อ domain เมื่อ endpoint พร้อม.

## Auth (server-side OIDC BFF)

- Admin ใช้ **server-side OIDC BFF** (contract:
  `pol-core/docs/reference/admin-fe-integration.md` +
  `admin-google-sso.md`). FE **ไม่ถือ token**; session = httpOnly cookie ที่ backend set. ไม่มี GIS/id-token/Bearer.
- **same-origin proxy บังคับ**: root `next.config.ts` rewrite `/admin/*`, `/producer/*`, `/api/*`
  ไป `process.env.ADMIN_API_ORIGIN` (dev = `https://localhost:5001`; **prod เว้นว่าง** -> rewrite คืน `[]`
  เพราะ reverse proxy same-origin อยู่แล้ว).
  ผลพลอยได้: browser เห็นทุก call เป็น same-origin -> **CORS ไม่ถูก exercise** (อย่าไล่ debug CORS เมื่อใช้ proxy นี้;
  doc backend เขียน admin origin 5130 ก็ไม่มีผล).
- `src/lib/api/admin/auth.ts`: `adminFetch` (credentials:'include', แนบ `X-CSRF-Token`=cookie `adm_csrf` เฉพาะ
  mutation, 401->`login()`), `getMe()` (200->AdminMe / 401->null), `login(returnTo)` (full-page navigate
  `/admin/auth/login?returnTo=`), `logout`/`logoutAll`. pure helper แยกไว้ unit-test (node) ได้.
- guard = **client-side** (ตรงกับ contract): `auth-provider.tsx` (getMe on mount, `useAuth`) +
  `auth-guard.tsx` (loading/anon->login/authed) wrap ใน `minimals-layout.tsx` -> คุมทุก protected group;
  `/login` `/logout` `/login-error` ไม่ผ่าน MinimalsLayout = public โดยโครงสร้าง.
- `returnTo` ต้องอยู่ใน backend allowlist (`AdminSession:ReturnUrlAllowlist`); `app/page.tsx` redirect `/`->`/dashboard`
  ทำให้ landing robust แม้ backend fall back มา `/`. backend deny -> redirect `/login-error?reason=<label>` (FE หน้านี้ map ข้อความ).
- **E2E recipe**: real backend ต้อง Google human-auth + provisioned admin -> validate ครบไม่ได้ด้วย automation.
  ใช้ **contract-mock backend** (no-dep node http บน :5100 พูดตาม contract) + cookie-jar curl ผ่าน proxy +
  isolated browser context -> exercise proxy/guard/401/CSRF/authed ครบแบบ deterministic.
- Development frontend origin คือ Admin `https://localhost:3001`.
  Staging/production ต้องประสาน backend allowlist/OAuth callback และ reverse proxy ของ Admin origin ก่อน deploy.
- Merchant auth/runtime contract เป็นเจ้าของโดย canonical
  [pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

## App setup & theming

- `src/app/layout.tsx`: โหลด 5 Google font ผ่าน `next/font/google` เป็น `--font-*` CSS var,
  ครอบ `SettingsProvider`, และ inject `SETTINGS_INIT_SCRIPT` (inline IIFE ใน `<head>`) เพื่อ
  pre-paint theme ก่อน render แรก (กัน flash).
- `src/components/providers/settings-provider.tsx`: อ่าน 9 setting (mode/preset/contrast/rtl/
  compact/fontSize/navLayout/navColor/fontFamily) จาก localStorage แล้ว apply ลง `<html>` (class/`data-*`/CSS var).
  เข้าถึงผ่าน `useSettings()`.
- path alias **`@/*` -> `./src/*`** (`tsconfig.json`) — ใช้ absolute import เสมอ, เลี่ยง relative ข้ามโมดูล.
- **โครงสร้างไฟล์ hierarchical**: folder = domain, file = entity, ตัด prefix ที่ซ้ำชื่อโฟลเดอร์
  (เช่น `components/admin/role/view.tsx` ไม่ใช่ `components/role/roles-view.tsx`). โดเมนหลัก:
  `admin/{user,role}` (URL `/admin/user`, `/admin/role`), `merchant/{user,role}` (URL `/merchant/user`,
  `/merchant/role`), `control/*`, `order`, `transaction`, `policy`. root entity ของ domain ใช้ `index.ts`
  (`types/merchant/index.ts`, `lib/mock/merchant/index.ts`). ยกเว้น `src/app/minimals/*` +
  `components/dashboard/*` (Minimals demo — คงโครงเดิม). API client แยกตาม concern:
  `lib/api/admin/{auth,role}.ts`, `lib/api/merchant/user.ts`.
  หมายเหตุ: page URL `/admin/*` อยู่ร่วมกับ BFF rewrite `/admin/:path*` ได้ใน dev (afterFiles — page ชนะ);
  prod ต้อง confirm ว่า reverse proxy ไม่ route `/admin/*` ทั้ง prefix ไป backend.

## Environment

- Template อยู่ที่ `.env.example`.
- Developer คัดลอกเป็น `.env.local` ด้วยมือ; ห้าม auto-copy root env หรือ secret.
- `ADMIN_API_ORIGIN=https://localhost:5001` เปิด dev rewrites; production เว้นว่างเมื่อ reverse proxy
  ให้ SPA/API เป็น same-origin.
- Generated HTTPS certificates อยู่ root `certificates/` และถูก ignore.

## Tooling

- Root scripts `dev`, `dev:clean`, `build`, `start` เรียก Next.js โดยตรง; `test` รัน verifier,
  root Vitest และ retained package tests; `lint`/`typecheck` ครอบ root app กับ retained packages.
- Admin dev script ใช้ `next dev --experimental-https` บน 3001. Admin start script ใช้ HTTP
  บน port เดิม; TLS production เป็นหน้าที่ reverse proxy.
- **test runner = vitest** (`vitest` ^4.1.9, root config: alias `@`→`./src`, `environment: node`,
  include `src/**/*.test.ts`); `@pol/shared` มี validation tests ของตัวเอง.
- `npm run verify:workspaces` ตรวจ exact topology, Admin route contract, import boundaries และ `.only`/`.skip`.
- `npm run smoke:routes` spawn Admin production server, probe contract และหยุดเฉพาะ child process ที่สร้างเอง.
- Build output และ standalone output อยู่ที่ `.next`.

## Navigation (sidebar)

- เพิ่มเมนู sidebar ต้องแก้ **สองไฟล์**: `src/components/layout/nav-config.ts` (breadcrumb/search)
  **และ** `src/components/layout/minimals-nav-config.ts` — `MinimalsLayout` render sidebar จาก
  `minimals-nav-config.ts` เท่านั้น. แก้แค่ `nav-config.ts` = เมนูไม่ขึ้นใน sidebar จริง (เคสจริง
  /policy/list). verify เมนู active บน production build ไม่ใช่เชื่อว่าแก้ config แล้วพอ.

## Known Admin domain mismatch (flag, ยังไม่แก้)

- Admin Merchant-management role (`components/merchant/role`) ใช้ resource keys
  ของ Admin domain (`txn`/`merchant`/`finance`/`user`/`system`). ปรับ resource model ให้ตรง
  Merchant-management domain ในงานแยก (spec: `merchant-user-management` REQ-8 note).
