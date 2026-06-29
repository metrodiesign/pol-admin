# คู่มือการรัน POL สำหรับทีมพัฒนา

ระบบประกอบด้วย 3 ส่วน ที่ต้องรันพร้อมกันสำหรับ local dev:

| บทบาท | Repo | Port |
|--------|------|------|
| Backend API (.NET 10) | `pol-core` | 5100 |
| Frontend Admin (Next.js 16) | `pol-admin` | 5200 |
| Database (SQL Server 2025) | Docker | 11433 |

---

## 1. Prerequisites

ติดตั้งก่อนเริ่ม:

| เครื่องมือ | เวอร์ชันขั้นต่ำ | ตรวจสอบ |
|-----------|---------------|---------|
| Node.js | 20 LTS | `node -v` |
| .NET SDK | 10.0 | `dotnet --version` |
| Docker Desktop | ล่าสุด | `docker --version` |
| Git | 2.x | `git --version` |

---

## 2. Clone Repository

```bash
# Clone ทั้งสอง repo ไว้ใน folder เดียวกัน
git clone <pol-core-url>  pol-core
git clone <pol-admin-url> pol-admin
```

---

## 3. pol-core — Backend API

### 3.1 ตั้งค่า Environment

```bash
cd pol-core
cp .env.example .env
```

แก้ไข `.env` โดยแทนที่ `REPLACE_WITH_*` ด้วยค่าจริง:

```env
# รหัสผ่าน SA สำหรับ SQL Server container (ตั้งเองได้อิสระ ขอให้แข็งแรง)
MSSQL_SA_PASSWORD=P@ssw0rd_Local_Dev!

# รหัสผ่านแต่ละ login สำหรับ runtime (ตั้งเองได้อิสระ)
POL_APP_PASSWORD=AppP@ss_Local1!
POL_ADMIN_PASSWORD=AdminP@ss_Local1!
POL_WORKER_PASSWORD=WorkerP@ss_Local1!

# Connection strings — แทนค่าจากข้างบน
ConnectionStrings__Producer=Server=localhost,11433;Database=PaymentOrchestration;User Id=pol_app;Password=AppP@ss_Local1!;Encrypt=True;TrustServerCertificate=True
ConnectionStrings__Admin=Server=localhost,11433;Database=PaymentOrchestration;User Id=pol_admin;Password=AdminP@ss_Local1!;Encrypt=True;TrustServerCertificate=True
ConnectionStrings__Worker=Server=localhost,11433;Database=PaymentOrchestration;User Id=pol_worker;Password=WorkerP@ss_Local1!;Encrypt=True;TrustServerCertificate=True

# Design-time (EF migrations) — ใช้ SA เท่านั้น
POL_DESIGN_SQL=Server=localhost,11433;Database=PaymentOrchestration;User Id=sa;Password=P@ssw0rd_Local_Dev!;Encrypt=True;TrustServerCertificate=True

# Vault key (local dev ใช้ fake key นี้ได้ — ห้ามใช้บน production)
Vault__MasterKeyBase64=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=

# Google SSO — รับจากทีม infra (ถ้ายังไม่มีให้เว้นว่าง)
Google__Audiences__admin=REPLACE_WITH_ADMIN_SPA_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

> รหัสผ่าน SQL Server ต้องมีตัวพิมพ์ใหญ่ + ตัวพิมพ์เล็ก + ตัวเลข + อักขระพิเศษ และห้ามมีชื่อ login
> ถ้า Docker container ถูกสร้างไปแล้ว และต้องการเปลี่ยน MSSQL_SA_PASSWORD ต้องลบ volume เก่าออกก่อน: `docker compose down -v`

### 3.2 เปิด Database Container

```bash
cd pol-core
docker compose up -d
```

ตรวจว่า healthy ก่อนทำขั้นต่อไป:

```bash
docker compose ps
# รอจนเห็น pol-db: healthy, pol-db-init: exited (0)
```

### 3.3 รัน EF Migration

สร้างตารางในฐานข้อมูล (รันครั้งเดียวต่อ DB หรือเมื่อมี migration ใหม่):

```bash
cd pol-core
POL_DESIGN_SQL="Server=localhost,11433;Database=PaymentOrchestration;User Id=sa;Password=<SA_PASSWORD>;Encrypt=True;TrustServerCertificate=True" \
  dotnet ef database update \
  --context ProducerDbContext \
  --project src/BuildingBlocks/BuildingBlocks.Infrastructure \
  --startup-project src/Hosts/Api
```

> แทนที่ `<SA_PASSWORD>` ด้วยค่าที่ตั้งใน `.env`

### 3.4 รัน API

```bash
cd pol-core
dotnet run --project src/Hosts/Api
```

API ขึ้นที่ `http://localhost:5100`  
Swagger UI: `http://localhost:5100/swagger` (dev mode เท่านั้น)

---

## 4. pol-admin — Frontend

### 4.1 ติดตั้ง Dependencies

```bash
cd pol-admin
npm install
```

### 4.2 ตั้งค่า Environment

```bash
cp .env.example .env.local
```

`.env.local` มีค่าถูกต้องอยู่แล้ว:

```env
ADMIN_API_ORIGIN=http://localhost:5100
```

> ไม่ต้องแก้ไข ถ้า API รันที่ port 5100 ตามค่า default

### 4.3 รัน Development Server

```bash
cd pol-admin
npm run dev
```

Frontend ขึ้นที่ `http://localhost:5200`

---

## 5. สรุปคำสั่งรันทั้งหมด (เรียงตามลำดับ)

```bash
# Terminal 1: เปิด Database
cd pol-core && docker compose up -d

# Terminal 2: รัน Backend API
cd pol-core && dotnet run --project src/Hosts/Api

# Terminal 3: รัน Frontend
cd pol-admin && npm run dev
```

---

## 6. คำสั่งที่ใช้บ่อย

### pol-admin

```bash
npm run dev      # รัน dev server (:5200)
npm run build    # build production bundle
npm run test     # รัน unit tests (vitest)
npm run lint     # ตรวจ ESLint
npx tsc --noEmit # ตรวจ TypeScript types
```

### pol-core

```bash
# Build
dotnet build src/Hosts/Api

# Test
dotnet test

# รัน API
dotnet run --project src/Hosts/Api

# Watch mode (auto-reload เมื่อแก้ไขโค้ด)
dotnet watch --project src/Hosts/Api

# สร้าง migration ใหม่
dotnet ef migrations add <MigrationName> \
  --context ProducerDbContext \
  --project src/BuildingBlocks/BuildingBlocks.Infrastructure \
  --startup-project src/Hosts/Api
```

### Docker

```bash
docker compose up -d          # เปิด DB (background)
docker compose down           # ปิด container
docker compose down -v        # ปิดและลบ volume (ล้าง DB ทั้งหมด)
docker compose logs pol-db    # ดู log ของ DB container
```

---

## 7. Port Reference

| Service | Port | URL |
|---------|------|-----|
| pol-admin (Next.js) | 5200 | http://localhost:5200 |
| pol-core API | 5100 | http://localhost:5100 |
| SQL Server | 11433 | localhost,11433 |
| Swagger UI | 5100 | http://localhost:5100/swagger |

---

## 8. Git Workflow

ทุก branch ต้องผ่าน PR — ห้าม push ตรงเข้า `main` หรือ `develop`

```bash
# เปิด feature branch
git checkout -b feat/<feature-name>

# สร้าง PR ไป develop
gh pr create --base develop

# merge develop เข้า main ผ่าน PR เท่านั้น
```

กฎ:
- ห้าม force push
- ห้าม commit `.env` หรือ `.env.local` (อยู่ใน `.gitignore` แล้ว)
- ห้าม hardcode secret ทุกชนิด
- CI ต้องผ่าน (test + lint) ก่อน merge

---

## 9. Troubleshooting

### API ไม่ตอบสนอง (Internal Server Error จาก Next.js)

`pol-core` ไม่ได้รัน:

```bash
curl http://localhost:5100/health
# ถ้า connection refused -> รัน dotnet run ก่อน
```

### SQL Server ไม่ขึ้น

```bash
docker compose logs pol-db
# ดูว่า MSSQL_SA_PASSWORD ผ่านนโยบายความแข็งแกร่งหรือไม่
```

### Migration ล้มเหลว

```bash
# ตรวจว่า pol-db-init exited 0 (bootstrap SQL เสร็จ)
docker compose ps
# ถ้า pol-db-init ยังไม่ exited รอก่อน
```

### Next.js build error (TypeScript)

```bash
cd pol-admin && npx tsc --noEmit
# Error ใน test files (admin-api.test.ts, checkout.test.ts) เป็น pre-existing ไม่บล็อก dev
```

### Google SSO (producer login) ไม่ทำงาน

ต้องการจากทีม infra:
1. `Google__Audiences__admin` ใน `.env` ของ pol-core
2. `Producer:Oidc:ClientId` ตั้งค่าบน backend
3. Redirect URI ลงทะเบียนใน Google Cloud Console แล้ว

---

## 10. โครงสร้าง Request Flow

```
Browser (5200)
  |
  | GET /producer/auth/login?returnTo=/register
  v
Next.js Dev Server (5200) -- rewrite /producer/* -->
  |
  v
pol-core API (5100) /producer/auth/login
  |
  v
Google OAuth (redirect)
  |
  v
pol-core /producer/auth/callback (set cookie)
  |
  v
Browser -> /register (returnTo)
```

Next.js proxy ทำงานเฉพาะ **dev เท่านั้น** (ตัวแปร `ADMIN_API_ORIGIN`).  
Production: reverse proxy เสิร์ฟทั้ง SPA และ API บน origin เดียวกัน ไม่ต้อง rewrite.
