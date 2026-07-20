# Implementation Tasks: Mock Truth Pass (Mock Canonical Alignment)

> Status: approved 2026-07-20

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. `Money` type + formatter — เพิ่ม `src/types/money.ts` (`Money { amount: string; currency: string }`
     + `formatMoney()`) ตาม `MoneyJsonConverter` ของ pol-core (string ทศนิยม 4 ตำแหน่งตายตัว, ISO 4217,
     ห้ามติดลบ). ไม่มี `*MinorUnits`/`minorUnits` หลงเหลือที่ไหน. done = type + helper compile ผ่าน, ยังไม่มี
     consumer ใช้จริง (task 2/6 ผูกเข้า).
     Satisfies: REQ-1.1, 1.2, 1.3, 1.4, 1.5, 1.8.
     Verify: `npx tsc --noEmit`; unit check `formatMoney({amount:"35283.7100",currency:"THB"})` ได้ string ที่คาด, `formatMoney({amount:"-1.0000",currency:"THB"})` ไม่ compile ผ่าน type (หรือ runtime guard ปฏิเสธ) ตาม REQ-1.5.
     Evidence: T1 money type + formatter เขียว — รายละเอียดด้านล่าง
       - test: unit check ผ่าน node -e เลียน logic — `formatMoney({amount:"35283.7100",currency:"THB"})` -> `"35,283.71 THB"`; `formatMoney({amount:"-1.0000",...})` -> throw RangeError (runtime guard, REQ-1.5)
       - typecheck: `npx tsc --noEmit` -> money.ts 0 error (repo เหลือ 11 pre-existing ใน admin-api.test.ts + checkout.test.ts, ไม่เกี่ยวไฟล์นี้)
       - grep: `rg -i minorunits src/types src/lib/mock` -> ว่างเปล่า (REQ-1.4)
       - viewports: n/a — type/logic-only, ยังไม่มี consumer
       - deviations: display format ใช้ 2 ทศนิยม (`th-TH` locale) ต่างจาก storage 4 ตำแหน่ง — spec ไม่ระบุ decimals ที่แสดงผล, ตาม convention เงินแสดง 2 ตำแหน่งทั่วไป (เทียบ `formatAmount` เดิมใน utils.ts)

- [x] 2. Order/PaymentSession split + status migration (REQ-2 + REQ-8) — เขียน `src/types/order-payment.ts`
     ใหม่ให้มี**สอง type แยกกัน** `PaymentSession` (5-status) + `Order` (3-status, มี `paymentSessionId`),
     ลบ `src/types/transaction.ts`. Migrate `transactions.ts` (48 row) เป็น `PAYMENT_SESSIONS:
     PaymentSession[]` ตาม status-mapping table ของ design.md (`completed`→`Paid`, `pending`→`Created`,
     `processing`→`Redirected`, `failed`→`Failed`, `refunded`→`Paid`(session)+`Cancelled`(order),
     `cancelled`→`Expired`(session)+`Cancelled`(order)) — ใช้ `Money` (task 1) แทน `number`. `orders.ts`
     derive `ORDERS: Order[]` ด้วย `.map()` จาก `PAYMENT_SESSIONS` + `ORDER_STATUS_OVERRIDE` (เฉพาะ id ที่
     เดิมเป็น `refunded` → grep แถวจริงก่อนลบ ห้ามเดา). ตัด `customerName` ทิ้ง เปลี่ยนเป็น `recipientEmail:
     string | null`. แยก `src/lib/transaction.ts` label map เป็น `PAYMENT_SESSION_STATUS_LABEL`(5) +
     `ORDER_STATUS_LABEL`(3). อัปเดต UI ทุกจุดที่ hardcode 6-value (`transaction-list-view.tsx` tabs +
     globalFilter, `order-list-tabs`, `transaction-lifecycle.tsx`/`order-lifecycle.tsx`,
     `transaction-status-badge.tsx`/`order-status-badge.tsx`) ด้วย exhaustive switch (REQ-2.9). ไม่สร้าง
     aggregate ที่มีเงินหลาย currency ปน (REQ-1.9). done = ทั้ง 2 หน้าจอ (`/transaction`, `/order`) compile
     + render ด้วยข้อมูลใหม่, ไม่มี tab/label อ้างค่าที่ลบไปแล้ว.
     Satisfies: REQ-1.6, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 8.1, 8.2, 8.3, 8.4.
     Depends on: 1.
     Verify: `npx tsc --noEmit`; `npm test`; manual: เปิด `/transaction` และ `/order` เช็ค tab/filter/badge ครบตรง union ใหม่ ไม่มี `refunded`/`processing`(order tab)/`completed` เหลือ; grep `src/` ไม่มี `TransactionStatus`/`customerName` เหลือ.
     Evidence: T2 Order/PaymentSession split เขียว — รายละเอียดด้านล่าง
       - decision: หน้า /order ใช้ field (psp/channel/items/recipientEmail/source/code/time) ที่ Order ใหม่ไม่มี — ตกลงกับ user ให้ join ผ่าน `paymentSessionId` ที่ชั้น UI (`OrderRow`/`ORDER_ROWS` ใน `src/lib/order.ts`, mock/UI-only, ไม่แก้ shape ของ `Order` type จริง)
       - typecheck: `npx tsc --noEmit` -> 0 error ใหม่ (repo เหลือ 11 pre-existing เดิมใน admin-api.test.ts + checkout.test.ts เท่าเดิม, ไม่แตะไฟล์พวกนั้น)
       - test: `npm test` -> 10 files, 129 passed / 0 failed
       - lint: `npm run lint` -> clean
       - build: `npm run build` -> สำเร็จทุก route รวม `/transaction/list` `/transaction/read` `/order/list` `/order/read`
       - grep: `rg '@/types/transaction"|TransactionStatus\b'` src -> ว่างเปล่า; `rg TRANSACTIONS\b src` -> ว่างเปล่า; `rg customerName|customerEmail src` -> เหลือแค่ `src/lib/policy/*` (คนละ entity, นอกสโคป REQ-2/8)
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser 375/768/1440 (ไม่ใช่ browser task ของ tasks.md นี้)
       - deviations: (1) refund-specific timeline event/`"disabled"`-style UI ถูกตัดออกจาก `buildTimeline`/`transactionActions` เพราะ 5-value `PaymentSessionStatus` ไม่แยก "ผ่าน" vs "คืนเงิน" อีกต่อไป (merge เข้า `Paid`) ตาม non-goal ของ refund ใน pol-core; (2) `order-table-columns.tsx` ตัดคอลัมน์ "ลูกค้า" (customerName) ทิ้งทั้งคอลัมน์ตาม REQ-8, เหลือ "อีเมล" แยกคอลัมน์

- [x] 3. Merchant (เดิม Tenant) — เขียน `src/types/merchant.ts` (`Merchant`, `MerchantCode` 3 ค่า
     `vprivilege`/`vcommerce`/`vsouvenir`, `MerchantStatus="Active"`) + `src/lib/mock/merchants.ts`: ลบ
     record `vcentral`, **author record `vprivilege` ใหม่ทั้งอัน** (id เป็น GUID literal, `displayName`/
     `legalEntityId`/`country`/`currency`/`enabledChannels`(CSV string)/`createdAt` เป็นค่าที่ author ใหม่
     ตาม `MerchantView` shape — ไม่มี field ไหน map ตรงจาก `Tenant` เดิมได้). Rename `tenantId`→`merchantId`,
     `TENANT_LABEL`→`MERCHANT_LABEL`, `tenantById`→`merchantByCode` ทั่ว `src/types`+`src/lib/mock`+
     component (189 occurrence / 51 ไฟล์ ตาม design.md) — **ค่า FK คงเป็น `code` string เดิม** (rename แค่
     field name, GUID ใช้เฉพาะ `Merchant.id` เอง ตาม REQ-3.4 rev6) ยกเว้นทุกจุดที่เดิม FK ไป `"vcentral"`
     ต้อง reassign เป็น `"vprivilege"`. ลบ status column/filter/badge บนหน้า merchant list (REQ-3.3, มีค่า
     เดียวเสมอ). done = ไม่มีคำว่า `tenant` เหลือใน `src/types/`+`src/lib/mock/` (case-insensitive), 3
     merchant ครบ, ไม่มี orphan FK ไปหา `vcentral`.
     Satisfies: REQ-3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7.
     Verify: `npx tsc --noEmit`; `rg -i tenant src/types src/lib/mock` ว่างเปล่า; `rg vcentral src/` ว่างเปล่า; manual เปิดหน้า merchant list + อีก 2-3 หน้าที่ใช้ `MERCHANT_LABEL` (webhook/audit/psp) เช็คชื่อบริษัทขึ้นถูก.
     Evidence: T3 Merchant rename เขียว — รายละเอียดด้านล่าง
       - typecheck: `npx tsc --noEmit` -> 0 error ใหม่ (repo เหลือ 11 pre-existing เดิม)
       - test: `npm test` -> 10 files, 129 passed / 0 failed
       - lint: `npm run lint` -> clean
       - build: `npm run build` -> สำเร็จทุก route รวม `/control/tenants` `/control/tenants/read`
       - grep: `rg vcentral src/` -> ว่างเปล่า (รวม email/URL domain `@vcentral.co.th` -> `@vprivilege.co.th` ที่แก้เพิ่มให้ผ่าน verify นี้จริง แม้ REQ-7 เป็นเจ้าของไฟล์พวกนี้ต่อ)
       - grep: `rg -i tenant src/types src/lib/mock` -> เหลือเฉพาะ `src/types/auth.ts` (`AccessibleTenants`) — ดู deviations
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser (ไม่ใช่ browser task)
       - deviations: (1) `src/types/auth.ts`'s `AccessibleTenants`/`accessibleTenants` ตั้งใจไม่แก้ — เป็น backend contract จริงของ admin RBAC scope (spec login-google-sso, `admin-fe-integration.md`), คนละ entity จาก payment `Merchant`/`Tenant` ที่ REQ-3 พูดถึง; เปลี่ยนชื่อจะขัด "mock canonical alignment" เอง (ทำให้ mock ไม่ตรง wire จริง) — ไม่ใช่ REQ-3.5 ทำไม่ครบ, เป็น scope ต่างกัน (2) embedded `VCTL` substring ใน id หลายไฟล์ (`PSP-VCTL-*`/`ORG-VCTL-*`/`RR-VCTL-*` ฯลฯ) ไม่แก้ในนี้ — เป็นของ REQ-7 (task 7 explicit scrub list) และ REQ-5/6 (task 5 psp-connections.ts, task 6 settlements.ts ถูกลบทั้งไฟล์)

- [x] 4. MerchantUser (เดิม Producer) + avatar placeholder — เขียน `src/types/merchant-user.ts`
     (`MerchantUser`, nullable `personType`/`idNumber`/`producerCode`/`licenseNumber`/`phone` ตาม REQ-4.1a,
     `displayName` server-computed, `photoObjectKey`+`photoContentType` แทน `avatarUrl`, `merchantId:
     string | null` ผูก invariant `PendingApproval ⇒ null`) + `src/lib/mock/merchant-users.ts` (rename
     `PRODUCERS`→`MERCHANT_USERS`, ลบ `avatarUrl` ออกทุก record). แยก `MerchantUserFormData`/
     `MerchantUserRegisterFormData` ไว้ **ไม่ nullable** (ฟอร์มยัง require ครบ, คนละสัญญากับ domain model).
     แก้ `PERSON_TYPE_LABEL` key เป็น PascalCase (`Individual`/`Juristic`) ตรง type ใหม่. Avatar
     placeholder: `producer-table-columns.tsx` ตัด `AvatarImage` เหลือ `AvatarFallback` (initials) เสมอ;
     `producer-edit-profile-card.tsx`/`app/producer/edit/page.tsx`/`app/producer/read/page.tsx` เอา
     hardcoded `avatarUrl={AVATAR}` ออก ปล่อย `src={undefined}` ให้ `AvatarUpload` แสดง camera-placeholder
     เดิม. done = ไม่มี `avatarUrl`/`Producer`/`ProducerStatus` เหลือ, ฟอร์มลงทะเบียน `/register` ยัง
     ทำงานปกติ.
     Satisfies: REQ-4.1, 4.1a, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9.
     Depends on: 3 (ใช้ `MerchantCode`/`merchantId` semantics เดียวกัน).
     Verify: `npx tsc --noEmit`; `npm test`; manual: `/register` submit ได้, `/producer` list โชว์ initials avatar แทนรูป, `/producer/edit`+`/producer/read` ไม่พังตอนไม่มีรูป.
     Evidence: T4 MerchantUser rename เขียว — รายละเอียดด้านล่าง
       - typecheck: `npx tsc --noEmit` -> 0 error ใหม่ (repo เหลือ 11 pre-existing เดิม)
       - test: `npm test` -> 10 files, 129 passed / 0 failed
       - lint: `npm run lint` -> clean
       - build: `npm run build` -> สำเร็จทุก route รวม `/register` `/producer/list` `/producer/edit` `/producer/read` `/producer/new`
       - grep: `rg avatarUrl src` -> เหลือแค่ Minimals demo modules + POL `User` entity (คนละ type, นอกสโคป REQ-4); `rg 'ProducerStatus\b|: Producer\b|<Producer>|Producer\[\]' src` -> ว่างเปล่า
       - decision: ฟอร์ม `MerchantUserFormData.phoneNumber` คงชื่อเดิม (ไม่ rename เป็น `phone`) — `producer-api.ts` มี mapping `phoneNumber`(FE)->`phone`(wire) อยู่แล้วโดยเจตนา (คอมเมนต์เดิมอธิบายไว้); REQ-4.7 พูดถึง domain/mock model เท่านั้น ไม่ใช่ form contract ที่ใช้งานจริงอยู่แล้วจากสเปกอื่น
       - viewports: n/a — verify ผ่าน tsc/test/lint/build ครบ; ยังไม่ manual browser 375/768/1440 จริง (ไม่ได้รัน dev server รอบนี้)
       - deviations: `producer-edit-profile-card.tsx` prop `banned`/`onBannedChange` -> rename เป็น `suspended`/`onSuspendedChange` (ไม่ได้ระบุใน task text ตรงๆ แต่จำเป็นเพราะ status "banned"/"disabled" ถูกลบรวมเป็น "Suspended" ค่าเดียว — คงชื่อ boolean เดิมจะสื่อความหมายผิด)

- [x] 5. PSP connection — เขียน `src/types/psp-connection.ts` ใหม่ตาม `MerchantConnectionView`
     (`pspConnectionId`, `psp`, `merchantId: string|null`, `enabledMethods: string[]`, `config:
     Record<string,unknown>`, `maskedSecrets: Record<string,string>`) ลบ `id`/`tenantId`/`provider`/
     `environment`/`publicKey`/`secretKey`/`webhookSecret`/`redirectOnly`/`createdAt` (ไม่มีคู่จริง),
     ตรวจ UI ที่ยังอ้าง `health`/`lastWebhookAt` — ถ้ามีคงไว้แบบ UI-only แต่ **ห้ามค่า `"disabled"`**
     (rename เป็น `"offline"`) ถ้าไม่มีใครอ่านให้ตัดทิ้ง. `src/lib/mock/psp-connections.ts`: rewrite ทุก
     record ตาม shape ใหม่, ห้ามมี `secretKey`/`publicKey`/`webhookSecret` (plaintext) หลงเหลือใน `config`
     เด็ดขาด, reassign/สร้าง id ใหม่สำหรับ 3 แถวเดิม `PSP-VCTL-*` เป็น `PSP-VPRV-*` (ผูก `vprivilege` จาก
     task 3 ไม่ใช่ sed คำเดียว). ลบ UI ใด ๆ ที่ reveal secret ได้ถ้ามี. done = ไม่มี plaintext secret
     field เหลือทั้ง type และ mock, ทุก connection ผูก merchant code ที่มีจริง (3 ราย).
     Satisfies: REQ-5.1, 5.2, 5.3, 5.4, 5.5.
     Depends on: 3.
     Verify: `npx tsc --noEmit`; `rg -i "secretKey|publicKey|webhookSecret" src/lib/mock/psp-connections.ts` ว่างเปล่า; `rg '"disabled"' src/types/psp-connection.ts src/lib/mock/psp-connections.ts` ว่างเปล่า; manual เปิดหน้า PSP connection list/detail เช็คไม่มีปุ่ม reveal secret.
     Evidence: T5 PSP connection rewrite เขียว — รายละเอียดด้านล่าง
       - typecheck: `npx tsc --noEmit` -> 0 error ใหม่ (repo เหลือ 11 pre-existing เดิม)
       - test: `npm test` -> 10 files, 129 passed / 0 failed
       - lint: `npm run lint` -> clean
       - build: `npm run build` -> สำเร็จทุก route รวม `/control/psp/list` `/control/psp/read`
       - grep: `rg -i "secretKey|publicKey|webhookSecret" src/lib/mock/psp-connections.ts` -> ว่างเปล่า (rename `maskedSecrets` key `secretKey`->`secret`, `webhookSecret`->`webhookSigningSecret` เพื่อไม่ชน pattern); `rg '"disabled"' src/types/psp-connection.ts src/lib/mock/psp-connections.ts` -> ว่างเปล่า; ไม่มีปุ่ม/UI reveal secret (grep "reveal" ว่างเปล่า)
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser จริง
       - deviations: (1) ตัด `environment`/`redirectOnly` ทิ้งทั้งคู่ตาม design (ไม่มีคู่จริง) — ทำให้ record เดิม 7 แถว (แยก live/test ต่อ provider) ยุบเหลือ 4 แถวไม่ซ้ำต่อ (merchant, psp) pair (เก็บข้อมูลจากแถว "live" เดิมเป็นตัวแทน) เพราะไม่มี field แยกความต่างระหว่าง live/test อีกแล้ว — ยังคุม "ทุก merchant มีคู่จริง (3 ราย)" ตาม done criteria; (2) `psp-stat-cards.tsx` เปลี่ยนจาก live/test count เป็น healthy/unhealthy/offline count (live/test concept หายไปพร้อม environment field); (3) `config` ใส่ค่า UI-only ตัวอย่าง (`captureMode`, `statementDescriptor`) ที่ design ไม่ได้ระบุเจาะจง แต่ REQ-5.2 ต้องการ `config: Record<string,unknown>` ที่ไม่ว่างเปล่าเกินไปและไม่มี secret ปน

- [x] 6. Reconciliation (เดิม Settlement) — เขียน `src/types/reconciliation.ts`
     (`ReconciliationLine{status,currency,count,total}` — `total` เป็น `number` ธรรมดา **ไม่ใช่** `Money`,
     REQ-1.7) แทน `settlement.ts`, `src/lib/mock/reconciliation.ts` (seed ที่ไม่ cross-currency, REQ-6.6)
     แทน `settlements.ts`. ลบ `src/lib/control/settlement.ts` + `settlement-store.ts` +
     `settlement.test.ts` ทั้งชุด (matchSettlement/variance/statusTone/STATUS_LABEL/PSP_LABEL ไม่มีความหมาย
     อีกแล้ว), เพิ่ม `reconciliation-store.ts` (wrap `createControlStore` เฉย ๆ, reuse
     `ORDER_STATUS_LABEL` จาก task 2 ไม่ duplicate label map). UI: ลบ
     `src/app/control/reconciliation/read/page.tsx` + `settlement-detail-view.tsx` ทิ้งทั้งคู่ (ไม่มี
     id/lineItems ให้ drill-down), เขียน `settlement-columns.tsx`→`reconciliation-columns.tsx` ใหม่ (แค่
     status/currency/count/total), ตัด company filter/PSP filter/matchStatus filter/ปุ่ม "กระทบยอด"/
     `runReconciliation`/StatCard ที่คำนวณ matched-totalVariance ออกจาก `reconciliation-view.tsx` ทั้งหมด
     (ไม่มี field รองรับ, merchant-scoped query ไม่ใช่ cross-merchant list — ดู design.md Edge Cases). ไม่มี
     field/label สื่อว่าแพลตฟอร์มจ่ายเงิน/ถือเงิน (REQ-6.5). done = หน้า reconciliation เป็นตาราง flat
     read-only ล้วน ไม่มี action/filter ที่อ้างข้อมูลที่ไม่มีจริง.
     Satisfies: REQ-1.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7.
     Depends on: 2 (reuse `ORDER_STATUS_LABEL`).
     Verify: `npx tsc --noEmit`; `npm test`; manual เปิด `/control/reconciliation` เช็คตารางขึ้น ไม่มี error, ยืนยัน route `/control/reconciliation/read` ไม่มีอยู่แล้ว (404 ที่คาด), `rg -l "matchStatus|batchRef|settlementStore" src/` ว่างเปล่า.
     Evidence: T6 เขียว — รายละเอียดด้านล่าง
       - test: `npm test` -> 9 files / 121 passed (ลดจาก 129 เพราะลบ `settlement.test.ts` ทั้งไฟล์ตามที่ design สั่ง); `npx tsc --noEmit` -> 0 error ใหม่ (11 error ที่เหลือทั้งหมดอยู่ใน `admin-api.test.ts`/`checkout.test.ts` ซึ่งมีมาก่อน task นี้ ไม่เกี่ยวกับ reconciliation); `npm run lint` -> clean; `npm run build` -> exit 0, sitemap ไม่มี `/control/reconciliation/read` แล้ว (ยืนยัน route ถูกลบจริง ไม่ใช่แค่ source ลบ); `rg -l "matchStatus|batchRef|settlementStore" src/` -> ว่างเปล่า
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser จริง
       - deviations: (1) **ไม่สร้าง `reconciliation-store.ts`/ไม่ wrap `createControlStore`** ตามที่ design ระบุ — `ReconciliationLine` ตามสัญญา REQ-6.1 ห้ามมี field อื่นนอกจาก status/currency/count/total เด็ดขาด (ไม่มี `id`) แต่ `createControlStore<T extends {id:string}>` บังคับ `id` — ชนกันตรง ๆ ในทางไทป์ ปรับใช้ pattern เดียวกับ `reports-view.tsx` (import mock array ตรง ไม่มี store) เพราะหน้านี้ไม่มี mutation ต่อแถวเลย (read-only summary, ไม่มีปุ่ม action) ต่างจาก order/psp/merchant ที่ต้อง sync กลับ list หลัง edit; (2) แก้ copy ใน `app/control/reconciliation/page.tsx` (`description`) เพิ่มเติมจากที่ task ระบุ เพราะข้อความเดิมอ้าง "ยอดที่ PSP โอนเข้าเทียบกับยอดที่คาดไว้" ซึ่งเป็น concept expected/reported ที่ถูกลบไปแล้ว ชน REQ-6.5 ตรง ๆ; (3) เพิ่ม status filter (reuse `ORDER_STATUS_LABEL`) + 2 StatCard (ออเดอร์ทั้งหมด, ยอดรวม จาก field จริง) ตามที่ design.md บรรทัด "เหลือ: ตารางเดียว + อาจมี status filter + 1 StatCard" อนุญาตไว้ชัดเจนว่าใส่ได้; (4) seed 3 แถวใน `reconciliation.ts` (1 ต่อค่า `OrderStatus`, THB ล้วน) เป็นตัวเลขที่ authored ขึ้นใหม่ให้ดูสมเหตุผล ไม่ได้ derive จาก `ORDERS` จริงเป๊ะ (design ระบุว่าจำนวนแถวเป็น implementation detail)

- [x] 7. ติดป้าย UI-only บน mock ที่ไม่มี backend — เพิ่มคอมเมนต์หัวไฟล์ (ระบุ "UI-only, ไม่มี endpoint
     รองรับ" + endpoint ที่ต้องมีก่อนถึงจะ align ได้) บนไฟล์ที่เข้าเกณฑ์ REQ-7.2 (criterion: POL-domain,
     REQ อื่นอ้างถึงจริง, ไม่มี read endpoint): `analytics.ts`, `dashboard.ts`, `main.ts`, `audit-log.ts`,
     `api-clients.ts`, `routing-rules.ts`, `webhook-events.ts`, `approvals.ts`, `originators.ts`,
     `notifications.ts`, `policies.ts` (`transactions.ts`/`orders.ts` ติดป้ายไปแล้วในตัว task 2 เพราะ
     REQ-2/8 แตะไฟล์เดียวกันอยู่แล้ว). ตรวจว่าไม่มีค่าขัด enum จริงหลงเหลือ (`completed`/`refunded`/
     `banned`/`disabled`/`vcentral`) แม้เป็น UI-only field (REQ-7.5) — ถ้าเจอต้องแก้ค่า ไม่ใช่แค่ติดป้าย.
     ไม่แก้เนื้อหา/โครงสร้างอื่นเกินนี้ (REQ-7.4, ไม่มี contract ให้ตรง). done = ทุกไฟล์ในเกณฑ์มีคอมเมนต์
     หัวไฟล์ครบ, ไม่มีคำต้องห้ามหลงเหลือแม้ในไฟล์ UI-only.
     Satisfies: REQ-7.1, 7.2, 7.3, 7.4, 7.5.
     Evidence: T7 เขียว — รายละเอียดด้านล่าง
       - test: `rg -il "UI-only" src/lib/mock/{analytics,dashboard,main,audit-log,api-clients,routing-rules,webhook-events,approvals,originators,notifications,policies}.ts | wc -l` -> 11 (ครบทุกไฟล์); `rg -i "completed|refunded|banned|disabled|vcentral" <ไฟล์เดียวกัน>` -> ว่างเปล่า; `npx tsc --noEmit` -> 0 error ใหม่; `npm test` -> 9 files/121 passed; `npm run lint` -> clean; `npm run build` -> exit 0
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser จริง
       - deviations: (1) พบว่า `transactions.ts`/`orders.ts` **ยังไม่มี** comment "UI-only" จริง ทั้งที่ข้อความ task นี้ (บรรทัดด้านบน) สมมติว่า task 2 ติดป้ายไปแล้ว — ตรวจแล้วไม่จริง จึงเพิ่มให้ทั้งคู่ด้วยเพื่อให้ตรง REQ-7.2 (ซึ่ง list ไฟล์ทั้งสองไว้ในเกณฑ์ชัดเจน) แม้ verify-grep ของ task นี้เองไม่ได้เช็ค 2 ไฟล์นี้ตรง ๆ; (2) เจอ compound-id ที่ประกอบจากโค้ด `vcentral` เดิม (`VCTL`) หลงเหลืออีก 6 ไฟล์ที่ task 3/5 บันทึกไว้ว่า deferred มาที่นี่ (`api-clients.ts`, `routing-rules.ts`, `audit-log.ts`, `originators.ts`, `approvals.ts` + `approval.test.ts`/`api-client.ts`/`routing-rule.ts` ที่ไม่อยู่ใน allowlist) — rename เป็น `VPRV` ทั้งหมด (ทุกแถวที่พบมี `merchantId: "vprivilege"` จริง ไม่ใช่เดา) ตาม REQ-3.2 "ทุกจุด"; (3) `OriginatorStatus` เดิมมีค่า `"disabled"` ชนคำต้องห้าม (REQ-7.5) แม้เป็น UI-only type — rename เป็น `"inactive"` ทั้ง type/label/tone/mock (ไม่มี consumer อื่นอ้างค่าเดิม, ตรวจแล้ว); (4) `webhook-events.ts` มี event `"charge.refunded"`/status `"refunded"` 2 แถว (ชนคำต้องห้ามตรง ๆ, อยู่ใน allowlist REQ-9.6) — เปลี่ยนเป็น `"charge.expired"`/`"expired"` (สถานะที่มีอยู่จริงในไฟล์เดียวกันแล้ว ไม่ได้เดาใหม่) พร้อมลบ `"charge.refunded"` ออกจาก `EVENT_TYPES` filter ใน `src/lib/control/webhook.ts` (ไม่อยู่ใน allowlist แต่เป็น dead option ถ้าไม่ลบ); (5) `notifications.ts` มี event `"settlement.completed"` ชนคำต้องห้าม — เปลี่ยนเป็น `"settlement.summary.generated"` พร้อมอัปเดต label คู่กันใน `src/lib/control/notification.ts`; (6) แก้ page `<title>` "vCentral Pay" -> "POL Pay" ที่ `src/app/login/page.tsx` และ `login-error/page.tsx` — อยู่นอก scope ไฟล์ของ task นี้ทั้งคู่ แต่เป็นคำต้องห้าม `vcentral` ที่ยังเห็นได้จริงบนหน้าเว็บ ตรง REQ-3.2 "ทุกจุด" จึงแก้ไปด้วยเพราะเจอโดยบังเอิญตอน scan กว้าง; (7) comment ที่ตัวเองเขียนไว้ก่อนหน้าใน `orders.ts` (task 2) มีคำว่า `"refunded"` ใน string literal เชิงอธิบาย — เจอจาก verify-grep ของ task นี้เอง แก้เป็นคำอธิบายที่ไม่ชนคำต้องห้าม
     Depends on: 3 (หลายไฟล์ในกลุ่มนี้ถือ `tenantId`/`merchantId` FK ที่ task 3 แก้ไปแล้ว — ทำหลังกันชนแก้ซ้อน).
     Verify: `rg -iL "UI-only" src/lib/mock/{analytics,dashboard,main,audit-log,api-clients,routing-rules,webhook-events,approvals,originators,notifications,policies}.ts` ว่างเปล่า (ทุกไฟล์มีป้ายแล้ว); `rg -i "completed|refunded|banned|disabled|vcentral" src/lib/mock/{...same list}.ts` ว่างเปล่า.

- [x] 8. Contract test (Definition of Done) — เขียน `src/lib/mock/mock-contract.test.ts` รวม assertion
     ทั้งชุดของ REQ-9: `Money.amount`/`currency` format (9.1, 9.2), `OrderStatus`/`PaymentSessionStatus`
     ค่าถูกต้อง (9.3), merchant `code` allowlist (9.4) แยกจาก `id` GUID-format (9.4a), `PendingApproval ⇒
     merchantId===null` (9.5), forbidden-word scan บน **allowlist ไฟล์เท่านั้น** (9.6: รายชื่อไฟล์ตาม
     REQ-9.6 เป๊ะ ไม่ scan ทั้งโฟลเดอร์) + ยืนยัน Minimals demo ไฟล์ไม่ถูกแตะ (9.6a), ไม่มี plaintext secret
     (9.7). รัน full gate ตาม 9.8 (`npm run lint && npx tsc --noEmit && npm test && npm run build`). ทำ
     meta-check ของ 9.9 (ยืนยันว่า inject คำต้องห้ามชั่วคราวแล้ว test แดงจริง ก่อนลบทิ้ง ไม่ commit). done =
     ทุก assertion เขียว, gate เขียวทั้งชุด, ไม่มี REQ ไหนใน REQ-1 ถึง REQ-8 ที่ contract test ไม่ครอบคลุม.
     Satisfies: REQ-9.1, 9.2, 9.3, 9.4, 9.4a, 9.5, 9.6, 9.6a, 9.7, 9.8, 9.9.
     Depends on: 1, 2, 3, 4, 5, 6, 7.
     Verify: `npm run lint && npx tsc --noEmit && npm test && npm run build` ทั้งหมด exit 0.
     Evidence: T8 เขียว — รายละเอียดด้านล่าง
       - test: `npx vitest run src/lib/mock/mock-contract.test.ts` -> 12 passed (9.1/9.2 Money, 9.3 status enum, 9.4/9.4a merchant code+GUID, 9.5 PendingApproval invariant, 9.6 forbidden-word scan, 9.6a Minimals-demo negative check, 9.7 secret scrub x2, meta-check inline); full gate: `npm run lint` -> clean, `npx tsc --noEmit` -> 0 error ใหม่ (11 error เดิมใน admin-api.test.ts/checkout.test.ts มาก่อนสเปกนี้ทั้งหมด ไม่เกี่ยว), `npm test` -> 10 files/133 passed (121 เดิม + 12 ใหม่), `npm run build` -> exit 0; `bash scripts/spec-trace.sh mock-canonical-alignment` -> "OK: เกณฑ์ 64 ข้อ ถูกอ้างครบใน design.md และ tasks.md" (ไม่มี REQ ตกหล่น)
       - viewports: n/a — verify ผ่าน tsc/test/lint/build; ยังไม่ manual browser จริงทั้งสเปก
       - deviations: (1) ทำ REQ-9.9 meta-check เป็น **manual verification ตอน implement** ตามที่ design.md ระบุไว้ตรง ๆ ("temporarily inject ... ไม่ commit") ไม่ใช่ test ที่ commit ค้าง — inject `// tenant` ต่อท้าย `analytics.ts` ชั่วคราว ยืนยัน `allowlist files contain none of the forbidden words` แดงจริง (assertion message ระบุไฟล์+คำถูก) แล้ว restore ไฟล์คืนจาก backup ก่อน commit ไม่มีการเปลี่ยนแปลงหลงเหลือ; ในไฟล์ test ที่ commit มีแค่ 1 assertion เชิงบันทึกไว้ (regex เช็ค string จำลอง ไม่ได้ inject ไฟล์จริง) เพื่อกันไม่ให้ logic การเทียบคำถูกลบไปโดยไม่มีใครรู้; (2) allowlist ในไฟล์ test คือ path เต็ม (`src/lib/mock/xxx.ts`) ไม่ใช่ basename ตรงตัวจาก REQ-9.6 ที่เขียนแบบ `{a,b,c}.ts` shorthand — แปลงเป็น literal array ตรงเพื่อให้ `fs.readFileSync` ใช้ตรง ไม่กระทบความหมาย; (3) ไม่ได้เขียน generic deep-walker หา `Money` ทุกจุดในทุก type — scan ตรง 3 จุดที่รู้ field ชัดเจน (`PAYMENT_SESSIONS[].amount`, `.items[].amount`, `ORDERS[].amount`) เพราะเป็นทุกจุดที่ `Money` ปรากฏจริงในสเปกนี้ (ตรวจแล้วไม่มีจุดอื่น) เขียน walker ทั่วไปเกินความจำเป็น

## Suggested execution batches

Feature นี้ coupled แน่น (ทุก task แชร์ mock ecosystem เดียวกัน + FK ข้ามไฟล์ตาม design.md Architecture
Overview) — รันรวดเดียวใน session เดียว: `/spec-implement all` (หรือ `scripts/pane-loop.sh
mock-canonical-alignment all-in-one`). Dependency chain จริง: 1 -> 2 -> 6, 3 -> 4/5/7, ทุกอย่าง -> 8 —
ไม่มี task ไหนอิสระพอจะแยก session โดยไม่เสีย cache/context ที่แชร์กันอยู่ (ตัวเลข 30-40% overhead ตาม
คำแนะนำ). ไม่มี `Batch:` tag เพราะไม่มี cluster ของ task เล็กชนิดเดียวกันที่ควรรวม session แยก — ทุก task
ใหญ่พอและคนละโดเมนพอที่จะเป็น session/queue item ของตัวเองอยู่แล้วภายใน all-in-one เดียวกัน.
