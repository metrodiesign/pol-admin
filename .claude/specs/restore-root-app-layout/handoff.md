# Handoff: Restore Root App Layout

> From: Codex session 01a00fbf
> To: reviewer หรือ human review
> Date: 2026-08-18

## Task Summary

ย้าย POL Admin จาก `apps/admin` กลับเป็น root Next.js application หลังแยก Merchant
ออกไปอยู่ repository `pol-merchant` แล้ว. งานครอบ Tasks 1-4 และ REQ-1 ถึง REQ-9
ของ spec `restore-root-app-layout`.

Root cause ที่ยืนยันจาก Git history และ repository state: commit `a239c56` สร้าง
Admin workspace เพื่อรองรับสอง applications; หลัง accepted spec
`remove-merchant-workspace` เหลือ application เดียว แต่ path, scripts, CI และ Docker
ยังคง outer workspace boundary ที่ไม่ให้ isolation เพิ่ม. Design จึงย้อนเฉพาะ boundary
และคง internal Admin/Merchant-management domain paths กับ routes เดิม.

## Current Status

Implementation และ integrated acceptance เสร็จ. Root app, package workspaces, CI,
Docker, verifier, smoke scripts และ current docs ใช้ root-native contract. ไม่มี
`apps` directory, package `@pol/admin` หรือ Admin workspace alias.

ไม่มี stage, commit, push หรือ pull request. HEAD ยังเป็น
`79644df1bfa4b9ad9149fdeecedc63cbafda76d6` และ Git index ว่าง.

Post-acceptance correctionตามคำสั่ง user: root `.env.local` มี deprecated port 5100
origin 2 จุดซึ่งถูก inject เข้า server rewrites และ browser bundle. เปลี่ยน exact 2 จุดเป็น
`https://localhost:5001` โดยไม่ log ค่าอื่น; dev server reloadแล้วและ compiled output
ไม่มี deprecated origin.

## Files Changed

- `src/**` — moved จาก `apps/admin/src/**`; 660 source paths โดยแก้เฉพาะ path-dependent allowlist
- `public/**` — moved จาก `apps/admin/public/**`; 81 assets คง Git blobs
- `.env.example`, `components.json`, `postcss.config.mjs`, `vitest.config.ts` — moved สู่ root
- `next.config.ts`, `tsconfig.json` — moved และปรับ root boundary
- `package.json`, `package-lock.json` — root app scripts/dependencies กับ exact workspace lock delta
- `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml` — root build/runtime contracts
- `scripts/lib/workspace-verification.mjs` — root topology, route identity, boundaries และ active-reference scan
- `scripts/lib/workspace-verification.test.mjs` — verifier/CI/Docker regression coverage
- `scripts/verify-workspaces.mjs`, `scripts/verify-smoke-signals.mjs`, `scripts/smoke-workspace-routes.mjs` — root runtime verification
- `README.md`, `docs/dev-setup.md` — root-native commands/layout
- `.ai/shared/ARCHITECTURE.md`, `.ai/shared/PROJECT_CONTEXT.md`, `.ai/shared/stack/nextjs.md` — current architecture guidance
- `.claude/specs/restore-root-app-layout/browser-baseline.json` — nested env-free baseline
- `.claude/specs/restore-root-app-layout/browser-acceptance.json` — root env-free candidate parity
- `.claude/specs/restore-root-app-layout/migration-journal.json` — move/recovery journal
- `.claude/specs/restore-root-app-layout/tasks.md` — task state และ evidence
- `apps/admin/**` — removed ผ่าน journaled moves
- `apps/merchant/**` — prior accepted `remove-merchant-workspace` deletion; ไม่ใช่ change ใหม่ของ spec นี้

## Important Decisions

- Root package เป็น Next.js application โดยตรง; คงเฉพาะ workspaces
  `packages/ui` และ `packages/shared`.
- คง `src/app/admin`, `src/components/admin` และ Merchant-management namespaces
  เพราะเป็น domain/route boundaries ไม่ใช่ workspace boundaries.
- ไม่คง compatibility aliases เช่น `build:admin`, `start:admin` หรือ package
  `@pol/admin`; current tooling เรียก root commands โดยตรง.
- ใช้ npm `11.12.1` native lock regeneration แล้วลบเฉพาะ orphan
  `packages[apps/admin]` ที่ npm คงเป็น `extraneous`; retained 801 records
  deep-equal กับ accepted prior-cleanup baseline.
- Browser parity ใช้ persistent browser/tab เดียวกันทั้ง nested baseline และ root
  candidate, routes `/dashboard` กับ `/admin/user/list`, widths 375/768/1440.
- Candidate snapshot ใช้ temporary Git index และ `git checkout-index`; real index
  ไม่เปลี่ยน และ ignored `.env.local`/certificate ไม่อยู่ใน snapshot.

## Recovery References

- `/Users/king_developer/.Trash/pol-admin-root-next-79644df1-20260818-01a00fbf`
- `/Users/king_developer/.Trash/pol-admin-root-tsbuildinfo-79644df1-20260818-01a00fbf`
- `/Users/king_developer/.Trash/pol-admin-admin-package-79644df1-20260818-01a00fbf.json`
- `/Users/king_developer/.Trash/pol-admin-admin-residual-79644df1-20260818-01a00fbf`
- `/Users/king_developer/.Trash/pol-admin-root-node_modules-79644df1-20260818-01a00fbf`
- Prior Merchant cleanup: `/Users/king_developer/.Trash/pol-admin-apps-merchant-79644df1-20260817T222500-01a00fbf`
- Env-free candidate snapshot: `/tmp/pol-admin-root-candidate.SOzTWO/tree`
- Move journal: `.claude/specs/restore-root-app-layout/migration-journal.json`

ทุก Trash endpoint ยังอยู่, ไม่เป็น symlink และอยู่ device `16777231`.
Rollback order คือ reverse completed journal entries โดยห้าม overwrite destination.

## Constraints

- ห้ามอ่าน, log, copy หรือ overwrite root `.env.local` และ certificate content.
- Working-tree Next.js build/smoke ใช้ root `.env.local` ตาม platform behavior;
  evidence ระบุเฉพาะ path.
- ห้ามแก้ sibling repository `pol-merchant`.
- ห้าม stage/commit โดยไม่มี review; ห้าม push ตรง `main`/`develop`; ห้าม force push.
- ห้าม rewrite historical specs หรือ retrospectives.
- Toolchain acceptance ต้องเป็น Node `22.19.0` และ npm `11.12.1`.

## Tests Run

- pinned `npm ci` -> 713 packages installed; commandผ่าน
- `npm audit --omit=dev --audit-level=high` -> `found 0 vulnerabilities`
- `npm test` -> verifier 20, root Vitest 209, Shared 26 passed
- `npm run lint` -> root, `@pol/ui`, `@pol/shared` passed
- `npm run typecheck` -> root, `@pol/ui`, `@pol/shared` passed
- `npm run build` -> 113 page entries; activationรายงานเฉพาะ `.env.local`
- `npm run verify:workspaces` -> 112 routes; boundary 666 files; active refs 731 files passed
- `node scripts/verify-smoke-signals.mjs` -> SIGINT 130, SIGTERM 143, port released
- `npm run smoke:routes` -> `/` 307, `/admin/user/list` 200, `/register` 404
- candidate snapshot `npm ci && npm run build && npm run verify:workspaces` -> env-free buildและ route identity passed
- browser parity -> 6 observations passed; additional failed assets, broken images,
  console errors และ overflow regressionsเท่ากับ 0; body/path/title/widthตรง 6/6
- Docker image `sha256:a1668ec31bfba9b49d92e3f7ada1f578e49f0a784e7e6992dc0cf475cc48a3fb`
  -> buildผ่าน; container healthy, user `nextjs` UID 1001, command `node server.js`,
  routes 307/200/404; exact test container/tagลบแล้ว
- `GIT_INDEX_FILE=/tmp/pol-admin-root-candidate.SOzTWO/index bash .ai/bin/check-secrets.sh --all`
  -> candidate tracked-tree secret scan passed
- `for guard_test in .claude/hooks/tests/*.test.sh; do bash "$guard_test"; done`
  -> suites 7/116/19/80/27/11 passed, 0 failed
- all-spec `scripts/spec-trace.sh <feature>` loop -> active 192 criteriaและทุก REQ-based spec passed
- moved blob check -> 743 unchanged blobs, 0 mismatches
- accepted lock baseline check -> root changed, exact two records removed, retained 801,
  drift 0
- previous-spec fingerprint -> 4 files,
  `cbc5ddfa0789c253833558ee4b833b5ff9d368f87bbc1b3515ca6b07e40303a1`, unchanged
- local-origin repro -> generated dev route manifestเคยใช้ deprecated port 5100 ทั้ง
  3 rewrites; หลัง exact env correctionและ dev reload rewrites 3/3 ใช้
  `https://localhost:5001`, deprecated compiled files 0, replacement compiled files 5

## Deviations

- npm `11.12.1` native lock-only/prune คง absent `apps/admin` record เป็น
  `extraneous`; ลบ exact orphan recordแล้ว deep-compare retained recordsทุกตัว.
- Exact active-reference gateครอบ CI/Docker จึงแก้ stale Task 3 referencesใน Task 2
  all-in-one batchก่อน container verification.
- Browser exact DOM hashesต่าง 6/6 และ exact screenshot hashesตรง 3/6; ไม่ใช้สองค่า
  เป็น acceptance gate. Required measuresตาม REQ-9.13 ถึง REQ-9.16 ผ่านทั้งหมด;
  raw hashesอยู่ใน `browser-acceptance.json`. ไม่มีการเดาสาเหตุ.

## Known Issues

- `npm ci` รายงาน 8 vulnerabilities รวม dev dependencies; production-only audit
  รายงาน 0 และผ่าน REQ-9.3.
- Existing user-owned Next dev serverยังรันบน port 3001 และ `.next` อยู่ใน dev layout.
  `npm run verify:workspaces` ต้องมี production `.next/server/app-paths-manifest.json`;
  จึงต้องหยุด dev serverและรัน `npm run build` ก่อน verifierรอบใหม่.
- ไม่มี blocking issue.

## Next Recommended Agent

`code-reviewer` หรือ human reviewer เพื่อตรวจ unstaged diff ก่อนอนุญาต commit/PR.

## Next Steps

1. อ่าน `requirements.md`, `design.md`, `tasks.md`, `handoff.md` แล้วรัน
   `SDD_CODE_DIR=src scripts/spec-state.sh restore-root-app-layout`.
2. Review unstaged candidate โดยคง root `.env.local` และ certificates เป็น opaque.
3. เมื่อ review ผ่านและ user สั่ง ship ให้ใช้ PR workflow; ห้าม push ตรง `develop`.
