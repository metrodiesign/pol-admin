# Design: Producer Module (ตัวแทน/นายหน้าประกันภัย)

> Status: approved 2026-06-23 (quick, no gates)

## Architecture Overview

Vertical clone ของ `user` module → `producer` namespace, **ยกเว้น data model + form** ที่เขียนใหม่
ตาม field spec "การลงทะเบียนตัวแทน". Frontend-only mock, CRUD เป็น UI shell.

ชั้นที่สร้าง:
1. Types/logic — `src/types/producer.ts`, `src/lib/producer/producer-validation.ts` (+ test), `src/lib/mock/producers.ts`
2. Components — `src/components/producer/*` (5 ไฟล์)
3. Routes — `src/app/producer/*` (layout + list/new/edit/read)
4. Nav — แทรก NavGroup ใน `minimals-nav-config.ts` (render จริง) + `nav-config.ts` (breadcrumb/search)
5. Slice B — clone role submodule → producer-role namespace

## Data Models

```ts
// src/types/producer.ts
export type ProducerStatus = "active" | "pending" | "banned" | "rejected" | "disabled";
export type ProducerPersonType = "individual" | "juristic";

export interface Producer {
  id: string;
  firstName: string;
  lastName: string;
  personType: ProducerPersonType;
  idNumber: string;        // 13-digit
  producerCode: string;
  licenseNumber: string;   // optional; individual=10-digit, juristic=free text
  avatarUrl: string;
  phoneNumber: string;     // 10-digit
  email: string;
  status: ProducerStatus;
}

export interface ProducerFormData {
  firstName: string;
  lastName: string;
  personType: ProducerPersonType;
  idNumber: string;
  producerCode: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  acceptTerms: boolean;
}

export const PERSON_TYPE_LABEL: Record<ProducerPersonType, string> = {
  individual: "บุคคลธรรมดา",
  juristic: "นิติบุคคล",
};
```

## Key Functions (pure — `src/lib/producer/producer-validation.ts`)

```ts
isThaiId(v): boolean            // /^\d{13}$/
isThaiPhone(v): boolean         // /^\d{10}$/
isValidLicense(personType, v): boolean   // ""→true; individual→/^\d{10}$/; juristic→true
isEmail(v): boolean             // simple RFC-lite
export type ProducerFormErrors = Partial<Record<keyof ProducerFormData, string>>;
validateProducerForm(form, opts?: { requireAcceptTerms?: boolean }): ProducerFormErrors
```

`validateProducerForm` รวมกฎ required (5.7) + format (5.1–5.6). `requireAcceptTerms` เปิดเฉพาะหน้า create (4.9).
ไฟล์ test: `src/lib/producer/producer-validation.test.ts` (vitest/jest auto-detect; ถ้าไม่มี runner ผูก → ไฟล์เป็น executable spec + gate รัน typecheck).

## Components

| Component | clone จาก | ต่างจากต้นฉบับ |
|---|---|---|
| `producer-list-view` | `user-list-view` | data=PRODUCERS, filter=personType (แทน role), columns=producerColumns |
| `producer-list-toolbar` | `user-list-toolbar` | dropdown personType (บุคคลธรรมดา/นิติบุคคล) แทน role |
| `producer-table-columns` | `user-table-columns` | columns: select, name(+avatar+email), producerCode, personType, phone, licenseNumber, status, actions → link `/producer/{read,edit}` |
| `producer-edit-form-card` | `user-edit-form-card` | **เขียนใหม่**: 9 ฟิลด์ + radio personType + acceptTerms; ใช้ `validateProducerForm`; readOnly mode |
| `producer-edit-profile-card` | `user-edit-profile-card` | avatar=photoUrl, status badge, switches (banned/emailVerified), `onApprove` button (แสดงเมื่อ status==="pending") — copy + rename |

ฟอร์ม: ใช้ `@/components/form/text-field`, `@/components/ui/checkbox` (acceptTerms), native `<input type=radio>` (personType), `@/components/shared/avatar-upload` (photo ในการ์ดซ้าย).
Validation error: state `errors: ProducerFormErrors`, set ตอน submit, แสดงใต้แต่ละ field.

## Routes — `src/app/producer/`

mirror user module:
- `layout.tsx` → `<MinimalsLayout>` (REQ-1.5)
- `list/page.tsx` (+ metadata) → PageHeader + ProducerListView, action "เพิ่มตัวแทน" → `/producer/new`
- `new/layout.tsx` (metadata) + `new/page.tsx` → 2-column: profile card (photo) + ProducerEditFormCard (acceptTerms on)
- `edit/layout.tsx` + `edit/page.tsx` → mock entry, ProducerEditProfileCard + form
- `read/layout.tsx` + `read/page.tsx` → readOnly
- breadcrumb root: `{ label: "ตัวแทน/นายหน้า", href: "/producer/list" }`

## Nav (REQ-7)

แทรกหลังกลุ่ม `"ผู้ใช้งาน & สิทธิ์"` ในทั้งสองไฟล์:

```ts
{
  subheader: "ตัวแทน/นายหน้า",
  items: [
    { title: "ตัวแทน/นายหน้า", path: "/producer/list", icon: "user", match: "/producer", exclude: ["/producer/role"] },
    { title: "บทบาทและสิทธิ์", path: "/producer/role/list", icon: "lock", match: "/producer/role" }, // slice B
  ],
}
```

## Slice B — producer-role clone

| ต้นฉบับ | → ปลายทาง |
|---|---|
| `src/app/user/role/{list,create,edit,read}` | `src/app/producer/role/{list,create,edit,read}` |
| `src/components/role/*` (14) | `src/components/producer-role/*` |
| `src/types/role.ts` | `src/types/producer-role.ts` |
| `src/lib/mock/role.ts` | `src/lib/mock/producer-role.ts` |
| `src/lib/role/role-permissions.ts` (+test) | `src/lib/producer-role/producer-role-permissions.ts` (+test) |

rewrite: `/user/role` → `/producer/role`; imports `@/components/role` → `@/components/producer-role`, `@/lib/role` → `@/lib/producer-role`, `@/lib/mock/role` → `@/lib/mock/producer-role`, `@/types/role` → `@/types/producer-role`. cross-import ภายในกลุ่มเป็น relative → resolve เองหลัง copy.

## Error Handling

- form invalid → แสดง error ใต้ field, ไม่ submit (UI shell: submit = noop/toast).
- IF หลัง clone slice B เหลือ `/user/role` หรือ import role เดิม → grep ต้องได้ 0 (REQ-8.6).
- IF typecheck/build ล้ม → แก้ก่อน mark task เขียว.

## Testing Strategy

| Check | วิธี | REQ |
|---|---|---|
| validation rules | unit test `producer-validation.test.ts` | REQ-5.1–5.8 |
| routes ครบ | ไฟล์ list/new/edit/read page มีอยู่ | REQ-1.1–1.4 |
| components ครบ | ls `src/components/producer` (5) | REQ-2.2 |
| ไม่ผูก user namespace | `grep -rn "components/user" src/app/producer src/components/producer` = 0 | REQ-2.3 |
| producer-role ไม่ผูก role เดิม | `grep -rn "/user/role\|components/role\|lib/role\|types/role" src/app/producer/role src/components/producer-role` = 0 | REQ-8.5, 8.6 |
| nav group | navConfig + minimalsNavConfig มี subheader "ตัวแทน/นายหน้า" | REQ-7.1–7.4 |
| build/coexist | `npm run build` + lint ผ่าน, route ทั้งคู่เข้าได้ | REQ-9.2, 9.3 |

## Requirement Traceability

| Design element | satisfies |
|---|---|
| `src/app/producer/{layout,list,new,edit,read}` | REQ-1.1–1.6 |
| `src/components/producer/*` (5 ไฟล์), import producer namespace | REQ-2.1–2.4 |
| `src/types/producer.ts` (`Producer`, `ProducerFormData`, `ProducerPersonType`) | REQ-3.1–3.3 |
| `src/lib/mock/producers.ts` (`PRODUCERS`) | REQ-3.4, 3.5 |
| `producer-edit-form-card` 9 ฟิลด์ + radio + acceptTerms + readOnly | REQ-4.1–4.10 |
| `src/lib/producer/producer-validation.ts` + test | REQ-5.1–5.8 |
| `producer-list-view` + `producer-list-toolbar` + `producer-table-columns` | REQ-6.1–6.5 |
| NavGroup "ตัวแทน/นายหน้า" ใน minimals-nav-config.ts + nav-config.ts | REQ-7.1–7.6 |
| producer-role clone (app/components/types/mock/lib) | REQ-8.1–8.6 |
| `ProducerEditProfileCard.onApprove` button (pending only) + edit page `status` state flip | REQ-10.1–10.4 |
| ไม่แก้ user module (ยกเว้น nav), coexist, build | REQ-9.1–9.3 |
