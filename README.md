# pol-admin

Frontend monorepo สำหรับทีม Payment Operations. มี Admin app และ Merchant app ที่ clone
route, UI, navigation และ Admin auth/API จาก Admin ชั่วคราว เพื่อคัด Merchant surface ภายหลัง.

| App | Workspace | Development | Production local | Route เพิ่ม |
|-----|-----------|-------------|------------------|------------|
| Admin | `@pol/admin` | `https://localhost:3001` | `http://localhost:3001` | ไม่มี `/register` |
| Merchant | `@pol/merchant` | `https://localhost:3002` | `http://localhost:3002` | `/register` |

คู่มือรัน frontend-only, full stack, Docker, troubleshooting และ production checklist อยู่ที่
[docs/dev-setup.md](docs/dev-setup.md).

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
| Framework | Next.js App Router | 16.3.1 |
| Runtime | React | 19.2.4 |
| ภาษา | TypeScript | ^5 |
| Styling | Tailwind CSS v4 (CSS-first, ไม่มี config file) | ^4 |
| UI Primitives | shadcn style `base-nova` บน `@base-ui/react` (ไม่ใช่ Radix) | ^1.5.0 |
| Icons | lucide-react | ^1.16 |
| Charts | recharts (ห่อใน `apps/*/src/components/charts/*`) | ^3.8 |
| Tables | @tanstack/react-table (ห่อใน `apps/*/src/components/table/*`) | ^8.21 |
| Test Runner | Vitest | ^4.1.9 |
| Package manager | npm workspaces | 11.12.1 |

> ยังไม่มี backend domain จริง — domain data ใช้ typed mock ใน `apps/*/src/lib/mock/*`.
> Auth เป็น server-side OIDC BFF จริงแล้ว (ดู [Authentication](#authentication)).

---

## Prerequisites

- **Node.js** `^20.17.0` หรือ `>=22.9.0`; แนะนำ 22.19.0 ตาม CI/Docker
- **npm** 11.12.1
- ถ้าต้องการต่อ backend จริง: รัน [pol-core](https://github.com/metrodiesign/pol-core) ที่ `https://localhost:5001`

ตรวจสอบเวอร์ชัน:

```bash
node -v   # ^20.17.0 หรือ >=22.9.0
npm -v    # 11.12.1
```

ใช้ Node 22.19.0 เมื่อต้องการ toolchain ตรง CI/Docker.

---

## ติดตั้งและตั้งค่าเริ่มต้น

```bash
# 1. clone repo
git clone git@github.com:metrodiesign/pol-admin.git
cd pol-admin

# 2. ติดตั้งทุก workspace จาก root lockfile
npm ci

# 3. คัดลอก env แยก app ด้วยมือ
cp apps/admin/.env.example apps/admin/.env.local
cp apps/merchant/.env.example apps/merchant/.env.local
```

อย่าย้ายหรือคัดลอก root `.env.local` อัตโนมัติ. แต่ละ app โหลด environment จาก workspace ของตัวเอง.

---

## Environment Variables

สร้าง `apps/admin/.env.local` และ `apps/merchant/.env.local` จาก template ของ app นั้น
(ห้าม commit `.env.local` เข้า git)

| ตัวแปร | ค่า dev | ค่า prod | คำอธิบาย |
|--------|---------|----------|----------|
| `ADMIN_API_ORIGIN` | `https://localhost:5001` | ว่าง (ไม่ตั้ง) | BFF origin สำหรับ rewrites `/admin/*`, `/producer/*`, `/api/*` ใน dev |
| `NEXT_PUBLIC_API_ORIGIN` | `https://localhost:5001` | build-time ตาม deployment | Origin สำหรับ full-page OIDC login navigation |
| `NEXT_PUBLIC_SKIP_AUTH` | ไม่ตั้ง | ห้ามตั้ง | ข้าม auth เฉพาะ frontend-only development |

**Dev (ต่อ backend จริง):**

```env
ADMIN_API_ORIGIN=https://localhost:5001
NEXT_PUBLIC_API_ORIGIN=https://localhost:5001
```

**Dev (mock-only, ไม่ต้อง backend):**

```env
NEXT_PUBLIC_SKIP_AUTH=true
# ไม่ตั้ง ADMIN_API_ORIGIN และ NEXT_PUBLIC_API_ORIGIN
```

`NEXT_PUBLIC_SKIP_AUTH` ใช้ได้เฉพาะ development; production guard บังคับปิด.

**Production:**

```env
# เว้น ADMIN_API_ORIGIN ว่าง — reverse proxy เสิร์ฟ SPA + API เป็น origin เดียวกันอยู่แล้ว
```

> ห้าม hardcode credential ทุกชนิด อ่านจาก environment variable เท่านั้น

---

## การรัน Dev Server

ใช้สอง terminal เพื่อให้ `.next` และ certificate แยกกัน:

```bash
# Terminal 1
npm run dev:admin

# Terminal 2
npm run dev:merchant
```

- Admin: [https://localhost:3001](https://localhost:3001)
- Merchant: [https://localhost:3002](https://localhost:3002)

`npm run dev` และ `npm run dev:clean` ชี้ Admin เพื่อคงคำสั่งเดิม.

ครั้งแรก Next.js จะสร้าง certificate ใต้ app-local `certificates/` และอาจขอสิทธิ์ระบบเพื่อ trust
local CA. อนุมัติ trust prompt ของระบบก่อนใช้ browser; `curl -k` ใช้ได้เฉพาะ diagnostic local.

เมื่อต่อ `pol-core` ให้รัน `dotnet dev-certs https --trust`. ถ้า Node ยังไม่อ่าน system CA ให้เพิ่ม
`NODE_OPTIONS=--use-system-ca` ตอนรัน frontend; ดูขั้นตอนเต็มใน [docs/dev-setup.md](docs/dev-setup.md#8-https-และ-certificate).

Next.js 16 ใช้ **Turbopack** เป็น default (เร็วกว่า Webpack มาก)

**ดู raw log (แนะนำ):**

```bash
rtk proxy npm run dev:admin
```

> หมายเหตุ: ถ้าใช้ `npm run dev` โดยตรงผ่าน rtk hook output จะถูก filter เป็น summary `Errors: N | Warnings: N` บดบัง log จริง — ใช้ `rtk proxy` เพื่อดู raw output

**ถ้าพบ Turbopack zombie** (server alive แต่ทุก route คืน 404):

```bash
# ดู body จาก curl ก่อน — 404 ที่มี HTML body = zombie
curl -k -i https://localhost:3001

# ตรวจ owner แล้วหยุดจาก terminal เดิม หรือส่ง SIGTERM ให้ PID ที่ยืนยันแล้ว
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill <PID>
npm run dev:admin
```

---

## Build สำหรับ Production

```bash
npm run build:admin
npm run build:merchant

# รันคนละ terminal หลัง build
npm run start:admin
npm run start:merchant
```

Production local ใช้ HTTP: Admin `http://localhost:3001`, Merchant `http://localhost:3002`.
`build` และ `start` ชี้ Admin. Production TLS ให้ reverse proxy จัดการ.

**ตรวจสอบ Tailwind utility ที่ใช้ถูก generate:**

```bash
# หลัง build — grep ใน CSS จริง ไม่ใช่ source
grep -r "orange" apps/admin/.next/static/chunks/*.css | head -5
```

> `next build` เขียว ≠ utility class ถูก generate เสมอ (unknown utility เงียบไม่ error)

---

## รันเทสต์

```bash
# รัน test suite ทั้งหมด
npm test
```

App tests อยู่ที่ `apps/*/src/**/*.test.ts`; shared tests อยู่ใน package ที่รับผิดชอบ.
Environment = `node` (ไม่ใช่ jsdom)

**Typecheck:**

```bash
npm run typecheck
```

**Lint:**

```bash
npm run lint
```

---

## โครงสร้างโปรเจกต์

```
apps/
  admin/                # @pol/admin; route tree, auth/API, config, public, .next แยก
  merchant/             # @pol/merchant; clone parity + /register
packages/
  ui/                   # @pol/ui; shared UI primitives/styles ที่ใช้จริงร่วมกัน
  shared/               # @pol/shared; pure types/validation/utilities
scripts/                # route parity, import boundary และ runtime smoke checks
```

ห้าม app import source จากอีก app และห้าม package import app. Route/auth abstraction ยังเป็น app-local
โดยเจตนา เพื่อคัด Merchant routes ภายหลังได้ง่าย.

---

## Authentication

ระบบใช้ **server-side OIDC BFF** — FE ไม่ถือ token เลย

- Session = **httpOnly cookie** ที่ backend set (ไม่มี GIS/id-token/Bearer ใน FE)
- Guard = client-side: `auth-provider.tsx` (call `getMe` on mount) + `auth-guard.tsx` (loading/anon -> redirect `/login`)
- Public routes (ไม่ผ่าน MinimalsLayout): `/login`, `/logout`, `/login-error`; Merchant เพิ่ม `/register`

**Flow auth dev (ต้อง backend):**

```
Browser -> Admin HTTPS :3001 หรือ Merchant HTTPS :3002
          -> /admin/* rewrite -> pol-core HTTPS :5001
             <- httpOnly session cookie
Browser ถือ session ผ่าน cookie (same-origin)
```

**CSRF:** `adminFetch` แนบ header `X-CSRF-Token` = cookie `adm_csrf` เฉพาะ mutation (POST/PUT/PATCH/DELETE)

**Error redirect:** backend deny -> `/login-error?reason=<label>` (FE map เป็นข้อความใน `login-error/page.tsx`)

Merchant ใช้ `AdminMe`, `getMe`, Admin session/API และ navigation เหมือน Admin ในรอบนี้.
Development backend ต้องตั้ง Admin/Merchant `SpaBaseUrl` เป็น `https://localhost:3001` และ
`https://localhost:3002`. ก่อน deploy staging/production ต้องตั้ง frontend origins, OAuth callbacks
และ reverse proxy ให้ SPA กับ `/admin/*`, `/producer/*`, `/api/*` เป็น same-origin.

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

1. `apps/<app>/src/components/layout/nav-config.ts` — breadcrumb + search
2. `apps/<app>/src/components/layout/minimals-nav-config.ts` — sidebar render จากไฟล์นี้เท่านั้น

> แก้แค่ `nav-config.ts` เมนูจะไม่ขึ้นใน sidebar จริง

### Pattern หลัก

- **Data flow**: app-local `lib/mock/*` -> hook -> page container spread props -> child render
- **ไม่มี global store** (ไม่มี Redux/Zustand) — React hook + context เท่านั้น
- **Design token**: อยู่ใน `apps/<app>/src/app/globals.css` เป็น `@theme {}` — shared UI ถูก scan ผ่าน `@source`
- **Charts**: ใช้ wrapper ใน `apps/<app>/src/components/charts/*` เสมอ — ห้ามเรียก recharts โดยตรงในหน้า
- **`cn()`**: ใช้รวม className ทุกที่ (`clsx` + `tailwind-merge`)

### เพิ่ม Domain API (swap mock -> real)

```ts
// apps/<app>/src/lib/api/<domain>.ts
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
- PR merge ได้ต่อเมื่อ CI ผ่านทุก application และ framework guard checks
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

- **Pre-commit hook** (`.githooks/`): staged-change secret scan + task Evidence gate
- **CI** (`.github/workflows/`): audit + lint + typecheck + tests + builds + parity/smoke — required check ก่อน merge
- **Agent hooks** (`.claude/`, `.codex/`, `.opencode/`): guard เพิ่มเติมระหว่าง session ตาม harness

ถ้า hook block แล้วไม่แน่ใจว่าส่วนไหนของคำสั่งรันแล้ว ให้ตรวจ `git status` และ filesystem ก่อนรันซ้ำ

---

## ลิงก์ที่เกี่ยวข้อง

- [PROJECT_CONTEXT.md](.ai/shared/PROJECT_CONTEXT.md) — บริบทผลิตภัณฑ์
- [ARCHITECTURE.md](.ai/shared/ARCHITECTURE.md) — โครงสร้างโปรเจกต์
- [CODING_STANDARDS.md](.ai/shared/CODING_STANDARDS.md) — มาตรฐานการเขียนโค้ด
- [LESSONS.md](.ai/shared/LESSONS.md) — บทเรียนจาก retrospective
- [Stack: Next.js](.ai/shared/stack/nextjs.md) — idiom เฉพาะ stack นี้
