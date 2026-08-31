# Implementation Tasks: ORG read-only adapter alignment

> Status: approved 2026-08-24

Task เดียวครอบ shared read contract, adapter bindings, regression tests และ production browser
verification เพราะทุกส่วนแชร์ contract และต้องพิสูจน์แปด GET operations แบบ end-to-end พร้อมกัน.

## Tasks

- [x] 1. Align ORG read adapters with pinned `pol-core` contract end-to-end — เพิ่ม
  `org-read-contract.ts` เป็น production owner เดียวของ wire validation, status mapping และ bounded
  pagination batch ละไม่เกิน 4 requests; bind existing division, level, office และ position list/detail
  exports เข้ากับ helper โดยคง signatures; เพิ่ม parameterized shared contract/failure matrix ที่ขับ
  adapters จริงและคง binding/write regression coverage ใน existing test files ทั้งสี่; done เมื่อ
  eight GET operations, atomic pagination, transport/401 behavior และ 12 production routes ผ่าน
  deterministic temporary stub ที่ viewports `375`, `768` และ `1440`.
     Scope: ห้ามแก้ ORG writes, AROLE, JSX, CSS, routes, navigation, labels, copy, fields, actions,
     states, interactions, dependencies, manifests, lockfiles หรือ `pol-core`; production consumers
     ต้องไม่เปลี่ยน และ temporary browser stub ต้องอยู่นอก repository.
     Satisfies: REQ-1.1, REQ-1.2, REQ-1.3, REQ-1.4, REQ-1.5, REQ-2.1, REQ-2.2,
     REQ-2.3, REQ-2.4, REQ-2.5, REQ-2.6, REQ-2.7, REQ-2.8, REQ-2.9, REQ-3.1,
     REQ-3.2, REQ-3.3, REQ-3.4, REQ-3.5, REQ-3.6, REQ-4.1, REQ-4.2, REQ-4.3,
     REQ-4.4, REQ-4.5, REQ-4.6, REQ-4.7, REQ-4.8, REQ-4.9, REQ-4.10, REQ-4.11,
     REQ-4.12.
     Verify: `npm exec vitest -- run src/lib/api/admin/org-read-contract.test.ts src/lib/api/admin/division.test.ts src/lib/api/admin/level.test.ts src/lib/api/admin/office.test.ts src/lib/api/admin/position.test.ts`; `npm run typecheck`; `npm test`; `npm run lint`; `npm run build`; `npm run verify:workspaces`; `scripts/spec-trace.sh pol-core-api-integration`; production browser verification against a deterministic Node stub created under a temporary directory outside repository, with `ADMIN_API_ORIGIN=http://127.0.0.1:<stub-port>` supplied to both build and start, covering `/organization/division/list`, `/organization/division/read?id=<known-uuid>`, `/organization/division/edit?id=<known-uuid>`, `/organization/level/list`, `/organization/level/read?id=<known-uuid>`, `/organization/level/edit?id=<known-uuid>`, `/organization/office/list`, `/organization/office/read?id=<known-uuid>`, `/organization/office/edit?id=<known-uuid>`, `/organization/position/list`, `/organization/position/read?id=<known-uuid>` และ `/organization/position/edit?id=<known-uuid>` at exact `document.documentElement.clientWidth` values `375`, `768` and `1440`, asserting successful hydration, no unexpected console error, no failed ORG request, no horizontal overflow, loaded contract values และ unchanged visible UI/interaction contract.
     Evidence: targeted Vitest `92/92`; full tests Node `23`, root `326`, shared `26`; typecheck และ lintผ่าน; spec trace `32/32`. Parameterized exact boundary `total=2500,totalPages=100` ผ่านทั้งสี่ resource, request/orderถึง page 100, observed concurrencyสูงสุด 4; mutation `MAX_TOTAL_PAGES 100 -> 99` ทำ boundary testsแดง `4/4` แล้ว restoreเขียว. Fresh mirror checksum implementation `10/10` ก่อน test-only rework, webpack static pages `115/115` และ `verify:workspaces` ผ่าน `114` routes, `681` dependency/test-policy files, `747` active-reference files; production source hashesไม่เปลี่ยนใน rework. Chrome DevTools production ผ่าน `36/36` routes ที่ exact clientWidth `375`, `768`, `1440` รวม `/edit`, console errors `0`, horizontal overflow `0`, exact ORG requests `200`; real `401` redirect ไป `/login` โดยไม่แสดง contract value แล้ว restore success stubผ่าน. Approved environment deviations: workspace `.next` ติด filesystem `EPERM`; ใช้ fresh checksum-identical mirror และ offline font mock เฉพาะ local verification โดย artifact ไม่ deploy และไม่ใช่ font-fidelity evidence.

## Suggested execution batches

ใช้ all-in-one `coder-high` session (`/spec-implement all` หรือ
`scripts/pane-loop.sh pol-core-api-integration all-in-one`). Feature นี้ multi-file และ coupled ผ่าน
shared production helper, descriptor matrix, adapter bindings, write regressions และ production browser
contract; ห้ามแยกเป็น horizontal sessions หรือ parallel batches.
