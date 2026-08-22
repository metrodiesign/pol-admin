# Implementation Tasks: PSP Connections

> Status: approved 2026-08-19

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. Backend D8 safety contract — เพิ่ม synchronous pending flag และ credential replay ordering พร้อม tests; done เมื่อ List/Info คืน flagถูกต้องและ committed retry replayก่อน stale-versionโดยไม่ข้าม access/resource/intent validation.
     Satisfies: REQ-11.18-11.19, REQ-14.14.
     Verify: `dotnet test ../pol-core/tests/Hosts.Tests/Hosts.Tests.csproj`.
     Evidence: backend gateเขียวครบ
       - targeted: `dotnet test tests/Hosts.Tests/Hosts.Tests.csproj --filter "FullyQualifiedName~AdminPspCredentialChangeTests|FullyQualifiedName~AdminTask4ContractTests.Psp_response_contract" --no-restore` -> ผ่าน 4/4
       - full: `dotnet test ../pol-core/tests/Hosts.Tests/Hosts.Tests.csproj` -> ผ่าน 637/637
       - contract: `HasPendingCredentialChange` projectจาก `PendingApprovalId is not null`; committed retryคืน approval/candidateเดิมก่อน stale-version และสร้าง vault candidate/outbox/operationครั้งเดียว
       - validation: access denied, missing resource และ keyเดิมกับ payloadต่างกันยังถูก rejectก่อน/ระหว่าง replayตาม contract
       - viewports: n/a — backend-only task
       - deviations: full gateรอบแรกแดงจาก concurrent Microsoft identity tests; userอนุมัติขยาย scope แล้วแก้ shared ProblemDetails correlation normalizationกับ test-only OIDC metadata fixtureจน suiteผ่าน 20/20 และ full gateเขียว

- [x] 2. Access, contract และ verification foundation — ทำ auth five-state, permission-filtered navigation, route/UUID gates, typed PSP API, merchant/approval loaders, safe errors, idempotency helpers และ deterministic browser contract server; done เมื่อ request contractถูกต้องและ protected viewไม่ยิง APIก่อน gateผ่าน.
     Satisfies: REQ-1.1-1.5, REQ-1.12-1.13, REQ-2.1-2.6, REQ-2.14-2.16,
     REQ-3.1-3.4, REQ-11.1-11.17, REQ-14.1-14.2, REQ-14.4-14.7, REQ-14.13.
     Depends on: 1.
     Verify: `npm run typecheck`; `npm exec vitest -- run src/lib/control/psp.test.ts src/lib/api/control/psp.integration.test.ts src/lib/api/admin/auth.test.ts src/components/layout/nav-config.test.ts`; `node --check scripts/psp-contract-server.mjs`.
     Evidence: foundation gateเขียวครบ
       - typecheck: `npm run typecheck` -> ผ่าน root และ 2 workspaces
       - targeted: exact Verify Vitest command -> ผ่าน 63/63
       - contract server: `node --check scripts/psp-contract-server.mjs` -> exit 0
       - contract: loopback HTTP testsตรวจ List/Info/Create/Update/Test/Credential, merchant/approval pagination, raw ETag, CSRF, JSON, If-Match, Idempotency-Key และ safe error matrix
       - access: auth bootstrapแยก 5 states; nav filterใช้ permissionจาก `/admin/me`; `PspRouteGate`ไม่ mount childก่อน auth/permissionผ่าน; invalid Info/Edit UUIDเรียก generic not-foundก่อน client view
       - security: ไม่มี PSP plaintext masking helper, error parserอ่านเฉพาะ status/top-levelหรือ `extensions.code`, ไม่มี `detail`/request bodyใน error
       - viewports: deferredตาม task — foundationไม่มี final feature layout; browser matrixอยู่ Tasks 3-8
       - deviations: compatibility PSP fixtureและ mock-era componentsคงชั่วคราวให้ Task 2 typecheck; Task 3แทน List path และ Task 8ลบทั้งหมดตาม spec

- [x] 3. PSP List end-to-end — แทน mockด้วย backend pagination, all-page merchant/approval joins, race-safe filters, desktop table/mobile cards และ fail-closed states; done เมื่อ Listค้นหา/กรอง/แบ่งหน้าและแสดงสามสถานะถูกต้องทุก viewport.
     Satisfies: REQ-1.6-1.7, REQ-2.7-2.13, REQ-3.5-3.10, REQ-3.21, REQ-4,
     REQ-5.5-5.7, REQ-13.1, REQ-13.3-13.4, REQ-13.6-13.11.
     Depends on: 2.
     Verify: `npm run typecheck`; browser contract scenarios `happy`, `catalog-partial` และ approval failure ที่ 375, 768, 1440 px.
     Evidence: List gateเขียวครบ
       - typecheck/build: `npm run typecheck` และ production `ADMIN_API_ORIGIN=http://127.0.0.1:5100 npm run build` -> exit 0
       - happy: 375/768 ใช้ 2 cards, 1440 ใช้ table; `clientWidth` ตรงเป้า, `scrollWidth === clientWidth`, action `ดูข้อมูล` ครบ; search `22222222` เหลือ Merchant Beta 1 rowและ React interactionทำงาน
       - catalog-partial: 375/768/1440 แสดง warning + Retry, Merchant filter/Create disabled, unresolved Merchantแสดง UUID fallback, ไม่มี horizontal overflow
       - approval failure: 375/768/1440 แสดง `ตรวจสถานะอนุมัติไม่ได้` 2 rows, ไม่แสดง clear/pendingเท็จ, Retryมองเห็น, ไม่มี horizontal overflow
       - contract: List effect abort requestเก่าและใช้ generation guard; search/filter reset page 1; backend metadataคุม pagination; merchant/approval loaderอ่าน `limit=100` จนครบ totalและ fail closedเมื่อ metadata/pageไม่สมบูรณ์
       - security: Listไม่มี mock import, secret, inline edit, Test หรือ destructive action; approval positive sourceชนะแต่ lookup failureไม่ infer clear
       - console: production browser scenariosไม่มี console error/warningหรือ hydration error
       - deviations: none

- [x] 4. Info และ Test active credential end-to-end — สร้าง read-only detail, raw ETag resource, exact pending lookup, authoritative action gates และ Test success/502 refetch; done เมื่อ Infoไม่เผย secretและทุก unavailable/pending/conflict stateปิด mutationถูกต้อง.
     Satisfies: REQ-1.7, REQ-1.9, REQ-3.4, REQ-3.17-3.22, REQ-5.1-5.2,
     REQ-5.5-5.6, REQ-6, REQ-10.
     Depends on: 1, 2.
     Verify: `npm run typecheck`; browser contract scenarios `happy`, `approval-lag`, `missing-etag` และ `test-failed` ที่ 375, 768, 1440 px.
     Evidence: Info/Test gateเขียวครบ
       - typecheck/tests/build: `npm run typecheck`; PSP domain + HTTP integration Vitestผ่าน 45/45; production build exit 0
       - happy: Testสำเร็จแล้ว resourceอัปเดตเป็น Version 8; Edit/Test/Credentialเปิดตามสิทธิ์; 375/768/1440 ไม่มี overflowหรือ console error/warning
       - approval-lag: exact pending lookupปิด Edit/Test/Credentialทุก viewport แม้ resource flagมาช้ากว่า approval; masked active credentialยังแสดงได้
       - missing-etag: mutationทั้งสามปิด, แสดง ETag recovery noticeและ reload actionทุก viewport
       - test-failed: `502 psp_test_failed` trigger refetch; persisted Health/ผลทดสอบเป็น Failed/ล้มเหลวและ Version 8ทุก viewport
       - security: renderเฉพาะ config allowlistและ backend `maskedSecrets`; ไม่พบ `futureField` หรือ plaintext secret; action gateรวม permission, capability, raw ETag, pending flag และ approval availability
       - deviations: credential dialog shellถูกเพิ่มล่วงหน้าสำหรับ actionจาก Info; lifecycleเต็มและ unknown-outcome reconciliationยังอยู่ Task 7

- [x] 5. Create connection end-to-end — เพิ่ม route, shared header/form, provider validation, complete merchant selector, secure credential lifecycle, idempotent submit และ safe conflict handling; done เมื่อ 2C2P/Omise payloadถูก contractและ successเปิด Infoโดยไม่มี sensitive stateค้าง.
     Satisfies: REQ-1.2, REQ-1.5-1.6, REQ-1.8, REQ-1.11, REQ-2.4-2.5,
     REQ-2.7, REQ-2.11-2.13, REQ-2.16, REQ-3.1-3.3, REQ-3.11-3.16,
     REQ-5.1-5.6, REQ-5.8, REQ-7, REQ-12.1-12.2, REQ-12.4-12.8,
     REQ-12.12-12.16, REQ-13.1-13.4, REQ-13.7-13.9, REQ-13.11.
     Depends on: 2.
     Verify: `npm run typecheck`; browser contract scenarios `happy`, validation failure และ duplicate `409` ที่ 375, 768, 1440 px.
     Evidence: Create gateเขียวครบ
       - static gate: `npm run typecheck`, `npm run lint`, production buildผ่าน; PSP domain + HTTP integration Vitestผ่าน 45/45
       - contract: Create integrationยืนยัน JSON/CSRF/Idempotency-Key, ไม่มี If-Match, `config:null`, `secrets.secretKey` และ top-level `pspMerchantId`; success routeใช้ IDจาก backend
       - happy: header previewใช้ placeholder/default status; provider switch 2C2P -> Omise -> 2C2P reset credential/method, Omiseเหลือ `card`; `201` เปิด Info IDใหม่และไม่พบค่าทดสอบ sensitiveใน DOM/URL/log
       - validation: local empty submitอยู่หน้าเดิมพร้อม field/form errors; backend `400 validation_failed` แสดง safe errorโดยไม่ echo inputทุก viewport
       - duplicate: code-less `409` แสดง `Merchant มี connection สำหรับ PSP นี้แล้ว` และอยู่หน้า Createทุก viewport
       - responsive/a11y: 375/768/1440 มี `scrollWidth === clientWidth`; dirty cancel dialogทำงานและคืน focusเข้า trigger; passwordใช้ `autocomplete=new-password`, `spellcheck=false`; consoleสะอาด
       - deviations: browser plugin policyไม่อนุญาตอ่าน browser storageโดยตรง; ตรวจ absenceด้วย source/static contractร่วมกับ DOM/URL/logแทน

- [x] 6. Edit connection end-to-end — เพิ่ม latest-resource form, immutable config round-trip, no-credential Update, dirty guard, disable confirmation และ stale conflict recovery; done เมื่อ pending/missing ETagไม่เปิด formและ successful Updateกลับ Infoโดยไม่ทับข้อมูลใหม่.
     Satisfies: REQ-1.4-1.5, REQ-1.9-1.11, REQ-3.11-3.16, REQ-3.22,
     REQ-5.1-5.6, REQ-8, REQ-12.8-12.11, REQ-13.1-13.4, REQ-13.7-13.9,
     REQ-13.11.
     Depends on: 1, 2, 4.
     Verify: `npm run typecheck`; browser contract scenarios `happy`, pending, `missing-etag` และ stale `conflict` ที่ 375, 768, 1440 px.
     Evidence: Edit gateเขียวครบ
       - static gate: `npm run typecheck`, `npm run lint`, `node --check scripts/psp-contract-server.mjs` และ production buildผ่าน
       - contract: Update integrationยืนยัน raw If-Match/Idempotency-Key/CSRF, bodyมีเฉพาะ merchantId, enabledMethods, immutable raw config, isEnabled และไม่มี credential fields
       - happy: pristine formปิด Save; Merchant/PSP/config read-only, ไม่มี password inputหรือ unknown config; เปลี่ยน methods + Enabledเปิด Save, true -> falseบังคับ confirmation, `200`กลับ Infoพร้อม card-only/ปิดใช้งาน/Version 8
       - pending: `approval-lag` แสดงรออนุมัติและไม่ mount editable formทุก viewport
       - missing-etag: แสดง technical block + reload, ไม่ mount editable formทุก viewport
       - conflict: `409 state_conflict`คงหน้าและ dirty state, ไม่ overwrite, แสดงโหลดเวอร์ชันล่าสุด; reload remount baselineล่าสุดและปิด Save
       - responsive/a11y: happy/pending/missing-etag/conflict ที่ 375/768/1440 ไม่มี overflow; Edit dirty guardและ disable dialogทำงาน; consoleสะอาด
       - deviations: none

- [x] 7. Credential-change maker-checker end-to-end — เพิ่ม accessible dialogจาก Info/pristine Edit, provider-specific write-only fields, pending transition และ unknown-outcome reconciliation; done เมื่อ cancel/success/unmountล้าง sensitive stateและ retryใช้ key/ETagเดิมเฉพาะกรณีปลอดภัย.
     Satisfies: REQ-3.10, REQ-3.22, REQ-6.8-6.10, REQ-9, REQ-11.2-11.17,
     REQ-12, REQ-13.1-13.5, REQ-13.11.
     Depends on: 1, 2, 4, 6.
     Verify: `npm run typecheck`; browser contract scenarios `happy`, `approval-lag`, code-less `409` และ network outcomeไม่แน่ชัด ที่ 375, 768, 1440 px.
     Evidence: credential maker-checker gateเขียวครบ
       - static gate: `npm run typecheck`, `npm run lint`, production buildผ่าน; PSP domain + HTTP integration Vitestผ่าน 47/47
       - provider/security: 2C2P dialogมี password fields `2C2P Merchant ID` + `secretKey`; Omiseมีเฉพาะ `secretKey`; ทุก fieldใช้ `autocomplete=new-password`, `spellcheck=false`, ไม่ prefill/reveal/client-mask
       - lifecycle: dialogจาก Infoและ pristine Edit; dirty Editปิด actionพร้อมเหตุผล; cancel unmountแล้วเปิดใหม่ submitได้ required errorsทั้งสองจึงยืนยัน sensitive stateถูกล้าง; focusเข้า passwordแรกและคืน triggerเมื่อปิด
       - happy `202`: dialogปิด, Approval pendingทันที, refetchเป็น Version 8, Edit/Test/credential disabled, masked active credentialเดิม; Edit flowใช้ non-sensitive markerแล้วลบจาก URLเมื่อ authoritative pendingยืนยัน
       - code-less `409`: dialogปิด, sensitive stateถูกล้าง, refetch resource/approvalและแสดง current-state noticeโดยไม่ echo inputทุก viewport
       - unknown outcome: หลัง socket lossปิด submitและบังคับตรวจล่าสุด; ETagเดิม + authoritative clearเท่านั้นจึงเปิด `ส่งคำขอเดิมอีกครั้ง`; contract serverยอมรับครั้งสองเฉพาะ Idempotency-Key/If-Matchเดิมแล้วคืน `202`
       - responsive/security: happy/pending/code-less 409/unknown ที่ 375/768/1440 ไม่มี overflowหรือ console error/warning; ไม่พบค่าทดสอบ sensitiveใน DOM/URL/log
       - deviations: browser plugin policyไม่อนุญาตอ่าน browser storageโดยตรง; source/static contractยืนยันไม่มี storage path

- [x] 8. Assemble, remove mock path และ full verification — เชื่อมทุก route/nav/action, ลบ PSP mock/stat cards/client masking, ปิด accessibility/responsive/security gaps และรัน full gate; done เมื่อทุก REQมี implementation anchor, browser matrixผ่าน และไม่มี mock fallbackหรือ sensitive dataรั่ว.
     Satisfies: REQ-1, REQ-2, REQ-3, REQ-5, REQ-11, REQ-12, REQ-13,
     REQ-14.3-14.13.
     Depends on: 1, 2, 3, 4, 5, 6, 7.
     Verify: `npm run typecheck`; `npm run lint`; `npm test`; `npm run build`; `npm exec vitest -- run src/lib/api/control/psp.integration.test.ts`; `dotnet test ../pol-core/tests/Hosts.Tests/Hosts.Tests.csproj`; `scripts/spec-trace.sh psp-connections`; browser verificationครบทุก page/scenario ที่ 375, 768, 1440 pxโดยไม่มี console/hydration errorหรือ sensitive dataใน URL/storage/log.
     Evidence: full assembly gateเขียวครบ
       - cleanup: ลบ `src/lib/mock/control/psp-connections.ts`, `src/components/control/psp/stat-cards.tsx` และ referenceใน mock contract test; `rg`ไม่พบ PSP mock/stat runtime path
       - frontend: `npm run typecheck`, `npm run lint`, `npm test`ผ่าน 303/303 และ production `npm run build`ผ่าน 115 routes
       - focused contract: `npm exec vitest -- run src/lib/api/control/psp.integration.test.ts`ผ่าน 16/16; `node --check scripts/psp-contract-server.mjs`ผ่าน
       - backend: `dotnet test ../pol-core/tests/Hosts.Tests/Hosts.Tests.csproj`ผ่าน 637/637 รวม Microsoft identity regression tests
       - trace/security: `scripts/spec-trace.sh psp-connections`ผ่าน 209/209พร้อม EARS lint; `.ai/bin/check-secrets.sh --all`และ `git diff --check`ทั้งสอง repoผ่าน
       - browser: cumulative scenario matrixจาก Tasks 3-7ผ่านที่ 375/768/1440; final production smoke List/Create/Info/Editผ่าน 12/12 combinationsด้วย exact client width, `scrollWidth === clientWidth`, semantic controlsครบ, ไม่มี console/hydration errorหรือ sensitive echoใน DOM/URL/log
       - review fixes: abort guardกัน stale merchant/approval result, resource-keyed remountกัน intentข้าม connection และ Testถูก disableหลัง `operation_in_progress`; post-review typecheck/lint/full tests/focused 47/47/buildผ่าน
       - review browser: `operation-in-progress` แสดงข้อความและ disable Test ที่ 375/768/1440โดยไม่มี overflowหรือ console error; final 4-page matrixยังผ่าน 12/12
       - sensitive storage: browser plugin policyไม่อนุญาตอ่าน storageโดยตรง; static scanยืนยัน PSP sourceไม่มี `localStorage`/`sessionStorage` path
       - deviations: none

## Suggested execution batches

Task 1 เป็น CORE backend invariantข้าม repository ควรรันใน focused sessionก่อน. Tasks 2-8 แชร์ types,
API client, hooks, components และ browser harnessแน่น ควรรันต่อใน sessionเดียวหลัง Task 1.

ไม่มี `Batch:` tag: ทุก taskเป็น vertical sliceขนาดใหญ่และมี dependencyจริง. ใช้
`/spec-implement 1` แล้ว `/spec-implement 2-8`, หรือ `/spec-implement all` หากต้องการ sessionเดียวทั้งหมด.
