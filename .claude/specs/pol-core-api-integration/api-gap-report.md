# รายงานช่องว่างการเชื่อม POL Admin กับ pol-core

รายงาน Phase 1 แบบ audit-only เปรียบเทียบ production UI ของ `pol-admin` กับ Admin audience contract ที่ประกาศจริงใน `pol-core`. ขอบเขตครอบคลุม 67 routes และ 156 HTTP operations โดยไม่รวม `/minimals/*`.

## สรุปผล

### Snapshot ที่ใช้ตรวจ

| Repository | Branch | HEAD SHA | การใช้หลักฐาน |
|---|---|---|---|
| `pol-admin` | `develop` | `886dcd93ca1b29a4ac62553cfd29afcf911f9fad` | routes, components, hooks, types, mocks, adapters และ rewrites |
| `pol-core` | `codex/tier-0-microsoft-canonical-email` | `88db074596afb726c1153d0e92e59e30cdd026b3` | endpoint source, DTO, auth metadata, contract tests และ OpenAPI audience filter; read-only |

### จำนวนรายการตัดสิน

หน่วยนับในตารางนี้คือ canonical decision row จำนวน 55 แถว. Route และ endpoint ที่แชร์ contract เดียวกันอาจอ้าง decision row เดียว; coverage ledgers ด้านล่างนับ route และ HTTP operation แยกต่างหาก.

| Status | จำนวน | ความหมายใน audit นี้ |
|---|---:|---|
| `EXACT_MATCH` | 0 | ยังไม่มี mock-backed surface ที่ contract และ state พร้อมครบจนเสนอ migration ได้ทันที |
| `ALREADY_REAL` | 5 | auth/BFF 4 contract และ PSP integration 1 contract เชื่อมจริงอยู่แล้ว |
| `UI_FIELD_MISSING` | 3 | backend คืน field ที่ UI ไม่มีตำแหน่ง; report only |
| `API_FIELD_MISSING` | 3 | UI ต้องใช้ field ที่ Admin API ไม่มี; ห้ามแต่งค่า |
| `CONTRACT_MISMATCH` | 8 | type, DTO, pagination, lifecycle หรือ concurrency ไม่ตรง |
| `NO_ENDPOINT` | 3 | UI มี action/data group แต่ backend ไม่มี operation รองรับ |
| `BACKEND_EXTRA` | 7 | Admin API มี operation แต่ production UI ไม่มี surface |
| `BLOCKED` | 26 | ต้องเพิ่ม/เปลี่ยน loading, error, state, UX, permission หรือ flow จึงเชื่อมได้ |
| **รวม** | **55** | แต่ละ decision row มี status เดียว |

### Coverage count

| Inventory | จำนวน | หลักฐาน |
|---|---:|---|
| production routes | 67 | `src/app/**/page.tsx`, ตัด `src/app/minimals/**` |
| Admin-facing operations | 156 | dedupe ด้วย `METHOD + normalized path`; ดู endpoint ledger |
| `EXACT_MATCH` เสนอ implement | 0 | ไม่มีรายการให้อนุมัติในข้อห้ามปัจจุบัน |

## วิธีตรวจและข้อจำกัด

- Admin OpenAPI audience ตัดสินจาก `src/Hosts/Api/OpenApiDocuments.cs:37-56`: operation เข้าเอกสาร Admin เมื่อ endpoint metadata มี `AdminSession` หรือ path เป็น Admin auth.
- Inventory derive จาก endpoint metadata ใน source แล้ว cross-check handler, request/response record, permission, ETag/CSRF/idempotency marker และ contract tests. ไม่ใช้ integration guide เป็น source of truth.
- ไม่ generate runtime OpenAPI document เพราะ `pol-core` เป็น read-only dependency และ MSBuild ต้องเขียน `obj`; probe หยุดด้วย `MSB3491`. ข้อจำกัดนี้ไม่ใช่ product failure และไม่ลด endpoint coverage เพราะ ledgerอ้าง static endpoint metadata โดยตรง.
- Endpoint ledger แก้ arithmetic miss ใน brief: Admin/IAM/reference/governance มี 75 operations ไม่ใช่ 74 เพราะ `GET /api/v1/merchants/{code}` ที่ `Program.cs:1941` เป็น AdminSession operation. รวมกับ domain 96, หัก overlap 17 และเพิ่ม dual-console reads 2 operationsที่ inventoryเดิมตกหล่น ได้ 156 unique operations.
- ทุก mutation ที่ระบุ CSRF ใช้ same-origin cookie session; browser ห้ามถือหรือส่ง Bearer token. Existing `adminFetch` ที่ `src/lib/api/admin/auth.ts:67` ใช้ `credentials: "include"` และแนบ `X-CSRF-Token` เฉพาะ mutation.
- ถ้า surface ไม่มี loading, error หรือ malformed-value state ที่ใช้งานได้ ถูกจัด `BLOCKED` แม้ field หลักจะใกล้เคียง ตาม constraint ของงาน.

## Canonical decision register

### Auth และ system

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-01 | protected routes — `src/components/layout/minimals-layout.tsx:26`; `src/components/auth/auth-guard.tsx:20` | real `getMe` | guard loading, anonymous redirect, forbidden page, retry | `GET /api/v1/admins/me` | `src/Hosts/Api/Program.cs:2639` | AdminSession | backend current admin, tier, roles, permissions และ merchant scope → auth context | 401 → login; 403 → forbidden; other failure → reload; no ETag | `ALREADY_REAL` | BFF/session/error behaviorตรงและใช้งานอยู่ | report only |
| AUTH-02 | `/login` — `src/components/auth/login-view.tsx:99` | real full-page navigation | Microsoft sign-in | `GET /api/v1/admins/auth/{provider}/login` | `src/Hosts/Api/Program.cs:1809` | anonymous, rate limited; provider=`microsoft` | `returnTo` → OIDC challenge; browserไม่รับ token | unknown/unconfigured provider 404; OIDC redirects | `ALREADY_REAL` | server-side OIDC BFF ตรง contract | report only |
| AUTH-03 | `/login-error` — `src/app/login-error/page.tsx:55`; `src/lib/auth/login-error.ts:7` | query reason จาก backend redirect | แสดงข้อความ reason ที่รองรับ | backend OIDC deny redirect ไป `/login-error?reason=...` | Admin auth options/callback path; entry `src/Hosts/Api/Program.cs:1809` | anonymous local page | stable reason label → existing copy | unknown reason มี fallbackเดิม; ไม่มี API fetch | `ALREADY_REAL` | error redirect contract ถูก wire แล้ว | report only |
| AUTH-04 | `/logout` และ account drawer — `src/app/logout/page.tsx:8`; `src/lib/api/admin/auth.ts:103` | real `adminFetch` | logout, retry เมื่อ fail | `POST /api/v1/admins/auth/logout` | `src/Hosts/Api/Program.cs:1832` | AdminSession + CSRF | no body; 204 → redirect login | credentials include; CSRF; retry UIเดิม | `ALREADY_REAL` | session revoke contractตรง | report only |
| AUTH-X1 | — (ไม่มี surface) | — | logout ทุก sessions | `POST /api/v1/admins/auth/logout-all` | `src/Hosts/Api/Program.cs:1858` | AdminSession + CSRF | no body → 204 | ไม่มี UI confirmation/result state | `BACKEND_EXTRA` | adapter exportมีแต่ไม่มี production consumer/action | report only |

### Admin role และ user

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AROLE-01 | `/admin/role/list` — `src/components/admin/role/view.tsx:27` | real adapter `src/lib/api/admin/role.ts:40` | search code/name/description, status, permission count, userCount; read/edit/duplicate/delete | `GET /api/v1/admins/roles`; `GET /api/v1/admins/permissions`; `DELETE /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3149,3163,3250,3918` | AdminSession; `user.roles` mutation | code/name/description/color/status/permissions/userCount mapครบ; backendเพิ่ม versionและ listเป็น `PagedResult` | FE คาด array; deleteต้อง `If-Match`; backend SFS; UI loading/error/emptyมี | `CONTRACT_MISMATCH` | real adapterยิงจริงแต่ list envelope, SFS และ delete concurrency stale | report only |
| AROLE-02 | `/admin/role/create` — `src/components/admin/role/create-view.tsx:45` | real adapter `src/lib/api/admin/role.ts:58` | name, code, description, status, color, permissions; duplicate-from | `POST /api/v1/admins/roles` | `src/Hosts/Api/Program.cs:3208,3544` | AdminSession + `user.roles` + CSRF | request fieldsทั้งหมดรวม color mapตรง; responseเพิ่ม version | duplicate-fromพึ่ง `getRoles` ที่ parse list envelopeผิด; backend validation/ProblemDetails | `CONTRACT_MISMATCH` | createปกติ fieldตรง แต่ duplicate pathพึ่ง stale list contract | report only |
| AROLE-03 | `/admin/role/edit` — `src/components/admin/role/edit-view.tsx:33` | real adapter `src/lib/api/admin/role.ts:50,68` | load/edit name, description, status, color, permissions | `GET /api/v1/admins/roles/{code}`; `PUT /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3189,3229,3546,3918` | AdminSession + `user.roles`; CSRF + `If-Match` | name/description/color/status/permissions mapครบ; backendคืน version/ETagแต่ adapterไม่เก็บ | 404/409/412 และ reload conflictไม่ครบ | `CONTRACT_MISMATCH` | updateไม่ส่ง required `If-Match` | report only |
| AROLE-04 | `/admin/role/read` — `src/components/admin/role/read-view.tsx:30` | real adapter `src/lib/api/admin/role.ts:50` | role metadata + permission matrix | `GET /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3189,3918` | AdminSession | code/name/description/color/status/permissions/userCount mapครบ; backendเพิ่ม version | responseมี ETag/versionแต่ adapterไม่เก็บเพื่อส่งต่อ edit; loading/error/emptyมีบางส่วน | `CONTRACT_MISMATCH` | read-to-edit transitionทิ้ง concurrency token | report only |
| AUSER-01 | `/admin/user/list` — `src/components/admin/user/list-view.tsx:22`; columns `src/components/admin/user/table-columns.tsx:79` | mock `src/lib/mock/admin/users.ts:6` | createdAt, name/avatar, email, phone, company, roles, status; search/filter/page; view/edit/delete | `GET /api/v1/admins`; ไม่มี `DELETE /api/v1/admins/{id}` | `src/Hosts/Api/Program.cs:2721,2847,3901` | AdminSession + `user.view`; suspendเป็น Super + CSRF + `If-Match` | collection mapได้เฉพาะ createdAt/emailและ statusหลังแปลง enum; ไม่มี name/avatarUrl/phoneNumber/company/roles; backendเพิ่ม adminId/tier/subjectBound/version | backend SFS/paged/ProblemDetails; UI client pagingและไม่มี loading/error; deleteไม่มี operationตรง และ suspendเป็น lifecycleคนละ semantics | `BLOCKED` | fieldหลักหาย, statusต่าง และ delete actionห้ามแทนด้วย suspend | report only |
| AUSER-02 | `/admin/user/new` — `src/app/admin/user/new/page.tsx:7` | hard-coded empty form; no save handler | firstName, lastName, email, office, department, position, level, status, roles | `POST /api/v1/admins` | `src/Hosts/Api/Program.cs:2674` | AdminSession + Super + CSRF | UI label valuesต้องแปลงเป็น GUID refs; backend provisioning lifecycleไม่ตรง direct-create form | no submit/error state; backend conflict/validation | `BLOCKED` | ต้องเปลี่ยน form wiring/stateและยืนยัน provisioning semantics | report only |
| AUSER-03 | `/admin/user/edit` — `src/app/admin/user/edit/page.tsx:15` | hard-coded record; no row id binding | profile fields, status, organization refs, roles; save/cancel | `PUT /api/v1/admins/{id}/profile`; `PUT /api/v1/admins/{id}/roles` | `src/Hosts/Api/Program.cs:2918,3269` | AdminSession + `user.manage`/`user.roles`; CSRF + `If-Match` | labelsต้อง map GUID; UI status enumต่าง; routeไม่มี id | 404/409/412, ETag และ mutation error stateไม่มี | `BLOCKED` | ต้องเปลี่ยน route/data bindingและ conflict UX | report only |
| AUSER-04 | `/admin/user/read` — `src/app/admin/user/read/page.tsx:11` | hard-coded record | profile/status/organization/roles; edit link | `GET /api/v1/admins/{id}` | `src/Hosts/Api/Program.cs:2750` | AdminSession + `user.view` | routeไม่มี id; UI fieldsบางส่วนไม่มี backend guarantee | ETag/404/error/loadingไม่มี | `BLOCKED` | recordจริงระบุตัวไม่ได้โดยไม่เปลี่ยน route contract/flow | report only |
| AUSER-X1 | — (ไม่มี surface) | — | effective permissions, merchant assignment, suspend/reactivate, tier, sessions revoke | `GET /admins/{id}/effective-permissions`; merchant assignment operations; suspend/reactivate/tier operations; session operations | `src/Hosts/Api/Program.cs:2791-2892,3087-3105` | AdminSession; Superหรือ permissionเฉพาะ; mutationมี CSRF/`If-Match`/Idempotencyตาม endpoint | ไม่มี existing slot/action | server paging/error/concurrencyไม่มี consumer | `BACKEND_EXTRA` | production UIไม่มีตำแหน่งหรือ action | report only |

### Merchant-management identity

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| MROLE-01 | `/merchant/role/list` — `src/components/merchant/role/view.tsx:26` | mock `src/lib/mock/merchant/role.ts:8` | same role table/search/filter/actions as Admin role | `GET /api/v1/merchants/{merchantId}/roles`; `GET .../permissions`; `DELETE .../roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:107,157,225` | AdminSession + merchant user-management permission | UIไม่มี selected merchantId; role resource vocabularyต่าง | backend SFS/ETag/`If-Match`; UIไม่มี loading/error | `BLOCKED` | ต้องเพิ่ม merchant context, state และ concurrency UX | report only |
| MROLE-02 | `/merchant/role/create` — `src/components/merchant/role/create-view.tsx:34` | mock | role fields + permissions + duplicate | `POST /api/v1/merchants/{merchantId}/roles` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:177` | AdminSession + permission + CSRF | UIไม่มี merchantId binding; permission catalogต้องเป็น merchant-side | validation/error stateไม่มี | `BLOCKED` | ต้องเปลี่ยน data contextและ state | report only |
| MROLE-03 | `/merchant/role/edit` — `src/components/merchant/role/edit-view.tsx:30` | mock | edit role/permissions/status/color | `GET/PUT /api/v1/merchants/{merchantId}/roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:136,201,330-344` | AdminSession + merchant-role permission; `If-Match` | name/description/color/status/permissions/userCount mapได้; UIไม่มี merchantId/ETag และ permission resource vocabularyเดิมไม่ตรง merchant-side catalog | 404/409/412/loading/errorไม่มี | `BLOCKED` | merchant context, vocabulary, concurrencyและ stateไม่ครบ | report only |
| MROLE-04 | `/merchant/role/read` — `src/components/merchant/role/read-view.tsx:30` | mock | metadata + permission matrix | `GET /api/v1/merchants/{merchantId}/roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:136` | AdminSession + permission | merchantIdไม่อยู่ใน route; response fieldsไม่ตรงครบ | ETag/error/loadingไม่มี | `BLOCKED` | ต้องเปลี่ยน route/contextหรือ interaction flow | report only |
| MUSER-01 | `/merchant/user/list` — `src/components/merchant/user/list-view.tsx:27`; columns `src/components/merchant/user/table-columns.tsx:71` | mock `src/lib/mock/merchant/users.ts:7` | created/name/email/phone/producerCode/personType/license/status; view/edit/delete/search/filter | `GET /api/v1/merchants/users`; detailตาม MUSER-04; ไม่มี delete operationตรง | `src/Hosts/Api/Program.cs:2244`; DTO `src/Modules/Merchants/Merchants.Application/Users/ManageMerchantUsers.cs:196` | dual-console; AdminSession branchใช้ `merchants.users.view`; MerchantUserSession branchใช้ `users.view`; merchant scope; SFS | createdAt/displayName/maskedEmail/maskedPhone/producerCode/maskedLicense/status mapได้ผ่าน adapter; listไม่มี personTypeและ firstName/lastName; backendเพิ่ม roleCodes/merchantId/version | server SFS/paged/400/401/403; UI client pagingและไม่มี loading/error; deleteไม่มี contract | `BLOCKED` | endpointมีจริงแต่ DTO, paging, states และ delete actionไม่ตรง | report only |
| MUSER-02 | `/merchant/user/new` — `src/app/merchant/user/new/page.tsx:10` | hard-coded form; no save handler | identity, producer/license, email verification, KYC upload, terms | `POST /api/v1/merchants/{merchantId}/user-invitations` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:54` | AdminSession + permission + CSRF + Idempotency | UI direct-registration/KYC fieldsไม่ตรง invitation request | no submit/loading/error; async invite lifecycle | `BLOCKED` | backend flowเป็น invitation ไม่ใช่ form lifecycleเดิม | report only |
| MUSER-03 | `/merchant/user/edit` — `src/app/merchant/user/edit/page.tsx:16` | hard-coded record | identity/profile/license/contact; save/cancel | `GET .../users/{userId}/edit`; `PUT .../users/{userId}`; `PUT .../users/{userId}/roles` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:30,78,246` | AdminSession + permission; CSRF + `If-Match` | routeไม่มี merchantId/userId; fieldsและrole bindingไม่ครบ | ETag/conflict/loading/errorไม่มี | `BLOCKED` | ต้องเปลี่ยน route bindingและ state | report only |
| MUSER-04 | `/merchant/user/read` — `src/app/merchant/user/read/page.tsx:13` | hard-coded record; approve/reject local state | detail, approve, reject, edit | `GET /api/v1/merchants/users/{merchantUserId}`; approve/reject operationsใต้ `/api/v1/admins/merchants/users/{userId}`; `GET .../users/{userId}/edit` | `src/Hosts/Api/Program.cs:2281,2553,2588`; `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:30`; DTO `src/Modules/Merchants/Merchants.Application/Users/ManageMerchantUsers.cs:201` | detail dual-console; AdminSession branch `merchants.users.view`; MerchantUserSession branch `users.view`; actionsใช้ approve permission + CSRF + `If-Match` + Idempotency | detailคืน displayName/masked contact/license/personType/masked ID/roles/permissions/version; UIต้อง firstName/lastNameและ unmasked form fields; approveต้อง merchantCode/roleCodes, rejectต้อง reason | detail ETag/404; action 202/conflict; routeไม่มี user idและไม่มี loading/error state | `BLOCKED` | detailมีจริงแต่ route/model/action lifecycleไม่ตรง | report only |
| MUSER-X1 | — (ไม่มี surface) | — | registration audit | `GET /admins/merchants/users/{userId}/registrations` | `src/Hosts/Api/Program.cs:2614` | AdminSession + reveal/view permission | ไม่มี UI slot | audit/error stateไม่มี | `BACKEND_EXTRA` | Admin registration auditไม่มี production surface | report only |

### Organization reference data

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ORG-DIV | `/organization/division/{list,create,edit,read}` — `src/components/organization/division/list-view.tsx:28`, `src/components/organization/division/create-view.tsx:21`, `src/components/organization/division/edit-view.tsx:35`, `src/components/organization/division/read-view.tsx:21` | real adapter `src/lib/api/admin/division.ts` | id/code/name/isActive; search/status; create/edit/deactivate/read | `GET/POST /api/v1/divisions`; `GET/PUT/DELETE /api/v1/divisions/{id}` | generic mapper `src/Hosts/Api/Program.cs:2948,2992-3066` | AdminSession; `user.view`/`user.manage`; CSRF; write `If-Match` | backend status `1` หรือ `2` และ `version`; FE boolean `isActive`; list backend `PagedResult` | FE page/limit adapter stale; PUT/DELETEไม่ส่ง ETag | `CONTRACT_MISMATCH` | real integrationยิง APIแต่ status, paging, concurrencyไม่ตรง | report only |
| ORG-LVL | `/organization/level/{list,create,edit,read}` — `src/components/organization/level/list-view.tsx:28`, `src/components/organization/level/create-view.tsx:21`, `src/components/organization/level/edit-view.tsx:35`, `src/components/organization/level/read-view.tsx:21` | real adapter `src/lib/api/admin/level.ts` | id/code/name/isActive และ CRUDเดิม | `GET/POST /api/v1/levels`; `GET/PUT/DELETE /api/v1/levels/{id}` | `src/Hosts/Api/Program.cs:2948,2992-3066` | เหมือน ORG-DIV | boolean statusและ paged DTOไม่ตรง; versionไม่ถูกเก็บ | SFS/ProblemDetails/ETagไม่ตรง adapter | `CONTRACT_MISMATCH` | เหตุผลเดียวกับ division | report only |
| ORG-OFF | `/organization/office/{list,create,edit,read}` — `src/components/organization/office/list-view.tsx:28`, `src/components/organization/office/create-view.tsx:21`, `src/components/organization/office/edit-view.tsx:35`, `src/components/organization/office/read-view.tsx:21` | real adapter `src/lib/api/admin/office.ts` | id/code/name/isActive และ CRUDเดิม | `GET/POST /api/v1/offices`; `GET/PUT/DELETE /api/v1/offices/{id}` | `src/Hosts/Api/Program.cs:2948,2992-3066` | เหมือน ORG-DIV | boolean statusและ paged DTOไม่ตรง; versionไม่ถูกเก็บ | SFS/ProblemDetails/ETagไม่ตรง adapter | `CONTRACT_MISMATCH` | เหตุผลเดียวกับ division | report only |
| ORG-POS | `/organization/position/{list,create,edit,read}` — `src/components/organization/position/list-view.tsx:28`, `src/components/organization/position/create-view.tsx:21`, `src/components/organization/position/edit-view.tsx:35`, `src/components/organization/position/read-view.tsx:21` | real adapter `src/lib/api/admin/position.ts` | id/code/name/isActive และ CRUDเดิม | `GET/POST /api/v1/positions`; `GET/PUT/DELETE /api/v1/positions/{id}` | `src/Hosts/Api/Program.cs:2948,2992-3066` | เหมือน ORG-DIV | boolean statusและ paged DTOไม่ตรง; versionไม่ถูกเก็บ | SFS/ProblemDetails/ETagไม่ตรง adapter | `CONTRACT_MISMATCH` | เหตุผลเดียวกับ division | report only |

### Control plane

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| APIC-01 | `/control/api-clients`, `/read?id` — `src/components/control/api-client/view.tsx:22`, `src/components/control/api-client/detail-view.tsx:68` | mock/store `src/lib/mock/control/api-clients.ts:7`; `src/lib/control/api-clients-store.ts:9` | KPI, name/clientId/scopes/merchant/lastUsed/status; masked secret; revoke | `GET /api-clients`; `GET /api-clients/{id}`; `POST /api-clients/{id}/revoke` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:13,25,69` | AdminSession + `apikey.manage`; revoke CSRF+`If-Match`+Idempotency | detail backendมี `SecretHint`, UI expects masked `clientSecret`; remaining fields partial | backend paged/ETag/errors; UIไม่มี loading/error | `BLOCKED` | ต้องเพิ่ม stateและ resolve secret representation/concurrency | report only |
| APIC-X1 | — (ไม่มี surface) | — | create/update/rotate/reveal one-time secret | `POST /api-clients`; `PUT /api-clients/{id}`; `POST .../secret-rotation-requests`; `POST /api-clients/secrets/{ticketId}/reveal` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:39,54,84,102` | AdminSession + `apikey.manage`; CSRF; Idempotency; `If-Match`ตาม endpoint | ไม่มี UI slot/one-time reveal flow | 202/no-store/ETag/error statesไม่มี | `BACKEND_EXTRA` | เพิ่ม UIจะผิด out-of-scope | report only |
| APP-01 | `/control/approvals`, `/read?id` — `src/components/control/approval/view.tsx:32`, `src/components/control/approval/detail-view.tsx:68` | mock/store `src/lib/mock/control/approvals.ts:11` | KPI, request detail, approve/reject dialog | `GET /approvals`; `GET /approvals/{id}`; approve/reject operations | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:72,83,126` | AdminSession + `settings.manage`; mutation CSRF+`If-Match`+Idempotency | backend mutationต้อง `reason`,`targetVersion`; UIไม่มี input/version | paged filters, ETag, 202 และ error/loading stateไม่ครบ | `BLOCKED` | ต้องเปลี่ยน dialog/flowเพื่อส่ง contractบังคับ | report only |
| AUD-01 | `/control/audit`, `/read?id` — `src/components/control/audit/log-view.tsx:26`, `src/components/control/audit/detail-view.tsx:49` | mock `src/lib/mock/control/audit-log.ts:7` | actor email, action, entity, merchant, result, IP, before/after JSON | `GET /audits`; `GET /audits/{id}` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:98,110` | AdminSession + `audit.view` | APIมี actor GUID/resource/sanitized changes; ไม่มี actor email, IP หรือ raw before/afterที่ UIต้องใช้ | paged filters; integrity failure 503 | `API_FIELD_MISSING` | ห้ามแต่งค่าให้ existing slots | report only |
| AUD-02 | same routes/components as AUD-01 | same mock | ไม่มีตำแหน่งสำหรับ correlation/hash/integrity metadata | same AUD-01 endpoints | same source | same auth | backend correlation/hash/sanitized integrity fields → ไม่มี UI slot | report only; ไม่เปลี่ยน UI | `UI_FIELD_MISSING` | response extraต้อง ignore | report only |
| AUD-03 | same routes/components as AUD-01 | mock-only | existing table/detailไม่มี loading/error/503 integrity state | same AUD-01 endpoints | same source | same auth | field mappingตาม AUD-01/02 | backendอาจ 401/403/503; UIมีเพียง DataTable empty | `BLOCKED` | constraintห้ามสร้าง stateใหม่ | report only |
| NOTIF-01 | `/control/notifications` Rules tab — `src/components/control/notification/view.tsx:35` | mock/store `src/lib/mock/control/notifications.ts:9` | event/channel/target/threshold/merchant/enabled; toggle local | `GET/POST /notifications/rules`; `GET/PUT/DELETE /notifications/rules/{id}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:123-182` | AdminSession + `settings.manage`; CSRF; writesใช้ Idempotency/`If-Match` | wire fields/lifecycleไม่ตรงครบกับ local rule | paged/ETag/ProblemDetails; ไม่มี loading/error/conflict | `BLOCKED` | ต้องเพิ่ม stateและ concurrency flow | report only |
| NOTIF-02 | `/control/notifications`, `/read?id` Log tab — `src/components/control/notification/view.tsx:73`, `src/components/control/notification/log-detail-view.tsx:62` | mock notification log | event/channel/target/status/sentAt/detail | `GET /notifications/deliveries`; `GET /notifications/deliveries/{id}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:195,208` | AdminSession + `settings.manage` | fields partial; UI detail id/query fallbackไม่ยืนยัน contract | paged/errors/loadingไม่มี | `BLOCKED` | existing statesไม่ครบ | report only |
| ORIG-01 | `/control/originators`, `/read?id` — `src/components/control/originator/view.tsx:21`, `src/components/control/originator/detail-view.tsx:50` | mock `src/lib/mock/control/originators.ts:7` | code/name/type/merchant/linkedApiClient/status/search/filter/detail | `GET /originators`; `GET /originators/{id}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:398,421` | AdminSession + `merchant.view` | core fields map; responseเพิ่ม saleCode/timestamps/version | server paging/filter/ETag/error; UI client pagingและไม่มี loading/error | `BLOCKED` | state contractไม่ครบ | report only |
| ORIG-02 | same routes/components as ORIG-01 | same mock | ไม่มี slotสำหรับ saleCode, timestamps, version | same ORIG-01 endpoints | same source | same auth | backend extra fieldsต้อง ignore | ไม่มี UI change | `UI_FIELD_MISSING` | responseมีข้อมูลเกินตำแหน่งเดิม | report only |
| ORIG-X1 | — (ไม่มี surface) | — | create/update/delete/enable/disable originator | `POST /originators`; `PUT/DELETE /originators/{id}`; `POST /originators/{id}/enable`; `POST /originators/{id}/disable` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:444,468,496,521` | AdminSession + `merchant.manage`; CSRF; `If-Match`ตาม endpoint | ไม่มี UI actionเดิม | ETag/error statesไม่มี consumer | `BACKEND_EXTRA` | ห้ามสร้าง UIใหม่ | report only |
| PSP-01 | `/control/psp/{list,create,read,edit}` — `src/components/control/psp/connections-view.tsx:161`, `src/components/control/psp/create-view.tsx:246`, `src/components/control/psp/detail-view.tsx:292`, `src/components/control/psp/edit-view.tsx:139` | real adapter `src/lib/api/control/psp.ts:74,105` | list/filter/page/retry; create secret; detail/test/credential change; edit methods/enabled/conflict reload | PSP connection 6 operations: list, detail, create, update, test, credential-change request | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:548-672`; DTO `src/Modules/Payments/Payments.Application/AdminControlPlane/AdminPaymentsControl.cs:32` | AdminSession + `settings.manage`; createเพิ่ม `merchant.manage`; CSRF/Idempotency/`If-Match` | connectionId/merchant/psp/methods/enabled/health/lastTest/approval/masked secret/version mapครบ; secret write-only | server paging/filter; Abort/generation; loading/error/empty/retry; ETag/409/uncertain retryครบ | `ALREADY_REAL` | contractตรงและเชื่อมจริงอยู่แล้ว | report only |
| ROUTE-01 | `/control/routing`, `/read?id` — `src/components/control/routing/rules-view.tsx:26`, `src/components/control/routing/detail-view.tsx:63` | local store `src/lib/control/routing-store.ts:7` | flat priority/merchant/channel/amount/target/fallback/enabled; toggle/move | routing ruleset 6 operations: list/detail/create/update/delete/activation-request | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:700-812` | AdminSession + `settings.manage`; CSRF; `If-Match`/Idempotency | backendเป็น ruleset draft/activation lifecycle + nested DTO; UIเป็น flat mutable rule | paged/ETag/202 approval/error/loadingไม่มี | `BLOCKED` | ต้องเปลี่ยน IA, lifecycle และ interaction flow | report only |
| TEN-01 | `/control/tenants`, `/read?id` — `src/components/control/tenant/view.tsx:20`, `src/components/control/tenant/detail-view.tsx:47` | mock `src/lib/mock/merchant/index.ts` | code/name/legalEntityId/saqScope/enabledPsps/adminCount/status | `GET /merchants`; `GET /merchants/{code}`; `PUT /merchants/{id}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:317,338`; `src/Hosts/Api/Program.cs:1941` | AdminSession + `merchant.view/manage`; write CSRF+`If-Match`+Idempotency | APIไม่มี legalEntityId, saqScope, enabledPsps, adminCountตาม UI | server paging/filter/ETag/error/loadingไม่มี | `API_FIELD_MISSING` | ห้ามแต่งข้อมูลหรือถอด field | report only |
| TEN-02 | same routes/components as TEN-01 | same mock | UIไม่มี country/currency/enabledChannels/createdAt/version | same TEN-01 endpoints | same source | same auth | backend fieldsไม่มีตำแหน่งเดิม | ignore only | `UI_FIELD_MISSING` | backend responseมีข้อมูลเกิน UI | report only |
| TEN-X1 | — (ไม่มี surfaceตรง) | — | provision merchant, suspend/reactivate lifecycle | `POST /merchants`; `POST /merchants/{id}/suspend`; `POST /merchants/{id}/reactivate` | `src/Hosts/Api/Program.cs:1884`; `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:370` | AdminSession; create Super; mutations CSRF/`If-Match`/Idempotency | ไม่มี existing create/status actionครบ contract | saga/approval/error statesไม่มี | `BACKEND_EXTRA` | ห้ามเพิ่ม UI | report only |
| WH-01 | `/control/webhooks`, `/read?id` — `src/components/control/webhook/view.tsx:53`, `src/components/control/webhook/detail-view.tsx:53` | mock/store `src/lib/control/webhook-store.ts:9` | endpoint cards; inbound event list/detail; raw payload/signature; fake replay | webhook endpoint/delivery operations + `GET /webhooks/inbound-events[/{id}]` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:14-109`; `src/Hosts/Api/Webhooks/InboundWebhookEndpoints.cs:13,45` | AdminSession + `settings.manage`หรือ `audit.view`; writes CSRF/Idempotency/`If-Match` | inbound APIจงใจไม่คืน raw payload/signature; replay backendเป็น outbound deliveryคนละ entity | paging/filter/ETag/errors/loadingไม่ตรง | `BLOCKED` | contractต่างและ existing loading/error stateไม่ครบ | report only |
| RECON-01 | `/control/reconciliation` — `src/components/control/reconciliation/view.tsx:33` | mock `src/lib/mock/control/reconciliation.ts` | KPI totalOrders/totalAmount; currency/status/count/total lines | `GET /api/v1/reports/reconciliation` | `src/Hosts/Api/Program.cs:1760` | dual session; Adminต้อง `txn.view` + scope | line fields map; KPI derivableจาก response | backend filter/error; UIไม่มี loading/error | `BLOCKED` | stateไม่ครบตาม constraint | report only |
| REPORT-01 | `/control/reports` — `src/components/control/reports/view.tsx:38` | aggregate mock payment sessions | KPI + PSP/method/originator breakdown; period preset; sparkline | `GET /reports/operations`; `GET /reports/operations/export`; `GET /reports/dashboard` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:20,190,219` | AdminSession + `txn.view/export` | totals/breakdown map; presetต้องแปลง from/to; backendไม่มี sparkline series | max 31 days, 422 broad query, export cap; UIไม่มี loading/error | `BLOCKED` | existing chart/stateไม่รองรับ contractครบ | report only |
| PAYCFG-X1 | — (ไม่มี surface) | — | provider/method/merchant/user override และ resolution | payment-control 20 GET/PUT operationsใต้ `/payments/.../methods...` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:27-299` | AdminSession + merchant/user manage/view; writes CSRF+`If-Match`+Idempotency | ไม่มี production UI slot | ETag/override resolution/errorไม่มี consumer | `BACKEND_EXTRA` | ห้ามเพิ่ม config UI | report only |

### Dashboard และ commerce

| ID | Route + component `file:line` | Current data source | UI slot/action เดิม | HTTP method + endpoint | Backend source `file:line` | Auth/permission | Request/response mapping | Paging/filter/sort/error/concurrency | Status | เหตุผล | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DASH-01 | `/dashboard` — `src/components/dashboard/payment-summary-widget.tsx:41`, `src/components/dashboard/current-download.tsx:8`, `src/components/dashboard/area-installed.tsx:16` | typed dashboard mock | KPI, status donut, method/channel breakdown | `GET /api/v1/reports/dashboard` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:20` | AdminSession + `txn.view` | totals/status/method/PSP/originatorบางส่วน map; chart series/labelsไม่ครบ | from/to/merchantId; 400/422/503; UIไม่มี loading/error | `BLOCKED` | ต่อจริงต้องเพิ่ม stateและ adapter decisions | report only |
| DASH-02 | `/dashboard` — invoices/actions `src/components/dashboard/new-invoices.tsx:40` | mock | invoice/order action listและ badges | ไม่มี endpointที่คืน shapeนี้ | — | — | ไม่มี response contractสำหรับ surfaceนี้ | client-only; no loading/error | `NO_ENDPOINT` | backendไม่มี operationสำหรับ data groupเดิม | report only |
| DASH-03 | `/dashboard` — `src/components/dashboard/welcome-banner.tsx:14`, `src/components/dashboard/featured-carousel.tsx:11`, `src/components/dashboard/related-applications.tsx:75`, `src/components/dashboard/widget-circular.tsx:9` | template/static mock | carousel, apps, circular widgets | — (ไม่พบ endpoint) | — | — | ไม่มี contract | local interactionsเท่านั้น | `NO_ENDPOINT` | template groupsไม่มี backend capability | report only |
| TXN-01 | `/transaction/list`, `/read?id` — `src/components/transaction/list-view.tsx:13`, `detail-view.tsx:112` | mock `src/lib/mock/transactions.ts:1`; derived `src/lib/transaction.ts:62` | list/filter/sort/page/CSV; money/status/customer/items; detail timeline | `GET /payments/transactions`; `GET .../export`; `GET /payments/transactions/{id}` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:51,90,165` | AdminSession + `txn.view/export` | backend masked customer/order/lifecycle/capabilities; UI source/channel/policy/phone/link derivedต่าง | SFS/server paging/export limits/ETag/errors; UI client paging ไม่มี loading/error | `BLOCKED` | fieldและ stateไม่ครบสำหรับ swapตรง | report only |
| TXN-02 | same routes — toolbar/columns `src/components/transaction/list-toolbar.tsx:57`, `src/components/transaction/table-columns.tsx:156`; detail actions | mock/inert handlers | edit/copy/delete/resend/extend/open/download actions | — (ไม่พบ transaction mutation endpointsตรง action) | — | — | ไม่มี request contract | ไม่มี error/concurrency semantics | `NO_ENDPOINT` | UI actionไม่มี backend operationตรง | report only |
| ORDER-01 | `/order/list`, `/read?id` — `src/components/order/list-view.tsx:25`, `src/components/order/detail-view.tsx:111` | mock `src/lib/mock/orders.ts:1`; derived `src/lib/order.ts:39,124` | order/customer/session table, client filters/page/CSV; detail/resend/cancel | `GET /orders`; `GET /orders/export`; `GET /orders/{id}`; resend/cancel operations | `src/Hosts/Api/Program.cs:1420,1465,1577,1630,1701` | AdminSession + `txn.view/manage/export`; mutation CSRF/Idempotency/`If-Match`ตาม endpoint | DTO/lifecycle/customer maskingต่าง; UI link/action assumptionsไม่ตรง | SFS/export window/ETag/errors/loadingไม่มี | `BLOCKED` | ต้องเพิ่ม adapter, state และ concurrency flow | report only |
| POLICY-01 | `/policy/list` — `src/components/policy/marketplace-view.tsx:31`; `src/hooks/use-policy-table-with-cart.ts:44` | mock `src/lib/mock/policies.ts:1` | insurance/customer/product/premium/VCP fields; local cart | `GET /api/v1/products/documents` | `src/Hosts/Api/Program.cs:835` | AdminSession + `txn.view`; merchantId/originatorId required | backend document product fieldsไม่ครอบ policy/customer/coverage/VCP lifecycleที่ UIใช้ | paged filters/503 upstream; UIไม่มี compatible error/loading | `API_FIELD_MISSING` | partial recordห้ามผสม mockกับ real | report only |
| CHECKOUT-01 | `/checkout/[sessionId]` — `src/components/policy/checkout-session-view.tsx:11`, `src/components/policy/checkout-view.tsx:66`; `src/lib/policy/checkout.ts:10` | localStorage + fabricated UUID link | editable customer/items/discount/channel/expiry/notifications/recipients/note; create payment flow | carts 6 operations, payment-session 3 operations, `POST /orders` | `src/Hosts/Api/Program.cs:872-1258,1511` | dual/Admin sessionตาม endpoint; CSRF/Idempotency/`If-Match` | backend cart/order/session lifecycleและ wire fieldsไม่ตรง local policy checkout | ETag, 409/412/503, redirect lifecycle; UIไม่มี compatible states | `BLOCKED` | ต้องเปลี่ยน flow/record shape; ห้าม partial integration | report only |

## Route coverage ledger

ทุก production route ปรากฏครั้งเดียว. `LOCAL` หมายถึง routeไม่มี domain data slot/actionที่ต้องเชื่อม API.

| # | Route | Page source `file:line` | Decision ID | Coverage note |
|---:|---|---|---|---|
| 1 | `/` | `src/app/page.tsx:5` | LOCAL | redirect `/dashboard` |
| 2 | `/admin/role/create` | `src/app/admin/role/create/page.tsx:3` | AROLE-02 | create role |
| 3 | `/admin/role/edit` | `src/app/admin/role/edit/page.tsx:5` | AROLE-03 | edit role |
| 4 | `/admin/role/list` | `src/app/admin/role/list/page.tsx:10` | AROLE-01 | role list/actions |
| 5 | `/admin/role/read` | `src/app/admin/role/read/page.tsx:5` | AROLE-04 | role detail |
| 6 | `/admin/user/edit` | `src/app/admin/user/edit/page.tsx:15` | AUSER-03 | hard-coded edit |
| 7 | `/admin/user/list` | `src/app/admin/user/list/page.tsx:10` | AUSER-01 | user list |
| 8 | `/admin/user/new` | `src/app/admin/user/new/page.tsx:7` | AUSER-02 | create form |
| 9 | `/admin/user/read` | `src/app/admin/user/read/page.tsx:11` | AUSER-04 | hard-coded detail |
| 10 | `/checkout/[sessionId]` | `src/app/checkout/[sessionId]/page.tsx:8` | CHECKOUT-01 | cart/order/payment flow |
| 11 | `/control/api-clients` | `src/app/control/api-clients/page.tsx:8` | APIC-01 | list/KPI |
| 12 | `/control/api-clients/read` | `src/app/control/api-clients/read/page.tsx:8` | APIC-01 | detail/revoke |
| 13 | `/control/approvals` | `src/app/control/approvals/page.tsx:8` | APP-01 | list/actions |
| 14 | `/control/approvals/read` | `src/app/control/approvals/read/page.tsx:8` | APP-01 | detail/actions |
| 15 | `/control/audit` | `src/app/control/audit/page.tsx:8` | AUD-01, AUD-02, AUD-03 | list |
| 16 | `/control/audit/read` | `src/app/control/audit/read/page.tsx:8` | AUD-01, AUD-02, AUD-03 | detail |
| 17 | `/control/notifications` | `src/app/control/notifications/page.tsx:8` | NOTIF-01, NOTIF-02 | rules/log tabs |
| 18 | `/control/notifications/read` | `src/app/control/notifications/read/page.tsx:8` | NOTIF-02 | delivery detail |
| 19 | `/control/originators` | `src/app/control/originators/page.tsx:8` | ORIG-01, ORIG-02 | list |
| 20 | `/control/originators/read` | `src/app/control/originators/read/page.tsx:8` | ORIG-01, ORIG-02 | detail |
| 21 | `/control/psp/create` | `src/app/control/psp/create/page.tsx:9` | PSP-01 | real create |
| 22 | `/control/psp/edit` | `src/app/control/psp/edit/page.tsx:9` | PSP-01 | real edit |
| 23 | `/control/psp/list` | `src/app/control/psp/list/page.tsx:9` | PSP-01 | real list |
| 24 | `/control/psp/read` | `src/app/control/psp/read/page.tsx:9` | PSP-01 | real detail/test/change |
| 25 | `/control/reconciliation` | `src/app/control/reconciliation/page.tsx:8` | RECON-01 | reconciliation |
| 26 | `/control/reports` | `src/app/control/reports/page.tsx:8` | REPORT-01 | operations report |
| 27 | `/control/routing` | `src/app/control/routing/page.tsx:8` | ROUTE-01 | ruleset list |
| 28 | `/control/routing/read` | `src/app/control/routing/read/page.tsx:8` | ROUTE-01 | ruleset detail |
| 29 | `/control/tenants` | `src/app/control/tenants/page.tsx:8` | TEN-01, TEN-02 | tenant list |
| 30 | `/control/tenants/read` | `src/app/control/tenants/read/page.tsx:8` | TEN-01, TEN-02 | tenant detail |
| 31 | `/control/webhooks` | `src/app/control/webhooks/page.tsx:8` | WH-01 | endpoint/event list |
| 32 | `/control/webhooks/read` | `src/app/control/webhooks/read/page.tsx:8` | WH-01 | event detail/replay shell |
| 33 | `/dashboard` | `src/app/dashboard/page.tsx:8` | DASH-01, DASH-02, DASH-03 | all widget groups |
| 34 | `/error/403` | `src/app/error/403/page.tsx:7` | LOCAL | local forbidden page; guard covered AUTH-01 |
| 35 | `/login-error` | `src/app/login-error/page.tsx:55` | AUTH-03 | auth error |
| 36 | `/login` | `src/app/login/page.tsx:7` | AUTH-02 | OIDC login |
| 37 | `/logout` | `src/app/logout/page.tsx:8` | AUTH-04 | session logout |
| 38 | `/maintenance` | `src/app/maintenance/page.tsx:55` | LOCAL | static maintenance page |
| 39 | `/merchant/role/create` | `src/app/merchant/role/create/page.tsx:3` | MROLE-02 | create role |
| 40 | `/merchant/role/edit` | `src/app/merchant/role/edit/page.tsx:5` | MROLE-03 | edit role |
| 41 | `/merchant/role/list` | `src/app/merchant/role/list/page.tsx:10` | MROLE-01 | role list |
| 42 | `/merchant/role/read` | `src/app/merchant/role/read/page.tsx:5` | MROLE-04 | role detail |
| 43 | `/merchant/user/edit` | `src/app/merchant/user/edit/page.tsx:16` | MUSER-03 | hard-coded edit |
| 44 | `/merchant/user/list` | `src/app/merchant/user/list/page.tsx:10` | MUSER-01 | mock list |
| 45 | `/merchant/user/new` | `src/app/merchant/user/new/page.tsx:10` | MUSER-02 | direct-registration form |
| 46 | `/merchant/user/read` | `src/app/merchant/user/read/page.tsx:13` | MUSER-04 | detail/local approval |
| 47 | `/order/list` | `src/app/order/list/page.tsx:9` | ORDER-01 | list/export |
| 48 | `/order/read` | `src/app/order/read/page.tsx:8` | ORDER-01 | detail/actions |
| 49 | `/organization/division/create` | `src/app/organization/division/create/page.tsx:3` | ORG-DIV | create |
| 50 | `/organization/division/edit` | `src/app/organization/division/edit/page.tsx:5` | ORG-DIV | edit |
| 51 | `/organization/division/list` | `src/app/organization/division/list/page.tsx:10` | ORG-DIV | list |
| 52 | `/organization/division/read` | `src/app/organization/division/read/page.tsx:5` | ORG-DIV | detail |
| 53 | `/organization/level/create` | `src/app/organization/level/create/page.tsx:3` | ORG-LVL | create |
| 54 | `/organization/level/edit` | `src/app/organization/level/edit/page.tsx:5` | ORG-LVL | edit |
| 55 | `/organization/level/list` | `src/app/organization/level/list/page.tsx:10` | ORG-LVL | list |
| 56 | `/organization/level/read` | `src/app/organization/level/read/page.tsx:5` | ORG-LVL | detail |
| 57 | `/organization/office/create` | `src/app/organization/office/create/page.tsx:3` | ORG-OFF | create |
| 58 | `/organization/office/edit` | `src/app/organization/office/edit/page.tsx:5` | ORG-OFF | edit |
| 59 | `/organization/office/list` | `src/app/organization/office/list/page.tsx:10` | ORG-OFF | list |
| 60 | `/organization/office/read` | `src/app/organization/office/read/page.tsx:5` | ORG-OFF | detail |
| 61 | `/organization/position/create` | `src/app/organization/position/create/page.tsx:3` | ORG-POS | create |
| 62 | `/organization/position/edit` | `src/app/organization/position/edit/page.tsx:5` | ORG-POS | edit |
| 63 | `/organization/position/list` | `src/app/organization/position/list/page.tsx:10` | ORG-POS | list |
| 64 | `/organization/position/read` | `src/app/organization/position/read/page.tsx:5` | ORG-POS | detail |
| 65 | `/policy/list` | `src/app/policy/list/page.tsx:8` | POLICY-01 | policy marketplace/cart |
| 66 | `/transaction/list` | `src/app/transaction/list/page.tsx:9` | TXN-01, TXN-02 | list/export/actions |
| 67 | `/transaction/read` | `src/app/transaction/read/page.tsx:8` | TXN-01, TXN-02 | detail/actions |

## Admin endpoint coverage ledger

Ledgerนี้ deriveจาก Admin audience rule แล้ว dedupeด้วย `METHOD + normalized path`. Pathตัด route constraints เช่น `:guid` ออกเพื่ออ่านง่าย แต่คง parameter name. ทุก operationปรากฏครั้งเดียว.

### Auth, Admin, RBAC และ reference data

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-001 | `GET /api/v1/admins/auth/{provider}/login` | `src/Hosts/Api/Program.cs:1809` | anonymous; rate limit | AUTH-02 — `ALREADY_REAL` |
| EP-002 | `POST /api/v1/admins/auth/logout` | `src/Hosts/Api/Program.cs:1832` | AdminSession + CSRF | AUTH-04 — `ALREADY_REAL` |
| EP-003 | `POST /api/v1/admins/auth/logout-all` | `src/Hosts/Api/Program.cs:1858` | AdminSession + CSRF | AUTH-X1 — `BACKEND_EXTRA` |
| EP-004 | `GET /api/v1/admins/me` | `src/Hosts/Api/Program.cs:2639` | AdminSession | AUTH-01 — `ALREADY_REAL` |
| EP-005 | `POST /api/v1/admins` | `src/Hosts/Api/Program.cs:2674` | AdminSession + Super + CSRF | AUSER-02 — `BLOCKED` |
| EP-006 | `GET /api/v1/admins` | `src/Hosts/Api/Program.cs:2721` | AdminSession + `user.view`; SFS | AUSER-01 — `BLOCKED` |
| EP-007 | `GET /api/v1/admins/{id}` | `src/Hosts/Api/Program.cs:2750` | AdminSession + `user.view`; ETag | AUSER-04 — `BLOCKED` |
| EP-008 | `GET /api/v1/admins/{id}/effective-permissions` | `src/Hosts/Api/Program.cs:2791` | AdminSession | AUSER-X1 — `BACKEND_EXTRA` |
| EP-009 | `POST /api/v1/admins/{id}/merchants` | `src/Hosts/Api/Program.cs:2806` | AdminSession + Super + CSRF + `If-Match` | AUSER-X1 — `BACKEND_EXTRA` |
| EP-010 | `DELETE /api/v1/admins/{id}/merchants/{merchantId}` | `src/Hosts/Api/Program.cs:2826` | AdminSession + Super + CSRF + `If-Match` | AUSER-X1 — `BACKEND_EXTRA` |
| EP-011 | `POST /api/v1/admins/{id}/suspend` | `src/Hosts/Api/Program.cs:2847` | AdminSession + Super + CSRF + `If-Match` | AUSER-X1 — `BACKEND_EXTRA` |
| EP-012 | `POST /api/v1/admins/{id}/reactivate` | `src/Hosts/Api/Program.cs:2870` | AdminSession + Super + CSRF + `If-Match` | AUSER-X1 — `BACKEND_EXTRA` |
| EP-013 | `POST /api/v1/admins/{id}/tier` | `src/Hosts/Api/Program.cs:2892` | AdminSession + Super + CSRF + `If-Match` | AUSER-X1 — `BACKEND_EXTRA` |
| EP-014 | `PUT /api/v1/admins/{id}/profile` | `src/Hosts/Api/Program.cs:2918` | AdminSession + `user.manage` + CSRF + `If-Match` | AUSER-03 — `BLOCKED` |
| EP-015 | `GET /api/v1/admins/{id}/sessions` | `src/Hosts/Api/Program.cs:3087` | AdminSession + Super | AUSER-X1 — `BACKEND_EXTRA` |
| EP-016 | `DELETE /api/v1/admins/{id}/sessions/{sessionId}` | `src/Hosts/Api/Program.cs:3105` | AdminSession + Super + CSRF + Idempotency | AUSER-X1 — `BACKEND_EXTRA` |
| EP-017 | `GET /api/v1/admins/permissions` | `src/Hosts/Api/Program.cs:3149` | AdminSession | AROLE-01 — `CONTRACT_MISMATCH` |
| EP-018 | `GET /api/v1/admins/roles` | `src/Hosts/Api/Program.cs:3163` | AdminSession; SFS | AROLE-01 — `CONTRACT_MISMATCH` |
| EP-019 | `GET /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3189` | AdminSession; ETag | AROLE-04 — `CONTRACT_MISMATCH` |
| EP-020 | `POST /api/v1/admins/roles` | `src/Hosts/Api/Program.cs:3208` | AdminSession + `user.roles` + CSRF | AROLE-02 — `CONTRACT_MISMATCH` |
| EP-021 | `PUT /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3229` | AdminSession + `user.roles` + CSRF + `If-Match` | AROLE-03 — `CONTRACT_MISMATCH` |
| EP-022 | `DELETE /api/v1/admins/roles/{code}` | `src/Hosts/Api/Program.cs:3250` | AdminSession + `user.roles` + CSRF + `If-Match` | AROLE-01 — `CONTRACT_MISMATCH` |
| EP-023 | `PUT /api/v1/admins/{id}/roles` | `src/Hosts/Api/Program.cs:3269` | AdminSession + `user.roles` + CSRF + `If-Match` | AUSER-03 — `BLOCKED` |
| EP-024 | `GET /api/v1/positions` | `src/Hosts/Api/Program.cs:2992` | AdminSession + `user.view`; paged | ORG-POS — `CONTRACT_MISMATCH` |
| EP-025 | `GET /api/v1/positions/{id}` | `src/Hosts/Api/Program.cs:3009` | AdminSession + `user.view`; ETag | ORG-POS — `CONTRACT_MISMATCH` |
| EP-026 | `POST /api/v1/positions` | `src/Hosts/Api/Program.cs:3026` | AdminSession + `user.manage` + CSRF | ORG-POS — `CONTRACT_MISMATCH` |
| EP-027 | `PUT /api/v1/positions/{id}` | `src/Hosts/Api/Program.cs:3044` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-POS — `CONTRACT_MISMATCH` |
| EP-028 | `DELETE /api/v1/positions/{id}` | `src/Hosts/Api/Program.cs:3066` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-POS — `CONTRACT_MISMATCH` |
| EP-029 | `GET /api/v1/offices` | `src/Hosts/Api/Program.cs:2992` | AdminSession + `user.view`; paged | ORG-OFF — `CONTRACT_MISMATCH` |
| EP-030 | `GET /api/v1/offices/{id}` | `src/Hosts/Api/Program.cs:3009` | AdminSession + `user.view`; ETag | ORG-OFF — `CONTRACT_MISMATCH` |
| EP-031 | `POST /api/v1/offices` | `src/Hosts/Api/Program.cs:3026` | AdminSession + `user.manage` + CSRF | ORG-OFF — `CONTRACT_MISMATCH` |
| EP-032 | `PUT /api/v1/offices/{id}` | `src/Hosts/Api/Program.cs:3044` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-OFF — `CONTRACT_MISMATCH` |
| EP-033 | `DELETE /api/v1/offices/{id}` | `src/Hosts/Api/Program.cs:3066` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-OFF — `CONTRACT_MISMATCH` |
| EP-034 | `GET /api/v1/levels` | `src/Hosts/Api/Program.cs:2992` | AdminSession + `user.view`; paged | ORG-LVL — `CONTRACT_MISMATCH` |
| EP-035 | `GET /api/v1/levels/{id}` | `src/Hosts/Api/Program.cs:3009` | AdminSession + `user.view`; ETag | ORG-LVL — `CONTRACT_MISMATCH` |
| EP-036 | `POST /api/v1/levels` | `src/Hosts/Api/Program.cs:3026` | AdminSession + `user.manage` + CSRF | ORG-LVL — `CONTRACT_MISMATCH` |
| EP-037 | `PUT /api/v1/levels/{id}` | `src/Hosts/Api/Program.cs:3044` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-LVL — `CONTRACT_MISMATCH` |
| EP-038 | `DELETE /api/v1/levels/{id}` | `src/Hosts/Api/Program.cs:3066` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-LVL — `CONTRACT_MISMATCH` |
| EP-039 | `GET /api/v1/divisions` | `src/Hosts/Api/Program.cs:2992` | AdminSession + `user.view`; paged | ORG-DIV — `CONTRACT_MISMATCH` |
| EP-040 | `GET /api/v1/divisions/{id}` | `src/Hosts/Api/Program.cs:3009` | AdminSession + `user.view`; ETag | ORG-DIV — `CONTRACT_MISMATCH` |
| EP-041 | `POST /api/v1/divisions` | `src/Hosts/Api/Program.cs:3026` | AdminSession + `user.manage` + CSRF | ORG-DIV — `CONTRACT_MISMATCH` |
| EP-042 | `PUT /api/v1/divisions/{id}` | `src/Hosts/Api/Program.cs:3044` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-DIV — `CONTRACT_MISMATCH` |
| EP-043 | `DELETE /api/v1/divisions/{id}` | `src/Hosts/Api/Program.cs:3066` | AdminSession + `user.manage` + CSRF + `If-Match` | ORG-DIV — `CONTRACT_MISMATCH` |

### Merchant lifecycle และ Admin merchant identity

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-044 | `POST /api/v1/merchants` | `src/Hosts/Api/Program.cs:1884` | AdminSession + Super + CSRF | TEN-X1 — `BACKEND_EXTRA` |
| EP-045 | `GET /api/v1/merchants/{code}` | `src/Hosts/Api/Program.cs:1941` | AdminSession + `merchant.view`; ETag | TEN-01 — `API_FIELD_MISSING` |
| EP-046 | `GET /api/v1/merchants` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:317` | AdminSession + `merchant.view`; paged | TEN-01 — `API_FIELD_MISSING` |
| EP-047 | `PUT /api/v1/merchants/{merchantId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:338` | AdminSession + `merchant.manage`; CSRF + `If-Match` + Idempotency | TEN-01 — `API_FIELD_MISSING` |
| EP-048 | `POST /api/v1/merchants/{merchantId}/suspend` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:370` | same mutation controls | TEN-X1 — `BACKEND_EXTRA` |
| EP-049 | `POST /api/v1/merchants/{merchantId}/reactivate` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:370` | same mutation controls | TEN-X1 — `BACKEND_EXTRA` |
| EP-050 | `POST /api/v1/admins/merchants/users/{merchantUserId}/approve` | `src/Hosts/Api/Program.cs:2553` | AdminSession + approve permission + CSRF + `If-Match` + Idempotency | MUSER-04 — `BLOCKED` |
| EP-051 | `POST /api/v1/admins/merchants/users/{merchantUserId}/reject` | `src/Hosts/Api/Program.cs:2588` | same; body reason | MUSER-04 — `BLOCKED` |
| EP-052 | `GET /api/v1/admins/merchants/users/{merchantUserId}/registrations` | `src/Hosts/Api/Program.cs:2614` | AdminSession + view/reveal permission | MUSER-X1 — `BACKEND_EXTRA` |
| EP-053 | `GET /api/v1/merchants/{merchantId}/users/{merchantUserId}/edit` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:30` | AdminSession + user manage; ETag | MUSER-03 — `BLOCKED` |
| EP-054 | `POST /api/v1/merchants/{merchantId}/user-invitations` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:54` | AdminSession + permission + CSRF + Idempotency | MUSER-02 — `BLOCKED` |
| EP-055 | `PUT /api/v1/merchants/{merchantId}/users/{merchantUserId}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:78` | AdminSession + permission + CSRF + `If-Match` | MUSER-03 — `BLOCKED` |
| EP-056 | `GET /api/v1/merchants/{merchantId}/roles` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:107` | AdminSession + permission; SFS | MROLE-01 — `BLOCKED` |
| EP-057 | `GET /api/v1/merchants/{merchantId}/roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:136` | AdminSession + permission; ETag | MROLE-04 — `BLOCKED` |
| EP-058 | `GET /api/v1/merchants/{merchantId}/permissions` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:157` | AdminSession + permission | MROLE-01 — `BLOCKED` |
| EP-059 | `POST /api/v1/merchants/{merchantId}/roles` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:177` | AdminSession + permission + CSRF | MROLE-02 — `BLOCKED` |
| EP-060 | `PUT /api/v1/merchants/{merchantId}/roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:201` | AdminSession + permission + CSRF + `If-Match` | MROLE-03 — `BLOCKED` |
| EP-061 | `DELETE /api/v1/merchants/{merchantId}/roles/{code}` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:225` | AdminSession + permission + CSRF + `If-Match` | MROLE-01 — `BLOCKED` |
| EP-062 | `PUT /api/v1/merchants/{merchantId}/users/{merchantUserId}/roles` | `src/Hosts/Api/ControlPlane/AdminMerchantIdentityEndpoints.cs:246` | AdminSession + permission + CSRF + `If-Match` | MUSER-03 — `BLOCKED` |

### API clients และ governance

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-063 | `GET /api/v1/api-clients` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:13` | AdminSession + `apikey.manage`; paged | APIC-01 — `BLOCKED` |
| EP-064 | `GET /api/v1/api-clients/{clientId}` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:25` | AdminSession + `apikey.manage`; ETag | APIC-01 — `BLOCKED` |
| EP-065 | `POST /api/v1/api-clients` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:39` | AdminSession + `apikey.manage`; CSRF + Idempotency | APIC-X1 — `BACKEND_EXTRA` |
| EP-066 | `PUT /api/v1/api-clients/{clientId}` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:54` | AdminSession + `apikey.manage`; CSRF + `If-Match` + Idempotency | APIC-X1 — `BACKEND_EXTRA` |
| EP-067 | `POST /api/v1/api-clients/{clientId}/revoke` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:69` | AdminSession + `apikey.manage`; CSRF + `If-Match` + Idempotency | APIC-01 — `BLOCKED` |
| EP-068 | `POST /api/v1/api-clients/{clientId}/secret-rotation-requests` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:84` | AdminSession + `apikey.manage`; CSRF + `If-Match` + Idempotency; 202 | APIC-X1 — `BACKEND_EXTRA` |
| EP-069 | `POST /api/v1/api-clients/secrets/{ticketId}/reveal` | `src/Hosts/Api/Iam/ApiClientEndpoints.cs:102` | AdminSession + `apikey.manage`; CSRF + Idempotency; no-store | APIC-X1 — `BACKEND_EXTRA` |
| EP-070 | `GET /api/v1/approvals` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:72` | AdminSession + `settings.manage`; paged | APP-01 — `BLOCKED` |
| EP-071 | `GET /api/v1/approvals/{approvalId}` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:83` | same; ETag | APP-01 — `BLOCKED` |
| EP-072 | `POST /api/v1/approvals/{approvalId}/approve` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:126` | same + CSRF + `If-Match` + Idempotency; 202 | APP-01 — `BLOCKED` |
| EP-073 | `POST /api/v1/approvals/{approvalId}/reject` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:126` | same controls; 202 | APP-01 — `BLOCKED` |
| EP-074 | `GET /api/v1/audits` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:98` | AdminSession + `audit.view`; paged; integrity 503 | AUD-01 — `API_FIELD_MISSING` |
| EP-075 | `GET /api/v1/audits/{auditId}` | `src/Hosts/Api/Governance/GovernanceEndpoints.cs:110` | AdminSession + `audit.view`; sanitized | AUD-01 — `API_FIELD_MISSING` |

### Commerce, payment sessions, orders และ reconciliation

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-076 | `GET /api/v1/products/documents` | `src/Hosts/Api/Program.cs:835` | AdminSession + `txn.view`; merchantId+originatorId | POLICY-01 — `API_FIELD_MISSING` |
| EP-077 | `POST /api/v1/carts` | `src/Hosts/Api/Program.cs:872` | dual/Admin `txn.manage`; CSRF + Idempotency | CHECKOUT-01 — `BLOCKED` |
| EP-078 | `POST /api/v1/carts/{cartId}/items` | `src/Hosts/Api/Program.cs:913` | dual/Admin `txn.manage`; CSRF + Idempotency | CHECKOUT-01 — `BLOCKED` |
| EP-079 | `GET /api/v1/carts/{cartId}` | `src/Hosts/Api/Program.cs:968` | dual session; ETag | CHECKOUT-01 — `BLOCKED` |
| EP-080 | `DELETE /api/v1/carts/{cartId}/items/{itemId}` | `src/Hosts/Api/Program.cs:1003` | dual; CSRF + `If-Match` + Idempotency + ETag | CHECKOUT-01 — `BLOCKED` |
| EP-081 | `PUT /api/v1/carts/{cartId}/items/{itemId}` | `src/Hosts/Api/Program.cs:1039` | same controls | CHECKOUT-01 — `BLOCKED` |
| EP-082 | `POST /api/v1/carts/{cartId}/clear` | `src/Hosts/Api/Program.cs:1076` | same controls | CHECKOUT-01 — `BLOCKED` |
| EP-083 | `POST /api/v1/payments/sessions` | `src/Hosts/Api/Program.cs:1109` | dual/Admin; CSRF + Idempotency | CHECKOUT-01 — `BLOCKED` |
| EP-084 | `POST /api/v1/payments/sessions/{paymentSessionId}/redirect` | `src/Hosts/Api/Program.cs:1198` | dual; CSRF + `If-Match` + Idempotency + ETag | CHECKOUT-01 — `BLOCKED` |
| EP-085 | `GET /api/v1/payments/sessions/{paymentSessionId}` | `src/Hosts/Api/Program.cs:1258` | dual session; ETag | CHECKOUT-01 — `BLOCKED` |
| EP-086 | `POST /api/v1/orders/{orderId}/summary/resend` | `src/Hosts/Api/Program.cs:1420` | AdminSession + `txn.manage`; CSRF + Idempotency | ORDER-01 — `BLOCKED` |
| EP-087 | `POST /api/v1/orders/{orderId}/cancel` | `src/Hosts/Api/Program.cs:1465` | AdminSession + `txn.manage`; CSRF + `If-Match` + Idempotency | ORDER-01 — `BLOCKED` |
| EP-088 | `POST /api/v1/orders` | `src/Hosts/Api/Program.cs:1511` | dual/Admin; CSRF + Idempotency | CHECKOUT-01 — `BLOCKED` |
| EP-089 | `GET /api/v1/orders` | `src/Hosts/Api/Program.cs:1577` | dual/Admin `txn.view`; SFS | ORDER-01 — `BLOCKED` |
| EP-090 | `GET /api/v1/orders/export` | `src/Hosts/Api/Program.cs:1630` | AdminSession + `txn.export`; from/to | ORDER-01 — `BLOCKED` |
| EP-091 | `GET /api/v1/orders/{orderId}` | `src/Hosts/Api/Program.cs:1701` | dual/Admin `txn.view`; ETag | ORDER-01 — `BLOCKED` |
| EP-092 | `GET /api/v1/reports/reconciliation` | `src/Hosts/Api/Program.cs:1760` | dual/Admin `txn.view` | RECON-01 — `BLOCKED` |

### Payment capability override

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-093 | `GET /api/v1/payments/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:27` | AdminSession + merchant view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-094 | `PUT /api/v1/payments/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:38` | AdminSession + manage; CSRF + `If-Match` + Idempotency | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-095 | `GET /api/v1/payments/providers/{providerCode}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:54` | AdminSession + merchant view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-096 | `PUT /api/v1/payments/providers/{providerCode}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:65` | AdminSession + manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-097 | `GET /api/v1/payments/providers/{providerCode}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:81` | AdminSession + view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-098 | `PUT /api/v1/payments/providers/{providerCode}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:93` | AdminSession + manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-099 | `GET /api/v1/payments/providers/{providerCode}/methods/{method}/options/{option}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:110` | AdminSession + view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-100 | `PUT /api/v1/payments/providers/{providerCode}/methods/{method}/options/{option}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:122` | AdminSession + manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-101 | `GET /api/v1/payments/psp-connections/{connectionId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:139` | AdminSession + view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-102 | `PUT /api/v1/payments/psp-connections/{connectionId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:151` | AdminSession + manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-103 | `GET /api/v1/payments/psp-connections/{connectionId}/methods/{method}/options/{option}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:168` | AdminSession + view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-104 | `PUT /api/v1/payments/psp-connections/{connectionId}/methods/{method}/options/{option}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:180` | AdminSession + manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-105 | `GET /api/v1/payments/merchants/{merchantId}/methods` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:197` | AdminSession + `merchant.view` | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-106 | `GET /api/v1/payments/merchants/{merchantId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:209` | AdminSession + `merchant.view`; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-107 | `PUT /api/v1/payments/merchants/{merchantId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:221` | AdminSession + `merchant.manage`; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-108 | `GET /api/v1/payments/merchants/{merchantId}/users/{userId}/methods` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:238` | AdminSession + merchant-user view | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-109 | `GET /api/v1/payments/merchants/{merchantId}/users/{userId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:256` | AdminSession + merchant-user view; ETag | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-110 | `PUT /api/v1/payments/merchants/{merchantId}/users/{userId}/methods/{method}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:268` | AdminSession + merchant-user manage; mutation controls | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-111 | `GET /api/v1/payments/merchants/{merchantId}/users/{userId}/methods/{method}/resolution` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:285` | AdminSession + merchant-user view | PAYCFG-X1 — `BACKEND_EXTRA` |
| EP-112 | `GET /api/v1/payments/merchants/{merchantId}/users/{userId}/methods/{method}/options` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:299` | AdminSession + merchant-user view; provider query | PAYCFG-X1 — `BACKEND_EXTRA` |

### Originators, PSP connections และ routing

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-113 | `GET /api/v1/originators` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:398` | AdminSession + `merchant.view`; paged filters | ORIG-01 — `BLOCKED` |
| EP-114 | `GET /api/v1/originators/{originatorId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:421` | AdminSession + `merchant.view`; ETag | ORIG-01 — `BLOCKED` |
| EP-115 | `POST /api/v1/originators` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:444` | AdminSession + `merchant.manage` + CSRF | ORIG-X1 — `BACKEND_EXTRA` |
| EP-116 | `PUT /api/v1/originators/{originatorId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:468` | same + `If-Match` | ORIG-X1 — `BACKEND_EXTRA` |
| EP-117 | `DELETE /api/v1/originators/{originatorId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:496` | same + `If-Match` | ORIG-X1 — `BACKEND_EXTRA` |
| EP-118 | `POST /api/v1/originators/{originatorId}/enable` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:521` | same + `If-Match`; ETag | ORIG-X1 — `BACKEND_EXTRA` |
| EP-119 | `POST /api/v1/originators/{originatorId}/disable` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:521` | same + `If-Match`; ETag | ORIG-X1 — `BACKEND_EXTRA` |
| EP-120 | `GET /api/v1/payments/psp-connections` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:548` | AdminSession + `settings.manage`; paged | PSP-01 — `ALREADY_REAL` |
| EP-121 | `GET /api/v1/payments/psp-connections/{connectionId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:571` | same; ETag | PSP-01 — `ALREADY_REAL` |
| EP-122 | `POST /api/v1/payments/psp-connections` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:594` | `settings.manage` + `merchant.manage`; CSRF + Idempotency; ETag | PSP-01 — `ALREADY_REAL` |
| EP-123 | `PUT /api/v1/payments/psp-connections/{connectionId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:620` | AdminSession + `settings.manage`; CSRF + `If-Match` + Idempotency | PSP-01 — `ALREADY_REAL` |
| EP-124 | `POST /api/v1/payments/psp-connections/{connectionId}/test` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:646` | same mutation controls | PSP-01 — `ALREADY_REAL` |
| EP-125 | `POST /api/v1/payments/psp-connections/{connectionId}/credential-change-requests` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:672` | same controls; 202 | PSP-01 — `ALREADY_REAL` |
| EP-126 | `GET /api/v1/payments/routing-rulesets` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:700` | AdminSession + `settings.manage`; paged | ROUTE-01 — `BLOCKED` |
| EP-127 | `GET /api/v1/payments/routing-rulesets/{rulesetId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:721` | same; ETag | ROUTE-01 — `BLOCKED` |
| EP-128 | `POST /api/v1/payments/routing-rulesets` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:744` | same + CSRF; draft + ETag | ROUTE-01 — `BLOCKED` |
| EP-129 | `PUT /api/v1/payments/routing-rulesets/{rulesetId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:766` | same + CSRF + `If-Match` | ROUTE-01 — `BLOCKED` |
| EP-130 | `DELETE /api/v1/payments/routing-rulesets/{rulesetId}` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:791` | same + CSRF + `If-Match` | ROUTE-01 — `BLOCKED` |
| EP-131 | `POST /api/v1/payments/routing-rulesets/{rulesetId}/activation-requests` | `src/Hosts/Api/ControlPlane/AdminControlEndpoints.cs:812` | same + CSRF + `If-Match` + Idempotency; 202 | ROUTE-01 — `BLOCKED` |

### Notifications และ webhooks

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-132 | `GET /api/v1/webhooks/endpoints` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:14` | AdminSession + `settings.manage`; paged | WH-01 — `BLOCKED` |
| EP-133 | `GET /api/v1/webhooks/endpoints/{endpointId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:27` | same; ETag | WH-01 — `BLOCKED` |
| EP-134 | `POST /api/v1/webhooks/endpoints` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:40` | same + CSRF + Idempotency; ETag | WH-01 — `BLOCKED` |
| EP-135 | `PUT /api/v1/webhooks/endpoints/{endpointId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:55` | same + `If-Match` + Idempotency | WH-01 — `BLOCKED` |
| EP-136 | `DELETE /api/v1/webhooks/endpoints/{endpointId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:72` | same controls | WH-01 — `BLOCKED` |
| EP-137 | `GET /api/v1/webhooks/deliveries` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:85` | AdminSession + `settings.manage`; paged | WH-01 — `BLOCKED` |
| EP-138 | `GET /api/v1/webhooks/deliveries/{deliveryId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:98` | same | WH-01 — `BLOCKED` |
| EP-139 | `POST /api/v1/webhooks/deliveries/{deliveryId}/replay` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:109` | same + CSRF + Idempotency | WH-01 — `BLOCKED` |
| EP-140 | `GET /api/v1/notifications/rules` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:123` | AdminSession + `settings.manage`; paged | NOTIF-01 — `BLOCKED` |
| EP-141 | `GET /api/v1/notifications/rules/{ruleId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:136` | same; ETag | NOTIF-01 — `BLOCKED` |
| EP-142 | `POST /api/v1/notifications/rules` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:149` | same + CSRF + Idempotency; ETag | NOTIF-01 — `BLOCKED` |
| EP-143 | `PUT /api/v1/notifications/rules/{ruleId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:165` | same + `If-Match` + Idempotency | NOTIF-01 — `BLOCKED` |
| EP-144 | `DELETE /api/v1/notifications/rules/{ruleId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:182` | same controls | NOTIF-01 — `BLOCKED` |
| EP-145 | `GET /api/v1/notifications/deliveries` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:195` | AdminSession + `settings.manage`; paged | NOTIF-02 — `BLOCKED` |
| EP-146 | `GET /api/v1/notifications/deliveries/{deliveryId}` | `src/Hosts/Api/Notifications/DeliveryEndpoints.cs:208` | same | NOTIF-02 — `BLOCKED` |
| EP-147 | `GET /api/v1/webhooks/inbound-events` | `src/Hosts/Api/Webhooks/InboundWebhookEndpoints.cs:13` | AdminSession + `audit.view`; paged filters | WH-01 — `BLOCKED` |
| EP-148 | `GET /api/v1/webhooks/inbound-events/{eventId}` | `src/Hosts/Api/Webhooks/InboundWebhookEndpoints.cs:45` | AdminSession + `audit.view`; redacted | WH-01 — `BLOCKED` |

### Admin reporting และ transactions

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-149 | `GET /api/v1/reports/dashboard` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:20` | AdminSession + `txn.view`; from/to/merchantId | DASH-01 — `BLOCKED` |
| EP-150 | `GET /api/v1/payments/transactions` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:51` | AdminSession + `txn.view`; SFS | TXN-01 — `BLOCKED` |
| EP-151 | `GET /api/v1/payments/transactions/export` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:90` | AdminSession + `txn.export`; from/to | TXN-01 — `BLOCKED` |
| EP-152 | `GET /api/v1/payments/transactions/{paymentSessionId}` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:165` | AdminSession + `txn.view`; ETag | TXN-01 — `BLOCKED` |
| EP-153 | `GET /api/v1/reports/operations` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:190` | AdminSession + `txn.view`; period/merchantId | REPORT-01 — `BLOCKED` |
| EP-154 | `GET /api/v1/reports/operations/export` | `src/Hosts/Api/Reporting/AdminReportingEndpoints.cs:219` | AdminSession + `txn.export`; period; 100 MiB cap | REPORT-01 — `BLOCKED` |

### Dual-console merchant-user reads

| # | Method + endpoint | Backend source `file:line` | Auth/permission + contract | Decision/status |
|---:|---|---|---|---|
| EP-155 | `GET /api/v1/merchants/users` | `src/Hosts/Api/Program.cs:2244` | dual-console; AdminSession branch `merchants.users.view`; MerchantUserSession branch `users.view`; SFS max 100 | MUSER-01 — `BLOCKED` |
| EP-156 | `GET /api/v1/merchants/users/{merchantUserId}` | `src/Hosts/Api/Program.cs:2281` | dual-console; AdminSession branch `merchants.users.view`; MerchantUserSession branch `users.view`; ETag | MUSER-04 — `BLOCKED` |

## Existing integration ที่ไม่ควรทำซ้ำ

- Admin auth/BFF: AUTH-01 ถึง AUTH-04 ใช้ httpOnly `__Host-adm_session`, same-origin proxy และ CSRF double-submitอยู่แล้ว.
- PSP connections: PSP-01 ครบ list/create/detail/update/test/credential-change, รวม ETag, `If-Match`, Idempotency, retry และ conflict handling.
- Admin role และ organization adaptersยิง APIจริงแต่ยังไม่ใช่ `ALREADY_REAL`: AROLE-01..04 และ ORG-* มี stale DTO/paging/concurrency จึงห้ามนับว่าพร้อม.

## รายการเสนอ implement หลังอนุมัติ

ไม่มี `EXACT_MATCH`. ภายใต้ข้อห้าม “UX/UI เหมือนเดิมทุกประการ” และ “stateไม่ครบให้ BLOCKED” ไม่มี mock-backed decision row ที่ปลอดภัยพอสำหรับ Phase 2.

รายการที่ใกล้สุดแต่ยังห้าม implement:

- `RECON-01`: fieldหลัก mapได้ แต่ UIไม่มี loading/error state.
- `REPORT-01` และ `DASH-01`: aggregateหลัก mapได้ แต่ period, chart series และ error stateไม่ครบ.
- `ORIG-01`: read fieldsหลัก mapได้ แต่ server paging/ETag/loading/errorไม่ครบ.
- `AROLE-*` และ `ORG-*`: adapterมีแล้วแต่ DTO, paging และ ETag/`If-Match` stale.

## Phase 1 change evidence

- สร้างเฉพาะ `.claude/specs/pol-core-api-integration/api-gap-report.md`.
- ไม่แก้ source, JSX, CSS, configuration, dependency หรือไฟล์ใน `pol-core`.
- ไม่เริ่ม requirements, design, tasks หรือ implementation.
- `git diff --name-only` ไม่แสดง untracked reportตามธรรมชาติ; ต้องอ่านคู่กับ `git status --short` และ `git ls-files --others --exclude-standard` ใน verificationท้ายงาน.

## คำถามขออนุมัติ

ผล audit มี `EXACT_MATCH = 0` จึงไม่มีรายการให้อนุมัติ implementตรงตาม scopeเดิม. ต้องการให้หยุดที่รายงานนี้ หรืออนุมัติขยาย scopeเพื่อแก้ gap ใดก่อน เช่นเพิ่ม existing loading/error stateสำหรับ `RECON-01`, ทำ adapter/concurrencyให้ `AROLE-*`/`ORG-*`, หรือปรับ UX/lifecycleของรายการ `BLOCKED`?

STATUS: NEEDS-INPUT
