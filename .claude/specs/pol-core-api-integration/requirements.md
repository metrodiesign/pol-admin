# Requirements: ORG read-only adapter alignment

> Status: approved 2026-08-24, amended 2026-08-24

เอกสารนี้กำหนดการปรับ existing ORG read adapters ให้ตรงกับ `pol-core` contract สำหรับสี่ resource โดยคง UX/UI และ write lifecycle เดิม. Contract อ้างอิง backend snapshot `88db074596afb726c1153d0e92e59e30cdd026b3`.

## Overview

ORG ใช้ transport และ API source จริงอยู่แล้ว แต่ read adapters ยัง decode response ผิด contract. งานนี้แก้เฉพาะ list/detail reads; overall ORG ยังเป็น `CONTRACT_MISMATCH` จนกว่า create, update, delete, ETag และ conflict semantics จะได้รับอนุมัติและแก้แยกภายหลัง.

Requirements IDs ใน draft ก่อน gate ถูก supersede ด้วย stable spine ด้านล่างก่อน approval.

## Scoped resources

ทุก requirement ที่ใช้คำว่า scoped resource ครอบคลุมทุกแถวในตารางนี้.

| Key | Resource | List endpoint | Detail endpoint |
|---|---|---|---|
| `ORG-DIV` | divisions | `GET /api/v1/divisions` | `GET /api/v1/divisions/{id}` |
| `ORG-LVL` | levels | `GET /api/v1/levels` | `GET /api/v1/levels/{id}` |
| `ORG-OFF` | offices | `GET /api/v1/offices` | `GET /api/v1/offices/{id}` |
| `ORG-POS` | positions | `GET /api/v1/positions` | `GET /api/v1/positions/{id}` |

## REQ-1: Read operations

**User Story:** ในฐานะ POL Admin ฉันต้องการให้ ORG reads ใช้ backend contract จริง เพื่อให้ UI เดิมแสดง record ที่ backend ยืนยัน.

**Acceptance Criteria (EARS):**

- 1.1  WHEN a scoped resource list is requested THE SYSTEM SHALL call its list endpoint from the scoped-resource table.
- 1.2  WHEN a scoped resource detail is requested THE SYSTEM SHALL call its detail endpoint with the requested `id`.
- 1.3  WHEN a scoped list response is valid THE SYSTEM SHALL return the existing resource view-model array.
- 1.4  WHEN a scoped detail response is valid THE SYSTEM SHALL return the existing resource view model.
- 1.5  IF a scoped detail request returns `404` THEN THE SYSTEM SHALL return `null`.

## REQ-2: Wire contract and mapping

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการให้ adapter ตรวจ response ก่อนใช้ เพื่อไม่ให้ payload ที่ผิด contract ปนเข้า UI state.

**Acceptance Criteria (EARS):**

- 2.1  THE SYSTEM SHALL declare explicit local TypeScript wire types for `PagedResult<MasterResponse>`.
- 2.2  THE SYSTEM SHALL use no `any` in scoped wire types, decoders, mappings, or tests.
- 2.3  WHEN a list response is received THE SYSTEM SHALL validate it against the lossless frontend-supported `PagedResult` schema before mapping.
- 2.4  WHEN a record is received THE SYSTEM SHALL validate it against the lossless frontend-supported `MasterResponse` schema before mapping.
- 2.5  WHEN a valid wire object contains extra fields THE SYSTEM SHALL ignore those extra fields.
- 2.6  WHEN `MasterResponse.status` is `1` THE SYSTEM SHALL map `isActive` to `true`.
- 2.7  WHEN `MasterResponse.status` is `2` THE SYSTEM SHALL map `isActive` to `false`.
- 2.8  IF a wire value violates the lossless frontend-supported schema THEN THE SYSTEM SHALL reject the adapter operation.
- 2.9  IF page `1` declares `totalPages` greater than `100` (more than `2,500` records at required `limit=25`) THEN THE SYSTEM SHALL reject the adapter operation before starting any remaining-page request.

### Lossless frontend-supported schema

| Type | Field | Valid value |
|---|---|---|
| `PagedResult<MasterResponse>` | `items` | array of valid `MasterResponse` objects |
| `PagedResult<MasterResponse>` | `page` | positive safe integer |
| `PagedResult<MasterResponse>` | `limit` | positive safe integer not exceeding `25` |
| `PagedResult<MasterResponse>` | `total` | nonnegative safe integer; source `long` values above `Number.MAX_SAFE_INTEGER` are unsupported |
| `PagedResult<MasterResponse>` | `totalPages` | nonnegative safe integer not exceeding `100` and equal to `Math.ceil(total / limit)`; supports at most `2,500` records at `limit=25` |
| `MasterResponse` | `id` | UUID string matching `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` |
| `MasterResponse` | `code` | nonempty string matching `^[a-z0-9_]+$`, at most 64 characters |
| `MasterResponse` | `name` | string at most 200 characters with `name.trim().length > 0` |
| `MasterResponse` | `status` | integer literal `1` or `2` |
| `MasterResponse` | `version` | nonnegative safe integer; source `long` values above `Number.MAX_SAFE_INTEGER` are unsupported |

Values above `Number.MAX_SAFE_INTEGER` in source `long` fields are unsupported and SHALL reject the adapter operation.

## REQ-3: Pagination and atomic result

**User Story:** ในฐานะ POL Admin ฉันต้องการให้ adapter คืนรายการครบในลำดับเดิม เพื่อให้ client-side filtering, sorting และ pagination ทำงานเหมือนเดิม.

Page `1` ยอมรับเฉพาะเมื่อ response มี `page=1`, `limit=25` และ `totalPages` ไม่เกิน `100`. Adapter ต้อง reject ก่อนเริ่ม remaining-page requests เมื่อ page `1` เกิน ceiling นี้. Remaining page ยอมรับเฉพาะเมื่อ `page` ตรงกับเลขที่ขอ, `limit=25`, `totalPages` ตรงกับ anchor และ payload ผ่าน lossless frontend-supported schema.

**Acceptance Criteria (EARS):**

- 3.1  WHEN a scoped list is requested THE SYSTEM SHALL request page `1` with `limit=25`.
- 3.2  WHEN page `1` has response `page=1`, response `limit=25` and a valid payload THE SYSTEM SHALL use its `totalPages` as the best-effort page-count anchor for that operation.
- 3.3  WHEN the page-count anchor exceeds `1` THE SYSTEM SHALL request every page from `2` through that anchor.
- 3.4  WHEN multiple pages are valid THE SYSTEM SHALL preserve ascending page order and backend item order within each page.
- 3.5  IF any remaining page cannot be accepted under the page `1` contract anchor THEN THE SYSTEM SHALL reject the whole list operation.
- 3.6  IF a list operation is rejected THEN THE SYSTEM SHALL return no partial array.

## REQ-4: Authorization, transport, and failures

**User Story:** ในฐานะผู้ดูแลความปลอดภัย ฉันต้องการให้ ORG reads รักษา BFF boundary และ failure path เดิม เพื่อไม่ให้ browser ถือ token หรือ UI แสดง fallback ปลอม.

**Acceptance Criteria (EARS):**

- 4.1  THE SYSTEM SHALL preserve backend authorization requiring an authenticated `AdminSession` with `user.view` permission for every scoped request.
- 4.2  WHEN a scoped request is sent THE SYSTEM SHALL send it through the existing `adminFetch` adapter.
- 4.3  WHEN a scoped request is sent THE SYSTEM SHALL use its same-origin `/api/v1/*` path.
- 4.4  WHEN a scoped request is sent THE SYSTEM SHALL preserve `credentials: "include"` behavior supplied by `adminFetch`.
- 4.5  THE SYSTEM SHALL send no browser-side `Authorization: Bearer` header for a scoped request.
- 4.6  IF `adminFetch` receives `401` THEN THE SYSTEM SHALL set browser location to `/login`.
- 4.7  IF the adapter receives a `401` response THEN THE SYSTEM SHALL reject the adapter operation.
- 4.8  IF the adapter rejects a `401` response THEN THE SYSTEM SHALL return neither mock data nor `null`.
- 4.9  IF a scoped response is non-2xx other than detail `404` THEN THE SYSTEM SHALL reject the adapter operation.
- 4.10  IF a scoped request fails at the network layer THEN THE SYSTEM SHALL reject the adapter operation.
- 4.11  IF a scoped response contains malformed JSON THEN THE SYSTEM SHALL reject the adapter operation.
- 4.12  IF `adminFetch` receives `401` THEN THE SYSTEM SHALL return the `401` response to the adapter.

## Immutable boundaries

| Boundary | Required invariant |
|---|---|
| View contract | Existing exported ORG view-model shapes and read-adapter signatures remain unchanged |
| Consumers | Existing production consumer source files remain unchanged |
| UX/UI | JSX structure, routes, navigation, labels, copy, fields, actions, states, styles and interaction flows remain unchanged |
| Writes | ORG create, update and delete behavior remains unchanged |
| Dependencies | No dependency, manifest or lockfile change |
| Backend | No file, branch or commit change in `pol-core` |
| Secrets | No backend host, production URL, token, credential or secret is hardcoded |
| Failure fallback | No rejected operation returns mock data or `null`; detail `404` is the sole `null` case |

## Verification strategy

Adapter contract testsต้องใช้ parameterized resource descriptor จาก scoped-resource table เพื่อรัน exact matrix เดียวกันกับทั้งสี่ resource. Tests อยู่ co-located กับ adapter เดิมและต้องขับ decoder, mapper และ request path จริงของแต่ละ adapter.

### Descriptor test matrix

| Case | Input or trigger | Required assertion |
|---|---|---|
| `T-01` | valid single-page list with status `1` and `2` | lossless frontend-supported schema accepted and both `isActive` values mapped |
| `T-02` | valid multi-page list | every anchored page requested with `limit=25`; page/item order preserved |
| `T-03` | valid detail | lossless frontend-supported schema accepted and existing view model returned |
| `T-04` | detail `404` | `null` returned |
| `T-05` | `401` response | `/login` side effect preserved; operation rejects; no mock or `null` |
| `T-06` | `403` response | operation rejects |
| `T-07` | representative `5xx` response | operation rejects |
| `T-08` | network failure | operation rejects |
| `T-09` | malformed JSON | operation rejects |
| `T-10` | each invalid `PagedResult` field class, including page `1` response `page != 1`, `limit != 25`, `totalPages > 100` and unsafe source `long` total | whole list operation rejects; `totalPages > 100` starts no remaining-page request |
| `T-11` | each invalid `MasterResponse` field class, including unsafe source `long` version | list and detail reject |
| `T-12` | unsupported `status` | list and detail reject |
| `T-13` | extra response fields | fields ignored; mapped result unchanged |
| `T-14` | remaining-page failure, malformed payload, response `page` mismatch, response `limit != 25` or `totalPages` anchor mismatch | whole list rejects; no partial array |
| `T-15` | captured request | same-origin path and `credentials: "include"`; no Bearer header |

### Final commands

รันจริงทุกคำสั่งจาก repository root และบันทึก exit code; ห้ามอ้างผ่านหากไม่ได้รัน.

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm run verify:workspaces
```

### Browser invariants

ตรวจ production ORG routes ที่ใช้ adapter ทั้งสี่ที่ viewport `375`, `768` และ `1440` pixels. หลักฐานต้องแสดงว่า section order, controls, labels, interaction และ layout เดิมไม่เปลี่ยน; เปลี่ยนได้เฉพาะค่าข้อมูล.

### Safe local read probe

เมื่อ local `pol-admin` BFF และ local `pol-core` พร้อมใช้งาน ให้ probe เฉพาะ `GET` list endpoint ทั้งสี่ผ่าน same-origin session. ห้ามยิง mutation; หากขาด OIDC/session credential ให้บันทึก command, endpoint และ exact error เป็น environment blocker โดยห้ามอ้างว่า probe ผ่าน.

## Out of scope

- AROLE adapters และทุก AROLE gap.
- ORG create, update, delete, ETag และ conflict lifecycle.
- ทุก Phase 1 gap นอก scoped-resource table.
- การเพิ่ม field, endpoint, UI state, fallback, placeholder หรือ interaction.
- การแก้ `pol-core` หรือเพิ่ม dependency.

## Edge Cases & Open Questions

ไม่มี open product question ใน scope นี้. Design ต้องยืนยัน wire field names กับ pinned backend source โดยไม่ขยาย requirements.
