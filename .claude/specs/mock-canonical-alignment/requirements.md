# Requirements: Mock Truth Pass (ลบทุกอย่างใน mock ที่ขัดกับซอร์ส pol-core)

> Status: approved 2026-07-13, amended 2026-07-20 (rev 6 — /spec-analyze หลัง design.md approved พบ 6 finding
> (1 conflicting constraint, 2 ambiguity, 1 gap-acknowledged-no-change, 1 logical-inconsistency-wording, 1 unstated
> assumption): แก้ REQ-1.6 (Product.price illustrative-only), REQ-3.4 (FK value ยังเป็น code ไม่ใช่ GUID), REQ-5.4
> (ห้ามค่า `disabled` บน health), REQ-7.2 (criterion แทน list ตายตัว + เพิ่ม main.ts), REQ-8.1 (เคลียร์ถ้อยคำ
> "แหล่งเดียว" = ไฟล์เดียวไม่ใช่ type เดียว) — REQ-2 status-migration gap (F3) ตัดสินใจคงเป็น design-level เดิม
> ไม่ย้ายเข้า requirements. ดู "Edge Cases & Open Questions" ท้ายไฟล์สำหรับ log เต็ม.
> rev 5 เดิม — Codex review บน draft ตัวถัดไปพบ 4 findings ในสเปกเอง (2 P1, 2 P2) แก้ที่นี่ก่อนเข้า design:
> ขอบเขต scanner ของ REQ-9.6, แยก merchant id/code ใน REQ-9.4, nullable fields ของ REQ-4.1, photo URL claim ของ REQ-4.9.
> rev 4 เดิม — ตัด scope จาก rev 3: ตัด mapper seam / Tier A-B split / PagedResult envelope ออก)

## Overview

`src/lib/mock/*` + `src/types/*` ของ pol-admin มีค่าและ field ที่ **ขัดกับซอร์สจริงของ backend `pol-core`** —
บริษัทที่ไม่มีอยู่ (`vcentral`), สถานะที่ระบบสร้างไม่ได้ (`completed`, `refunded`, `banned`, `disabled`,
merchant `onboarding`/`suspended`), secret แบบ plaintext ที่ API ไม่เคยคืน, settlement batch ที่แพลตฟอร์ม
ไม่มีหน้าที่ทำ (non-goal ประกาศไว้ชัด: เงิน settle จาก PSP เข้าบัญชี merchant ตรง), และเงินเป็น `number`
(บาท) ทั้งที่ wire จริงเป็น `{ "amount": "1500.0000", "currency": "THB" }`.

**สเปกนี้คือ Truth Pass: ลบสิ่งที่โกหก ไม่ใช่สร้างชั้นใหม่.** ทุกค่าที่เหลือใน mock ต้อง trace กลับไปที่
ไฟล์ซอร์สของ pol-core ได้ — และมี test ล็อกไว้ไม่ให้ drift กลับ.

### สิ่งที่ **ไม่** ทำในสเปกนี้ (ตัดจาก rev 3 โดยตั้งใจ)

- **ไม่สร้าง mapper/seam layer** — pol-core มี read endpoint ครอบคลุมหน้าจอของ pol-admin แค่ 2 กลุ่ม
  (roles/permissions, admins); หน้าที่เหลือ (merchant list, producer list, transactions, orders, dashboard,
  audit-log, api-clients, routing-rules, webhook-events, settlements, policies) **ไม่มี endpoint ใด ๆ รองรับ**
  การสร้าง seam ตอนนี้คือการเดา view model ของหน้าที่ยังไม่มีใครเรียก → เลื่อนไปสเปก **API Integration**
  ตอนที่ต่อ API จริง ทีละ entity
- **ไม่แยกโฟลเดอร์ wire/ui** และ **ไม่ห่อ `PagedResult` envelope** — ด้วยเหตุผลเดียวกัน
- **ไม่ rename `Admin` → `PlatformUser`** — ซอร์ส rename แล้วบางส่วน แต่ **wire ยังพูดว่า admin**
  (`/api/v1/admins/*`, `AdminListItemResponse`, `AdminMeResponse`, permission catalog `admin`) → rename ตอนนี้
  จะไม่ตรง wire

### หลักตัดสิน: ยึด "ซอร์ส" ไม่ยึด "เอกสาร"

เอกสารของ pol-core **ขัดกับโค้ดตัวเอง**: `platform-modules.md` บรรยาย payment status 7 ค่า
(`action_required`/`processing`/`succeeded`) และ `entity-fields.md` ยังเขียน `Money.MinorUnits` — แต่ซอร์สจริง
คือ rf1 merge แล้ว (Money = `decimal` + wire string) ส่วน 7-status **ยังไม่มีโค้ดสักบรรทัด** (เป็น gap ที่
เอกสารบันทึกไว้เอง). ทุก REQ ด้านล่างอ้าง **ไฟล์ซอร์ส** ไม่ใช่เอกสาร.

### แหล่งอ้างอิง (repo `pol-core` — อ่านอย่างเดียว ห้ามแก้)

| ของ | ไฟล์ |
|---|---|
| Money + wire format | `src/SharedKernel/Money.cs`, `MoneyJsonConverter.cs` |
| Endpoint + DTO ทั้งหมด | `src/Hosts/Api/Program.cs` (DTO อยู่บรรทัด 1786-1976) |
| Merchant allowlist / status | `src/Modules/Merchants/Merchants.Domain/MerchantCode.cs`, `MerchantStatus.cs` |
| Merchant read model | `src/Modules/Merchants/Merchants.Application/GetMerchant/MerchantView.cs` |
| MerchantUser (เดิม Producer) | `src/Modules/Merchants/Merchants.Domain/Users/User.cs`, `Users/UserStatus.cs` |
| Order lifecycle | `src/Modules/Orders/Orders.Domain/OrderStatus.cs` |
| Reconciliation | `src/Modules/Orders/Orders.Application/GetReconciliationSummary.cs` |
| Payment lifecycle + PSP code | `src/Modules/Payments/Payments.Domain/SessionStatus.cs`, `Psp/Code.cs` |

### Out of scope

- Minimals demo mock ทั้งหมด (chat/booking/banking/course/kanban/mail/post/job/tour/calendar/ecommerce/
  invoice-minimals/file-manager/product/file/user-profile)
- auth/cookie/CSRF mechanism · การต่อ API จริง · route · permission key rename (`hierarchical-naming`)
- payment status 7 ค่า / `action_required` / `processing` — target ที่ยังไม่มีโค้ด (REQ-2.7)

---

## REQ-1: Money — เลิกใช้ `number` บาท

**User Story:** As a POL developer, I want ยอดเงินใน mock เป็นชนิดเดียวกับที่ pol-core ส่งจริง,
so that ไม่มีใครเขียนโค้ดบวกเงินด้วย float.

**Acceptance Criteria (EARS):**
- 1.1 THE SYSTEM SHALL นิยาม type `Money { amount: string; currency: string }` ที่เดียวใน `src/types/`
- 1.2 THE SYSTEM SHALL ให้ `Money.amount` เป็น **string** เสมอ ทศนิยม **4 ตำแหน่งตายตัว** — `"1500.0000"` ไม่ใช่ `"1500"` / `"1500.00"` / `1500` (ตรง `MoneyJsonConverter.Write`; ส่ง JSON number กลับไปจะได้ 400)
- 1.3 THE SYSTEM SHALL ให้ `Money.currency` เป็น ISO 4217 ตัวพิมพ์ใหญ่ 3 ตัวอักษร
- 1.4 THE SYSTEM SHALL ไม่มี field `*MinorUnits` / `minorUnits` ที่ใดใน `src/types/` และ `src/lib/mock/`
- 1.5 THE SYSTEM SHALL ไม่ให้ `Money.amount` ติดลบ (`Money.Of` ของ pol-core throw บนค่าติดลบ)
- 1.6 THE SYSTEM SHALL ใช้ `Money` กับยอดเงินที่มีคู่ใน pol-core (`Product.price`, `Order.amount`, `PaymentSession.amount`) — `Product.price` เป็นตัวอย่าง illustrative จากซอร์ส pol-core เท่านั้น ไม่ใช่ mandate: pol-admin ไม่มี mock/type ที่ map ตรงกับ `Product` (มีแค่ `Policy`/`policies.ts` ซึ่ง REQ-7.2 ยืนยันแล้วว่าคนละ entity — "Product ไม่มีฟิลด์ประกันสักตัว") จึง**ไม่มีไฟล์เป้าหมายให้ apply ข้อนี้ในรอบนี้** (spec-analyze F5, 2026-07-20)
- 1.7 THE SYSTEM SHALL **ไม่** ใช้ `Money` กับ `ReconciliationLine.total` — pol-core ส่งเป็น `decimal` เปล่า (JSON number) + `currency` เป็น field แยก (ดู REQ-6)
- 1.8 THE SYSTEM SHALL มี helper แปลง `Money` → string ที่จัดรูปสำหรับแสดงผล ที่เดียว — component ห้าม `parseFloat` เอง
- 1.9 IF aggregate หนึ่งมีเงินหลาย currency THEN mock SHALL ไม่สร้างเคสนั้น (invariant ของ pol-core)

## REQ-2: Status enum + wire casing ตามซอร์ส

**User Story:** As a POL developer, I want status ใน mock ตรงกับ enum จริงและ casing จริง,
so that หน้าจอไม่แสดงสถานะที่ระบบสร้างไม่ได้.

**Acceptance Criteria (EARS):**
- 2.1 THE SYSTEM SHALL ให้ status ที่มาจาก enum ของ pol-core ใช้ **PascalCase ชื่อ enum member** — ไม่มี `JsonStringEnumConverter` ลงทะเบียนใน `Program.cs`; ค่าออก wire ผ่าน `.ToString()` (`ReconciliationLine`, `OrderSummaryResponse`) จึงเป็น `"AwaitingPayment"` / `"Paid"` **ไม่ใช่** `awaiting_payment`
- 2.2 THE SYSTEM SHALL นิยาม `OrderStatus = "AwaitingPayment" | "Paid" | "Cancelled"` (3 ค่า ตรง `OrderStatus.cs`)
- 2.3 THE SYSTEM SHALL นิยาม `PaymentSessionStatus = "Created" | "Redirected" | "Paid" | "Failed" | "Expired"` (5 ค่า ตรง `SessionStatus.cs`) **แยกจาก `OrderStatus`** — pol-core แยกคนละ enum คนละ aggregate
- 2.4 THE SYSTEM SHALL ลบค่า `completed` และ `refunded` ออกทั้ง type และ mock ทุกไฟล์ — ไม่มีอยู่จริงทั้งคู่ (refund/money movement เป็น non-goal ของแพลตฟอร์ม)
- 2.5 THE SYSTEM SHALL ให้ PSP code เป็น lowercase `"omise"` | `"2c2p"` (ผ่าน `PspCodeJsonConverter` — ไม่ใช่ int ไม่ใช่ชื่อ C# member)
- 2.6 THE SYSTEM SHALL ให้ payment method เป็น `"card"` | `"promptpay"` | `"installment"`
- 2.7 THE SYSTEM SHALL **ไม่** ใส่ค่าที่ยังไม่มีโค้ด (`action_required`, `processing`, canonical 7 ค่า) — บันทึกเป็นหนี้แทน
- 2.8 THE SYSTEM SHALL ให้ทุก component ที่ map status → label/สี/ไอคอน/filter/tab ครอบคลุมครบทุกค่าของ union ที่ใช้ และไม่อ้าง `completed`/`refunded`
- 2.9 IF component ได้รับ status นอก union THEN THE SYSTEM SHALL fail ที่ compile time (exhaustive switch ไม่ใช่ fallback เงียบ)

## REQ-3: Merchant (เดิม Tenant)

**User Story:** As a POL developer, I want merchant ใน mock ตรงกับ allowlist และ enum จริง,
so that demo ไม่โชว์บริษัทหรือสถานะที่ไม่มีอยู่.

**Acceptance Criteria (EARS):**
- 3.1 THE SYSTEM SHALL ให้ merchant มีเพียง 3 ราย: `vprivilege`, `vcommerce`, `vsouvenir` (ตรง `MerchantCode.Allowed`, lowercase)
- 3.2 THE SYSTEM SHALL ลบ `vcentral` ออกทุกจุด — mock, type union, label map, และ id ที่ประกอบจากโค้ดนั้น (`PSP-VCTL-*`, `STL-VCTL-*` ต้องสร้างใหม่ ไม่ใช่ sed คำเดียว)
- 3.3 THE SYSTEM SHALL นิยาม `MerchantStatus = "Active"` (**ค่าเดียว** ตรง `MerchantStatus.cs` ที่ระบุ YAGNI ในคอมเมนต์) และลบ `onboarding` / `suspended`
- 3.4 THE SYSTEM SHALL rename `Tenant` → `Merchant`, `TenantId` → `MerchantId`, `TenantStatus` → `MerchantStatus`, field `tenantId` → `merchantId` ทุกจุดใน `src/types` + `src/lib/mock` + component ที่อ้างถึง — เป็นการ rename **ชื่อ field เท่านั้น**: ค่า FK ที่ไฟล์อื่น (นอกเหนือ `Merchant` record เอง) ถืออยู่ยังเป็น **`code`** string เดิม (`"vprivilege"` เป็นต้น) เสมอ ไม่เปลี่ยนเป็น GUID — GUID (REQ-9.4a) ใช้เฉพาะ field `id` บน `Merchant` record ของตัวเองเท่านั้น (spec-analyze F2, 2026-07-20)
- 3.5 THE SYSTEM SHALL ไม่มีคำว่า `tenant` (case-insensitive) หลงเหลือใน `src/types/` และ `src/lib/mock/`
- 3.6 THE SYSTEM SHALL ให้ field ของ merchant ที่มีคู่ใน `MerchantView` ใช้ชื่อและชนิดเดียวกัน: `id`, `code`, `displayName`, `legalEntityId`, `status`, `country`, `currency`, `enabledChannels` (**string CSV** ไม่ใช่ array), `createdAt`
- 3.7 WHERE mock มี field ที่ pol-core ไม่มี (`saqScope`, `adminCount`, `name`, `enabledPsps`) THE SYSTEM SHALL คงไว้ได้ แต่ต้องมีคอมเมนต์กำกับว่าเป็น **UI-only ไม่มีใน backend** (REQ-7)

## REQ-4: MerchantUser (เดิม Producer)

**User Story:** As a POL developer, I want producer mock ตรงกับ `Merchants.Domain.Users.User`,
so that ฟอร์มลงทะเบียนและหน้า approve สะท้อนของจริง.

**Acceptance Criteria (EARS):**
- 4.1 THE SYSTEM SHALL rename `Producer` → `MerchantUser` (type + mock + ที่อ้างถึง) — field ตรงกับ pol-core อยู่แล้ว (`firstName`, `lastName`, `personType`, `idNumber`, `producerCode`, `licenseNumber`, `phone`, `email`, `status`)
- 4.1a THE SYSTEM SHALL นิยาม `personType`, `idNumber`, `producerCode`, `licenseNumber`, `phone` เป็น **nullable** (`| null`) บน `MerchantUser` type — ตรง `PersonType?`/`IdNumber`/`ProducerCode`/`LicenseNumber`/`Phone` ที่เป็น optional ทุกตัวใน `User.cs:37-41` (`firstName`/`lastName` เท่านั้นที่ required); ฟอร์มลงทะเบียนบังคับกรอกฟิลด์ไหนเป็นเรื่องของ form model แยกต่างหาก ไม่ใช่ domain/mock model นี้
- 4.2 THE SYSTEM SHALL คงชื่อ field `producerCode` ไว้ — pol-core ใช้ชื่อนี้เอง (ศัพท์ธุรกิจประกัน ไม่ใช่ชื่อ actor)
- 4.3 THE SYSTEM SHALL นิยาม `MerchantUserStatus = "PendingApproval" | "Active" | "Rejected" | "Suspended"` (4 ค่า ตรง `UserStatus.cs`) และลบ `banned` / `disabled`
- 4.4 THE SYSTEM SHALL เปลี่ยน `avatarUrl` เป็น `photoObjectKey` + `photoContentType` — pol-core เก็บ opaque server-generated key (bytes อยู่นอก DB) ไม่ใช่ URL และไม่ใช่ชื่อไฟล์จาก client
- 4.5 THE SYSTEM SHALL เพิ่ม field `merchantId` (nullable) — pol-core set ตอน admin approve เท่านั้น, NULL ก่อนหน้านั้น (1 merchant ต่อ 1 account)
- 4.6 THE SYSTEM SHALL ให้ mock ที่ `status = "PendingApproval"` มี `merchantId = null` เสมอ (invariant ของ pol-core)
- 4.7 THE SYSTEM SHALL rename `phoneNumber` → `phone` ตาม pol-core
- 4.8 THE SYSTEM SHALL ให้ `displayName` เป็นค่า server-computed (`"{firstName} {lastName}"`) — ไม่ใช่ค่าที่ฟอร์มส่ง
- 4.9 THE SYSTEM SHALL เก็บแค่ `photoObjectKey` ใน mock (opaque key ตาม 4.4) — ห้ามประกอบ/เก็บ URL ใน mock เพราะ **pol-core ยังไม่มี HTTP endpoint ที่ serve รูปจาก `IPhotoStore.GetAsync`** (มีแค่ write path ตอน submit registration, `GetAsync` ไม่มี caller ใน `Hosts/Api`) — จุดแสดงผล UI ที่มี `photoObjectKey` ใช้ placeholder avatar แทนจนกว่าจะมี photo-serving endpoint จริง (นอกสโคปสเปกนี้ ดู Edge Cases)

## REQ-5: PSP connection — secret ต้อง masked

**User Story:** As a POL admin, I want mock ของ PSP connection สะท้อนว่า API ไม่เคยคืน secret,
so that ไม่มีใครเขียน UI ที่คาดหวังว่าอ่าน secret กลับมาได้.

**Acceptance Criteria (EARS):**
- 5.1 THE SYSTEM SHALL ลบ field `publicKey` / `secretKey` / `webhookSecret` แบบ plaintext ออกจาก mock — pol-core คืนเฉพาะ `maskedSecrets` (map ของ hint) และ **ปฏิเสธ payload ที่วาง secret นอก envelope `secrets`** (`ProvisioningGuards.RejectSecretsInConfig`)
- 5.2 THE SYSTEM SHALL ให้ PSP connection mock ตรง `MerchantConnectionView`: `pspConnectionId`, `psp`, `merchantId`, `enabledMethods` (**array** ของ method code), `config`, `maskedSecrets`
- 5.3 THE SYSTEM SHALL ลบ UI ใด ๆ ที่อ่าน/แสดง secret แบบ reveal ได้ — ถ้ามี
- 5.4 WHERE mock มี field ที่ pol-core ไม่มี (`environment`, `health`, `lastWebhookAt`, `redirectOnly`) THE SYSTEM SHALL คงไว้ได้แต่ต้องมีคอมเมนต์ UI-only (REQ-7) — ถ้าคง `health` ไว้ ห้ามใช้ค่า `disabled` (ชนคำต้องห้ามของ REQ-9.6/9.7 และขัด REQ-7.5) ต้อง rename ค่านั้น (เช่น `offline`) ก่อน (spec-analyze F1, 2026-07-20)
- 5.5 THE SYSTEM SHALL ไม่มี read endpoint แยกของ PSP connection — อ่านผ่าน `MerchantView.Connections` (บันทึกเป็นหมายเหตุ ไม่ใช่โค้ด)

## REQ-6: Settlement → Reconciliation ตาม DTO จริง

**User Story:** As a POL admin, I want หน้ากระทบยอดสะท้อน endpoint จริง,
so that ไม่มีใครเข้าใจผิดว่าแพลตฟอร์มจ่ายเงินหรือถือเงิน.

**Acceptance Criteria (EARS):**
- 6.1 THE SYSTEM SHALL แทนที่ `settlements.ts` / `src/types/settlement.ts` ด้วย reconciliation ที่ตรง `ReconciliationView { lines: ReconciliationLine[] }` โดย `ReconciliationLine = { status: string; currency: string; count: number; total: number }`
- 6.2 THE SYSTEM SHALL ให้ `status` ใน `ReconciliationLine` เป็นค่าจาก `OrderStatus` (PascalCase, REQ-2.2) — reconciliation คือ **order ของ merchant จัดกลุ่มตาม (status, currency)** พร้อม count + total
- 6.3 THE SYSTEM SHALL ให้ `total` เป็น `number` (JSON number) + `currency` เป็น field แยก — **ไม่ใช่ `Money` object** (REQ-1.7)
- 6.4 THE SYSTEM SHALL ลบแนวคิด settlement batch ทิ้ง: ไม่มี `expected` / `reported` / `matchStatus` / `batchRef` / `settledAt` / PSP payout / line item — ไม่มีสักตัวใน pol-core
- 6.5 THE SYSTEM SHALL ไม่มีชื่อ field / label / copy ที่สื่อว่าแพลตฟอร์มเป็นผู้จ่ายเงินหรือถือเงิน (payout, disburse, "จ่ายเงินให้บริษัท")
- 6.6 THE SYSTEM SHALL ไม่รวมยอดข้าม currency (invariant ที่ระบุตรง ๆ ใน `GetReconciliationSummary.cs`)
- 6.7 THE SYSTEM SHALL ปรับ/ลบ UI ของหน้า settlement ที่ไม่มีข้อมูลรองรับแล้ว — ไม่ป้อนค่าปลอมแทน (design ระบุรายจุด)

## REQ-7: ติดป้าย mock ที่ไม่มี backend

**User Story:** As a POL developer, I want รู้ทันทีว่า mock ตัวไหนไม่มี endpoint รองรับ,
so that ไม่มีใครเขียนโค้ดโดยเชื่อว่า field เหล่านี้มาจาก API จริง.

**Acceptance Criteria (EARS):**
- 7.1 THE SYSTEM SHALL ติดคอมเมนต์บนหัวไฟล์ mock ทุกไฟล์ที่ **ไม่มี endpoint ใน pol-core รองรับ** ระบุว่าเป็น UI-only + endpoint ที่ต้องมีก่อนถึงจะ align ได้
- 7.2 THE SYSTEM SHALL ครอบคลุมทุกไฟล์ mock ที่เข้าเกณฑ์: **ไฟล์ POL-domain (ไม่ใช่ Minimals demo) ที่มี REQ ใดใน REQ-1 ถึง REQ-8 ของสเปกนี้อ้างถึงจริง แต่ไม่มี read endpoint รองรับ** — เกณฑ์นี้แทนที่การ list แบบตายตัว (spec-analyze F6, 2026-07-20). รายการที่ verify แล้วว่าเข้าเกณฑ์ ณ ตอนเขียนสเปก: `transactions.ts` (ไม่มี read endpoint ของ `PaymentSession` เลย), `orders.ts`, `analytics.ts`, `dashboard.ts`, `main.ts` (payment summary stats, import type จาก `dashboard.ts`), `audit-log.ts`, `api-clients.ts`, `routing-rules.ts`, `webhook-events.ts`, `approvals.ts`, `originators.ts`, `notifications.ts`, `policies.ts` (pol-core ไม่มี entity `Policy` และ `Product` ไม่มีฟิลด์ประกันสักตัว) — ตรงกับ allowlist ของ REQ-9.6
- 7.3 THE SYSTEM SHALL ติดคอมเมนต์กำกับ field ที่ pol-core ไม่มี ใน entity ที่มี backend (REQ-3.7, REQ-5.4)
- 7.4 THE SYSTEM SHALL **ไม่** แก้เนื้อหา/โครงของ mock ที่ไม่มี backend เกินกว่าที่ REQ-2/3/5/6 บังคับ — ไม่มี contract ให้ตรง การรื้อเพิ่มคือ scope creep
- 7.5 THE SYSTEM SHALL ให้ mock ที่ไม่มี backend ก็ยัง **ไม่ขัดกับ enum ที่มีจริง** — ห้ามมี `completed`/`refunded`/`banned`/`disabled`/`vcentral` แม้เป็น UI-only

## REQ-8: ยุบ type ซ้ำ

**User Story:** As a POL developer, I want type เดียวต่อหนึ่ง concept,
so that ไม่ต้องแก้ 2 ที่ทุกครั้งที่ contract เปลี่ยน.

**Acceptance Criteria (EARS):**
- 8.1 THE SYSTEM SHALL ยุบ `src/types/transaction.ts` กับ `src/types/order-payment.ts` (ปัจจุบันเป็นก้อนเดียวกันคนละชื่อ) ให้เหลือ**ไฟล์เดียว** (`order-payment.ts`) — "แหล่งเดียว" หมายถึงไฟล์เดียว **ไม่ใช่ type เดียว**: REQ-8.2 บังคับให้แยก `Order`/`PaymentSession` เป็นคนละ type อยู่ในไฟล์นั้น (spec-analyze F4, 2026-07-20 — ถ้อยคำเดิมอ่านขัดกับ REQ-8.2 ได้)
- 8.2 THE SYSTEM SHALL แยก `Order` (`OrderStatus` 3 ค่า) ออกจาก `PaymentSession` (`PaymentSessionStatus` 5 ค่า) ตามที่ pol-core แยกจริง
- 8.3 THE SYSTEM SHALL ให้ทุกไฟล์ที่เคย import จาก 2 ไฟล์นั้นชี้มาที่แหล่งเดียว
- 8.4 THE SYSTEM SHALL ไม่ทิ้ง type/ไฟล์ที่ไม่มีใคร import เหลือไว้

## REQ-9: Contract test (Definition of Done)

**User Story:** As a POL developer, I want test ที่ล็อกว่า mock ไม่โกหก,
so that ค่าปลอมไม่ drift กลับตอนมีคนเพิ่มแถวใหม่.

**Acceptance Criteria (EARS):**
- 9.1 THE SYSTEM SHALL มี test ที่ assert ว่าทุก `Money.amount` เป็น `typeof === "string"` และ match `/^\d+\.\d{4}$/`
- 9.2 THE SYSTEM SHALL มี test ที่ assert ว่าทุก `Money.currency` match `/^[A-Z]{3}$/`
- 9.3 THE SYSTEM SHALL มี test ที่ assert ว่าทุก order status ∈ 3 ค่า และทุก payment session status ∈ 5 ค่า (PascalCase)
- 9.4 THE SYSTEM SHALL มี test ที่ assert ว่าทุก merchant **`code`** อยู่ใน allowlist 3 ค่า (`vprivilege`/`vcommerce`/`vsouvenir`) — แยกจาก `id` เพราะ `MerchantView.Id` เป็น `Guid` จริง (`MerchantView.cs:8`) ไม่ใช่ค่าคงที่ที่ผูก allowlist ได้
- 9.4a THE SYSTEM SHALL มี test ที่ assert ว่าทุก merchant `id` เป็นรูปแบบ GUID ที่ valid (regex/parse) — ไม่ตรวจตรงกับ allowlist ค่าคงที่
- 9.5 THE SYSTEM SHALL มี test ที่ assert invariant REQ-4.6 (`PendingApproval` ⇒ `merchantId === null`)
- 9.6 THE SYSTEM SHALL มี test ที่ scan เฉพาะไฟล์ POL-scope ที่ REQ-1 ถึง REQ-8 อ้างถึงจริง (**allowlist ไฟล์ ไม่ใช่ scan ทั้งโฟลเดอร์**) แล้ว fail ถ้าเจอคำต้องห้าม: `completed`, `refunded`, `banned`, `disabled`, `vcentral`, `tenant`, `minorUnits` (REQ-7.5). Allowlist:
  `src/lib/mock/{tenants,producers,psp-connections,settlements,transactions,orders,analytics,dashboard,main,audit-log,api-clients,routing-rules,webhook-events,approvals,originators,notifications,policies}.ts`,
  `src/types/{tenant,producer,psp-connection,settlement,transaction,order-payment}.ts`
  (settlements.ts/settlement.ts คือชื่อก่อน REQ-6 แทนที่ — scan ไฟล์ replacement จริงถ้า rename ไปแล้วตอน implement)
- 9.6a THE SYSTEM SHALL ไม่ scan ไฟล์ Minimals demo อื่นที่เหลือใน `src/lib/mock/` (เช่น `banking`, `booking`, `calendar`, `chat`, `course`, `ecommerce`, `file`, `file-manager`, `invoice-minimals`, `job`, `kanban`, `mail`, `order`, `post`, `product`, `tour`, `user-profile`, `topbar`, `role`, `users`, `producer-role`) — ไฟล์เหล่านี้ไม่มี REQ ไหนในสเปกนี้ verify ต่อ pol-core จึงไม่อยู่ใน Truth Pass รอบนี้ (P1 finding จาก Codex review: scan ทั้งโฟลเดอร์เดิม fail จริงที่ `banking.ts`/`ecommerce.ts` เพราะเป็น Minimals template demo ไม่ใช่ POL mock)
- 9.7 THE SYSTEM SHALL มี test ที่ assert ว่าไม่มี field secret แบบ plaintext (`secretKey`, `webhookSecret`, `publicKey`) ใน mock (REQ-5.1)
- 9.8 THE SYSTEM SHALL ผ่าน `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` ทั้งหมด
- 9.9 IF มีการเพิ่มค่าที่ผิด contract THEN test SHALL fail (ไม่ผ่านเงียบ)

---

## Edge Cases & Open Questions

### ปิดแล้ว (verify จากซอร์ส 2026-07-13)

- **`Producer` → `MerchantUser` rename ได้** — field ตรง `Merchants.Domain.Users.User` ทุกตัว (pol-core เก็บชื่อ `ProducerCode` ไว้เอง) → REQ-4
- **`policies.ts` ไม่มี contract** — `Product` มีแค่ `Id/MerchantId/Name/Price/IsActive/CreatedAt` → REQ-7 (ติดป้าย ไม่แตะเนื้อ)
- **`transactions.ts` ไม่มี contract** — `PaymentSession` **ไม่มี read endpoint เลย** (`POST /payments/sessions` คืนแค่ `{paymentSessionId}`, `POST .../redirect` คืนแค่ `{redirectUrl}`) → REQ-7
- **เอกสาร pol-core ขัดกับซอร์ส** — rf1 (Money) merge แล้ว, 7-status ยังไม่ทำ → ยึดซอร์ส (REQ-2.7)
- **Reconciliation ≠ settlement** — เป็น order grouped by (status, currency) + count + total → REQ-6
- **status wire = PascalCase** ไม่ใช่ snake_case (ไม่มี `JsonStringEnumConverter`) → REQ-2.1
- **`Admin` → `PlatformUser` ไม่ rename รอบนี้** — wire ยังพูดว่า admin ทุกจุด
- **REQ-9.6 scan ทั้งโฟลเดอร์เดิม fail จริง** — verify `banking.ts` มี `status: "completed"` 3 จุด (Minimals demo, ไม่เกี่ยว POL) → เปลี่ยนเป็น allowlist ไฟล์ POL-scope เท่านั้น (rev 5, Codex review)
- **merchant `id` เป็น `Guid`, `code` เป็น allowlist string แยกกัน** — `MerchantView.cs:8` ยืนยัน `Id` type `Guid` → REQ-9.4/9.4a แยก assertion (rev 5, Codex review)
- **`personType`/`idNumber`/`producerCode`/`licenseNumber`/`phone` เป็น nullable บน `User.cs`** — verify `User.cs:37-41` ทุกตัวเป็น `?` ยกเว้น `firstName`/`lastName` → REQ-4.1a (rev 5, Codex review)
- **ไม่มี photo-serving endpoint ใน pol-core** — grep `IPhotoStore`/`GetAsync` ทั้ง repo: มีแค่ write path (`SubmitRegistration`), `LocalPhotoStore.GetAsync` ไม่มี caller ใน `Hosts/Api` เลย → REQ-4.9 แก้เป็นไม่ประกอบ URL ใน mock (rev 5, Codex review) ดู OQ-F

### /spec-analyze log (rev 6, 2026-07-20) — anchor: ไม่มี (ไฟล์นี้ยังไม่เคย commit ณ ตอน analyze รันครั้งนี้ — `git log -1 -- requirements.md` ว่างเปล่า, ไม่ใช่ anchor ที่ตั้งใจละไว้)

- **F1 (conflicting constraint) — REQ-5.4 vs REQ-9.6/9.7/7.5**: `health:"disabled"` ชนคำต้องห้าม → **แก้**: เพิ่มเงื่อนไขห้ามค่า `disabled` ใน REQ-5.4 (ต้อง rename เช่น `offline`)
- **F2 (ambiguity) — REQ-3.4**: rename field ไม่ได้ระบุว่าค่า FK ข้ามไฟล์เป็น code หรือ GUID → **แก้**: ระบุชัดว่าเป็น `code` string เสมอ, GUID เฉพาะ `Merchant.id` เอง
- **F3 (gap) — REQ-2.2/2.3/2.4**: ไม่มี mapping rule จากค่าเก่า 6 ค่าไปยัง enum ใหม่ (3/5 ค่า) → **ตัดสิน: ไม่แก้ requirements.md** — คงเป็น design-level decision (design.md ปิดแล้วด้วย mapping table ที่ REQ-2 ไม่จำเป็นต้องรู้รายละเอียด data-migration ระดับนี้ — EARS คือ WHAT ไม่ใช่ HOW migrate ข้อมูลเก่า)
- **F4 (logical inconsistency, ถ้อยคำ) — REQ-8.1 vs REQ-8.2**: "แหล่งเดียว" อ่านขัดกับ "แยก Order/PaymentSession" ได้ → **แก้**: เคลียร์ถ้อยคำ REQ-8.1 ว่าหมายถึงไฟล์เดียว ไม่ใช่ type เดียว
- **F5 (unstated assumption) — REQ-1.6**: `Product.price` ไม่มีไฟล์เป้าหมายจริงใน pol-admin → **แก้**: ระบุชัดว่าเป็นตัวอย่าง illustrative จากซอร์สเท่านั้น ไม่ใช่ mandate ที่ต้องมีไฟล์ apply
- **F6 (gap) — REQ-7.2**: list ไฟล์ไม่ exhaustive ("อย่างน้อย") ไม่มีเกณฑ์ตัดสินไฟล์ใหม่ → **แก้**: เปลี่ยนเป็น criterion-based ("ไฟล์ POL-domain ที่ REQ อื่นอ้างถึงจริงแต่ไม่มี read endpoint") + เพิ่ม `main.ts` เข้า list ตัวอย่าง

### ยังต้องปิดใน design

- **OQ-A: ลบ `refunded` แล้ว UI ที่ผูกอยู่ทำยังไง** — tab/filter/KPI "คืนเงิน" จะว่าง: ลบ UI นั้น หรือแทนด้วย `Cancelled` (สถานะที่มีจริง)
- **OQ-B: `MerchantStatus` เหลือค่าเดียว (`Active`)** — column/badge/filter สถานะบนหน้า merchant list กลายเป็น UI ที่ไม่มีข้อมูล: ลบ column หรือคงไว้รอ lifecycle จริง
- **OQ-C: `transactions.ts` (852 บรรทัด) มี `customerName`/`customerEmail`** — pol-core มีแค่ `NotificationRecipient` (email, optional) ไม่มีชื่อลูกค้าเลย: คง field ไว้พร้อมป้าย UI-only (ตาม REQ-7.4 ไม่รื้อ) หรือตัด — design ตัดสิน
- **OQ-D: `orders.ts` vs `transactions.ts` (852 บรรทัดเท่ากัน, type เดียวกัน)** — REQ-8 ยุบ type แล้ว mock 2 ไฟล์นี้ควรยุบด้วยไหม หรือคงไว้เพราะคนละหน้าจอ
- **OQ-E: เกณฑ์ตัดสิน "รูปแบบ id"** — id ปัจจุบันเป็น string มนุษย์อ่านได้ (`PSP-VCTL-OMISE-LIVE`, `TXN-2026-100000`) แต่ pol-core ใช้ `Guid` ทุกตัว: เปลี่ยนเป็น GUID (ตรง contract แต่ demo อ่านไม่รู้เรื่อง) หรือคงไว้ + ป้าย UI-only
- **OQ-F: placeholder avatar ตอนไม่มี photo-serving endpoint** — REQ-4.9 (rev 5) ให้ใช้ placeholder เมื่อ `photoObjectKey` มีค่า แต่ resolve จริงไม่ได้: design ต้องเลือก placeholder component/asset ที่ใช้ (เช่น initials avatar เดิมของ Minimals) และตัดสินว่า photo-serving endpoint เป็น spec ถัดไปที่ต้องทำก่อน UI แสดงรูปจริงได้หรือไม่ (นอกสโคป Truth Pass นี้ — cross-repo, ต้องเพิ่ม endpoint ฝั่ง pol-core)

### Edge

- **`enabledChannels` เป็น CSV string** (`MerchantView`) แต่ **`enabledMethods` เป็น array** (`MerchantConnectionView`) — ต่างชนิดกันจริงในซอร์ส **ห้าม "แก้ให้เหมือนกัน"**
- **`EnabledChannels` / `EnabledMethods` ยังไม่ถูก enforce** ที่ใดใน pol-core (gap ที่เอกสารบันทึกเอง) — mock ห้ามสมมติว่า UI กรองช่องทางตามค่านี้แล้ว
- **`Metadata` / `Config` เป็น `JsonElement?`** — bag อิสระที่ admin ส่งตอน provision เก็บ verbatim; mock ใส่ได้แต่ต้องเป็น object ธรรมดา ไม่ใช่ typed field
- **REQ-9.6 คำต้องห้าม `tenant`** จะชนกับคำที่ถูกต้องอื่นไหม (เช่น comment อธิบายประวัติ) — design กำหนดขอบเขต scan ให้ชัด (เฉพาะ string literal + identifier ไม่ใช่คอมเมนต์?)
