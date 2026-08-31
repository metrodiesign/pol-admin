# แผนตรวจ Control Plane UI Parity ใน Browser

> **สำหรับ agentic workers:** ต้องใช้ `superpowers:executing-plans` เพื่อทำแผนนี้ทีละขั้นพร้อม checkpoint

**Goal:** ยืนยันทุกหน้าใน 4 กลุ่ม Control plane ว่าใช้ UX/UI pattern เดียวกับ Merchant user/role และแก้เฉพาะ mismatch ที่พิสูจน์ได้จาก browser

**Architecture:** ใช้ implementation และ shared kit ที่ผ่าน spec แล้วเป็นฐาน ไม่ rewrite component หรือเปลี่ยน data flow เปิด route จริงที่ `https://localhost:3001` เทียบ reference ที่ viewport เดียวกัน แล้วเพิ่ม regression assertion ก่อนแก้เฉพาะ component เจ้าของ mismatch

**Tech Stack:** Next.js 16.3.1, React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest 4.1.9

**Spec:** `.claude/specs/control-plane-ui-parity/{requirements,design,tasks}.md`

## Global Constraints

- ไม่แก้ mock data, store, filter, sort, pagination หรือ action handler
- ไม่ import `src/components/merchant/**` เข้า `src/components/control/**`
- คง `ControlStatusBadge`, page size เริ่มต้น 10 และ destructive revoke ที่ท้าย API client card
- ไม่แก้ `src/lib/**`, `src/types/**`, Merchant components, shared table/UI/charts/layout หรือ `globals.css`
- `/organization/*` อยู่นอก scope เพราะไม่ใช่กลุ่ม `Control plane · องค์กร`
- ไม่เพิ่ม dependency

---

## Route Matrix

| กลุ่ม | List route | Read flow |
|---|---|---|
| การเชื่อมต่อ | `/control/psp/list` | เปิดรายละเอียดจาก action ในแถว |
| การเชื่อมต่อ | `/control/routing` | เปิดรายละเอียดจาก action ในแถว |
| การเชื่อมต่อ | `/control/api-clients` | เปิดรายละเอียดจาก action ในแถว |
| การเชื่อมต่อ | `/control/webhooks` | เปิดรายละเอียดจาก action ในแถว |
| การกำกับดูแล | `/control/approvals` | เปิดรายละเอียดจาก action ในแถว |
| การกำกับดูแล | `/control/audit` | เปิดรายละเอียดจาก action ในแถว |
| การกำกับดูแล | `/control/notifications` | เปิด Delivery log แล้วเปิดรายละเอียดจาก action ในแถว |
| การเงิน | `/control/reconciliation` | ไม่มี read route |
| การเงิน | `/control/reports` | ไม่มี read route |
| องค์กร | `/control/tenants` | เปิดรายละเอียดจาก action ในแถว |
| องค์กร | `/control/originators` | เปิดรายละเอียดจาก action ในแถว |

## Task 1: ตรวจ Reference และ Control Routes

**Files:**

- Read: `src/app/merchant/user/list/page.tsx`
- Read: `src/components/merchant/user/list-view.tsx`
- Read: `src/components/merchant/role/view.tsx`
- Read: `src/components/merchant/role/read-view.tsx`
- Read: `src/components/control/**`
- No source modification

**Interfaces:**

- **Consumes:** แอป local ที่ `https://localhost:3001` และ Microsoft SSO session ของผู้ใช้
- **Produces:** browser evidence แยกตาม route, viewport และ requirement

- [ ] **Step 1: เปิดแอปด้วย launcher ของ repository**

```bash
npm run dev
```

Expected: Next.js พร้อมรับ request ที่ `https://localhost:3001` โดยไม่ชน process เดิม

- [ ] **Step 2: เปิด reference pages ที่ viewport 1440 px**

เปิด `/merchant/user/list`, `/merchant/role/list` และ `/merchant/role/read` จากรายการจริง

Expected: เห็น reference ของ header, breadcrumb, toolbar, table card, row actions, pagination และ detail card

- [ ] **Step 3: ตรวจ list routes ทุก route ใน Route Matrix ที่ viewport 1440 px**

ตรวจตาม REQ-1.1 ถึง REQ-1.7:

- Page header ไม่มี description และ breadcrumb จบด้วย “รายชื่อ”
- Toolbar ใช้ grid เดียวกับ Merchant และ filter clear ได้
- Table อยู่ใน card เดียว ไม่มี status spine หรือ chevron column
- Row action เป็น icon พร้อม tooltip
- Pagination และจำนวนต่อหน้าปรากฏเฉพาะหน้าที่เกี่ยวข้อง
- KPI, chart และ endpoint cards ใช้ shell เดียวกัน
- Notifications tabs อยู่ใน card เดียว

Expected: ทุกข้อผ่าน หรือบันทึก route, viewport, element และภาพที่ชี้ mismatch ได้ชัดเจน

- [ ] **Step 4: ตรวจ read routes ทุก route ใน Route Matrix ที่ viewport 1440 px**

ตรวจตาม REQ-2.1 ถึง REQ-2.6:

- Header มี “ยกเลิก” ก่อน detail card
- เนื้อหาอยู่ใน card เดียว มี identity band และ sections
- ไม่มี overline, status spine, aside หรือ `mmd:grid-cols-12`
- Webhook replay และ Approval approve/reject อยู่ใน header
- Routing toggle และ API client revoke ยังทำงานในตำแหน่งเดิม

Expected: ทุกข้อผ่าน หรือบันทึก mismatch แบบเดียวกับ Step 3

- [ ] **Step 5: ตรวจ responsive layout**

ตรวจ reference และ Control routes ที่ viewport 375 px และ 768 px โดยเน้น header actions, toolbar, tab strip, table overflow และ detail sections

Expected: ไม่มี body horizontal overflow, action ไม่ทับกัน และ control ใช้ behavior เดียวกับ reference

## Task 2: เพิ่ม Regression Proof และแก้ Residual Mismatch

**Files:**

- Test: `src/components/control/control-parity.test.ts`
- Modify only: component เจ้าของ mismatch ใต้ `src/app/control/**` หรือ `src/components/control/**`
- Reuse: `src/components/control/shared/**`

**Interfaces:**

- **Consumes:** mismatch ที่มี browser evidence จาก Task 1
- **Produces:** regression assertion ที่ fail ก่อนแก้และ minimal patch ที่ทำให้ผ่าน

- [ ] **Step 1: ตัดสินจาก evidence**

ถ้า Task 1 ผ่านทุก route ให้จบ Task 2 โดยไม่แก้ source ถ้าพบ mismatch ให้ระบุ requirement, route และ component เจ้าของก่อนแตะโค้ด

- [ ] **Step 2: เพิ่ม assertion ที่ reproduce mismatch**

เพิ่ม assertion ใน test block ที่ตรงกับ list, detail หรือ not-found โดยตรวจ markup/class/text ที่ขาดหรือผิดจาก requirement

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: test ใหม่ fail ด้วย assertion ที่ตรงกับ browser mismatch ส่วน test เดิมยังผ่าน

- [ ] **Step 3: แก้ component เจ้าของ mismatch**

Reuse `ControlToolbar`, `RowActions`, `DetailIdentity`, `DetailSection`, `DetailNotFound`, `StatCard` หรือ style constants ที่มีอยู่ ห้ามสร้าง shared abstraction ใหม่

- [ ] **Step 4: รัน regression test**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: ทุก test ผ่าน

- [ ] **Step 5: ตรวจ route ที่แก้ซ้ำใน browser**

ตรวจ viewport 375 px, 768 px และ 1440 px

Expected: mismatch หายและ surrounding behavior ไม่เปลี่ยน

## Task 3: รัน Quality Gates

**Files:**

- Verify only: source และ test ที่เปลี่ยนจาก Task 2
- Update evidence only if source changed: `.claude/specs/control-plane-ui-parity/tasks.md`

**Interfaces:**

- **Consumes:** browser evidence และ patch จาก Task 2
- **Produces:** gate results ที่อ้าง command และจำนวน test จริง

- [ ] **Step 1: รัน focused lint และ typecheck**

```bash
npx eslint src/components/control src/app/control
npm run typecheck
```

Expected: exit code 0 ทั้งสองคำสั่ง

- [ ] **Step 2: รัน test suite**

```bash
npm test
```

Expected: exit code 0 และไม่มี skipped/focused test ใหม่

- [ ] **Step 3: รัน spec trace**

```bash
scripts/spec-trace.sh control-plane-ui-parity
```

Expected: requirement trace ผ่านครบ

- [ ] **Step 4: ตรวจ architecture boundary**

```bash
rg 'components/merchant' src/components/control
rg 'ControlListToolbar|StatusSpine|status-spine' src/components/control src/app/control
```

Expected: ไม่มีผลลัพธ์

- [ ] **Step 5: บันทึกผล**

ถ้าไม่มี source change ให้รายงาน verification-only และไม่แก้ spec ถ้ามี source change ให้เพิ่ม Evidence ใต้ Task 6 โดยระบุ route, viewport, test command และผลจริง

## Self-review

- **Spec coverage:** Task 1 ครอบ REQ-1 และ REQ-2; Task 2 ครอบ regression proof และ shared-kit constraints; Task 3 ครอบ REQ-4
- **Scope:** PSP ตรวจ visual เพราะอยู่ใต้เมนูจริง แต่ห้าม refactor เพิ่มหากไม่พบ mismatch
- **Stop condition:** browser matrix และ quality gates ผ่านครบ แล้วหยุดโดยไม่ทำ cleanup หรือ redesign เพิ่ม
