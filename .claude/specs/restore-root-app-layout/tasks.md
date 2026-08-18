# Implementation Tasks: Restore Root App Layout

> Status: approved 2026-08-18

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass; decompose micro-steps only during execution.

- [x] 1. ย้าย Admin สู่ root แบบกู้คืนได้และทำ root app ให้ code-green — จับ composite fingerprint,
  journal ทุก atomic rename, รักษา blobs แล้วทำ root install/test/lint/typecheck/build ผ่านโดย index ว่าง
     Satisfies: REQ-1 (all criteria), REQ-2.1-REQ-2.11, REQ-2.13, REQ-2.21, REQ-2.23,
     REQ-3.1-REQ-3.18, REQ-3.21-REQ-3.27, REQ-4.1-REQ-4.12, REQ-4.14-REQ-4.18, REQ-8 (all criteria).
     Verify: migration preflight/journal/rollback probes และ Git blob/lock delta checks ผ่าน.
     Verify: `npm ci`, `npm test`, `npm run lint` ผ่าน.
     Verify: `npm run typecheck`, `npm run build` ผ่าน; Git index ว่าง.
     Evidence:
       - test: migration journal -> 13 planned root/Admin moves completedด้วย atomic same-device rename; `apps` absent; stale root `.next`, `tsconfig.tsbuildinfo`, Admin manifest/residual และ generated root `node_modules` มี recovery pathsใน Trash; certificateตรวจเฉพาะ directory endpointและไม่อ่าน content
       - test: moved-tree Git blob probe -> 743 unchanged source/public/config blobsเทียบ `HEAD` ตรงทั้งหมด; intentional editsจำกัด Tailwind path, root config boundary และ moved test path; root `.env.local` ยังเป็น regular non-symlinkและไม่อ่าน content; Git indexว่าง
       - test: npm `11.12.1` lock acceptance -> changedเฉพาะ `packages[root]`, removed `packages[apps/admin]` กับ `packages[node_modules/@pol/admin]`, retained 801 records deep-equal; `npm ci` ด้วย Node `22.19.0` ผ่านและ local linksเหลือ `@pol/ui`, `@pol/shared`
       - test: `npm test`, `npm run lint`, `npm run typecheck` -> verifier 18, root Vitest 209, Shared 26 testsผ่าน; root app + retained workspaces lint/typecheckผ่าน
       - test: `npm run build` -> root standalone buildผ่าน, 113 page entries; normalized routes 112 และ SHA-256 `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216` ตรง baseline; `.next/standalone/server.js` present; buildรายงาน activationเฉพาะ path `.env.local`
       - viewports: n/a — Task 1 เป็น filesystem/config migration; browser baseline/candidate parityอยู่ Task 4
       - deviations: npm `11.12.1` lock-only/prune ลบ obsolete linkแต่คง absent `apps/admin` stanzaเป็น `extraneous`; ลบ exact orphan stanzaหลัง native pruneแล้ว deep-compare retained recordsทุกตัว; ไม่แก้ dependency node/version

- [x] 2. ทำ repository enforcement และ current references เป็น root-native — อัปเดต verifier,
  route hash, signal-safe smoke, exact stale scan และ docs จน topology/routes/runtime ผ่าน
     Satisfies: REQ-2.12, REQ-2.22, REQ-2.24, REQ-3.19-REQ-3.20,
     REQ-5 (all criteria), REQ-7 (all criteria).
     Depends on: 1.
     Verify: `node --test scripts/lib/workspace-verification.test.mjs`, `npm run verify:workspaces` ผ่าน.
     Verify: `node scripts/verify-smoke-signals.mjs`, `npm run smoke:routes` และ exact active-reference scan ผ่าน.
     Evidence:
       - test: `node --test scripts/lib/workspace-verification.test.mjs` ด้วย Node `22.19.0` -> 19 passed, 0 failed; ครอบ exact package topology, removed app paths/imports, route fingerprint, active-reference fixture exception, CI/Docker root contracts, test policyและ process cleanup
       - test: `npm run verify:workspaces` -> root Admin 112 normalized routesและ approved SHA-256 `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216`; boundary/test-policy scan 666 code files; exact active-reference scan 731 filesผ่านโดย exceptionจำกัด marked fixtureใน verifier test
       - test: `node scripts/verify-smoke-signals.mjs` -> SIGINT exit 130, SIGTERM exit 143, managed port 3001 releasedทั้งสองรอบ
       - test: `npm run smoke:routes` -> root `/` 307, `/admin/user/list` 200, `/register` 404; scriptเรียก root `start` โดยตรงและ cleanup portผ่าน
       - test: current operational docs/root configs scan -> forbidden active refsเหลือเฉพาะ 8 marked negative fixtures; README, dev setup, architecture, project contextและ Next.js profileบอก root app, direct commands, Admin port 3001 และ canonical `https://github.com/metrodiesign/pol-merchant.git`
       - test: `npm test`, `npm run lint`, `npm run typecheck` -> verifier 19, root Vitest 209, Shared 26 testsผ่าน; root app + retained package lint/typecheckผ่าน
       - viewports: n/a — enforcement/runtime/docs change; browser parityอยู่ Task 4
       - deviations: exact active-reference scopeรวม CI/Docker จึงเปลี่ยน stale path/command refsของ Task 3 ใน all-in-one batchนี้ก่อน container verification; runtime/container acceptanceยังไม่ถูก claimใน Task 2

- [x] 3. ย้าย CI และ container สู่ root runtime — ใช้ direct root gates, exact manifest set,
  root standalone artifacts และ non-root port/health/route contract โดย Docker context ไม่มี env files
     Satisfies: REQ-4.13, REQ-6 (all criteria).
     Depends on: 1, 2.
     Verify: CI YAML parse, root audit/build/signal/smoke gates และ Docker build ผ่าน.
     Verify: container user/UID/command/health พร้อม route probes `307`/`200`/`404` ผ่าน.
     Evidence:
       - test: CI YAML parseด้วย Rubyผ่าน; verifier unit 20 passed ครอบ direct root build, exact Docker manifest set, standalone artifacts, non-root command และ exact `.dockerignore` env patterns
       - test: `npm audit --omit=dev` -> 0 vulnerabilities; root production buildผ่าน 113 page entries; signal verificationได้ SIGINT 130/SIGTERM 143; smoke routesได้ `/` 307, `/admin/user/list` 200, `/register` 404
       - test: Docker build `pol-admin:restore-root-layout-79644df1-01a00fbf` -> image `sha256:a1668ec31bfba9b49d92e3f7ada1f578e49f0a784e7e6992dc0cf475cc48a3fb`, context 8.43 MB, root standalone copyและ `node server.js` สำเร็จ
       - test: container `a1bc1af8809a625fa2181ae9a6fd3f388b6cb59ab81ea6e1d4a2b2b2a7272976` healthy; runtime user `nextjs` UID 1001, port 3001, health contractถูกต้อง; route probesได้ 307/200/404 แล้วหยุดและลบ exact test container/tag พร้อมยืนยัน portว่าง
       - test: post-container `npm test`, `npm run typecheck`, `npm run verify:workspaces` -> verifier 20, root Vitest 209, Shared 26 testsผ่าน; typecheckและ root topology 112 routesผ่าน
       - viewports: n/a — container acceptanceตรวจ HTTP/runtime contract; browser viewport parityอยู่ Task 4
       - deviations: none

- [x] 4. รัน integrated preservation acceptance และส่งมอบ — เทียบ env-free baseline/candidate,
  browser parity, full quality/security/container gates, recovery evidence และ handoff โดยไม่ทำ external Git action
     Satisfies: REQ-2.12, REQ-2.14-REQ-2.20, REQ-2.22, REQ-4.12, REQ-9 (all criteria).
     Depends on: 1, 2, 3.
     Verify: REQ-9 command matrix, route/browser parity และ working-tree active-env gates ผ่าน.
     Verify: Docker/runtime, secret/guard/spec-trace, stale scan และ composite fingerprint checks ผ่าน.
     Verify: `scripts/spec-trace.sh restore-root-app-layout` ผ่าน; index/HEAD คงเดิมและไม่มี commit/push/PR.
     Evidence:
       - test: pinned Node `22.19.0` / npm `11.12.1`; temporary Git-index candidate tree `d1122323bada919f0e8f59eaa8304c78437f810a` มี 989 paths, manifest SHA-256 `20eeff82821163103b4ff0b842bbe8eaabd2e6dfb2a35c0f991a1ac81c99c186`, ไม่มี `.env.local`/certificate และ real indexไม่เปลี่ยน; candidate `npm ci`, build 113 entries, verifier 112 routesผ่าน
       - test: browser/tool/tabเดียวกับ nested baselineเทียบ `/dashboard`, `/admin/user/list` ที่ 375/768/1440 -> 6/6 path/title/clientWidth/body-text/asset-countตรง; 29 assetsต่อ observation, additional failed assets 0, broken images 0, console errors 0, overflow regressions 0; viewport resetแล้ว; exact resultsอยู่ `browser-acceptance.json`
       - test: working-tree matrix -> `npm ci` ผ่าน; production audit 0; verifier 20 + root Vitest 209 + Shared 26 testsผ่าน; lint/typecheckผ่าน; build 113 entriesโดยรายงาน activationเฉพาะ path `.env.local`; workspace verifier 112 routes/666 code files/731 active files; signals 130/143 และ smoke 307/200/404 ผ่าน
       - test: same-session Docker acceptance -> image `sha256:a1668ec31bfba9b49d92e3f7ada1f578e49f0a784e7e6992dc0cf475cc48a3fb`; healthy non-root `nextjs` UID 1001, `node server.js`, routes 307/200/404; exact test container/tagลบแล้ว
       - test: final candidate tracked-tree secret scanผ่าน; guard suites 7/116/19/80/27/11 passed, 0 failed; all-spec traceผ่านรวม active 192 criteria; CI YAML/JSON parseและ candidate-index diff checkผ่าน
       - test: preservation -> 743 unchanged moved blobs, mismatches 0; accepted lock delta changed root/removed 2/retained 801 drift 0; prior spec 4-file SHA-256 `cbc5ddfa0789c253833558ee4b833b5ff9d368f87bbc1b3515ca6b07e40303a1` unchanged; recovery endpoints presentบน device `16777231`
       - test: final Git/runtime state -> real index empty, HEAD `79644df1bfa4b9ad9149fdeecedc63cbafda76d6`, `apps` absent, port 3001 free; ไม่มี commit, push หรือ PR
       - test: post-acceptance origin correctionตามคำสั่ง user -> root `.env.local` เปลี่ยน deprecated port 5100 origin exact 2 จุดเป็น `https://localhost:5001` โดยไม่ log ค่าอื่น; existing dev server reloadแล้ว, rewrite 3/3 ใช้ expected origin, deprecated compiled files 0 และ replacement compiled files 5
       - viewports: 375x900, 768x900, 1440x900 บนทั้ง `/dashboard` และ `/admin/user/list`; required regressions 0 ทุก viewport
       - deviations: exact DOM hashตรง 0/6 และ exact screenshot hashตรง 3/6 เป็น non-gating diagnostics; REQ-9.13-REQ-9.16 และเพิ่ม body-text equalityผ่านทั้งหมด, raw hashesถูกเก็บโดยไม่เดาสาเหตุ

## Suggested execution batches

Feature coupled: filesystem state, root manifests, verifier, build artifacts และ final evidence พึ่งกัน.

- แนะนำ session เดียว: `/spec-implement all`
- CLI equivalent: `scripts/pane-loop.sh restore-root-app-layout all-in-one`
- ไม่มี `Batch:` group เพราะทุก task ใหญ่หรือมี dependency จริง

## Implementation guardrails

- Task 1 fail ที่ preflight, journal, rename, rollback หรือ integrity check ให้หยุดก่อน task ถัดไป
- ห้ามอ่านหรือ log `.env.local` กับ certificate content; root environment activation รายงานเฉพาะ path
- รักษา previous-cleanup fingerprint โดยตัด active spec path ตาม approved composite baseline
- ห้าม stage, commit, push, เปิด PR หรือแก้ sibling `pol-merchant`
- ทุก completed task ต้อง flip checkbox พร้อม plain indented `Evidence:` และ `viewports:` ใน edit เดียวกัน
