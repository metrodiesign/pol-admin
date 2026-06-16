> Canonical source for ALL agents (Claude loads via .claude/rules stub; Codex/OpenCode/Pi read directly).
> แก้ที่นี่ที่เดียว — single source of truth.

# Product Overview

## Purpose

**Payment Orchestration Layer (POL) — Admin** คือ frontend ของ **admin portal ภายในองค์กร
(internal-only, พนักงานเท่านั้น)** สำหรับทีม payment operations ของบริษัทประกัน. ระบบ POL คือชั้นที่
รับชำระเบี้ยประกัน (policy premium) แล้ว route ธุรกรรมไปยังหลาย Payment Service Provider
(PSP เช่น 2C2P, Omise) ตามกฎ routing; frontend นี้คือหน้าจอบริหารของ POL — ติดตามสถานะธุรกรรม
ตลอด lifecycle, จัดการ payment link, originator (สาขา/ตัวแทน/นายหน้า/connected app), webhook,
API client, audit และ report/reconciliation.

One-line pitch: ที่เดียวให้พนักงานภายในมองเห็นและปฏิบัติการกับการรับชำระเบี้ยประกันข้าม PSP
ทั้งหมด — capture/void/refund, routing, กระทบยอด, และ audit — บนหน้าจอ admin ตัวเดียว.

## Target Users

ผู้ใช้คือ **พนักงานภายในองค์กรเท่านั้น** (ไม่ใช่ merchant หรือลูกค้าปลายทาง). RBAC แยกตาม role
(ดู `src/types/role.ts`, `src/lib/mock/roles.ts`):

- **System Admin** (`admin.system`) — คุมทั้งระบบ: จัดการ user/role, ตั้งค่า PSP/webhook/API client, ดู audit
- **Finance Admin** (`admin.finance`) — refund, reconciliation, financial report (PSP/channel breakdown, settlement)
- **Operator** (`admin.operator`) — ปฏิบัติการธุรกรรม: capture/void/refund, สร้าง payment link, ติดตามสถานะ
- **Viewer** (`admin.viewer`) — read-only: ธุรกรรม, policy, report, audit

> หมายเหตุ: RBAC model นิยาม `merchant.*` role ไว้ด้วย แต่นั่นเป็นของ **merchant portal ซึ่งเป็นคนละ surface**.
> repo นี้คือ **admin portal** สำหรับพนักงานภายใน — การกำหนด merchant role/permission ทำผ่าน roles module
> ของ admin เอง.

## Problem It Solves

- **กระจายความเสี่ยง PSP** — รวมหลาย PSP ไว้หลังชั้น orchestration เดียว แล้วเลือก PSP อัตโนมัติ
  ตามกฎ (channel/amount) เพื่อลด failure, คุม fee และเงื่อนไข settlement
- **มองเห็นและปฏิบัติการรวมศูนย์** — ทีมภายในเห็นธุรกรรมทุกช่องทาง (card/QR/installment/wallet/bank)
  และทำ capture/void/refund ได้จากที่เดียว แทนการสลับเข้าหลาย PSP console
- **กระทบยอดและตรวจสอบ** — reconciliation (expected vs settled) + audit log ที่ลบไม่ได้
  ครอบคลุมทุก sensitive action เพื่อ compliance และ forensics
- **เชื่อมช่องทางขายและ integration** — ติดตาม originator (สาขา/ตัวแทน/นายหน้า/app),
  จัดการ webhook ขาออก และ API client (OAuth2) สำหรับระบบที่มาเชื่อม

## Key Features

ฟีเจอร์หลักคือ payment domain ที่อยู่ใน `src/components/payment/*` (ดู [ARCHITECTURE.md](ARCHITECTURE.md)):

- **Dashboard** — KPI การรับชำระ (ยอดวันนี้, link ค้าง, succeeded/failed), volume trend, PSP split, channel breakdown, top originators
- **Transactions** — list + filter (status/originator/channel/PSP), bulk capture/void/refund, detail drawer + lifecycle track, export
- **Payment Links / Invoices** — สร้าง/ส่ง link เก็บเบี้ย, สถานะ (draft/pending/paid/overdue/voided), hosted payment preview
- **PSP** — config provider (2C2P/Omise) + routing rules engine (priority, when/then), test connection
- **API Clients** — OAuth2 client (scope, IP allowlist, usage), rotate secret
- **Webhooks** — endpoint + event delivery log (type, txn, status, attempts, latency), test
- **Audit** — audit log viewer พร้อม sensitive-action highlight, filter, drill-down
- **Users & Roles** — admin user management (status, IDP: Azure AD/Google/LINE) + RBAC role/permission matrix
- **Originators** — Branches (สาขา), Agents/Brokers/Staff (ตัวแทน/นายหน้า/พนักงาน), Connected Apps
- **Reports** — PSP/channel/originator breakdown + reconciliation table
- **Notifications** — ตั้งค่าแจ้งเตือน payment event และ webhook delivery

## Business Objectives

เป้าหมายของผลิตภัณฑ์ (เชิงผลลัพธ์ที่สังเกตได้ — KPI ตัวเลขจริงต้องยืนยันกับ stakeholder ก่อนใช้เป็นเกณฑ์ผ่าน):

- payment success rate สูงขึ้นจาก routing ที่เลือก PSP เหมาะกับ channel/amount
- reconciliation match rate (expected vs settled) ครบถ้วน ตรวจสอบย้อนได้ทุกธุรกรรม
- เวลาในการทำ refund/void ของ operator สั้นลง เทียบกับการเข้าหลาย PSP console
- audit ครอบคลุม sensitive action 100% (ไม่มี action การเงินที่ไม่ถูกบันทึก)

## Non-Goals

- **ไม่ใช่ merchant/customer-facing portal** — internal admin เท่านั้น
- **ไม่ใช่ตัว hosted payment page** เอง — เป็นหน้าบริหารของระบบ ไม่ใช่หน้าที่ลูกค้าจ่ายเงิน
- **ยังไม่มี backend จริง** — ทั้งหมดใช้ typed mock data (`src/lib/mock/*`); ไม่มี data fetching/auth จริง
  ในชั้นนี้ (ดู Current State)
- **Minimals template demo pages ไม่นับเป็นฟีเจอร์ของผลิตภัณฑ์** — หน้า analytics/ecommerce/banking/
  booking/calendar/chat/mail/kanban/tour/post/job/product/order ฯลฯ ใต้ `src/app/dashboard/*`
  คือ scaffolding ที่สืบทอดมาจาก admin template ไม่ใช่ขอบเขตของ POL admin

## Current State (ground truth)

- **Payment surface สร้างครบเป็น component library + types + mock** — `src/components/payment/*`
  (16 โมดูล), `src/types/*` (transaction, psp, originator, role, permission, webhook, api-client,
  audit, policy, invoice), `src/lib/mock/*` (originators/psp/transactions/webhooks/invoices/audit/roles/...)
- **ยังไม่ wire เข้า Next.js route** — `src/app/dashboard/*` ปัจจุบันยังเป็นหน้า demo ของ Minimals
  template; `nav-config.ts` อ้าง route ของ payment (`/transactions`, `/psp`, ...) ไว้แล้วแต่ยังไม่มี
  `page.tsx` จริง. **การ integrate routing คืองานถัดไป.**
- ผลิตภัณฑ์เป็น **frontend ล้วน, client-side**, ภาษาไทยทั้ง UI; stack/idiom ดู
  [stack/nextjs.md](stack/nextjs.md).
