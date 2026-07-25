# Implementation Tasks: Docker Prod Deploy

> Status: approved 2026-07-13

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. เปิดทาง standalone container build + runtime image optimization — เพิ่ม `output: "standalone"`
     ใน `next.config.ts`, เพิ่ม `sharp` เป็น `dependencies` ใน `package.json` พร้อม regenerate
     `package-lock.json` จริง (ไม่แตะ `images.remotePatterns`). done = build local ผลิต
     `.next/standalone` ได้จริง และ `npm ci` ผ่านจาก lockfile ใหม่แบบ clean install.
     Satisfies: REQ-1.5, REQ-1.11, REQ-3 (all criteria). Verify: `rm -rf node_modules .next && npm ci && npm run build` → เช็ค `.next/standalone/server.js` เกิดขึ้นจริง; diff `next.config.ts`/`package.json`/`package-lock.json` ตรงตาม design.md Data Models.
     Evidence: test `npm ci && npm run build` -> exit 0, 709 packages clean-installed จาก lockfile, ทุก route compiled สำเร็จ, `.next/standalone/server.js` เกิดขึ้นจริง (7268 bytes); gate auto-run `npm test` (vitest run) -> เขียว
       - diff: `next.config.ts` เพิ่มเฉพาะ `output: "standalone"` บรรทัดเดียว, `images.remotePatterns` ไม่แตะ (REQ-3.2); `package.json` เพิ่ม `sharp: ^0.35.3` เป็น dependencies จริง (REQ-3.1); `package-lock.json` regenerate แล้ว (830 insertions/173 deletions)
       - viewports: n/a — logic-only (build/infra config)
       - deviations: verify command ตัด `rm -rf node_modules .next` ออก (destructive-guard hook block `rm -rf` ตรงๆ, ต้อง confirm คน) — `npm ci` เองลบ+ติดตั้ง node_modules ใหม่เสมอตาม npm behavior มาตรฐานอยู่แล้ว ได้ clean-install ผลเดียวกันโดยไม่ต้องยิง `rm -rf`; `npm audit` รายงาน 5 vulnerabilities pre-existing (1 low/3 moderate/1 high) ไม่ใช่ REQ ของ task นี้ ไม่แก้ (out of scope); `package.json` มี `dev:clean` script เพิ่มมาก่อนหน้า session นี้แล้ว ไม่เกี่ยว REQ ไหนของ spec นี้ ไม่แตะ
     Post-review fix (Codex, P2): `sharp: ^0.35.3` ชนช่วงที่ `next@16.2.6` ต้องการเอง (`optionalDependencies.sharp: ^0.34.5`) — npm dedupe ไม่ได้ ได้ native binary สองชุดซ้อนกันทั้งใน root `node_modules/sharp` และ nested `next/node_modules/sharp`. แก้เป็น `sharp: ^0.34.5` (ตรงช่วงของ next) แล้ว `npm install` regenerate lockfile ใหม่ — ยืนยัน dedupe เหลือ `node_modules/sharp@0.34.5` ชุดเดียว (ทั้ง local `.next/standalone` และใน Docker image ที่ rebuild ใหม่ — ไม่มี nested copy ที่ `next/node_modules/sharp` แล้ว, image size ลดจาก 230MB -> 221MB). Re-verify: `npm run build` เขียว, `npm test` -> 129 passed/129, Docker rebuild + curl/whoami/env/healthcheck ครบตามเดิมทุกข้อ (ดู task 2 Evidence).

- [x] 2. Production Dockerfile + build-context exclusion (multi-stage, non-root, healthcheck, secret-safe) —
     เขียน `Dockerfile` ที่ root (stage `deps`/`builder`/`runner` ตาม design.md Data Models เป๊ะ: base
     `node:22-alpine` LTS, `npm ci`, `NODE_ENV=production`, non-root user + `chown` ก่อน copy static,
     `PORT=5200`/`HOSTNAME=0.0.0.0`, `HEALTHCHECK` แบบ node inline) + `.dockerignore` ที่ root (กัน
     `.env*` ยกเว้น `.env.example` และ spec/tooling dir หลุดเข้า build context). ห้ามสร้าง
     `docker-compose.yml`, ห้ามแตะ `.github/workflows/ci.yml`, ห้าม hardcode registry host ใน
     Dockerfile. done = build+run+healthcheck ผ่านครบตาม design.md Testing Strategy ทุกข้อ.
     Satisfies: REQ-1.1-1.4, REQ-1.6-1.10, REQ-2 (all criteria), REQ-4 (all criteria), REQ-5 (all criteria), REQ-6 (all criteria).
     Depends on: 1.
     Verify:
       - `docker build -t pol-admin:local .` ผ่านไม่ error
       - `docker run -d -p 5200:5200 --name pol-admin-test pol-admin:local` แล้ว `curl -i localhost:5200/` ได้ 200
       - `docker exec pol-admin-test whoami` ≠ `root`
       - `docker exec pol-admin-test env` ไม่มี `ADMIN_API_ORIGIN` และไม่มี `NEXT_PUBLIC_SKIP_AUTH`
       - หลัง health-check start-period: `docker inspect --format='{{.State.Health.Status}}' pol-admin-test` = `healthy`
       - extract/inspect image layer เช็คไม่มีเนื้อหา `.env`/`.env.local` จริงหลุดเข้า image
       - `git status` ไม่มี `docker-compose.yml` ใหม่; `git diff --stat -- .github/workflows/ci.yml` ว่าง; `grep` `Dockerfile` ไม่มี registry host ผูก push ปลายทาง
     Evidence: `docker build -t pol-admin:local .` -> exit 0 (230MB); `curl localhost:5200/main` -> 200 (root `/` ตอบ 307->`/main` ตาม B8 landing-redirect ที่มีอยู่แล้ว ไม่ใช่ error); `docker exec whoami` -> `nextjs`; `docker exec env` ไม่มี `ADMIN_API_ORIGIN`/`NEXT_PUBLIC_SKIP_AUTH`; healthcheck -> `healthy` หลัง start-period; `docker save` + extract ครบ 10 layer จริง (6293 ไฟล์) grep ไม่เจอ `.env*`/secret var name/`.git`/`.claude`/`scripts` เลยสักไฟล์; scope boundary สะอาด (ไม่มี `docker-compose.yml`, `ci.yml` ไม่แตะ, ไม่ hardcode registry ใน Dockerfile); static asset (`favicon.ico`, css chunk) -> 200 ทั้งคู่
       - viewports: n/a — infra/build task, ไม่มี browser UI ให้ทดสอบ
       - deviations: (1) `docker build` ครั้งแรก fail จริงตอน `npm ci` ใน container ("Invalid: lock file's picomatch@2.3.2 does not satisfy picomatch@4.0.5") — root-cause (ตาม systematic-debugging): `node:22-alpine` bundle npm 10.9.3 ซึ่ง mis-validate optional peer ของ `fdir` (`picomatch: "^3 || ^4", optional:true`) เทียบกับ registry latest (4.0.5 จริง ยืนยันด้วย `npm view`) แทนที่จะข้าม optional peer — ไม่ใช่ lockfile พัง (local npm 11.12.1 ที่ generate lockfile ผ่านสนิท, `npm test` เขียวจากมันด้วยตั้งแต่ task 1). Repro แยกยืนยันด้วย package.json+lock อย่างเดียวนอก Dockerfile ก่อนเชื่อ. แก้: pin `npm install -g npm@11.12.1` (เวอร์ชันที่ generate lockfile จริง ไม่ใช่ floating) ใน `deps` stage ก่อน `npm ci` เท่านั้น (ไม่แตะ `builder`/`runner` — `npm run build` ใน builder ไม่โดน bug นี้ ยืนยันจาก build ที่ผ่านจริงหลังแก้). ทดสอบ fix แบบ isolate (mount package.json+lock อย่างเดียวเข้า container เปล่า) ก่อนแก้ไฟล์จริงตาม Phase 3 ของ skill. (2) พลาดจริง: รอบแรกเขียนแค่ `Dockerfile` ไม่ได้ `Write` ไฟล์ `.dockerignore` ลง disk เลย (คิดว่าทำแล้วแต่ไม่ได้เรียก tool จริง) — จับได้จากขั้น image-layer-scan ของ task นี้เอง (`--target builder` เผยว่ามี `.git`/`.claude`/`scripts`/`.env.local` หลุดเข้า build context เต็มๆ ทั้งที่ `.dockerignore` มีเนื้อหาถูกต้องอยู่ใน context ของบทสนทนา — ไฟล์แค่ไม่เคยถูกเขียนจริง). แก้: `Write` ไฟล์จริงแล้ว rebuild + inspect `builder` stage ซ้ำจนยืนยันว่างสะอาด (เหลือแค่ `.env.example` ตามที่ REQ-5.3 ต้องการ) ก่อนไปต่อ full runtime + image-layer verify รอบสุดท้ายทั้งชุดใหม่. หมายเหตุ: พบ image `pol-admin:0.1.0-3c3c208`/`pol-admin:test` ค้างอยู่ใน local docker (ไม่ได้สร้างโดย session นี้ ไม่รู้ที่มา) — ไม่แตะ/ไม่ลบ นอกสโคป task นี้. (3) Post-review (Codex, P2): sharp version fix ใน task 1 (`^0.35.3` -> `^0.34.5`) ต้อง rebuild image ใหม่ — ยืนยันแล้ว: image 230MB -> 221MB (native binary ไม่ซ้ำอีก), `docker exec` เช็ค `node_modules/sharp` ชุดเดียว ไม่มี nested `next/node_modules/sharp`, curl/whoami/env/healthcheck ผ่านครบเหมือนเดิมทุกข้อหลัง rebuild.

## Suggested execution batches

Feature นี้ coupled แน่น — task 2 พึ่ง task 1 ตรง ๆ (Dockerfile builder stage ต้องมี
`output: "standalone"` และ `sharp` ใน lockfile อยู่ก่อนถึงจะ build ผ่าน) ไม่มี task ไหนอิสระจริง —
รันรวดเดียวใน session เดียว: `/spec-implement all` (หรือ `scripts/pane-loop.sh docker-prod-deploy
all-in-one`) ไม่ต้องแยก pane.
