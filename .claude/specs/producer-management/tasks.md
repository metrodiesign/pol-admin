# Tasks: Producer Module

> Status: approved 2026-06-23 (quick, no gates)

Build order: Slice A (T1–T5) → verify → Slice B (T6) → verify.

## Slice A — producer account CRUD

- [x] **T1 — Types + validation (pure) + tests** [REQ-3.1–3.3, REQ-5]
  - `src/types/producer.ts` (`Producer`, `ProducerStatus`, `ProducerPersonType`, `ProducerFormData`, `PERSON_TYPE_LABEL`)
  - `src/lib/producer/producer-validation.ts` (`isThaiId`, `isThaiPhone`, `isValidLicense`, `isEmail`, `validateProducerForm`)
  - `src/lib/producer/producer-validation.test.ts` (cover 5.1–5.7)

  Evidence: 18 vitest cases in producer-validation.test.ts pass (92 total green); viewports n/a (pure logic, no UI); deviations: none.

- [x] **T2 — Mock data** [REQ-3.4, 3.5]
  - `src/lib/mock/producers.ts` (`PRODUCERS: Producer[]`, 10 ราย, มีทั้ง individual+juristic, ค่าถูกตาม validation)

  Evidence: next build type-checks PRODUCERS:Producer[] green; values satisfy validation (id 13-digit, phone 10-digit, license individual 10-digit / juristic free-text); viewports n/a (data only); deviations: none.

- [x] **T3 — View components** [REQ-2, REQ-4, REQ-6]
  - `producer-edit-form-card.tsx` (เขียนใหม่: 9 ฟิลด์ + radio personType + acceptTerms + readOnly + validateProducerForm)
  - `producer-edit-profile-card.tsx`, `producer-table-columns.tsx`, `producer-list-toolbar.tsx`, `producer-list-view.tsx`

  Evidence: lint clean + next build green; viewports 375/768/1440 verified on /producer/new (radio personType, 9 fields, accept-terms render + responsive stack) and /producer/list @1440 (table, Thai personType labels, status badges, name-sort, pagination); deviations: phone uses plain numeric TextField (Thai 10-digit, no PhoneCountrySelect) and personType uses native radio (no radio primitive in system).

- [x] **T4 — Routes** [REQ-1]
  - `src/app/producer/layout.tsx` + `list/`, `new/` (layout+page), `edit/` (layout+page), `read/` (layout+page)
  - breadcrumb root "ตัวแทน/นายหน้า", metadata ภาษาไทย

  Evidence: next build prerendered /producer/{list,new,edit,read}; pages HTTP 200 with Thai content; viewports 375/768/1440 on /producer/new + /producer/list @1440 (screenshots); deviations: edit/read use a static mock entry (UI shell, mirrors user module — no per-row id route).

- [x] **T5 — Navigation** [REQ-7]
  - แทรก NavGroup "ตัวแทน/นายหน้า" ใน `minimals-nav-config.ts` + `nav-config.ts` (หลังกลุ่ม "ผู้ใช้งาน & สิทธิ์")

  Evidence: build green; sidebar renders group "ตัวแทน/นายหน้า" active on /producer (1440/768/375 screenshots) with breadcrumb/search auto-derived; deviations: role nav item ("บทบาทและสิทธิ์") added in T6.

- [x] **Verify A** [REQ-9]

  Evidence: 92 vitest pass + lint clean (ESLint no issues) + next build success (4 producer routes prerendered); viewports 375/768/1440 per T3/T4 screenshots; deviations: none.

## Slice B — producer-role clone

- [x] **T6 — Clone role submodule → producer-role** [REQ-8]
  - app: `src/app/producer/role/{list,create,edit,read}`
  - components: `src/components/producer-role/*` (14)
  - types/mock/lib: `producer-role.ts`, `mock/producer-role.ts`, `producer-role/role-permissions.ts`
  - rewrite paths `/user/role`→`/producer/role` + imports → producer-role namespace

  Evidence: next build prerendered /producer/role/{list,create,edit,read}; isolation grep = 0 refs to @/components/role|@/lib/role|@/lib/mock/role|@/types/role|/user/role in clone; lint clean + 92 vitest pass; /producer/role/list serves Thai content (บทบาท/สิทธิ์); viewports n/a (verbatim clone of already-verified user/role responsive classes); deviations: lib kept as role-permissions.ts inside lib/producer-role/ (dir namespace gives isolation; not renamed); no unit test added (source role-permissions.ts ships none).

- [x] **Verify B** [REQ-8.6, 9.3]

  Evidence: next build success all 4 /producer/role routes + lint clean + 92 vitest pass; isolation = 0 cross-refs to original role namespace; viewports n/a (clone parity with verified user/role); deviations: none.

## Follow-up — admin approval

- [x] **T7 — ปุ่มอนุมัติ (admin review)** [REQ-10]
  - `producer-edit-profile-card.tsx`: `onApprove?` prop + ปุ่ม "อนุมัติ" (แสดงเมื่อ status==="pending" && !readOnly)
  - `src/app/producer/edit/page.tsx`: `status` local state (init "pending") + `onApprove={() => setStatus("active")}`

  Evidence: lint clean + next build green; browser /producer/edit @1440 — status "รอตรวจสอบ" shows green "อนุมัติ" button, click flips status to "ใช้งาน" and hides the button (verified via a11y snapshot uid=button "อนุมัติ" + before/after screenshots); viewports 1440 verified, 375/768 n/a (button reuses already-verified profile-card layout); deviations: UI-shell local state (no persist); approve on edit only (not readOnly read page); reject button deferred (งานแยก).
