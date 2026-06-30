# pol-admin

Admin portal สำหรับทีม Payment Operations — ดูและปฏิบัติการธุรกรรมการรับชำระเบี้ยประกัน
ข้าม PSP (2C2P, Omise) ทั้งหมดจากหน้าจอเดียว (internal-only, พนักงานเท่านั้น)

## สารบัญ

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [ติดตั้งและตั้งค่าเริ่มต้น](#ติดตั้งและตั้งค่าเริ่มต้น)
- [Environment Variables](#environment-variables)
- [การรัน Dev Server](#การรัน-dev-server)
- [Build สำหรับ Production](#build-สำหรับ-production)
- [รันเทสต์](#รันเทสต์)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [Authentication](#authentication)
- [การพัฒนา](#การพัฒนา)
- [Workflow ทีม](#workflow-ทีม)

---

## Tech Stack

| ส่วน | เทคโนโลยี | เวอร์ชัน |
|------|-----------|---------|
| Framework | Next.js App Router | 16.2.6 |
| Runtime | React | 19.2.4 |
| ภาษา | TypeScript | ^5 |
| Styling | Tailwind CSS v4 (CSS-first, ไม่มี config file) | ^4 |
| UI Primitives | shadcn style `base-nova` บน `@base-ui/react` (ไม่ใช่ Radix) | ^1.5.0 |
| Icons | lucide-react | ^1.16 |
| Charts | recharts (ห่อใน `src/components/charts/*`) | ^3.8 |
| Tables | @tanstack/react-table (ห่อใน `src/components/table/*`) | ^8.21 |
| Test Runner | Vitest | ^4.1.9 |
| Dev Port | 5200 | |

> ยังไม่มี backend domain จริง — domain data ใช้ typed mock ใน `src/lib/mock/*`.
> Auth เป็น server-side OIDC BFF จริงแล้ว (ดู [Authentication](#authentication)).

---

## Prerequisites

- **Node.js** >= 20 (แนะนำ LTS ล่าสุด)
- **npm** >= 10 (มากับ Node 20)
- ถ้าต้องการต่อ backend จริง: รัน [pol-core](../pol-core) บนพอร์ต 5100 ไว้ก่อน

ตรวจสอบเวอร์ชัน:

```bash
node -v   # >= 20
npm -v    # >= 10
```

---

## ติดตั้งและตั้งค่าเริ่มต้น

```bash
# 1. clone repo
git clone git@github.com:metrodiesign/pol-admin.git
cd pol-admin

# 2. ติดตั้ง dependency
npm install

# 3. คัดลอก env template
cp .env.example .env.local
```

จากนั้นแก้ไขค่าใน `.env.local` ตาม [Environment Variables](#environment-variables)

---

## Environment Variables

สร้างไฟล์ `.env.local` จาก `.env.example` (ห้าม commit `.env.local` เข้า git)

| ตัวแปร | ค่า dev | ค่า prod | คำอธิบาย |
|--------|---------|----------|----------|
| `ADMIN_API_ORIGIN` | `http://localhost:5100` | ว่าง (ไม่ตั้ง) | origin ของ BFF — Next.js จะ rewrite `/admin/*` และ `/producer/*` ไปยัง host นี้ บังคับ same-origin ใน dev |

**Dev (ต่อ backend จริง):**

```env
ADMIN_API_ORIGIN=http://localhost:5100
```

**Dev (mock-only, ไม่ต้อง backend):**

```env
# ไม่ต้องตั้ง ADMIN_API_ORIGIN — rewrite จะ return [] อัตโนมัติ
```

**Production:**

```env
# เว้น ADMIN_API_ORIGIN ว่าง — reverse proxy เสิร์ฟ SPA + API เป็น origin เดียวกันอยู่แล้ว
```

> ห้าม hardcode credential ทุกชนิด อ่านจาก environment variable เท่านั้น

---

## การรัน Dev Server

```bash
npm run dev
```

แอปขึ้นที่ [http://localhost:5200](http://localhost:5200)

Next.js 16 ใช้ **Turbopack** เป็น default (เร็วกว่า Webpack มาก)

**ดู raw log (แนะนำ):**

```bash
rtk proxy npm run dev
```

> หมายเหตุ: ถ้าใช้ `npm run dev` โดยตรงผ่าน rtk hook output จะถูก filter เป็น summary `Errors: N | Warnings: N` บดบัง log จริง — ใช้ `rtk proxy` เพื่อดู raw output

**ถ้าพบ Turbopack zombie** (server alive แต่ทุก route คืน 404):

```bash
# ดู body จาก curl ก่อน — 404 ที่มี HTML body = zombie
curl -i http://localhost:5200

# kill แล้ว restart
lsof -ti :5200 | xargs kill -9
npm run dev
```

---

## Build สำหรับ Production

```bash
npm run build
npm run start
```

`start` รันบนพอร์ต 5200 เช่นกัน

**ตรวจสอบ Tailwind utility ที่ใช้ถูก generate:**

```bash
# หลัง build — grep ใน CSS จริง ไม่ใช่ source
grep -r "orange" .next/static/chunks/*.css | head -5
```

> `next build` เขียว ≠ utility class ถูก generate เสมอ (unknown utility เงียบไม่ error)

---

## รันเทสต์

```bash
# รัน test suite ทั้งหมด
npm test

# watch mode (ระหว่าง dev)
npx vitest
```

Test ทั้งหมดอยู่ที่ `src/**/*.test.ts` (co-located กับ logic ที่ทดสอบ)
Environment = `node` (ไม่ใช่ jsdom)

**Typecheck:**

```bash
npx tsc --noEmit
# หรือ
npm run build  # ตรวจ type พร้อมกัน
```

**Lint:**

```bash
npm run lint
```

---

## โครงสร้างโปรเจกต์

```
src/
  app/                  # Next.js App Router
    globals.css         # design token single-source (@theme) + dark mode + theme variants
    layout.tsx          # root: SettingsProvider, fonts (Google 5 ตระกูล), SETTINGS_INIT_SCRIPT
    dashboard/          # route group (Minimals template demo + POL routes ที่จะ wire ทีหลัง)

  components/
    ui/                 # primitive: shadcn/base-nova บน @base-ui/react — prop-only, ห้าม import @radix-ui
    payment/            # (*) POL domain surface จริง:
                        #   dashboard, transactions, invoices, psp, api-clients,
                        #   webhooks, audit, users, roles, branches, agents, apps,
                        #   reports, notifications, shell
    dashboard/          # Minimals template demo (scaffolding, ไม่ใช่ product feature)
    layout/             # app shell: sidebar/topbar, nav-config.ts, minimals-nav-config.ts
    form/               # field wrapper: text/select/date/country/phone-country
    charts/             # recharts wrapper (ใช้ wrapper เสมอ ห้ามเรียก recharts ตรงในหน้า)
    table/              # @tanstack/react-table UI: data-table, pagination
    shared/             # cross-app: breadcrumbs, page-header, avatar-upload
    providers/          # settings-provider.tsx (theme/mode/preset runtime control)

  hooks/                # stateful logic: use-data-table, use-policy-table-with-cart, ...
  lib/
    mock/               # typed mock data (NO backend): transactions/psp/webhooks/audit/...
    api/                # API client จริง: admin-api.ts (adminFetch, getMe, login, logout)
    utils.ts            # cn() (clsx+tailwind-merge), formatTHB()
    breadcrumbs.ts      # buildBreadcrumbs()
  types/                # domain contracts (PascalCase): transaction, psp, originator, role, ...
```

> `(*)` = product surface จริง. domain data ยังเป็น mock; auth เป็น real BFF แล้ว.

---

## Authentication

ระบบใช้ **server-side OIDC BFF** — FE ไม่ถือ token เลย

- Session = **httpOnly cookie** ที่ backend set (ไม่มี GIS/id-token/Bearer ใน FE)
- Guard = client-side: `auth-provider.tsx` (call `getMe` on mount) + `auth-guard.tsx` (loading/anon -> redirect `/login`)
- Public routes (ไม่ผ่าน MinimalsLayout): `/login`, `/logout`, `/login-error`

**Flow auth dev (ต้อง backend):**

```
Browser -> Next.js (port 5200)
          -> /admin/* rewrite -> pol-core (port 5100)
             <- httpOnly session cookie
Browser ถือ session ผ่าน cookie (same-origin)
```

**CSRF:** `adminFetch` แนบ header `X-CSRF-Token` = cookie `adm_csrf` เฉพาะ mutation (POST/PUT/PATCH/DELETE)

**Error redirect:** backend deny -> `/login-error?reason=<label>` (FE map เป็นข้อความใน `login-error/page.tsx`)

> ถ้าต้องการ E2E test ที่ deterministic: ใช้ contract-mock backend (node http บน 5100) แทน Google SSO จริง

---

## การพัฒนา

### Naming Conventions

| สิ่ง | รูปแบบ | ตัวอย่าง |
|------|--------|----------|
| ไฟล์ `.ts`/`.tsx` | kebab-case | `use-data-table.ts`, `policy-columns.tsx` |
| Type/Interface | PascalCase | `Policy`, `PolicyStatus` |
| Custom hook | prefix `use-*` | `use-policy-table-with-cart` |
| Context provider | suffix `*-provider.tsx` | `settings-provider.tsx` -> `useSettings()` |
| Mock data | `entity.ts` | `policies.ts` export `POLICIES: Policy[]` |
| Export | named function เสมอ | `export function PolicyDataTable()` |

> default export เฉพาะ Next.js page/layout

### Import Ordering

```ts
"use client"; // บรรทัดบนสุดถ้ามี

// 1. external
import { useState } from "react";
import { useReactTable } from "@tanstack/react-table";

// 2. internal absolute (@/*)
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/table/data-table";

// 3. relative (เฉพาะในโมดูลเดียวกัน)
import { columns } from "./columns";
```

### เพิ่มเมนู Sidebar

ต้องแก้ **สองไฟล์** เสมอ:

1. `src/components/layout/nav-config.ts` — breadcrumb + search
2. `src/components/layout/minimals-nav-config.ts` — sidebar render จากไฟล์นี้เท่านั้น

> แก้แค่ `nav-config.ts` เมนูจะไม่ขึ้นใน sidebar จริง

### Pattern หลัก

- **Data flow**: `lib/mock/*` -> hook -> page container spread props -> child render
- **ไม่มี global store** (ไม่มี Redux/Zustand) — React hook + context เท่านั้น
- **Design token**: อยู่ใน `src/app/globals.css` เป็น `@theme {}` ที่เดียว — ห้ามทำซ้ำค่าดิบ
- **Charts**: ใช้ wrapper ใน `src/components/charts/*` เสมอ — ห้ามเรียก recharts โดยตรงในหน้า
- **`cn()`**: ใช้รวม className ทุกที่ (`clsx` + `tailwind-merge`)

### เพิ่ม Domain API (swap mock -> real)

```ts
// src/lib/api/<domain>.ts
const ENDPOINT: string | null = null; // null = ใช้ mock, ใส่ path = ใช้ real fetch

export async function getTransactions() {
  if (!ENDPOINT) return import("@/lib/mock/transactions").then(m => m.TRANSACTIONS);
  return adminFetch(ENDPOINT).then(r => r.json());
}
```

---

## Workflow ทีม

### Git Branches

```
main      — production release
develop   — integration branch (ต้องผ่าน PR เสมอ)
feat/*    — feature branches
fix/*     — bug fix branches
```

### กฎการ commit/push

- ห้าม commit ตรงเข้า `main` หรือ `develop` — ต้องผ่าน PR + review
- ห้าม force push
- PR merge ได้ต่อเมื่อ CI ผ่าน (test + lint)
- ห้าม commit `.env.local`, `.env.*` (อยู่ใน `.gitignore` แล้ว)

### การสร้าง Feature ใหม่ (Spec-Driven)

โปรเจกต์ใช้ **spec-driven development** — spec มาก่อนโค้ดเสมอ

```
/spec-new <ชื่อฟีเจอร์>    — เริ่ม spec ใหม่, ถามคำถาม
/spec-requirements         — สร้าง requirements.md (EARS notation)
/spec-design               — สร้าง design.md
/spec-tasks                — สร้าง tasks.md
/spec-implement <task-id>  — implement ตาม task
```

Spec artifacts อยู่ที่ `.claude/specs/<feature-name>/`

### CI / Hooks

- **Pre-commit hook** (`.githooks/`): typecheck + lint — รันอัตโนมัติก่อน commit
- **CI** (`.github/workflows/`): test + lint — required check ก่อน merge
- **Claude hooks** (`.claude/hooks/`): guard เพิ่มเติมระหว่าง dev (secret scan, destructive op check)

ถ้า hook block แล้วไม่แน่ใจว่าส่วนไหนของคำสั่งรันแล้ว ให้ตรวจ `git status` และ filesystem ก่อนรันซ้ำ

---

## ลิงก์ที่เกี่ยวข้อง

- [PROJECT_CONTEXT.md](.ai/shared/PROJECT_CONTEXT.md) — บริบทผลิตภัณฑ์
- [ARCHITECTURE.md](.ai/shared/ARCHITECTURE.md) — โครงสร้างโปรเจกต์
- [CODING_STANDARDS.md](.ai/shared/CODING_STANDARDS.md) — มาตรฐานการเขียนโค้ด
- [LESSONS.md](.ai/shared/LESSONS.md) — บทเรียนจาก retrospective
- [Stack: Next.js](.ai/shared/stack/nextjs.md) — idiom เฉพาะ stack นี้
