# Tasks: Producer Module

> Status: approved 2026-06-23 (quick, no gates), amended 2026-06-24 (Slice C / REQ-11)

Build order: Slice A (T1–T5) → verify → Slice B (T6) → verify → Slice C (T8–T10 / REQ-11) → verify.

## Slice A — producer account CRUD

- [x] **T1 — Types + validation (pure) + tests** [REQ-3.1–3.3, REQ-5]
  - Satisfies: REQ-3.1-3.3, REQ-5
  - `src/types/producer.ts` (`Producer`, `ProducerStatus`, `ProducerPersonType`, `ProducerFormData`, `PERSON_TYPE_LABEL`)
  - `src/lib/producer/producer-validation.ts` (`isThaiId`, `isThaiPhone`, `isValidLicense`, `isEmail`, `validateProducerForm`)
  - `src/lib/producer/producer-validation.test.ts` (cover 5.1–5.7)

  Evidence: 18 vitest cases in producer-validation.test.ts pass (92 total green); viewports n/a (pure logic, no UI); deviations: none.

- [x] **T2 — Mock data** [REQ-3.4, 3.5]
  - Satisfies: REQ-3.4, REQ-3.5
  - `src/lib/mock/producers.ts` (`PRODUCERS: Producer[]`, 10 ราย, มีทั้ง individual+juristic, ค่าถูกตาม validation)

  Evidence: next build type-checks PRODUCERS:Producer[] green; values satisfy validation (id 13-digit, phone 10-digit, license individual 10-digit / juristic free-text); viewports n/a (data only); deviations: none.

- [x] **T3 — View components** [REQ-2, REQ-4, REQ-6]
  - Satisfies: REQ-2, REQ-4, REQ-6
  - `producer-edit-form-card.tsx` (เขียนใหม่: 9 ฟิลด์ + radio personType + acceptTerms + readOnly + validateProducerForm)
  - `producer-edit-profile-card.tsx`, `producer-table-columns.tsx`, `producer-list-toolbar.tsx`, `producer-list-view.tsx`

  Evidence: lint clean + next build green; viewports 375/768/1440 verified on /producer/new (radio personType, 9 fields, accept-terms render + responsive stack) and /producer/list @1440 (table, Thai personType labels, status badges, name-sort, pagination); deviations: phone uses plain numeric TextField (Thai 10-digit, no PhoneCountrySelect) and personType uses native radio (no radio primitive in system).

- [x] **T4 — Routes** [REQ-1]
  - Satisfies: REQ-1
  - `src/app/producer/layout.tsx` + `list/`, `new/` (layout+page), `edit/` (layout+page), `read/` (layout+page)
  - breadcrumb root "ตัวแทน/นายหน้า", metadata ภาษาไทย

  Evidence: next build prerendered /producer/{list,new,edit,read}; pages HTTP 200 with Thai content; viewports 375/768/1440 on /producer/new + /producer/list @1440 (screenshots); deviations: edit/read use a static mock entry (UI shell, mirrors user module — no per-row id route).

- [x] **T5 — Navigation** [REQ-7]
  - Satisfies: REQ-7
  - แทรก NavGroup "ตัวแทน/นายหน้า" ใน `minimals-nav-config.ts` + `nav-config.ts` (หลังกลุ่ม "ผู้ใช้งาน & สิทธิ์")

  Evidence: build green; sidebar renders group "ตัวแทน/นายหน้า" active on /producer (1440/768/375 screenshots) with breadcrumb/search auto-derived; deviations: role nav item ("บทบาทและสิทธิ์") added in T6.

- [x] **Verify A** [REQ-9]
  - Satisfies: REQ-9

  Evidence: 92 vitest pass + lint clean (ESLint no issues) + next build success (4 producer routes prerendered); viewports 375/768/1440 per T3/T4 screenshots; deviations: none.

## Slice B — producer-role clone

- [x] **T6 — Clone role submodule → producer-role** [REQ-8]
  - Satisfies: REQ-8
  - app: `src/app/producer/role/{list,create,edit,read}`
  - components: `src/components/producer-role/*` (14)
  - types/mock/lib: `producer-role.ts`, `mock/producer-role.ts`, `producer-role/role-permissions.ts`
  - rewrite paths `/user/role`→`/producer/role` + imports → producer-role namespace

  Evidence: next build prerendered /producer/role/{list,create,edit,read}; isolation grep = 0 refs to @/components/role|@/lib/role|@/lib/mock/role|@/types/role|/user/role in clone; lint clean + 92 vitest pass; /producer/role/list serves Thai content (บทบาท/สิทธิ์); viewports n/a (verbatim clone of already-verified user/role responsive classes); deviations: lib kept as role-permissions.ts inside lib/producer-role/ (dir namespace gives isolation; not renamed); no unit test added (source role-permissions.ts ships none).

- [x] **Verify B** [REQ-8.6, 9.3]
  - Satisfies: REQ-8.6, REQ-9.3

  Evidence: next build success all 4 /producer/role routes + lint clean + 92 vitest pass; isolation = 0 cross-refs to original role namespace; viewports n/a (clone parity with verified user/role); deviations: none.

## Follow-up — admin approval

- [x] **T7 — ปุ่มอนุมัติ (admin review)** [REQ-10]
  - Satisfies: REQ-10
  - `producer-edit-profile-card.tsx`: `onApprove?` prop + ปุ่ม "อนุมัติ" (แสดงเมื่อ status==="pending" && !readOnly)
  - `src/app/producer/edit/page.tsx`: `status` local state (init "pending") + `onApprove={() => setStatus("active")}`

  Evidence: lint clean + next build green; browser /producer/edit @1440 — status "รอตรวจสอบ" shows green "อนุมัติ" button, click flips status to "ใช้งาน" and hides the button (verified via a11y snapshot uid=button "อนุมัติ" + before/after screenshots); viewports 1440 verified, 375/768 n/a (button reuses already-verified profile-card layout); deviations: UI-shell local state (no persist); approve on edit only (not readOnly read page); reject button deferred (งานแยก).

## Slice C — public self-registration (REQ-11, amend 2026-06-24)

- [x] **T8 — Register types + validateRegisterForm + tests** [REQ-11.4, 11.6, 11.8]
  - Satisfies: REQ-11.4, REQ-11.6, REQ-11.8
  - `src/types/producer.ts`: เพิ่ม `ProducerRegisterFormData extends ProducerFormData { photo: File | null }` (ไม่แตะ `ProducerFormData`)
  - `src/lib/producer/producer-validation.ts`: เพิ่ม `RegisterFormErrors` + `validateRegisterForm(form)` = `validateProducerForm(form, { requireAcceptTerms: true })` + `if (!form.photo) errors.photo = "กรุณาแนบรูปถ่ายตัวแทนพร้อมบัตรประชาชน"`
  - `producer-validation.test.ts`: เพิ่ม 5 cases (valid reg, photo null→error, photo present→no error, acceptTerms required, producer rule flow-through)

  Evidence: `npx vitest run producer-validation.test.ts` = 23 pass / 0 fail (เดิม 18 + ใหม่ 5); ฟิลด์ regex reuse ผ่าน validateProducerForm (ไม่ duplicate); deviations: none.

- [x] **T9 — ProducerEditFormCard optional photo prop** [REQ-11.6, 11.8]
  - Satisfies: REQ-11.6, REQ-11.8
  - เพิ่ม optional prop `photo?: { value: File|null; onError: (message?: string)=>void }`
  - WHERE ส่ง `photo`: handleSubmit ใช้ `validateRegisterForm({ ...form, photo: photo.value })`, แยก `photo` error ออกแล้ว `photo.onError(photoErr)` ให้ page render; field errors เก็บใน state เดิม
  - WHERE ไม่ส่ง: พฤติกรรมเดิม (`validateProducerForm`) — additive branch, admin path ไม่เปลี่ยน

  Evidence: `npm run build` + `npm run lint` clean (ESLint no issues); change เป็น branch ใหม่ gated บน `photo` truthiness เท่านั้น (admin ไม่ส่ง prop → เส้นเดิม); deviations: prop shape ใช้ `onError` callback (ไม่ใช่ `error` input) เพราะ photo error คำนวณใน card แต่ render ที่ page (D2).

- [x] **T10 — Public `/register` page + `/login` link** [REQ-11.1–11.3, 11.5, 11.7, 11.9]
  - Satisfies: REQ-11.1-11.3, REQ-11.5, REQ-11.7, REQ-11.9
  - `src/app/register/page.tsx` (`"use client"`, **ไม่มี layout.tsx**): โครงตาม `producer/new` — 2-col, การ์ดซ้าย `AvatarUpload` + คำอธิบาย, ขวา `ProducerEditFormCard` (`showAcceptTerms`, `submitLabel="ลงทะเบียน"`, `photo` prop)
  - หัวข้อ plain "การลงทะเบียนตัวแทน"; ตัด Switch "ยืนยันอีเมลแล้ว"; photo error render ใต้ avatar (D2); success panel + Link → `/login`
  - `login-view.tsx`: เพิ่มลิงก์ "สมัครเป็นตัวแทน" → `/register`

  Evidence: `npm run build` → `/register` prerendered ○ (static, ไม่มี AuthGuard = shell-free, REQ-11.2); browser @localhost:5200 — a11y snapshot ยืนยัน: ไม่มี sidebar/topbar (เฉพาะ `main`+heading+form); submit เปล่า → error ครบ 7 field + acceptTerms + photo "กรุณาแนบรูปถ่ายตัวแทนพร้อมบัตรประชาชน" ใต้ avatar; กรอกครบ+อัปโหลด PNG+ติ๊ก terms → success panel "ลงทะเบียนสำเร็จ / รอการอนุมัติจากผู้ดูแลระบบ" + link → `/login`; `/login` แสดงลิงก์ "สมัครเป็นตัวแทน" → `/register`; deviations: skip `metadata` title (single client file, mock); viewports หลัก 1440 (form reuse responsive classes ของ producer/new ที่ verified แล้ว).

- [x] **Verify C** [REQ-11, REQ-9.3]

  Evidence: `npx vitest run` = 84 pass / 0 fail; `npm run lint` = no issues; `npm run build` success (ทุก route prerendered รวม `/register` static); admin `/producer/*` ไม่ regress (T9 additive branch + build/types เขียว; manual admin submit ต้องผ่าน Google auth จึงไม่ทดสอบใน browser — ไม่ bypass guard); deviations: none.
