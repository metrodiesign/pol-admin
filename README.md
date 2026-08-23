# pol-admin

Canonical repository สำหรับ POL Admin frontend ของทีม Payment Operations. Runtime ใน repo นี้มี
Admin app เดียว; Merchant frontend อยู่ที่ [pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

| App | Location | Development | Production local |
|-----|-----------|-------------|------------------|
| Admin | repository root | `https://localhost:3001` | `http://localhost:3001` |

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
| Charts | recharts (ห่อใน `src/components/charts/*`) | ^3.8 |
| Tables | @tanstack/react-table (ห่อใน `src/components/table/*`) | ^8.21 |
| Test Runner | Vitest | ^4.1.9 |
| Package manager | npm workspaces | 11.12.1 |

> ยังไม่มี backend domain จริง — domain data ใช้ typed mock ใน `src/lib/mock/*`.
> Auth เป็น server-side OIDC BFF จริงแล้ว (ดู [Authentication](#authentication)).

---

## Prerequisites

- **Node.js** `>=22.19.0` ตาม CI/Docker และ native TLS CA API ของ dev proxy
- **npm** 11.12.1
- ถ้าต้องการต่อ backend จริง: รัน [pol-core](https://github.com/metrodiesign/pol-core) ที่ `https://localhost:5001`

ตรวจสอบเวอร์ชัน:

```bash
node -v   # >=22.19.0
npm -v    # 11.12.1
```

ใช้ Node 22.19.0 เมื่อต้องการ toolchain ตรง CI/Docker.

---

## ติดตั้งและตั้งค่าเริ่มต้น

```bash
# 1. clone repo
git clone git@github.com:metrodiesign/pol-admin.git
cd pol-admin

# 2. ติดตั้ง root app และ retained package workspaces จาก root lockfile
npm ci

# 3. คัดลอก Admin env ด้วยมือ
cp .env.example .env.local
```

อย่าย้ายหรือคัดลอก root `.env.local` อัตโนมัติ. Root Admin app โหลด environment จากไฟล์นี้โดยตรง.

---

## Environment Variables

สร้าง `.env.local` จาก template ของ Admin (ห้าม commit `.env.local` เข้า git).

| ตัวแปร | ค่า dev | ค่า prod | คำอธิบาย |
|--------|---------|----------|----------|
| `ADMIN_API_ORIGIN` | `https://localhost:5001` | ว่าง (ไม่ตั้ง) | BFF origin สำหรับ rewrites `/admin/*`, `/producer/*`, `/api/*` ใน dev |
| `NEXT_PUBLIC_API_ORIGIN` | `https://localhost:5001` | build-time ตาม deployment | Origin สำหรับ full-page OIDC login navigation |

**Dev (ต่อ backend จริง):**

```env
ADMIN_API_ORIGIN=https://localhost:5001
NEXT_PUBLIC_API_ORIGIN=https://localhost:5001
```

**Production:**

```env
# เว้น ADMIN_API_ORIGIN ว่าง — reverse proxy เสิร์ฟ SPA + API เป็น origin เดียวกันอยู่แล้ว
```

> ห้าม hardcode credential ทุกชนิด อ่านจาก environment variable เท่านั้น

---

## การรัน Dev Server

รันจาก repository root:

```bash
npm run dev
```

- Admin: [https://localhost:3001](https://localhost:3001)

`npm run dev` เรียก Next.js ที่ root โดยตรง; `npm run dev:clean` ล้างเฉพาะ root `.next` กับ
`tsconfig.tsbuildinfo` แล้วเรียก `dev`.

ครั้งแรก Next.js จะสร้าง certificate ใต้ `certificates/` และอาจขอสิทธิ์ระบบเพื่อ trust
local CA. อนุมัติ trust prompt ของระบบก่อนใช้ browser; `curl -k` ใช้ได้เฉพาะ diagnostic local.

เมื่อต่อ `pol-core` ให้รัน `dotnet dev-certs https --trust` แล้ว export เฉพาะ public certificate
ไป `certificates/pol-core-localhost.crt`; `npm run dev` เพิ่มไฟล์นี้เข้า Node default CA list
ก่อน Next proxy เริ่มทำงาน. ดูคำสั่งใน [docs/dev-setup.md](docs/dev-setup.md#8-https-และ-certificate).

Next.js 16 ใช้ **Turbopack** เป็น default (เร็วกว่า Webpack มาก)

**ดู raw log (แนะนำ):**

```bash
rtk proxy npm run dev
```

> หมายเหตุ: ถ้าใช้ `npm run dev` โดยตรงผ่าน rtk hook output จะถูก filter เป็น summary `Errors: N | Warnings: N` บดบัง log จริง — ใช้ `rtk proxy` เพื่อดู raw output

**ถ้าพบ Turbopack zombie** (server alive แต่ทุก route คืน 404):

```bash
# ดู body จาก curl ก่อน — 404 ที่มี HTML body = zombie
curl -k -i https://localhost:3001

# ตรวจ owner แล้วหยุดจาก terminal เดิม หรือส่ง SIGTERM ให้ PID ที่ยืนยันแล้ว
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill <PID>
npm run dev
```

---

## Build สำหรับ Production

```bash
npm run build
npm run start
```

Production local ใช้ HTTP ที่ `http://localhost:3001`. `build` และ `start` เรียก Next.js ที่ root โดยตรง.
Production TLS ให้ reverse proxy จัดการ.

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
```

Admin tests อยู่ที่ `src/**/*.test.ts`; shared tests อยู่ใน package ที่รับผิดชอบ.
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
src/                    # Admin route tree, components, auth/API, mocks และ types
public/                 # Admin-owned static assets
next.config.ts          # Admin rewrites/images/standalone config
.env.example            # Admin environment contract
.next/                  # root build output (generated)
packages/
  ui/                   # @pol/ui; shared UI primitives/styles ที่ใช้จริงร่วมกัน
  shared/               # @pol/shared; pure types/validation/utilities
scripts/                # Admin route contract, import boundary และ runtime smoke checks
```

Root package `pol-admin` เป็น application; workspace topology กำหนดแบบ explicitเฉพาะ
`packages/ui`, `packages/shared`.
ห้าม package import application source. Merchant frontend พัฒนาและ deploy จาก canonical
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git); ไม่มี source synchronization ระหว่าง repo.

เส้นทาง `/merchant/*`, component/API/mock/type ใต้ Admin และ `/producer/*` rewrite เป็นความสามารถ
Merchant-management และ producer-domain ของ Admin จึงยังอยู่ใน repo นี้.

---

## Authentication

ระบบใช้ **server-side OIDC BFF** — FE ไม่ถือ token เลย

- Session = **httpOnly cookie** ที่ backend set (ไม่มี GIS/id-token/Bearer ใน FE)
- Guard = client-side: `auth-provider.tsx` (call `getMe` on mount) + `auth-guard.tsx` (loading/anon -> redirect `/login`)
- Public routes (ไม่ผ่าน MinimalsLayout): `/login`, `/logout`, `/login-error`; `/register` ต้องตอบ `404`

**Flow auth dev (ต้อง backend):**

```
Browser -> Admin HTTPS :3001
          -> /admin/* rewrite -> pol-core HTTPS :5001
             <- httpOnly session cookie
Browser ถือ session ผ่าน cookie (same-origin)
```

**CSRF:** `adminFetch` แนบ header `X-CSRF-Token` = cookie `adm_csrf` เฉพาะ mutation (POST/PUT/PATCH/DELETE)

**Error redirect:** backend deny -> `/login-error?reason=<label>` (FE map เป็นข้อความใน `login-error/page.tsx`)

Development backend ต้องตั้ง Admin `SpaBaseUrl` เป็น `https://localhost:3001`. ก่อน deploy
staging/production ต้องตั้ง Admin origin, OAuth callback และ reverse proxy ให้ SPA กับ `/admin/*`,
`/producer/*`, `/api/*` เป็น same-origin. Merchant auth/setup ดูใน canonical
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

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

- **Data flow**: app-local `lib/mock/*` -> hook -> page container spread props -> child render
- **ไม่มี global store** (ไม่มี Redux/Zustand) — React hook + context เท่านั้น
- **Design token**: อยู่ใน `src/app/globals.css` เป็น `@theme {}` — shared UI ถูก scan ผ่าน `@source`
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
- PR merge ได้ต่อเมื่อ CI ผ่าน Admin, retained workspaces และ framework guard checks
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
- **CI** (`.github/workflows/`): audit + lint + typecheck + tests + Admin build/verify/smoke — required check ก่อน merge
- **Agent hooks** (`.claude/`, `.codex/`, `.opencode/`): guard เพิ่มเติมระหว่าง session ตาม harness

ถ้า hook block แล้วไม่แน่ใจว่าส่วนไหนของคำสั่งรันแล้ว ให้ตรวจ `git status` และ filesystem ก่อนรันซ้ำ

---

## ลิงก์ที่เกี่ยวข้อง

- [PROJECT_CONTEXT.md](.ai/shared/PROJECT_CONTEXT.md) — บริบทผลิตภัณฑ์
- [ARCHITECTURE.md](.ai/shared/ARCHITECTURE.md) — โครงสร้างโปรเจกต์
- [CODING_STANDARDS.md](.ai/shared/CODING_STANDARDS.md) — มาตรฐานการเขียนโค้ด
- [LESSONS.md](.ai/shared/LESSONS.md) — บทเรียนจาก retrospective
- [Stack: Next.js](.ai/shared/stack/nextjs.md) — idiom เฉพาะ stack นี้
- [pol-merchant](https://github.com/metrodiesign/pol-merchant.git) — canonical Merchant frontend repository
