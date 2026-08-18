# Implementation Tasks: Remove Merchant Workspace

> Status: approved 2026-08-17

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass; decompose micro-steps only during execution.

- [x] 1. ย้าย Merchant workspace แบบกู้คืนได้ — ตรวจ pinned baseline และ sibling handoff, สร้าง tracked-only Admin route baseline, atomic rename `apps/merchant` ไป unique Trash destination และพิสูจน์ 749 tracked blobs โดยไม่ stage
     Satisfies: REQ-1 (all criteria), REQ-6.18-REQ-6.19, REQ-7.11, REQ-7.15.
     Verify: Git/Node preflightผ่าน, baseline Admin buildผ่าน, sourceหาย, indexว่าง, unstaged deletion 749 paths และ Trash blob match 749/749.
     Evidence:
       - test: `git archive 79644df1bfa4b9ad9149fdeecedc63cbafda76d6 | tar -xf - -C /tmp/pol-admin-remove-merchant-baseline.2wYINv` แล้วรัน npm `11.12.1` `ci` + `run build:admin` ด้วย Node `22.19.0` -> buildผ่าน, normalized routes 112, SHA-256 `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216`
       - test: `/Users/king_developer/.nvm/versions/node/v22.19.0/bin/node /tmp/pol-admin-remove-merchant-once.mjs` -> atomic renameผ่าน, source absent, deletions 749, Trash blobs 749/749, ignored contentไม่ถูกอ่าน, indexไม่เปลี่ยน
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run typecheck && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js test` ด้วย Node `22.19.0` -> typecheck 3 workspacesผ่าน; verifier 15, Admin 209, Shared 26 testsผ่าน
       - viewports: n/a — repository cleanup, UI sourceไม่เปลี่ยน
       - deviations: none

- [x] 2. เปลี่ยน root เป็น Admin-only workspace graph — ใช้ explicit retained workspaces, ลบ Merchant scripts, regenerate lockfileด้วย npm `11.12.1` และเพิ่ม topology guardโดยห้าม retained dependency drift
     Satisfies: REQ-2 (all criteria), REQ-3.1-REQ-3.11.
     Depends on: 1.
     Verify: lockfile delta acceptanceผ่าน, `npm ci`ผ่าน, local workspacesมีเฉพาะ `@pol/admin`, `@pol/ui`, `@pol/shared` และ root test/lint/typecheck commandsยัง target retained graph.
     Evidence:
       - test: `/Users/king_developer/.nvm/versions/node/v22.19.0/bin/node /tmp/pol-admin-lock-delta.mjs` -> package keys 806→804, removedเฉพาะ `apps/merchant` และ `node_modules/@pol/merchant`, added 0, retained `version/resolved/integrity` drift 0
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js ci && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js query .workspace --json` ด้วย Node `22.19.0` + npm `11.12.1` -> installผ่าน; local workspacesคือ `@pol/admin,@pol/shared,@pol/ui`
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js test && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run lint && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run typecheck` -> verifier 17, Admin 209, Shared 26 testsผ่าน; lint/typecheck 3 retained workspacesผ่าน
       - viewports: n/a — tooling logic only
       - deviations: npm `11.12.1` คง removed workspace stanzaเป็น `extraneous`; ลบเฉพาะ `apps/merchant` topology stanzaแล้ว rerun native lock regeneration, ไม่แก้ dependency nodeและ retained fieldไม่ drift

- [x] 3. ทำ workspace verifier เป็น Admin-only — ลบ route parity API, ตรวจ required/forbidden Admin routes, ป้องกัน importไป removed Merchant path และคง package-to-app/test-policy guardsพร้อม unit tests
     Satisfies: REQ-4.1-REQ-4.9, REQ-4.17-REQ-4.18.
     Depends on: 2.
     Verify: `node --test scripts/lib/workspace-verification.test.mjs`, `npm run build:admin` และ `npm run verify:workspaces` ผ่าน.
     Evidence:
       - test: `node --test scripts/lib/workspace-verification.test.mjs` -> 15 passed, 0 failed; ครอบ Admin routes, invalid manifest, removed Merchant imports, package-to-Admin importsและ test policy
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run build:admin && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run verify:workspaces` ด้วย Node `22.19.0` -> Admin build 113 page entries; verifierผ่าน 112 normalized routesและ scan 670 retained workspace files
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run typecheck && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js test` -> typecheck 3 workspacesผ่าน; verifier 15, Admin 209, Shared 26 testsผ่าน
       - viewports: n/a — verification tooling only, UI sourceไม่เปลี่ยน
       - deviations: none

- [x] 4. ทำ runtime automation เป็น Admin-only — ลด smoke/signal cleanupเหลือ managed Admin port `3001`, ตัด Merchant build/COPYจาก CI และ Docker แล้วพิสูจน์ non-root standalone runtimeกับ healthcheckเดิม
     Satisfies: REQ-3.12-REQ-3.14, REQ-4.10-REQ-4.16, REQ-5 (all criteria).
     Depends on: 2, 3.
     Verify: signal verifier, `npm run smoke:routes`, CI workflow assertions, Docker build และ local container user/port/route/health probes ผ่านโดยไม่แตะ existing process owner.
     Evidence:
       - test: `/Users/king_developer/.nvm/versions/node/v22.19.0/bin/node /tmp/pol-admin-smoke-port-owner.mjs` -> SIGINT 130, SIGTERM 143, port 3001 released; `/` 307, `/admin/user/list` 200, `/register` 404; ownerที่ port 3002ยัง listening
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js audit --omit=dev --audit-level=high` ด้วย Node `22.19.0` + npm `11.12.1` -> found 0 vulnerabilities
       - test: `docker build --tag pol-admin:remove-merchant-79644df1 .` และ run container `pol-admin-remove-merchant-79644df1` -> image `sha256:f908fccadd763b237da87b3007896d3026de65ebc076c72628ae931d61860e52`, health `healthy`, user `nextjs`, UID 1001, root 307→`/dashboard`, Admin user 200, register 404
       - test: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml")'` และ `node --test scripts/lib/workspace-verification.test.mjs` -> CI YAML parseผ่าน; 18 testsผ่านรวม CI/Docker Admin-only assertions
       - test: `node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js test && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run lint && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run typecheck && node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js run verify:workspaces` -> verifier 18, Admin 209, Shared 26 testsผ่าน; lint/typecheck/verifierผ่าน
       - viewports: n/a — no UI source change; runtime verified by production HTTP and container probes
       - deviations: none; test containerและ image tagถูกลบหลังบันทึก identifiers

- [x] 5. ประกาศ canonical ownership ใน current docs — อธิบาย retained topology, ชี้ Merchant frontendไป `pol-merchant`, ลบ local Merchant setup/deploy guidance และคง Admin Merchant-managementกับ historical records
     Satisfies: REQ-6.1-REQ-6.17.
     Depends on: 2, 4.
     Verify: scoped operational stale-reference scanว่าง, current docs diffตรง ownershipใหม่ และ historical specs/retrospectivesไม่มี diff.
     Evidence:
       - test: scoped `rg` scan บน root manifests/config, CI, Docker, runtime smoke และ current docs -> active forbidden refs 0; canonical Merchant URL อยู่ครบ current docs 5/5
       - test: `git diff --name-only -- .claude/specs retrospectives` โดย exclude active spec -> historical spec/retro diffs 0; `git diff --check` ผ่าน
       - test: `npm test && npm run typecheck` ด้วย Node `22.19.0` + npm `11.12.1` -> verifier 18, Admin 209, Shared 26 testsผ่าน; typecheck 3 retained workspacesผ่าน
       - viewports: n/a — documentation ownership change; UI sourceไม่เปลี่ยน
       - deviations: verifier source/test คง forbidden literalsเฉพาะ negative-enforcement guardsตาม REQ-4.6-REQ-4.7; active runtime scan exclude guardsและ guard testsผ่าน

- [x] 6. รัน integrated preservation acceptance และส่งมอบ — เทียบ retained Git blobsกับ baseline, build candidateแยกจาก archive, compare normalized routes, รันทุก quality/security/container gate และบันทึก Evidence, recovery path, pending sibling remote/PRกับ handoff
     Satisfies: REQ-6.20, REQ-7 (all criteria), REQ-8 (all criteria).
     Depends on: 1, 2, 3, 4, 5.
     Verify: full command matrix, preserved-tree diff, route delta, secret/guard/spec-trace/stale scansผ่านทั้งหมด; `git diff --cached`ว่างและไม่มี commit, pushหรือPR.
     Evidence:
       - test: `git diff --name-only 79644df1... -- apps/admin packages/ui packages/shared` -> 760 tracked paths preserved, changed paths 0; source absent, Trash presentบน device `16777231`, staged paths 0
       - test: Node `22.19.0` + npm `11.12.1` รัน `npm ci` และ `npm audit --omit=dev --audit-level=high` -> 714 packages installed; production vulnerabilities 0; workspaces exact `@pol/admin,@pol/shared,@pol/ui`
       - test: `npm test && npm run lint && npm run typecheck && npm run build:admin && npm run verify:workspaces` -> verifier 18, Admin 209, Shared 26ผ่าน; lint/typecheckผ่าน; build 113 page entries; verifier 112 routes/670 files
       - test: `/tmp/pol-admin-route-compare.mjs` เทียบ tracked-only baseline buildกับ fresh candidate build -> 112/112, missing 0, extra 0, SHA-256 `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216`
       - test: `npm run smoke:routes` -> Admin `/` 307→`/dashboard`, `/admin/user/list` 200, `/register` 404; managed port 3001 cleanupผ่าน
       - test: full-tree `check-secrets.sh --all`, guard loop `.claude/hooks/tests/*.test.sh` และ all-spec trace loop -> secret scanผ่าน, 6 guard suitesผ่าน, 13 specsผ่าน; active spec 137 criteria covered
       - test: scoped operational stale scan -> active forbidden refs 0; historical spec/retro diff 0; 13 verifier negative-guard refsมี unit coverage; focused/skipped test scanผ่านใน verifier
       - test: Docker image `sha256:f908fccadd763b237da87b3007896d3026de65ebc076c72628ae931d61860e52` -> healthy, user `nextjs` UID 1001, routes 307/200/404; exact test containerและ tagถูกลบหลังตรวจ
       - test: read-only sibling/remote check -> local `codex/merchant-workspace-reset` HEAD `ae550fa602593b75c77cbc817cb456c86f44311c`; remote branch 0, PR `[]`; remote CI/PRยัง pending
       - viewports: n/a — retained UI trees byte-for-byte; production HTTP และ container probesใช้แทน browser verificationตาม acceptance
       - deviations: initial guard/spec loop wrapperชน zsh read-only variable `status` ก่อน testเริ่ม; rerunด้วย task-specific variablesผ่านครบ. `npm ci` รายงาน dev-only vulnerabilities 8 แต่ approved production auditพบ 0

## Suggested execution batches

Feature coupled: removal state, workspace graph, verifier, build artifacts และ final evidenceพึ่งกัน.

- แนะนำ sessionเดียว: `/spec-implement all`
- CLI equivalent: `scripts/pane-loop.sh remove-merchant-workspace all-in-one`
- ไม่มี `Batch:` group เพราะทุก taskใหญ่หรือมี dependencyจริง

## Implementation guardrails

- Task 1 failที่ preflight, renameหรือpost-move integrityเมื่อใด ให้หยุดก่อน root/config/docs edit
- ทุก completed taskต้อง flip checkboxพร้อม `Evidence:` จาก commandและผลที่รันจริงใน editเดียวกัน
- ห้ามแก้ `apps/admin/**`, `packages/ui/**`, `packages/shared/**`, sibling repo, backend, databaseหรือexternal deployment
- ห้าม stage, commit, pushหรือเปิด PR
