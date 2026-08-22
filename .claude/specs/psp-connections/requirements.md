# Requirements: PSP Connections

> Status: approved 2026-08-19, amended 2026-08-19

## Overview

ฟีเจอร์นี้แทน PSP Connections แบบ mock เดิมด้วยหน้าจอ Admin ที่เรียก `pol-core` จริง เพื่อให้ทีมกลาง
จัดการ connection ของ 2C2P และ Omise ต่อ merchant ได้ โดยรักษา write-only credential, ETag,
idempotency, maker-checker, merchant scope, responsive layout และ accessibility ตาม backend contract.

คำว่า sensitive input ในเอกสารนี้หมายถึง `secretKey` และ `pspMerchantId`.

## Scope

| ขอบเขต | รวม | ไม่รวม |
|---|---|---|
| Frontend | List, Info, Create, Edit, credential-change dialog, navigation, API client, tests | SPA ใหม่, design-system rewrite |
| Backend | ใช้ endpoint ที่มีอยู่แบบ read/write, เพิ่ม `hasPendingCredentialChange` ใน read model และแก้ credential replay ordering | endpoint ใหม่, persistence schema, adapter, vault หรือ approval engine ใหม่ |
| PSP | 2C2P และ Omise ตาม capability ปัจจุบัน | routing rules, payout, refund, card input, QR, iframe, Omise.js |
| Configuration | อ่าน typed allowlisted config และส่งค่าเดิมกลับตอน Edit | raw JSON editor หรือ config field ที่ runtime ยังไม่มี consumer |
| Dependencies | reuse dependency และ component ที่ติดตั้งแล้ว | dependency ใหม่ |

## Contract Baseline

| การทำงาน | Method และ path | Header สำคัญ |
|---|---|---|
| List | `GET /api/v1/payments/psp-connections` | session cookie |
| Info | `GET /api/v1/payments/psp-connections/{connectionId}` | รับ `ETag` |
| Create | `POST /api/v1/payments/psp-connections` | `Idempotency-Key` |
| Edit | `PUT /api/v1/payments/psp-connections/{connectionId}` | `If-Match`, `Idempotency-Key` |
| Test active credential | `POST /api/v1/payments/psp-connections/{connectionId}/test` | `If-Match`, `Idempotency-Key` |
| Request credential change | `POST /api/v1/payments/psp-connections/{connectionId}/credential-change-requests` | `If-Match`, `Idempotency-Key` |
| Merchant labels/selector | `GET /api/v1/merchants` | session cookie |
| Pending approval state | `GET /api/v1/approvals` | session cookie |

### D8 contract amendments approved 2026-08-19

| Contract | Amendment |
|---|---|
| PSP List/Info response | ทุก `PspConnectionView` มี `hasPendingCredentialChange` จาก synchronous state `PendingApprovalId is not null` โดยไม่เปิดเผย approval ID |
| Credential-change retry | หลัง access, resource และ intent validation ให้ replay operation เดิมก่อน stale-version rejection |

## REQ-1: Information Architecture และ Navigation

**User Story:** As a central Admin operator, I want แยกหน้า List, Info, Create และ Edit ชัดเจน,
so that แต่ละงานมี flow คาดเดาได้และไม่แก้ข้อมูลโดยไม่ตั้งใจ.

**Acceptance Criteria (EARS):**

- 1.1 THE SYSTEM SHALL ใช้ route `/control/psp/list` สำหรับ List ตาม convention เดิมของ Admin SPA
- 1.2 THE SYSTEM SHALL ใช้ route `/control/psp/create` สำหรับ Create
- 1.3 THE SYSTEM SHALL ใช้ route `/control/psp/read?id={connectionId}` สำหรับ Info
- 1.4 THE SYSTEM SHALL ใช้ route `/control/psp/edit?id={connectionId}` สำหรับ Edit
- 1.5 THE SYSTEM SHALL มี page component แยกสำหรับ List, Info, Create และ Edit
- 1.6 WHEN ผู้ใช้เลือก `เพิ่มการเชื่อมต่อ` จาก List THE SYSTEM SHALL เปิด Create
- 1.7 WHEN ผู้ใช้เลือก connection จาก List THE SYSTEM SHALL เปิด Info ของ connection นั้น
- 1.8 WHEN Create สำเร็จ THE SYSTEM SHALL เปิด Info ของ connection ที่ backend สร้าง
- 1.9 WHEN ผู้ใช้เลือก `แก้ไขการตั้งค่า` จาก Info THE SYSTEM SHALL เปิด Edit ของ connection นั้น
- 1.10 WHEN Edit สำเร็จ THE SYSTEM SHALL กลับไป Info ของ connection นั้น
- 1.11 WHEN ผู้ใช้อยู่ใน Create หรือ Edit และมีค่าที่เปลี่ยนแต่ยังไม่บันทึก THE SYSTEM SHALL ใช้ unsaved-changes guard ตาม convention เดิมของ SPA
- 1.12 THE SYSTEM SHALL คง PSP navigation entry ใน sidebar และ search/breadcrumb config ทั้งสองแหล่งของ SPA
- 1.13 IF route Info หรือ Edit ไม่มี `id` หรือ `id` ไม่ใช่ UUID THEN THE SYSTEM SHALL แสดง generic not-found state โดยไม่ส่ง PSP API request

## REQ-2: Permission และ Merchant Scope

**User Story:** As an Admin with scoped permissions, I want เห็นเฉพาะ action ที่ตนมีสิทธิ์,
so that UI สอดคล้องกับ backend enforcement โดยไม่ใช้ client เป็น authorization boundary.

**Acceptance Criteria (EARS):**

- 2.1 THE SYSTEM SHALL อ่าน effective permission จาก auth bootstrap response ปัจจุบัน
- 2.2 WHILE ผู้ใช้ไม่มี `settings.manage` THE SYSTEM SHALL ซ่อน PSP navigation entry และ action ของฟีเจอร์นี้
- 2.3 WHILE ผู้ใช้มี `settings.manage` THE SYSTEM SHALL อนุญาตให้เปิด List, Info, Test และ credential-change action ใน UI
- 2.4 WHILE ผู้ใช้ไม่มี `merchant.manage` THE SYSTEM SHALL ซ่อน Create และ Edit action
- 2.5 WHILE ผู้ใช้มีทั้ง `settings.manage` และ `merchant.manage` THE SYSTEM SHALL แสดง Create และ Edit action
- 2.6 THE SYSTEM SHALL ให้ backend เป็น authorization และ merchant-scope source of truth สำหรับทุก request
- 2.7 THE SYSTEM SHALL โหลด merchant ทุกหน้าภายใน scope จาก `GET /api/v1/merchants` ด้วย `limit=100` จนครบ `total` เพื่อใช้เป็น label, filter และ Create selector
- 2.8 IF merchant label โหลดไม่ได้แต่ PSP connection โหลดได้ THEN THE SYSTEM SHALL แสดง `merchantId` แทนชื่อโดยไม่บล็อกการอ่าน connection
- 2.9 IF backend คืน `403` THEN THE SYSTEM SHALL แสดงสถานะไม่มีสิทธิ์โดยไม่พยายามข้าม permission check
- 2.10 IF resource ไม่พบหรืออยู่นอก merchant scope THEN THE SYSTEM SHALL แสดง not-found state เดียวกัน
- 2.11 WHILE ผู้ใช้ไม่มี `merchant.view` THE SYSTEM SHALL disable Create และ merchant filter พร้อมอธิบายว่า merchant catalog โหลดไม่ได้
- 2.12 IF merchant catalog โหลดบางหน้าไม่สำเร็จ THEN THE SYSTEM SHALL แสดง `merchantId` สำหรับ label ที่ resolve ไม่ได้โดยไม่บล็อก List หรือ Info
- 2.13 WHILE merchant catalog โหลดไม่ครบ THE SYSTEM SHALL disable Create และ merchant filter พร้อมแสดง retry action
- 2.14 WHILE auth bootstrap กำลังโหลด THE SYSTEM SHALL แสดง loading state บน direct PSP route โดยไม่ส่ง PSP API request
- 2.15 WHILE ผู้ใช้ไม่มี `settings.manage` และเปิด direct PSP route THE SYSTEM SHALL แสดง permission state โดยไม่ส่ง PSP API request
- 2.16 WHILE ผู้ใช้ไม่มี `merchant.manage` และเปิด direct Create หรือ Edit route THE SYSTEM SHALL แสดง permission state โดยไม่ส่ง mutation request

## REQ-3: Provider และ Data Contract

**User Story:** As a payment operator, I want form และข้อมูลตรงกับ capability ที่ adapter ใช้จริง,
so that ไม่เปิด method หรือ config ที่ runtime ไม่รองรับ.

**Acceptance Criteria (EARS):**

- 3.1 THE SYSTEM SHALL รองรับ PSP code เฉพาะ `2c2p` และ `omise`
- 3.2 THE SYSTEM SHALL รองรับ method `card`, `promptpay` และ `installment` สำหรับ 2C2P
- 3.3 THE SYSTEM SHALL รองรับ method `card` เท่านั้นสำหรับ Omise
- 3.4 WHEN backend คืน `capabilities.test` THE SYSTEM SHALL ใช้ค่านั้นเป็น source of truth ของ Test action
- 3.5 THE SYSTEM SHALL แยก Enabled, Health และ Approval เป็นคนละสถานะ
- 3.6 THE SYSTEM SHALL map Health `unknown`, `healthy` และ `failed` เป็น label `Unknown`, `Healthy` และ `Failed` ตามลำดับ
- 3.7 THE SYSTEM SHALL แสดง Enabled เป็น `เปิดใช้งาน` หรือ `ปิดใช้งาน`
- 3.8 THE SYSTEM SHALL แสดง Approval เป็น `ไม่มีคำขอที่รออนุมัติ` หรือ `รออนุมัติ`
- 3.9 THE SYSTEM SHALL แสดงชื่อ PSP เป็น `2C2P` หรือ `Omise` โดยไม่เปลี่ยน wire code
- 3.10 THE SYSTEM SHALL รับ masked credential จาก `maskedSecrets` เท่านั้น
- 3.11 THE SYSTEM SHALL อ่าน config เฉพาะ field `accountId`, `card`, `installment`, `enabledSources` และ `returnUrls`
- 3.12 IF config มี field นอก allowlist THEN THE SYSTEM SHALL ไม่ render ค่า field นั้น
- 3.13 THE SYSTEM SHALL ไม่สร้าง editable environment selector
- 3.14 WHERE backend ไม่มี safe environment endpoint THE SYSTEM SHALL ไม่แสดงหรือ infer environment
- 3.15 THE SYSTEM SHALL ไม่เปิดใช้ `publicKey` หรือ `webhookSecret` ของ Omise ใน MVP
- 3.16 THE SYSTEM SHALL gate Create ด้วย `settings.manage`, `merchant.manage`, `merchant.view` และ merchant catalog ที่โหลดครบ โดยไม่ require `ETag` หรือ pending state
- 3.17 WHEN `lastTestResult` เป็น `authenticated` THE SYSTEM SHALL แสดงผลทดสอบเป็น `สำเร็จ`
- 3.18 WHEN `lastTestResult` เป็น `probe_failed` THE SYSTEM SHALL แสดงผลทดสอบเป็น `ล้มเหลว`
- 3.19 WHEN `lastTestResult` เป็น `null` THE SYSTEM SHALL แสดง `ยังไม่เคยทดสอบ`
- 3.20 IF `lastTestResult` เป็นค่าที่ UI ไม่รู้จัก THEN THE SYSTEM SHALL แสดง `ไม่ทราบผล` โดยไม่แสดง wire value
- 3.21 IF approval state โหลดไม่ได้ THEN THE SYSTEM SHALL แสดง `ตรวจสถานะอนุมัติไม่ได้` แยกจาก `ไม่มีคำขอที่รออนุมัติ`
- 3.22 THE SYSTEM SHALL gate Edit และ credential-change ด้วย permission ที่เกี่ยวข้อง, raw `ETag`, `hasPendingCredentialChange=false` และ approval lookup ที่ยืนยันว่าไม่มี pending request โดยไม่ใช้ capability key ที่ไม่มี

## REQ-4: List

**User Story:** As a central Admin operator, I want ค้นหา กรอง และแบ่งหน้า PSP connections,
so that หา connection ที่ต้องตรวจได้เร็ว.

**Acceptance Criteria (EARS):**

- 4.1 THE SYSTEM SHALL โหลด List จาก `GET /api/v1/payments/psp-connections`
- 4.2 THE SYSTEM SHALL ส่ง `page`, `limit`, `search`, `merchantId`, `psp` และ `health` ตาม filter ที่ใช้งานอยู่
- 4.3 THE SYSTEM SHALL ใช้ pagination metadata จาก backend แทนแบ่งหน้าจากข้อมูล mock ฝั่ง client
- 4.4 THE SYSTEM SHALL แสดง Merchant, PSP, enabled methods, Enabled, Health, last test, Approval และ action `ดูข้อมูล` ต่อรายการ
- 4.5 THE SYSTEM SHALL map merchant name จากผล `GET /api/v1/merchants`
- 4.6 THE SYSTEM SHALL map pending approval จากรายการที่ `action=psp.credential.change`, `status=pending` และ `targetId` ตรงกับ connection
- 4.7 THE SYSTEM SHALL แสดง Enabled, Health และ Approval เป็น visual element แยกกันในแต่ละรายการ
- 4.8 WHILE List กำลังโหลด THE SYSTEM SHALL แสดง loading state ที่ไม่แสดงข้อมูลเก่าเป็นผลใหม่
- 4.9 WHILE List ไม่มีรายการ THE SYSTEM SHALL แสดง empty state พร้อม action `เพิ่มการเชื่อมต่อ` เมื่อผู้ใช้มีสิทธิ์ Create
- 4.10 IF List request ล้มเหลว THEN THE SYSTEM SHALL แสดง error state พร้อม retry action
- 4.11 WHEN ผู้ใช้เปลี่ยน search หรือ filter THE SYSTEM SHALL กลับไป backend page แรก
- 4.12 WHEN ผู้ใช้เปลี่ยนหน้า THE SYSTEM SHALL โหลดหน้าที่เลือกจาก backend
- 4.13 THE SYSTEM SHALL ไม่มี inline edit, inline secret, test action หรือ destructive action ใน List
- 4.14 THE SYSTEM SHALL ใช้ label `ค้นหา Connection ID` เพราะ backend search รองรับ `pspConnectionId` เท่านั้น
- 4.15 WHEN pending approval มีมากกว่าหนึ่งหน้า THE SYSTEM SHALL โหลดหน้าถัดไปด้วย `limit=100` จนครบ `total` ก่อนสรุปว่า connection ไม่มี pending request
- 4.16 IF approval request ของ List ล้มเหลว THEN THE SYSTEM SHALL แสดง `ตรวจสถานะอนุมัติไม่ได้` พร้อม retry โดยไม่แสดง `ไม่มีคำขอที่รออนุมัติ`

## REQ-5: Shared Status Header

**User Story:** As a payment operator, I want เห็น identity และสถานะสำคัญในตำแหน่งคงที่,
so that เปรียบเทียบ connection state ก่อนลงมือได้.

**Acceptance Criteria (EARS):**

- 5.1 THE SYSTEM SHALL ใช้ reusable `ConnectionHeader` บน Create, Info และ Edit
- 5.2 THE SYSTEM SHALL แสดง PSP, merchant, Enabled, Health และ Approval ใน `ConnectionHeader`
- 5.3 WHERE Create ยังเลือก PSP หรือ merchant ไม่ครบ THE SYSTEM SHALL แสดง placeholder ใน `ConnectionHeader`
- 5.4 WHEN Create มีค่าที่เลือกแล้ว THE SYSTEM SHALL แสดง PSP และ merchant ที่เลือกใน `ConnectionHeader`
- 5.5 THE SYSTEM SHALL แสดง text และ icon คู่กับสีสำหรับ Enabled, Health และ Approval
- 5.6 THE SYSTEM SHALL ไม่รวม Enabled, Health และ Approval เป็น badge เดียว
- 5.7 THE SYSTEM SHALL แสดง connection identity และสามสถานะแบบเทียบเท่ากันใน List row ซึ่งไม่มี connection เดียวสำหรับใช้ header
- 5.8 WHERE `ConnectionHeader` อยู่บน Create THE SYSTEM SHALL แสดง Enabled `เปิดใช้งาน`, Health `Unknown` และ Approval `ไม่มีคำขอที่รออนุมัติ` เป็น preview ของ backend defaults

## REQ-6: Info

**User Story:** As a payment operator, I want อ่าน config, credential hint, health และ approval state,
so that ตรวจ connection ได้โดยไม่เปิดเผย credential.

**Acceptance Criteria (EARS):**

- 6.1 THE SYSTEM SHALL โหลด Info จาก `GET /api/v1/payments/psp-connections/{connectionId}`
- 6.2 THE SYSTEM SHALL เก็บ raw `ETag` response header เป็น concurrency token ของ connection ที่โหลดล่าสุด
- 6.3 THE SYSTEM SHALL แสดง overview, enabled methods, Enabled, Health, last tested time และ last test result
- 6.4 THE SYSTEM SHALL แสดง config ที่ backend คืนเป็น typed read-only fields ตาม allowlist ใน REQ-3.11
- 6.5 THE SYSTEM SHALL ไม่แสดง raw JSON editor หรือ raw JSON block
- 6.6 THE SYSTEM SHALL แสดง masked hint ของ `secretKey` โดยไม่มี reveal action
- 6.7 WHERE PSP เป็น 2C2P THE SYSTEM SHALL อธิบายว่า provider merchant ID อ่านกลับจาก backend ไม่ได้
- 6.8 THE SYSTEM SHALL โหลด pending approval state ผ่าน `GET /api/v1/approvals` โดยส่ง `search={connectionId}`, `action=psp.credential.change`, `status=pending` และตรวจ `targetId` แบบ exact match
- 6.9 WHILE credential change รออนุมัติ THE SYSTEM SHALL แสดง `รออนุมัติ` โดยยังแสดง masked active credential เดิม
- 6.10 WHILE credential change รออนุมัติ THE SYSTEM SHALL disable Edit, Test และ credential-change action พร้อมข้อความว่า action เหล่านี้อาจเปลี่ยน target version
- 6.11 WHILE Info กำลังโหลด THE SYSTEM SHALL แสดง loading state
- 6.12 IF Info คืน `404` THEN THE SYSTEM SHALL แสดง not-found state ที่ไม่ระบุว่า resource อยู่นอก scope หรือไม่มีอยู่
- 6.13 IF Info request ล้มเหลวด้วยสถานะอื่น THEN THE SYSTEM SHALL แสดง error state พร้อม retry action
- 6.14 IF Info response ไม่มี `ETag` THEN THE SYSTEM SHALL disable mutation action และแจ้งให้โหลดข้อมูลใหม่
- 6.15 IF pending approval request ของ Info ล้มเหลว THEN THE SYSTEM SHALL disable Edit, Test และ credential-change action พร้อมแสดง retry action

## REQ-7: Create

**User Story:** As an Admin with management permission, I want สร้าง PSP connection พร้อม credential เริ่มต้น,
so that merchant รับชำระผ่าน provider ที่รองรับได้.

**Acceptance Criteria (EARS):**

- 7.1 THE SYSTEM SHALL แสดง Merchant, PSP, supported methods, provider account field และ initial secret ใน Create form
- 7.2 WHEN ผู้ใช้เลือก 2C2P THE SYSTEM SHALL แสดง `2C2P Merchant ID` และ `secretKey` เป็น field บังคับ
- 7.3 WHEN ผู้ใช้เลือก Omise THE SYSTEM SHALL แสดง `secretKey` เป็น field บังคับโดยไม่แสดง account field
- 7.4 WHEN ผู้ใช้เปลี่ยน PSP THE SYSTEM SHALL reset method และ provider-specific credential field ที่ไม่ใช้กับ PSP ใหม่
- 7.5 THE SYSTEM SHALL บังคับให้เลือก enabled method อย่างน้อยหนึ่งรายการ
- 7.6 THE SYSTEM SHALL แสดง method selector เฉพาะ method ตาม REQ-3.2 และ REQ-3.3
- 7.7 THE SYSTEM SHALL ส่ง body ที่มี `merchantId`, `psp`, `enabledMethods`, `config`, `secrets` และ `pspMerchantId` ตาม backend contract
- 7.8 THE SYSTEM SHALL ส่ง `config` เป็น `null` ใน Create เพราะ config allowlist ปัจจุบันไม่มี runtime consumer
- 7.9 THE SYSTEM SHALL วาง `secretKey` ใต้ `secrets` เท่านั้น
- 7.10 WHERE PSP เป็น 2C2P THE SYSTEM SHALL ส่ง account field เป็น `pspMerchantId`
- 7.11 THE SYSTEM SHALL ส่ง `Idempotency-Key` กับ Create request
- 7.12 WHEN backend คืน `201` THE SYSTEM SHALL ล้าง sensitive input แล้วเปิด Info ของ `pspConnectionId` ที่สร้าง
- 7.13 IF backend คืน validation error THEN THE SYSTEM SHALL แสดง field-level หรือ form-level error โดยไม่ echo sensitive input
- 7.14 IF Create คืน `409` โดยไม่มี Problem Details code THEN THE SYSTEM SHALL แจ้งว่า merchant มี connection สำหรับ PSP นี้แล้ว
- 7.15 WHILE Create request กำลังทำงาน THE SYSTEM SHALL disable submit action เพื่อป้องกัน duplicate intent

## REQ-8: Edit

**User Story:** As an Admin with management permission, I want แก้ methods และ enabled state,
so that คุมการใช้งาน connection โดยไม่แตะ credential.

**Acceptance Criteria (EARS):**

- 8.1 THE SYSTEM SHALL โหลด connection ล่าสุดและ `ETag` ก่อนแสดง Edit form
- 8.2 THE SYSTEM SHALL แสดง Merchant และ PSP แบบ read-only
- 8.3 THE SYSTEM SHALL ให้แก้ enabled methods เฉพาะ method ที่ provider รองรับ
- 8.4 THE SYSTEM SHALL ให้แก้ Enabled state
- 8.5 THE SYSTEM SHALL แสดง config allowlist แบบ read-only และส่งค่าเดิมกลับโดยไม่เปลี่ยน
- 8.6 THE SYSTEM SHALL ไม่แสดง credential input หรือ prefill credential ใน Edit
- 8.7 THE SYSTEM SHALL ไม่ส่ง `secrets` หรือ `pspMerchantId` ผ่าน Update endpoint
- 8.8 THE SYSTEM SHALL ส่ง body ที่มี `merchantId`, `enabledMethods`, `config` และ `isEnabled`
- 8.9 THE SYSTEM SHALL ส่ง `If-Match` จาก `ETag` ล่าสุดกับ Update request
- 8.10 THE SYSTEM SHALL ส่ง `Idempotency-Key` กับ Update request
- 8.11 WHEN ผู้ใช้เปลี่ยน Enabled จากเปิดเป็นปิด THE SYSTEM SHALL ขอ confirmation ที่อธิบายว่า connection จะหยุดรับชำระ
- 8.12 WHEN backend คืน `200` THE SYSTEM SHALL ล้าง dirty state แล้วกลับ Info
- 8.13 IF Update คืน stale-version conflict THEN THE SYSTEM SHALL ไม่ทับข้อมูลและเสนอ action โหลดเวอร์ชันล่าสุด
- 8.14 WHILE credential change รออนุมัติ THE SYSTEM SHALL ไม่อนุญาตให้เปิด Edit form

## REQ-9: Credential Change Dialog

**User Story:** As a maker, I want ส่ง credential ใหม่เข้า approval flow,
so that credential เดิมยัง active จน checker อนุมัติ.

**Acceptance Criteria (EARS):**

- 9.1 THE SYSTEM SHALL เปิด credential-change dialog จาก Info หรือจาก Edit ที่ไม่มี unsaved changes เมื่อไม่มี pending request
- 9.2 WHEN PSP เป็น 2C2P THE SYSTEM SHALL ขอ `2C2P Merchant ID` และ `secretKey` ใหม่ใน dialog
- 9.3 WHEN PSP เป็น Omise THE SYSTEM SHALL ขอ `secretKey` ใหม่โดยไม่มี account field
- 9.4 THE SYSTEM SHALL ไม่ prefill credential หรือ provider merchant ID เดิม
- 9.5 THE SYSTEM SHALL ส่ง request ไป `/api/v1/payments/psp-connections/{connectionId}/credential-change-requests`
- 9.6 THE SYSTEM SHALL ส่ง `merchantId`, `secrets` และ `pspMerchantId` ตาม provider contract
- 9.7 THE SYSTEM SHALL ส่ง `If-Match` จาก `ETag` ล่าสุด
- 9.8 THE SYSTEM SHALL ส่ง `Idempotency-Key` ของ credential-change intent
- 9.9 WHEN backend คืน `202` THE SYSTEM SHALL ล้าง sensitive input และปิด dialog
- 9.10 WHEN backend คืน `202` THE SYSTEM SHALL แสดง Approval เป็น `รออนุมัติ`
- 9.11 WHEN backend คืน `202` THE SYSTEM SHALL ไม่เปลี่ยน masked active credential ใน UI
- 9.12 WHEN backend คืน `202` THE SYSTEM SHALL เปิดหรือคง Info แล้ว refetch เพื่อรับ connection version และ `ETag` ล่าสุด
- 9.13 WHEN ผู้ใช้ cancel dialog THE SYSTEM SHALL ล้าง sensitive input
- 9.14 WHILE credential-change request กำลังทำงาน THE SYSTEM SHALL disable submit action
- 9.15 IF pending request มีอยู่แล้ว THEN THE SYSTEM SHALL disable action และไม่ส่ง request ซ้ำ
- 9.16 IF credential-change คืน `409` โดยไม่มี Problem Details code THEN THE SYSTEM SHALL refetch approval state และแสดง current-state conflict โดยไม่ echo sensitive input
- 9.17 IF credential-change คืน unknown หรือ network error THEN THE SYSTEM SHALL แสดง safe generic error โดยไม่ echo sensitive input
- 9.18 WHILE Edit form มี unsaved changes THE SYSTEM SHALL disable credential-change action พร้อมอธิบายว่าต้องบันทึกหรือยกเลิกการแก้ไขก่อน

## REQ-10: Test Active Credential

**User Story:** As a payment operator, I want ทดสอบ credential ที่ active อยู่,
so that รู้ว่า connection ใช้งานกับ PSP ได้โดยไม่สับสนกับ pending credential.

**Acceptance Criteria (EARS):**

- 10.1 THE SYSTEM SHALL ใช้ label `ทดสอบ Credential ที่ใช้งานอยู่`
- 10.2 WHERE backend capability `test` เป็น false THE SYSTEM SHALL ไม่เปิด test action
- 10.3 THE SYSTEM SHALL ส่ง request ไป `/api/v1/payments/psp-connections/{connectionId}/test`
- 10.4 THE SYSTEM SHALL ส่ง body ที่มี `merchantId`
- 10.5 THE SYSTEM SHALL ส่ง `If-Match` จาก `ETag` ล่าสุด
- 10.6 THE SYSTEM SHALL ส่ง `Idempotency-Key` ของ test intent
- 10.7 WHILE test request กำลังทำงาน THE SYSTEM SHALL disable test action
- 10.8 WHEN backend คืน `200` THE SYSTEM SHALL แสดง Health, last tested time และ result จาก response ล่าสุด
- 10.9 WHEN backend คืน `200` THE SYSTEM SHALL เก็บ `ETag` ใหม่จาก response
- 10.10 IF backend คืน `502` THEN THE SYSTEM SHALL refetch Info เพื่อแสดง persisted Health `failed`, เวลา และ `ETag` ล่าสุด
- 10.11 IF backend คืน `502` THEN THE SYSTEM SHALL แจ้งว่าทดสอบ active credential ล้มเหลวโดยไม่ echo secret
- 10.12 WHILE credential change รออนุมัติ THE SYSTEM SHALL disable test action เพื่อไม่เปลี่ยน target version ของ approval

## REQ-11: ETag, Idempotency และ Error Handling

**User Story:** As an Admin operator, I want mutation ปลอดภัยต่อ retry และ concurrent update,
so that action ไม่เกิดซ้ำและไม่ทับข้อมูลใหม่.

**Acceptance Criteria (EARS):**

- 11.1 THE SYSTEM SHALL ส่ง session cookie และ CSRF token ผ่าน API client เดิมตาม method contract
- 11.2 THE SYSTEM SHALL ใช้ raw `ETag` ล่าสุดเป็นค่า `If-Match` โดยไม่สร้าง token เอง
- 11.3 THE SYSTEM SHALL สร้าง idempotency key ใหม่เมื่อผู้ใช้เริ่ม intent ใหม่
- 11.4 WHEN retry intent และ payload เดิมหลัง network outcome ไม่แน่ชัด THE SYSTEM SHALL reuse idempotency key เดิม
- 11.5 WHEN payload หรือ intent เปลี่ยน THE SYSTEM SHALL สร้าง idempotency key ใหม่
- 11.6 THE SYSTEM SHALL ไม่เก็บ idempotency key ใน persistent browser storage
- 11.7 IF backend คืน `401` THEN THE SYSTEM SHALL เข้า session-expired flow เดิม
- 11.8 IF backend คืน `403` THEN THE SYSTEM SHALL แสดง permission error ที่สังเกตได้
- 11.9 IF backend คืน `404` THEN THE SYSTEM SHALL แสดง not-found message ที่ไม่เปิดเผย scope state
- 11.10 IF backend คืน `409` code `state_conflict` THEN THE SYSTEM SHALL เสนอโหลด resource และ `ETag` ล่าสุด
- 11.11 IF backend คืน `409` code `idempotency_key_reused` THEN THE SYSTEM SHALL หยุด retry ด้วย key นั้นและแจ้งให้เริ่ม intent ใหม่
- 11.12 IF backend คืน `409` code `operation_in_progress` THEN THE SYSTEM SHALL แจ้งว่า request เดิมกำลังประมวลผล
- 11.13 IF backend คืน Problem Details code ที่รู้จัก THEN THE SYSTEM SHALL map เป็นข้อความเฉพาะโดยไม่แสดง raw backend detail
- 11.14 IF backend คืน error ที่ไม่รู้จักหรือ network error THEN THE SYSTEM SHALL แสดง safe generic error พร้อม retry เมื่อ retry ปลอดภัย
- 11.15 IF local validation ของ Create, Edit หรือ credential-change ไม่ผ่าน THEN THE SYSTEM SHALL แสดง field-level error โดยไม่ส่ง request
- 11.16 IF backend คืน `400` code ที่รู้จัก THEN THE SYSTEM SHALL แสดง safe field-level หรือ form-level error ตาม operation โดยไม่แสดง raw backend detail
- 11.17 IF backend คืน `400` โดยไม่มี code หรือมี code ที่ไม่รู้จัก THEN THE SYSTEM SHALL แสดง safe generic form error
- 11.18 THE SYSTEM SHALL ให้ backend คืน `hasPendingCredentialChange` ในทุก `PspConnectionView` โดยคำนวณจาก synchronous connection state `PendingApprovalId is not null`
- 11.19 WHEN credential-change request เดิมถูก commit แล้วถูก retry ด้วย actor, merchant, payload, expected version และ `Idempotency-Key` เดิม THE BACKEND SHALL replay prior result หลัง access, resource และ intent validation แต่ก่อน stale-version rejection

## REQ-12: Credential Security

**User Story:** As a security owner, I want sensitive input อยู่ใน browser สั้นที่สุด,
so that ลดโอกาสรั่วผ่าน storage, URL, telemetry หรือ DOM.

**Acceptance Criteria (EARS):**

- 12.1 THE SYSTEM SHALL เก็บ sensitive input ได้แก่ `secretKey` และ `pspMerchantId` ใน component-local form state เท่าที่จำเป็น
- 12.2 WHEN Create หรือ credential change สำเร็จ THE SYSTEM SHALL reset sensitive input state
- 12.3 WHEN credential dialog ถูก cancel หรือ unmount THE SYSTEM SHALL reset sensitive input state
- 12.4 THE SYSTEM SHALL ไม่เก็บ sensitive input ใน `localStorage` หรือ `sessionStorage`
- 12.5 THE SYSTEM SHALL ไม่วาง sensitive input ใน URL, query string หรือ navigation state
- 12.6 THE SYSTEM SHALL ไม่วาง sensitive input ใน global store หรือ client cache
- 12.7 THE SYSTEM SHALL ไม่ส่ง sensitive input เข้า analytics, logs, breadcrumbs, error-report payload หรือ session replay
- 12.8 THE SYSTEM SHALL ไม่ log request body ของ mutation ที่มี sensitive input
- 12.9 THE SYSTEM SHALL ไม่มี reveal action สำหรับ stored credential
- 12.10 THE SYSTEM SHALL ไม่ mask plaintext ฝั่ง client เพื่อจำลอง stored credential
- 12.11 THE SYSTEM SHALL render เฉพาะ masked hint ที่ backend คืน
- 12.12 THE SYSTEM SHALL ใช้ password control พร้อม `autocomplete="new-password"` และ `spellcheck="false"`
- 12.13 THE SYSTEM SHALL อนุญาตให้ paste ใน credential input
- 12.14 THE SYSTEM SHALL ไม่ echo sensitive input ใน validation, API error หรือ test result
- 12.15 THE SYSTEM SHALL วาง `secretKey` ใต้ `secrets` ใน request body เท่านั้น
- 12.16 WHERE PSP เป็น 2C2P THE SYSTEM SHALL ส่ง sensitive account identifier เป็น top-level `pspMerchantId` ตาม backend contract

## REQ-13: Accessibility และ Responsive

**User Story:** As an Admin using keyboard, screen reader หรือจอเล็ก, I want ทุกหน้าทำงานครบ,
so that จัดการ PSP connection ได้โดยไม่มี input method หรือ viewport barrier.

**Acceptance Criteria (EARS):**

- 13.1 THE SYSTEM SHALL ใช้ semantic heading, form, label, button, table และ dialog controls
- 13.2 THE SYSTEM SHALL ผูก field-level error กับ input ผ่าน accessible description
- 13.3 THE SYSTEM SHALL รองรับ keyboard navigation สำหรับ action, form และ dialog ทั้งหมด
- 13.4 THE SYSTEM SHALL แสดง visible focus สำหรับ interactive control ทุกตัว
- 13.5 WHEN dialog เปิด THE SYSTEM SHALL จัดการ initial focus, focus containment และคืน focus ไป trigger เมื่อปิด
- 13.6 THE SYSTEM SHALL สื่อ Enabled, Health และ Approval ด้วย text และ icon โดยไม่พึ่งสีอย่างเดียว
- 13.7 WHILE viewport กว้าง 375 px THE SYSTEM SHALL เรียง content เป็นแนวตั้งโดยไม่มี horizontal overflow ที่บังข้อมูลหรือ primary action
- 13.8 WHILE viewport กว้าง 768 px THE SYSTEM SHALL คงข้อมูลและ primary action ที่ใช้งานได้โดยไม่มี horizontal overflow ระดับหน้า
- 13.9 WHILE viewport กว้าง 1440 px THE SYSTEM SHALL แสดง layout ที่อ่านสถานะและข้อมูลหลักได้โดยไม่ต้องเปิด row เพิ่ม
- 13.10 WHILE List อยู่บนจอเล็ก THE SYSTEM SHALL ใช้ responsive table/card pattern ที่ทำให้ Merchant, PSP, Enabled, Health, Approval และ `ดูข้อมูล` เข้าถึงได้
- 13.11 THE SYSTEM SHALL มี loading, empty, error, disabled และ in-flight state ที่ screen reader รับรู้ได้

## REQ-14: Verification และ Regression Safety

**User Story:** As a maintainer, I want หลักฐานอัตโนมัติและ browser verification,
so that API contract, security และ responsive behavior ไม่ regress.

**Acceptance Criteria (EARS):**

- 14.1 THE SYSTEM SHALL มี unit tests สำหรับ provider rules, validation, status mapping, Problem Details mapping และ idempotency intent behavior
- 14.2 THE SYSTEM SHALL มี API integration tests ที่ตรวจ path, query, body, CSRF, `If-Match`, `Idempotency-Key` และ `ETag`
- 14.3 THE SYSTEM SHALL มี browser checks สำหรับ List, Info, Create, Edit และ credential-change dialog
- 14.4 THE SYSTEM SHALL มี test ครอบคลุม `401`, `403`, `404`, `409` และ `502`
- 14.5 THE SYSTEM SHALL มี test ยืนยันว่า Create และ credential change วาง `secretKey` ใต้ `secrets` เท่านั้น
- 14.6 THE SYSTEM SHALL มี test ยืนยันว่า Update request ไม่มี credential
- 14.7 THE SYSTEM SHALL ไม่มี `.only` หรือ `.skip` เพิ่มใน test
- 14.8 WHEN implementation เสร็จ THE SYSTEM SHALL ผ่าน `npm run typecheck`, `npm run lint`, `npm test` และ `npm run build` ด้วย exit code 0
- 14.9 WHEN implementation เสร็จ THE SYSTEM SHALL ผ่าน browser verification ที่ 375, 768 และ 1440 px
- 14.10 WHEN browser verification เสร็จ THE SYSTEM SHALL ไม่มี console error หรือ hydration error
- 14.11 WHEN browser verification เสร็จ THE SYSTEM SHALL ยืนยันว่า sensitive input ไม่อยู่ใน browser storage, URL หรือ application log
- 14.12 THE SYSTEM SHALL ใช้ real PSP API client path โดยไม่มี fallback ไป PSP mock data
- 14.13 THE SYSTEM SHALL ไม่เพิ่ม `jsdom`, Testing Library หรือ Playwright dependency สำหรับ UI verification ใน MVP
- 14.14 THE SYSTEM SHALL มี backend tests ยืนยัน `hasPendingCredentialChange` ทั้ง `true`/`false` และ credential-change replay หลัง committed response loss

## Edge Cases & Open Questions

### Decisions confirmed 2026-08-19

- ใช้ Requirements-First และ route convention `/control/psp/*` เดิมแทน conceptual `/settings/psp-connections/*`.
- ใช้ `GET /api/v1/merchants` สำหรับ merchant label/selector และ `GET /api/v1/approvals` สำหรับ pending state.
- Config allowlist แสดง read-only; Create ส่ง `null`; Edit preserve ค่าเดิม เพราะ runtime ยังไม่มี consumer.
- 2C2P provider merchant ID อ่านกลับไม่ได้; Create และ credential change ต้องรับค่าใหม่โดยไม่ prefill.
- อนุมัติ backend coordination ขั้นต่ำใน `pol-core`: additive `hasPendingCredentialChange` และ credential replay ordering fix พร้อม contract tests.
- ไม่เพิ่ม endpoint, persistence schema, adapter, vault, approval engine หรือการเปิดเผย approval ID/secret.
- ยอมรับ sequential all-page merchant/approval scan แบบไม่มี cap สำหรับ MVP; ถ้าเกิน operational budgetภายหลัง ให้ amend requirement หรือเพิ่ม backend bulk/exact-state contract.

### Backend limitations

- `PspConnectionView` ยังไม่มี merchant nameหรือ provider merchant ID จึงต้อง join/อธิบายผ่าน endpointและ contractเดิม; D8 กำหนดให้เพิ่ม synchronous `hasPendingCredentialChange` โดยไม่คืน approval ID.
- Merchant selector ใช้ `GET /api/v1/merchants` ซึ่งต้องมี `merchant.view` เพิ่มจาก permission ของ mutation; UI จึง disable Create เมื่อขาดสิทธิ์อ่านนี้.
- Pending credential ซ้ำ throw `InvalidOperationException` ซึ่ง shared handler map เป็น `409` โดยไม่มี Problem Details code; UI ใช้ operation context, refetch approval และแสดง current-state conflict.
- Credential-change `202` และ failed-test `502` ไม่คืน `ETag`; UI ต้อง refetch Info ก่อน mutation ถัดไป.
- Pending credential ผูกกับ connection version; Edit หรือ Test ระหว่างรอทำ approval target stale จึง disable ทั้งสอง action.
- Approval projection ผ่าน outbox อาจช้ากว่า `202`; UI ใช้ response `202` แสดง pending ทันที, ใช้ synchronous fieldเป็น safety gate และใช้ approvals endpointสำหรับข้อความ/การ join.
- Credential-change backend ปัจจุบันตรวจ version ก่อน operation record; D8 กำหนดให้ replay committed intent เดิมหลัง access/resource/intent validationและก่อน stale-version rejection.

### Verification boundary

- Browser verification ใช้ backend จริงเมื่อ local session พร้อม; ถ้า human OIDC หรือ PSP credential ทำให้ automation ใช้ไม่ได้ ให้ใช้ contract-mock backend สำหรับ deterministic HTTP/UI paths และรายงานส่วนที่ยังไม่ได้ live-verify ตรงไปตรงมา.

### Analysis anchor

- `requirements.md` ยังไม่มี commit history ตอน audit; `git log` คืนค่าว่าง.
- Repository base commit: `b44ce84`.
- Pre-decision requirements blob: `740ebc29e8d2018e7968ac7a57c533a6dc642507`.

### Analysis findings resolved 2026-08-19

| Code | REQ | Decision | เหตุผล |
|---|---|---|---|
| L1 | 7.14, 9.16, 11.10-11.13 | Map code-less `409` ตาม operation และแก้ limitation จาก `500` เป็น `409` | ตรง shared exception handler และยังให้ข้อความปลอดภัย |
| L2 | 5.1, 5.3-5.4 | ใช้ `ConnectionHeader` บน Create, Info, Edit; List ใช้ row equivalent | แก้ scope ที่ขัดกันและคง shared visual language |
| L3 | 8.14, 9.1, 9.10, 9.12 | เปิด credential change จาก Edit เฉพาะ pristine form; สำเร็จแล้วไป Info | ป้องกัน dirty state และ stale Edit หลัง version เปลี่ยน |
| A1 | 2.3-2.5, 3.4, 10.2 | `capabilities.test` คุม Test เท่านั้น | Backend ไม่มี capability key สำหรับ Edit หรือ credential change |
| A2 | 4.2 | Search เฉพาะ Connection ID | ตรง query behavior ของ backend; merchant และ PSP ใช้ filter |
| A3 | 3.6-3.8, 6.3, 10.8-10.11 | ใช้ label และ fallback mapping ที่กำหนด | ไม่รั่ว wire code และแยก no-pending จาก lookup failure |
| A4 | 7.1-7.2, 7.10, 9.2, 9.6 | UI ใช้ `2C2P Merchant ID`; payload ใช้ `pspMerchantId` | ไม่ชนกับ top-level merchant selector `merchantId` |
| C1 | Scope, 14.3 | ใช้ Vitest unit/API tests และ browser checks โดยไม่เพิ่ม DOM test dependency | รักษา dependency constraint และยังตรวจ interaction จริง |
| G1 | 4.6, 6.8 | List โหลด pending approval ทุกหน้า; Info search connection โดยตรง | ป้องกัน false negative จาก pagination |
| G2 | 3.8, 4.6, 6.8-6.10 | Approval lookup failure เป็นสถานะแยกและ fail closed | ห้ามตีความ lookup failure ว่าไม่มี pending request |
| G3 | 2.7-2.13, 4.5 | โหลด merchant ทุกหน้าด้วย `limit=100`; partial failure ใช้ ID fallback | Endpoint ไม่มี lookup ตาม merchant ID และ selector ต้องครบ scope |
| G4 | 1.2-1.4, 2.2-2.16 | Gate direct route หลัง auth bootstrap ก่อนส่ง feature request | ให้ UI สอดคล้อง permission โดย backend ยังเป็น authorization boundary |
| G5 | 1.3-1.4, 6.1, 8.1 | Missing/invalid route ID เป็น generic not-found โดยไม่ส่ง request | Behavior ชัดและไม่เปิดเผย scope state |
| G6 | 7.13, 8, 9, 10, 11.13-11.17 | Map local/known validation อย่างปลอดภัย; unknown `400` เป็น generic | ครอบทุก form โดยไม่แสดง raw detail หรือ sensitive input |
| U1 | 7.10, 9.4, 9.6, 12.1-12.16 | `pspMerchantId` เป็น sensitive write-only account identifier แต่ส่ง top-level | ตรง backend contract พร้อมใช้ lifecycle protection เดียวกับ secret |
| D8-A | Scope, 3.22, 6.8-6.10, 8.14, 9.15, 10.12, 11.18 | เพิ่ม synchronous `hasPendingCredentialChange` และ fail closedเมื่อ fieldหาย | ปิด approval projection false-negative โดยไม่เปิดเผย approval ID |
| D8-B | 11.4, 11.19, 14.14 | replay committed credential intent ก่อน stale-version rejection | ทำ retry หลัง response loss ให้ตรง idempotency contract |
| D8-C | 2.7, 4.15 | ยอมรับ sequential all-page scan แบบไม่มี cap สำหรับ MVP | cap ฝั่ง clientอาจสร้าง false clear; ค่อยแก้เมื่อมี budgetหรือ backend contract |
| D8-D | 3.16, 3.22 | Create ใช้ permission/catalog; Edit/credentialใช้ permission + ETag + pending gates | แยก applicability ตาม resource lifecycle |
