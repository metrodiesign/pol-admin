# Implementation Tasks: Split Admin and Merchant Apps

> Status: approved 2026-08-17

แต่ละ task เป็น slice ที่ทำและตรวจได้จบในรอบเดียว. งานทั้งชุดแชร์ workspace state และควรรันตามลำดับ.

## Tasks

- [x] 1. สร้าง four-workspace foundation — ย้าย source, assets และ config เข้า app-local copies, extract shared seams ที่อนุมัติ, อัปเดต A5 dependencies, lockfile และ environment isolation จนทั้งสอง app build แยก output ได้
  - **Satisfies:** REQ-1 (all criteria), REQ-5 (all criteria), REQ-6 (all criteria), REQ-7 (all criteria)
  - **Verify:** clean install, production audit, lint, typecheck และทั้งสอง workspace builds ผ่าน

  ```bash
  npm ci
  npm audit --omit=dev --audit-level=high
  npm run lint
  npm run typecheck
  npm run build:admin
  npm run build:merchant
  ```

  Evidence: Task 1 verified 2026-08-17; REQ-1, REQ-5, REQ-6 และ REQ-7 satisfied.
  - test: `npm ci && npm audit --omit=dev --audit-level=high` -> install 715 packages; production audit พบ 0 vulnerabilities
  - test: `npm run lint && npm run typecheck && npm test` -> lint/typecheck ผ่าน 4 workspaces; Admin 208, Merchant 208, Shared 26 tests ผ่าน
  - test: `npm run build:admin && npm run build:merchant` -> 114 generated pages ต่อ app; standalone servers อยู่ใต้ app-local outputs
  - test: compare Admin `BUILD_ID` hash/mtime before and after Merchant build -> ไม่เปลี่ยน; build output isolation ผ่าน
  - viewports: n/a — workspace/config migration; runtime UI verification อยู่ Task 2 และ Task 3
  - deviations: none

- [x] 2. ทำ Admin/Merchant runtime parity — กำหนด root commands, HTTPS/HTTP ports และ rewrites, ตัด `/register` จาก Admin, คง Merchant registration endpoint และ clone Admin auth, API, navigation และ tests
  - **Satisfies:** REQ-2 (all criteria), REQ-3.1-REQ-3.10, REQ-4 (all criteria)
  - **Depends on:** 1
  - **Verify:** app tests/builds ผ่าน; สอง dev servers ตอบ HTTPS 3001/3002 พร้อมกัน และ production servers ตอบ HTTP 3001/3002

  ```bash
  npm run test:admin
  npm run test:merchant
  npm run build:admin
  npm run build:merchant
  ```

  Evidence: Task 2 verified 2026-08-17; REQ-2, REQ-3.1 ถึง REQ-3.10 และ REQ-4 satisfied.
  - test: `npm test` -> Admin 209, Merchant 209 และ Shared 26 tests ผ่าน; registration tests ยืนยัน `POST /producer/users/register`
  - test: `npm run build:admin && npm run build:merchant` -> Admin 113 pages ไม่มี `/register`; Merchant 114 pages มี `/register`
  - test: concurrent app-local `npm run dev -- --experimental-https-key /tmp/pol-admin-https-smoke.2xrP7l/localhost-key.pem --experimental-https-cert /tmp/pol-admin-https-smoke.2xrP7l/localhost.pem` -> HTTPS 3001/3002 พร้อมกัน; `/` ได้ 307 ไป app-local `/dashboard`
  - test: `npm run start:admin` และ `npm run start:merchant` -> HTTP 3001/3002; Admin `/register` 404, Merchant `/register` 200, Merchant `/admin/user/list` 200
  - viewports: n/a — route/runtime migration ไม่มี visual change
  - deviations: first native HTTPS start ขอ sudo เพื่อ trust local CA; non-interactive probe ใช้ temporary one-day self-signed cert แล้วลบ exact files. เพิ่ม `agentRules: false` เพื่อหยุด Next 16.3.1 สร้าง app-local agent docs นอก design

- [x] 3. เพิ่ม workspace verification — ใช้ Node.js standard library ตรวจ route normalization/parity, import boundaries, test policy และ process-safe runtime smoke พร้อม unit tests
  - **Satisfies:** REQ-3.5, REQ-3.10-REQ-3.14, REQ-9.9-REQ-9.15
  - **Depends on:** 2
  - **Verify:** verifier unit tests, static checks และ runtime route smoke ผ่านหลัง build ทั้งสอง app

  ```bash
  node --test scripts/lib/workspace-verification.test.mjs
  npm run build:admin
  npm run build:merchant
  npm run verify:workspaces
  npm run smoke:routes
  ```

  Evidence: Task 3 verified 2026-08-17; REQ-3.5, REQ-3.10 ถึง REQ-3.14 และ REQ-9.9 ถึง REQ-9.15 satisfied.
  - test: `node --test scripts/lib/workspace-verification.test.mjs` -> 8 passed, 0 failed
  - test: `npm run verify:workspaces` -> Admin 112 routes, Merchant 113 routes, delta เฉพาะ `/register`; 1,333 workspace code files ผ่าน boundary/test-policy scan
  - test: `npm run smoke:routes` -> root redirects 307, Merchant Admin route 200, Admin register 404, Merchant register 200; ports 3001/3002 released หลังจบ
  - test: `npm run lint && npm run typecheck && npm test` -> lint/typecheck ผ่าน 4 workspaces; aggregate 452 tests ผ่าน
  - viewports: n/a — verifier/runtime logic ไม่มี visual change
  - deviations: none

- [x] 4. ย้าย Admin production image ไป standalone workspace layout — root Dockerfile install ด้วย workspaces, build เฉพาะ Admin และ serve/health-check HTTP port 3001 โดยไม่มี Merchant image หรือ secret
  - **Satisfies:** REQ-8 (all criteria)
  - **Depends on:** 2
  - **Verify:** image build ผ่าน; temporary container ตอบ HTTP 3001 และ health status ผ่าน

  ```bash
  docker build -t pol-admin:local .
  ```

  Evidence: Task 4 verified 2026-08-17; REQ-8 satisfied.
  - test: `docker build -t pol-admin:local .` -> workspace `npm ci` ผ่าน, build เฉพาะ Admin 113 pages, image `sha256:916b1e0ab857...` สำเร็จ
  - test: `docker run --rm -d --name pol-admin-smoke-codex-20260817-2 -p 3001:3001 pol-admin:local` -> root 307 ไป `/dashboard`; Docker health `healthy`
  - test: `docker inspect` และ container filesystem probes -> expose `3001/tcp`, command `node apps/admin/server.js`, user `nextjs`, ไม่มี Merchant server
  - viewports: n/a — production image/runtime packaging ไม่มี visual change
  - deviations: none

- [x] 5. ต่อ application CI gate — คง guard, secret และ spec-trace jobs แล้วเพิ่ม pinned Node/npm install, audit, lint, typecheck, tests, builds, static verification และ runtime smoke
  - **Satisfies:** REQ-9.1-REQ-9.8
  - **Depends on:** 3
  - **Verify:** ลำดับ command เดียวกับ CI ผ่านใน local checkout

  ```bash
  npm ci
  npm audit --omit=dev --audit-level=high
  npm run lint
  npm run typecheck
  npm test
  npm run build:admin
  npm run build:merchant
  npm run verify:workspaces
  npm run smoke:routes
  ```

  Evidence: Task 5 verified 2026-08-17; REQ-9.1 ถึง REQ-9.8 satisfied.
  - test: YAML semantic parse -> `verify` คง guard regression, secret scan และ spec-trace; `application` มี Node.js 22.19.0, npm 11.12.1 และ application gates ครบ
  - test: CI command sequence ตามรายการข้างต้น -> install ผ่าน; production audit 0 vulnerabilities; lint/typecheck ผ่าน 4 workspaces; aggregate 452 tests ผ่าน
  - test: Admin/Merchant builds -> 113/114 pages; `npm run verify:workspaces` -> route delta เฉพาะ `/register`; `npm run smoke:routes` -> expected 307/200/404 statuses
  - viewports: n/a — CI workflow ไม่มี visual change
  - deviations: none

- [x] 6. ปิดงานด้วย developer documentation และ full acceptance — อัปเดต README, dev setup และ architecture canon สำหรับ app-local env, two-terminal HTTPS workflow, production HTTP และ backend coordination พร้อมรักษา user-owned changes
  - **Satisfies:** REQ-9.16-REQ-9.21
  - **Depends on:** 4, 5
  - **Verify:** full repository gates, Docker smoke, spec trace และ diff hygiene ผ่าน; route equation ยังเป็น Merchant เท่ากับ Admin รวม `/register`

  ```bash
  npm run lint
  npm run typecheck
  npm test
  npm run build:admin
  npm run build:merchant
  npm run verify:workspaces
  npm run smoke:routes
  scripts/spec-trace.sh split-admin-merchant-apps
  git diff --check
  ```

  Evidence: Task 6 verified 2026-08-17; REQ-9.16 ถึง REQ-9.21 satisfied.
  - docs: `README.md`, `docs/dev-setup.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md` และ Next.js stack profile ระบุ root commands, manual app-local env copy, two-terminal HTTPS 3001/3002, production HTTP และ staging/production backend coordination
  - test: clean application gate -> production audit 0 vulnerabilities; lint/typecheck ผ่าน 4 workspaces; 453 tests ผ่าน; Admin/Merchant builds 113/114 pages
  - test: `npm run verify:workspaces && npm run smoke:routes` -> Admin 112 routes, Merchant 113 routes, delta เฉพาะ `/register`; expected 307/200/404 statuses; ports released
  - test: `docker build -t pol-admin:local .` + temporary container smoke -> image `sha256:efe1584288ae...`, health `healthy`, user `nextjs`, root 307 ไป `/dashboard`, ไม่มี Merchant server
  - test: `scripts/spec-trace.sh split-admin-merchant-apps` -> 108 EARS criteria covered; `git diff --check`, full-tree secret scan และ guard regression suites (260 pass, 0 fail) ผ่าน
  - review: architecture/code/security passes พบและแก้ shared UI utility leakage กับ occupied-port smoke race; ไม่มี actionable finding ค้าง
  - viewports: n/a — migration/config/docs ไม่มี visual behavior change; route runtime ตรวจด้วย HTTP/HTTPS probes
  - deviations: full dependency audit ยังรายงาน 8 dev-only advisories จาก tooling; required production audit พบ 0. Native local CA trust ต้องตอบ system prompt ตาม docs

## Suggested Execution Batches

ทุก task แชร์ source migration, package graph และ build artifacts. ใช้ session เดียวตาม dependency order;
ไม่มี `Batch:` group แยก.

```bash
scripts/pane-loop.sh split-admin-merchant-apps all-in-one
```

หรือใช้ `/spec-implement all` หลัง tasks ได้รับ approval.
