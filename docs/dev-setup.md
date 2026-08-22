# คู่มือการรัน POL Admin

คู่มือหลักสำหรับติดตั้งและรัน `pol-admin` แบบ frontend-only, ต่อ `pol-core`, production local และ Docker รวมถึงขั้นตรวจสอบและแก้ปัญหาที่พบบ่อย.

## 1. ภาพรวมระบบ

Repository นี้มี Next.js Admin app ที่ root และ npm package workspaces สองชุด.

| ส่วน | Location หรือ repo | Development | หน้าที่ |
|---|---|---|---|
| Admin frontend | repository root | `https://localhost:3001` | Admin console |
| Shared UI | `@pol/ui` | ไม่มี server | UI primitives ที่ใช้ร่วมกัน |
| Shared logic | `@pol/shared` | ไม่มี server | Pure types, validation และ utilities |
| Backend API | `pol-core` | `https://localhost:5001` | REST API, BFF session และ OIDC |
| SQL Server หลัก | `pol-core` Docker Compose | `localhost:11433` | Database `VCentralPay` |
| Motor simulator DB | `pol-core` Docker Compose | `localhost:11434` | Database `hippodb` |
| Non-Motor simulator DB | `pol-core` Docker Compose | `localhost:11435` | Database `mammothdb` |
| Seq | `pol-core` Docker Compose | `http://localhost:5341` | Local structured logs |

Application/package topology กำหนดแบบ explicit:

- root `pol-admin` application
- `packages/ui`
- `packages/shared`

`pol-admin` เป็น canonical repository สำหรับ Admin frontend. Merchant frontend อยู่ที่
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git) และไม่มี source synchronization
ระหว่างสอง repository. `/merchant/*` และ `/producer/*` ที่ยังอยู่ใน Admin เป็น Merchant-management
และ producer-domain capabilities ของพนักงานภายใน ไม่ใช่ Merchant app.

## 2. เลือกโหมดการรัน

| ต้องการ | Backend/DB | Frontend environment | คำสั่งหลัก |
|---|---:|---|---|
| ดู UI และ mock data | ไม่ต้อง | `NEXT_PUBLIC_SKIP_AUTH=true` | `npm run dev` |
| ทดสอบ auth/API จริง | ต้องรัน | API origin = `https://localhost:5001` | รัน `pol-core` แล้วรัน Admin |
| ตรวจ production bundle | ไม่จำเป็นสำหรับ route smoke | Build Admin | `npm run build` |
| ทดสอบ Admin container | ไม่จำเป็นสำหรับ root route | Same-origin production contract | `docker build` แล้ว `docker run` |

ถ้าเริ่มครั้งแรกและต้องการเห็นหน้าจอเร็วสุด ให้เริ่มจาก frontend-only. ถ้าต้องทดสอบ login,
session, CSRF หรือ API จริง ต้องใช้ full stack.

## 3. Prerequisites

### Frontend

| เครื่องมือ | เวอร์ชันที่ใช้จริง | ตรวจสอบ |
|---|---|---|
| Node.js | `>=22.19.0`; แนะนำ `22.19.0` ตาม CI/Docker | `node -v` |
| npm | `11.12.1` | `npm -v` |
| Git | 2.x | `git --version` |

Root `package.json`, CI และ Docker ใช้ Node `>=22.19.0`; version นี้รองรับ native TLS CA API
ที่ development proxy ใช้และรองรับ npm `11.12.1`.

ตรวจ version ก่อนติดตั้ง:

```bash
node -v
npm -v
```

### Full stack

| เครื่องมือ | เวอร์ชัน | ใช้ทำอะไร |
|---|---|---|
| .NET SDK | 10.x | รัน `pol-core` |
| Docker Desktop + Compose | เวอร์ชันที่รองรับ Compose v2 | SQL Server และ Seq |
| `dotnet-ef` | ตาม tool manifest ของ `pol-core` | Apply migration |

ตรวจ version:

```bash
dotnet --version
docker --version
docker compose version
```

## 4. Clone และติดตั้งครั้งแรก

แนะนำให้วางสอง repository เป็น sibling directories:

```text
Project/
  pol-admin/
  pol-core/
```

Clone และติดตั้ง frontend:

```bash
git clone https://github.com/metrodiesign/pol-admin.git
git clone https://github.com/metrodiesign/pol-core.git
cd pol-admin
npm ci
```

ใช้ `npm ci` จาก repository root เท่านั้น เพื่อให้ dependency graph ตรง `package-lock.json` และติดตั้ง root app พร้อม package workspacesครบ.

เปิด local enforcement floor ครั้งเดียวต่อ clone:

```bash
./.ai/bin/install.sh
git config core.hooksPath
```

ผลบรรทัดสุดท้ายควรเป็น `.githooks`.

## 5. ตั้งค่า Frontend Environment

Root Admin app โหลด environment จาก repository root:

- Admin อ่าน `.env.local`.
- `.env.local` อยู่ที่ root, ถูก ignore และห้าม tooling ย้าย คัดลอก หรือ overwrite อัตโนมัติ.
- `.env.local` ถูก ignore; commit ได้เฉพาะ `.env.example`.

### โหมดต่อ Backend จริง

สร้าง root local file จาก template:

```bash
cp .env.example .env.local
```

ค่ามาตรฐาน local development:

```env
ADMIN_API_ORIGIN=https://localhost:5001
NEXT_PUBLIC_API_ORIGIN=https://localhost:5001
```

### โหมด Frontend-only

ใช้ `.env.local` ที่มีเฉพาะ:

```env
NEXT_PUBLIC_SKIP_AUTH=true
```

โหมดนี้ใช้ได้เฉพาะ development. Production code บังคับ `NODE_ENV === "production"` ให้ bypass ใช้งานไม่ได้ แม้ตัวแปรหลุดเข้า environment.

### ความหมายของตัวแปร

| ตัวแปร | อ่านที่ไหน | ผล |
|---|---|---|
| `ADMIN_API_ORIGIN` | Next.js server/config | เปิด rewrites ไป BFF สำหรับ `/admin/*`, `/producer/*`, `/api/*` |
| `NEXT_PUBLIC_API_ORIGIN` | Browser bundle | กำหนด origin สำหรับ full-page OIDC login navigation |
| `NEXT_PUBLIC_SKIP_AUTH` | Browser bundle | ข้าม `getMe` เฉพาะ development เพื่อดู mock UI |

หลังแก้ `.env.local` ต้อง restart dev server. ตัวแปร `NEXT_PUBLIC_*` ถูก inline ตอน build; เปลี่ยนเฉพาะ runtime environment หลัง build แล้วไม่มีผลต่อ browser bundle.

ห้ามใส่ credential, token, client secret หรือ connection string ใน frontend env. Frontend ใช้ BFF cookie และไม่ถือ OAuth token.

## 6. รัน Frontend-only

รันจาก `pol-admin` root:

```bash
npm run dev
```

เปิด:

- Admin: `https://localhost:3001`

ครั้งแรก Next.js สร้าง certificate ใต้ `certificates/` และอาจเปิด system trust prompt.

Root commands เรียก application โดยตรง:

| Command | พฤติกรรม |
|---|---|
| `npm run dev` | `next dev` แบบ HTTPS port `3001` |
| `npm run dev:clean` | ล้าง root `.next` และ `tsconfig.tsbuildinfo` แล้วรัน `dev` |
| `npm run build` | `next build` ที่ root |
| `npm run start` | `next start` แบบ HTTP port `3001` |

## 7. รัน Full Stack

รายละเอียด backend เป็นเจ้าของโดย [pol-core local development runbook](https://github.com/metrodiesign/pol-core/blob/develop/docs/runbooks/local-dev-run.md). ขั้นตอนด้านล่างเป็น integration path ที่ frontend นี้ต้องใช้.

### ตั้งค่า Backend ครั้งแรก

จาก `pol-core` root:

```bash
cp .env.example .env
dotnet tool restore
```

แทนค่า `REPLACE_WITH_*` ใน `.env` ตาม runbook ของ `pol-core`. ใช้ local-only values และห้าม commit `.env`.

Trust ASP.NET Core HTTPS certificate:

```bash
dotnet dev-certs https --trust
```

ยก dependencies และรอ SQL Server พร้อม:

```bash
docker compose up -d
docker compose ps -a
```

ผลที่ต้องเห็น:

- `pol-db`, `pol-hippo-db`, `pol-mammoth-db` และ `pol-seq` เป็น healthy.
- `pol-db-init` จบด้วย exit code `0`.
- Port `11433`, `11434`, `11435` และ loopback `5341` ถูก bind.

Apply migrations เมื่อเป็น database ใหม่หรือมี migration เพิ่ม:

```bash
set -a
source .env
set +a
dotnet ef database update --context PolDbContext \
  --project src/BuildingBlocks/BuildingBlocks.Infrastructure \
  --startup-project src/Hosts/Api
```

### รันสาม Terminal

Terminal 1 รัน backend dependencies:

```bash
cd pol-core
docker compose up -d
docker compose ps -a
```

Terminal 2 รัน API:

```bash
cd pol-core
set -a
source .env
set +a
dotnet watch --project src/Hosts/Api/Api.csproj run
```

Terminal 3 รัน Admin:

```bash
cd pol-admin
npm run dev
```

Config หรือ DI change ใน `pol-core` ต้อง full restart; hot reload อาจไม่โหลดค่าใหม่.

### ตรวจว่า Full Stack พร้อม

ตรวจ backend process และ dependencies:

```bash
curl -k -i https://localhost:5001/health/live
curl -k -i https://localhost:5001/health/ready
```

ผลที่ต้องการคือ HTTP `200` ทั้งคู่. `/health/live` ตรวจ process; `/health/ready` ตรวจ readiness รวม dependencies.

ตรวจ frontend:

```bash
curl -k -I https://localhost:3001/
```

Root ของ Admin ควรตอบ `307` หรือ `308` ไป `/dashboard`.

ตรวจ route contract:

```bash
curl -k -o /dev/null -s -w '%{http_code}\n' https://localhost:3001/admin/user/list
curl -k -o /dev/null -s -w '%{http_code}\n' https://localhost:3001/register
```

ค่าที่คาด: Admin user route ไม่ใช่ `404` และ Admin register เป็น `404`.

HTTP status ของ protected page ไม่พิสูจน์ authorization. Auth guard ทำงานฝั่ง client และ backend ต้องบังคับ session/permission ทุก API endpoint.

## 8. HTTPS และ Certificate

Development มี certificate สองชุด:

| Certificate | ใช้กับ | วิธี trust |
|---|---|---|
| ASP.NET Core dev certificate | `https://localhost:5001` | `dotnet dev-certs https --trust` |
| Next.js generated certificate | `https://localhost:3001` | ยืนยัน system prompt ตอนรัน app ครั้งแรก |

หลัง trust .NET certificate บน macOS ให้ export เฉพาะ public certificate จาก keychain ไป path
ที่ `npm run dev` ใช้เป็น extra CA:

```bash
mkdir -p certificates
security find-certificate -p -c localhost | \
  openssl x509 -out certificates/pol-core-localhost.crt
npm run dev
```

`certificates/` ถูก ignore และห้าม commit. Dev command ต้องใช้ Node `>=22.19.0` ตาม `package.json`
เพื่อเพิ่ม certificate เข้า default CA list โดยไม่แทนที่ public roots เดิม. หากใช้ public CA file
คนละ path ให้ override ตอน start:

```bash
ADMIN_API_CA_CERTIFICATE=/absolute/path/to/pol-core-localhost.crt npm run dev
```

ใช้ `curl -k` เฉพาะ local diagnostic. ห้ามปิด TLS verification ใน source หรือ production.

Production local ของ Next.js ใช้ HTTP บน port `3001`; TLS production ต้อง terminate ที่ reverse proxy.

## 9. Auth และ Producer-domain Flow

ระบบใช้ server-side OIDC BFF:

- Frontend ไม่ถือ ID token, access token หรือ Bearer token.
- Backend set session เป็น secure httpOnly cookie.
- `getMe()` เรียก `/admin/me` ผ่าน same-origin rewrite.
- Mutation แนบ `X-CSRF-Token` จาก cookie `adm_csrf`.
- `401` ทำให้ client กลับ `/login`.

Admin Google login เริ่มที่:

```text
GET https://localhost:5001/api/v1/admins/auth/google/login?returnTo=/dashboard
```

Microsoft เปลี่ยน provider segment จาก `google` เป็น `microsoft`.

Backend development config ต้องมี:

| ค่า | Development origin |
|---|---|
| Admin SPA base URL | `https://localhost:3001` |
| Admin CORS origin | `https://localhost:3001` |

Admin `/register` ต้องตอบ `404`. Rewrite `/producer/*` ยังคงอยู่เพื่อรองรับ producer-domain API
ที่ Admin เรียกใช้. Merchant-facing auth และ registration เป็นเจ้าของโดย
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

## 10. คำสั่ง Frontend

| งาน | Root command | ผล |
|---|---|---|
| Admin dev | `npm run dev` | HTTPS `3001` |
| Admin clean dev | `npm run dev:clean` | ล้างเฉพาะ Admin cache แล้วรัน dev |
| Admin build | `npm run build` | Output `.next` |
| Admin production local | `npm run start` | HTTP `3001` |
| Tests | `npm test` | Verifier unit tests, root Vitest และ `packages/shared` tests |
| Lint | `npm run lint` | Root app และ retained packages |
| Typecheck | `npm run typecheck` | Root app และ retained packages |
| Route/boundary verify | `npm run verify:workspaces` | Topology, Admin routes, import boundary, test policy |
| Production route smoke | `npm run smoke:routes` | Start Admin production server แล้ว probe routes |

ดู raw dev log เมื่อ local RTK filter ซ่อน output:

```bash
rtk proxy npm run dev
```

## 11. Build และ Verification ก่อนส่งงาน

รันจาก `pol-admin` root ตามลำดับ:

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:workspaces
npm run smoke:routes
```

เงื่อนไขสำคัญ:

- `verify:workspaces` ต้องรันหลัง Admin build เพราะอ่าน `.next/server/app-paths-manifest.json`.
- `smoke:routes` ต้องใช้ port `3001` ที่ว่าง.
- Smoke script หยุดเฉพาะ child processes ที่ตัวเองสร้าง; ไม่ปิด process ที่ครอง port อยู่ก่อน.
- Admin route contract ต้องคง required routes และ `/register` ต้องเป็น `404`.

ตรวจ Tailwind utility ที่เพิ่งเพิ่มจาก production CSS จริง:

```bash
grep -r "orange" .next/static/chunks/*.css | head -5
```

Build เขียวไม่ยืนยันว่า unknown Tailwind utility ถูก generate.

## 12. Production Local

Build ก่อน start:

```bash
npm run build
```

รัน:

```bash
npm run start
```

URLs:

- Admin: `http://localhost:3001`

`next start` ไม่ใช้ development HTTPS certificate. ห้ามใช้ production local เป็นข้อพิสูจน์ว่า ingress TLS, OAuth callback หรือ cookie policy บน environment จริงถูกต้อง.

## 13. Docker

Root image รองรับ Admin เท่านั้น:

```bash
docker build -t pol-admin:local .
docker run --rm --name pol-admin-local -p 3001:3001 pol-admin:local
```

เปิด `http://localhost:3001` แล้วตรวจ health จาก terminal อื่น:

```bash
docker inspect --format '{{.State.Health.Status}}' pol-admin-local
```

Contract ของ image:

| ค่า | Contract |
|---|---|
| Runtime user | `nextjs` |
| Internal port | `3001` |
| Protocol | HTTP |
| Command | `node server.js` |
| Application | Admin เท่านั้น |
| Next rewrites | ว่างใน image ปัจจุบัน |

Image ตั้งใจ build โดยไม่ bake `NEXT_PUBLIC_API_ORIGIN` และไม่ตั้ง `ADMIN_API_ORIGIN`. Production ต้องใช้ reverse proxy ให้ SPA และ API เป็น same-origin.

Root image เป็น Admin artifact เท่านั้น. Merchant deployment ownership อยู่ที่
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

## 14. หยุดระบบอย่างปลอดภัย

หยุด Next.js หรือ `dotnet watch` ด้วย `Ctrl+C` ใน terminal เจ้าของ process.

หยุด backend dependencies โดยไม่ลบ data volume:

```bash
cd pol-core
docker compose down
```

อย่าใช้ `docker compose down -v` เป็นคำสั่งประจำ เพราะลบ local database volume. ใช้เฉพาะเมื่อยืนยันว่าจะ reset local data และทำตาม `pol-core` runbook.

ตรวจ process ที่ครอง port ก่อนหยุด:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

ถ้าต้องหยุด process นอก terminal ให้ตรวจ PID/command/owner แล้วส่ง `SIGTERM` ไป PID ที่ยืนยันแล้ว:

```bash
kill <PID>
```

ใช้ `SIGKILL` เฉพาะ process ไม่ตอบ `SIGTERM` และยืนยัน PID ซ้ำแล้ว.

## 15. Troubleshooting

### `npm` รันไม่ได้บน Node 20 รุ่นต้น

อาการ: npm แจ้ง unsupported engine หรือไม่เริ่มทำงาน.

ตรวจ:

```bash
node -v
npm -v
```

แก้: ใช้ Node `22.19.0` ขึ้นไป แล้วติดตั้ง npm `11.12.1`.

### Port ถูกใช้งานแล้ว

อาการ: `EADDRINUSE`, smoke แจ้ง occupied port หรือ server ไม่ขึ้น.

ตรวจ owner:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

หยุดจาก terminal เจ้าของ process. อย่าใช้ pipeline ที่ kill ทุก PID บน port โดยไม่ตรวจ owner.

### Backend health ไม่ผ่าน

ตรวจ live และ ready แยกกัน:

```bash
curl -k -i https://localhost:5001/health/live
curl -k -i https://localhost:5001/health/ready
docker compose ps
```

- Live fail: API process/certificate/port มีปัญหา.
- Live pass แต่ ready fail: ตรวจ SQL, migration, vault หรือ dependency health จาก backend log.

### Frontend proxy ต่อ Backend ไม่ได้

ตรวจตามลำดับ:

1. `pol-core` ตอบ `https://localhost:5001/health/live`.
2. Root `.env.local` ตั้ง `ADMIN_API_ORIGIN` และ `NEXT_PUBLIC_API_ORIGIN` เป็น `https://localhost:5001`.
3. Trust ASP.NET Core certificate แล้ว.
4. Restart frontend หลังแก้ env.
5. ถ้ายังมี certificate error ให้ export public certificate ไป
   `certificates/pol-core-localhost.crt` ตามหัวข้อ 8 แล้ว restart frontend.

### แก้ Root `.env.local` แล้วไม่มีผล

สาเหตุที่พบบ่อย: dev server ยังใช้ process เดิม หรือแก้ตัวแปร `NEXT_PUBLIC_*` หลัง process/build เริ่มแล้ว.

แก้: ยืนยันว่าไฟล์อยู่ที่ root `.env.local`, หยุด process เจ้าของ port `3001` จาก terminal เดิม แล้วรันใหม่.

### ทุก route ตอบ 404 แต่ process ยังอยู่

อาจเป็น Turbopack zombie. ดู response body ก่อน:

```bash
curl -k -i https://localhost:3001/
```

ถ้า root และทุก route คืน Next HTML 404 ทั้งที่ route มีจริง ให้หยุด process จาก terminal เดิม แล้วรันใหม่:

```bash
npm run dev
```

### Login loop หรือ callback กลับผิด host

ตรวจ:

- Admin SPA base URL = `https://localhost:3001`.
- OAuth redirect URI ใช้ backend `https://localhost:5001/api/v1/.../callback` ตรง provider.
- Return path อยู่ใน backend allowlist.
- Cookie เป็น Secure และ browser ไม่ block ตาม SameSite policy.
- แก้ backend config แล้ว full restart API.

### Admin `/register` ตอบ 404

เป็น behavior ที่ถูกต้อง. Merchant registration อยู่ใน canonical
[pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

### `verify:workspaces` หา manifest ไม่เจอ

Build Admin ก่อน:

```bash
npm run build
npm run verify:workspaces
```

### `smoke:routes` fail ตอน start

ตรวจว่า build outputs มีและ ports ว่าง:

```bash
test -f .next/BUILD_ID
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

Smoke script จะไม่ปิด process ที่มีอยู่ก่อน. หยุด owner เองแล้วรันใหม่.

## 16. Staging และ Production

ก่อน deploy ต้องผ่าน staging และมี rollback plan.

### Runtime contract

| App | Internal protocol/port | TLS | Image status |
|---|---|---|---|
| Admin | HTTP `3001` | Reverse proxy | Root Docker image รองรับ |

### Reverse proxy

Production build ปัจจุบันไม่มี Next rewrites. Reverse proxy ต้องเสิร์ฟ frontend และ BFF บน browser origin เดียวกัน.

| Browser path | Backend destination |
|---|---|
| `/admin/:path*` เฉพาะ API short paths | `/api/v1/admins/:path*` |
| `/producer/:path*` | `/api/v1/merchants/:path*` |
| `/api/:path*` | `/api/:path*` |

ระวัง `/admin/*` ใช้ทั้ง UI routes และ shortened API paths:

- UI เช่น `/admin/user/list` ต้องไป Admin Next server.
- API เช่น `/admin/me`, `/admin/auth/*`, `/admin/roles`, `/admin/permissions` ต้องไป BFF.
- `/producer/*` และ `/api/*` ที่ frontend เรียกต้องไป BFF.

ห้าม route `/admin/*` ทั้ง prefix ไป backend เพราะจะกลืน UI routes. ทดสอบ ingress ด้วย route จริงทั้งฝั่ง page และ API.

### Auth และ Security gate

ทดสอบบน staging ด้วย backend/IdP จริง:

1. Anonymous API ตอบ `401` หรือ `403` ตาม contract.
2. Admin login/callback/logout จบที่ Admin host.
3. Cookie `Secure`, `HttpOnly`, `SameSite`, domain และ path ถูกต้อง.
4. CSRF ผ่านเฉพาะ request ที่มี cookie/header คู่ถูกต้อง.
5. Admin permission ปฏิเสธ mutation ที่ role ไม่อนุญาต.

Frontend route availability ไม่ใช่หลักฐาน authorization. ต้องตรวจ status และผลข้อมูลจาก backend จริง.

### Admin deployment checklist

1. Build immutable image จาก reviewed commit.
2. ตั้ง Service target port และ health probe เป็น `3001`.
3. ตั้ง reverse proxy/TLS และ path routing.
4. ตั้ง backend Admin origin, callback และ return URL allowlist.
5. Smoke `/`, `/dashboard`, `/admin/user/list`, login, logout และ API permission บน staging.
6. เก็บ image tag เดิมและ proxy config เดิมสำหรับ rollback.

### Merchant ownership boundary

Merchant frontend ไม่มี build, image, service หรือ deployment definition ใน `pol-admin`.
ดู source และ runbook ที่ [pol-merchant](https://github.com/metrodiesign/pol-merchant.git).

### Rollback

Frontend change ไม่มี database migration. Rollback หลักคือ image tag, Service/port และ reverse proxy config.

ข้อมูลที่ backend รับแล้วไม่ถูกย้อนด้วย frontend rollback. ประเมินผลกระทบข้อมูลก่อน rollback ทุกครั้ง.

## 17. แหล่งอ้างอิง

- [README](../README.md) — quick start และ project overview
- [Admin env template](../.env.example) — Admin development environment
- [Dockerfile](../Dockerfile) — Admin production image contract
- [Next.js stack profile](../.ai/shared/stack/nextjs.md) — architecture และ runtime conventions
- [pol-merchant](https://github.com/metrodiesign/pol-merchant.git) — canonical Merchant frontend repository
- [pol-core local development runbook](https://github.com/metrodiesign/pol-core/blob/develop/docs/runbooks/local-dev-run.md) — backend setup source of truth
