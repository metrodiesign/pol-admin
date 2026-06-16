# Stack profile: Next.js (POL admin / pol-admin)

> Optional stack profile — complements the neutral canon, ไม่แทนที่. กฎทั่วไปอยู่ใน
> `../CODING_STANDARDS.md` / `../ARCHITECTURE.md` / `../TESTING_PROTOCOL.md`; ไฟล์นี้เก็บเฉพาะ
> idiom ที่เจาะจง stack ของโปรเจกต์นี้. ground truth คือโค้ดจริง — แก้ที่นี่เมื่อ stack เปลี่ยน.

## Versions (จาก package.json)

- **next** 16.2.6 (App Router), **react** / **react-dom** 19.2.4, **typescript** ^5
- **tailwindcss** ^4 + **@tailwindcss/postcss** ^4 (Tailwind v4, CSS-first — ไม่มี `tailwind.config.*`)
- UI primitives: **shadcn** style `base-nova` build บน **@base-ui/react** ^1.5.0 — **ไม่ใช่ @radix-ui**
- **lucide-react** ^1.16, **recharts** ^3.8, **@tanstack/react-table** ^8.21
- **class-variance-authority** ^0.7, **clsx** ^2.1, **tailwind-merge** ^3.6, **tw-animate-css** ^1.4
- **simplebar** ^6.3 / **simplebar-react** ^3.3 (custom scrollbar ใน popover/drawer)

## Server vs client boundary

- App Router: **server component เป็น default**; `"use client"` ใส่เฉพาะส่วน interactive
  (ui primitive, form, dialog, table, settings). มี `"use client"` ~252 จุด กระจุกใน
  `src/components/ui/*` และหน้า form. layout เป็น server.
- หลักการ: ดัน client boundary ให้ต่ำที่สุดเท่าที่ interactivity ต้องการ — ลด JS payload.
  ไม่ใช้ async server component ฟetch จริง (ยังเป็น mock-only, ดู Data layer).

## Styling (Tailwind v4 CSS-first)

- `src/app/globals.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, และ `@theme {}`
  เป็น **single source ของ design token** (color/typography/shadow/radius/breakpoint).
  ไม่มีไฟล์ config — token อยู่ใน CSS ล้วน.
- breakpoint custom: `--breakpoint-mmd` (900px), `--breakpoint-mlg` (1200px) เพื่อ parity กับ MUI;
  เรียงเป็น rem ให้มาก่อน sm/md/lg เพื่อ override precedence.
- **`cn()` = `clsx` + `tailwind-merge`** อยู่ใน `src/lib/utils.ts` — ใช้รวม className ทุกที่.
- variant ของ component ใช้ **`cva`** (class-variance-authority).
- runtime theming ผ่าน CSS variable: `.theme-minimals[data-preset="cyan|purple|blue|orange|red"]`
  override `--color-primary`/`--primary`/`--ring` โดยไม่ใช้ JS; dark mode = class `.dark` บน `<html>`.

## UI primitives (shadcn-on-base-ui)

- ทุก primitive ใน `src/components/ui/*` wrap **@base-ui/react** (ไม่ใช่ radix) + `cn()` +
  `data-slot="*"` บน subcomponent เพื่อ scope CSS โดยไม่ class-drill. ตั้งค่าใน `components.json`
  (style `base-nova`, base color `neutral`, icon `lucide`).
- เพิ่ม primitive ใหม่: ทำตาม pattern เดิม (wrap base-ui + cva + cn + data-slot) — **อย่า import @radix-ui**.

## Domain wrappers

- **Icons**: `lucide-react` — import เป็นชื่อ icon ตรง ๆ (`ChevronDownIcon`, `CheckIcon`, ...).
- **Charts**: `recharts` ห่อใน `src/components/charts/*` (donut/radial/stacked-bar/sparkline + legend/tooltip).
  อย่าเรียก recharts ตรงในหน้า — ใช้ wrapper.
- **Tables**: `@tanstack/react-table` ห่อใน `src/components/table/data-table.tsx` + hook
  `src/hooks/use-data-table.ts`; table เฉพาะโดเมนต่อยอดเป็น hook (`use-policy-table-with-cart`,
  `use-invoices-table`).

## Data layer (mock-only)

- **ไม่มี backend / API client / server action**. ข้อมูลทั้งหมดเป็น typed mock ใน `src/lib/mock/*`
  ที่ implement interface ใน `src/types/*` (เช่น `export const POLICIES: Policy[]`).
- data flow: `lib/mock/*` -> hook (filter/sort/paginate ผ่าน TanStack) -> page container spread
  เป็น props -> child component render. ไม่มี global store (ไม่มี Redux/Zustand) — React hook + context.
- เมื่อมี backend จริงในอนาคต: ใส่ชั้น fetch/adapter แยก แล้วคง type contract ใน `src/types/*` เป็นสัญญา.

## App setup & theming

- `src/app/layout.tsx`: โหลด 5 Google font ผ่าน `next/font/google` เป็น `--font-*` CSS var,
  ครอบ `SettingsProvider`, และ inject `SETTINGS_INIT_SCRIPT` (inline IIFE ใน `<head>`) เพื่อ
  pre-paint theme ก่อน render แรก (กัน flash).
- `src/components/providers/settings-provider.tsx`: อ่าน 9 setting (mode/preset/contrast/rtl/
  compact/fontSize/navLayout/navColor/fontFamily) จาก localStorage แล้ว apply ลง `<html>` (class/`data-*`/CSS var).
  เข้าถึงผ่าน `useSettings()`.
- path alias **`@/*` -> `./src/*`** (`tsconfig.json`) — ใช้ absolute import เสมอ, เลี่ยง relative ข้ามโมดูล.

## Tooling

- scripts: `dev` = `next dev -p 5200`, `start` = `next start -p 5200`, `build` = `next build`
  (Next 16 ใช้ Turbopack เป็น default), `lint` = `eslint`.
- **ยังไม่มี test runner** (ไม่มี jest/vitest/playwright ใน deps) — gate `.ai/bin/gate-task.sh`
  จะข้าม code-green check แล้วเหลือ Evidence gate จนกว่าจะเพิ่ม `test` script (ดู CODING_STANDARDS Tooling).
- typecheck: ใช้ `tsc --noEmit` ได้ (ยังไม่มี script `typecheck` ใน package.json — เพิ่มได้เพื่อให้ gate auto-detect).

## Known mismatch (flag, ยังไม่แก้)

- `package.json` field `"name": "merchant-dashboard"` ไม่ตรงกับผลิตภัณฑ์ (POL admin / pol-admin).
  เป็นชื่อตกค้างจาก template — ควร rename เป็น `pol-admin` แยก PR เมื่อสะดวก.
