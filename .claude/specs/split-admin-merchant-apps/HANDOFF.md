# Handoff: Admin/Merchant Route Parity Workspaces

> From: Codex
> To: human review
> Date: 2026-08-17

## Task Summary

ทำ spec `split-admin-merchant-apps` ครบ Tasks 1-6 และ REQ 108 criteria. Repo เปลี่ยนเป็น npm
workspaces ที่แยก Admin/Merchant runtime พร้อม route parity; Merchant เพิ่ม `/register` route เดียว.

## Current Status

Done. Requirements, design, tasks, implementation, reviews และ full acceptance ผ่านแล้ว. ผู้ใช้อนุมัติ
ให้ commit, push และเปิด PR เข้า `develop` เมื่อ 2026-08-17; ยังไม่อนุญาตให้ merge.

## Files Changed

- `.claude/specs/split-admin-merchant-apps/` — created — requirements, design, tasks, evidence และ handoff
- `apps/admin/` — created — source/public/config/env/tests ที่ย้ายจาก root; ไม่มี `/register`
- `apps/merchant/` — created — clone Admin implementation ทั้งชุดและเพิ่ม `/register`
- `packages/ui/` — created — shared `avatar-upload`, `fieldset`, `logo` และ internal `cn`
- `packages/shared/` — created — Merchant user types, validation และ tests
- `scripts/lib/workspace-verification.mjs` — created — route/boundary/test-policy/port checks
- `scripts/lib/workspace-verification.test.mjs` — created — verifier regression tests
- `scripts/verify-workspaces.mjs` — created — static acceptance runner
- `scripts/smoke-workspace-routes.mjs` — created — production route smoke และ owned-child cleanup
- `package.json`, `package-lock.json`, `tsconfig.base.json`, `eslint.config.mjs` — edited/created — workspace graph, scripts และ tooling
- `Dockerfile`, `.dockerignore` — edited — Admin standalone image HTTP 3001
- `.github/workflows/ci.yml` — edited — application install/audit/lint/typecheck/test/build/parity/smoke job
- `.gitignore` — edited — app-local HTTPS certificate ignore; user change preserved
- `README.md`, `docs/dev-setup.md` — edited — two-app env/runtime/deployment workflow; user port/HTTPS changes preserved
- `.ai/shared/PROJECT_CONTEXT.md`, `.ai/shared/ARCHITECTURE.md`, `.ai/shared/stack/nextjs.md` — edited — canonical monorepo model
- root `src/`, `public/`, `.env.example`, `components.json`, `next.config.ts`, `postcss.config.mjs`,
  `tsconfig.json`, `vitest.config.ts` — moved into app workspaces; Git currently แสดง delete + untracked add

## Important Decisions

- Route contract ชั่วคราว: `Merchant routes = Admin routes ∪ {/register}`.
- Merchant clone Admin auth/API/navigation/session จริง; ไม่สร้าง shared route/auth abstraction เพื่อให้ pruning ง่าย.
- Shared packages มีเฉพาะ seam ที่สอง app ใช้ร่วมจริง; verifier block app-to-app และ package-to-app imports.
- Development ใช้ native Next HTTPS Admin 3001/Merchant 3002; production local ใช้ HTTP ports เดิม.
- App-local `.env.example` ต้องคัดลอกด้วยมือ; root `.env.local` ไม่ถูกย้ายหรือแตะ.
- Docker image รองรับ Admin เท่านั้น; local image tag `pol-admin:local` ยังอยู่.
- Code review แก้ smoke false-pass เมื่อ port ถูกใช้ และตัด money/date helpers ออกจาก `@pol/ui`.

## Constraints

- ห้ามแก้ user-owned `.ai/shared/TASK_PROTOCOL.md`; diff ที่มีอยู่ก่อน feature ถูกแยกออกจาก PR และเก็บใน
  Git stash โดยไม่แก้ content.
- รักษา user-owned changes ที่ถูก integrate ใน `.gitignore`, README, dev setup, package manifest,
  app env template และ Next.js stack profile.
- ห้าม merge PR โดยไม่มีคำสั่งผู้ใช้.
- Merchant route/auth/navigation pruning และ Merchant deployment image อยู่นอก scope.
- ห้าม commit `.env.local`, certificates หรือ secret.

## Tests Run

- `npm ci` -> 715 packages installed; lockfile clean-install ผ่าน
- `npm audit --omit=dev --audit-level=high` -> 0 vulnerabilities
- `npm run lint` -> 4 workspaces ผ่าน
- `npm run typecheck` -> 4 workspaces ผ่าน
- `npm test` -> 453 tests ผ่าน: verifier 9, Admin 209, Merchant 209, Shared 26
- `npm run build:admin && npm run build:merchant` -> 113/114 generated pages; standalone outputs แยก
- `npm run verify:workspaces` -> Admin 112 routes, Merchant 113 routes, delta เฉพาะ `/register`
- `npm run smoke:routes` -> 307/200/404 contract ผ่าน; ports 3001/3002 released
- HTTPS concurrent probes -> Admin 3001/Merchant 3002; Admin `/register` 404, Merchant `/register` 200,
  Merchant `/admin/user/list` 200
- `docker build -t pol-admin:local .` -> image `sha256:efe1584288ae...`
- temporary Docker container -> healthy, user `nextjs`, root 307 ไป `/dashboard`, ไม่มี Merchant server
- `scripts/spec-trace.sh split-admin-merchant-apps` -> 108 criteria covered, EARS lint ผ่าน
- `git diff --check` และ `.ai/bin/check-secrets.sh --all` -> ผ่าน
- `.claude/hooks/tests/*.test.sh` -> 260 pass, 0 fail
- viewports: n/a; feature ไม่มี visual behavior change

## Known Issues

- Full `npm audit` รายงาน 8 dev-only advisories จาก ESLint/shadcn toolchain; production audit = 0.
- Native Next local CA trust อาจขอ system password. Automated HTTPS probe ใช้ temporary one-day
  self-signed certificate; exact certificate files ถูกลบหลังทดสอบ.
- Merchant ยังใช้ Admin session/permissions และ OAuth contract ตาม approved limitation.
- Local machine ใช้ Node 26; CI pins Node 22.19.0 + npm 11.12.1.

## Next Recommended Agent

Human review. ถ้าจะ publish ให้ใช้ repo PR workflow หลังผู้ใช้อนุมัติ commit/push.

## Next Steps

1. Review PR เทียบ `requirements.md`, `design.md`, `tasks.md` และ Evidence ของ Tasks 1-6.
2. รอ required CI checks ผ่านครบก่อนพิจารณา merge.
3. ห้าม merge จนกว่าผู้ใช้สั่งโดยตรง.
