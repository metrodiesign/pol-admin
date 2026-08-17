> Canonical source for ALL agents (Claude loads via .claude/rules stub; Codex/OpenCode/Pi read directly).
> แก้ที่นี่ที่เดียว — single source of truth.

# Product Overview

## Purpose

**Payment Orchestration Layer (POL) frontend** เป็น npm workspaces ที่มีสอง Next.js apps:
`@pol/admin` สำหรับพนักงานภายใน และ `@pol/merchant` สำหรับ Merchant surface. ในระยะ migration
ปัจจุบัน Merchant clone route implementation, UI, navigation และ Admin auth/API จาก Admin ทั้งชุด
แล้วเพิ่ม `/register`; การคัด route และสร้าง Merchant-specific auth/navigation เป็นงานภายหลัง.

ระบบ POL รับชำระเบี้ยประกันแล้ว route ธุรกรรมไปหลาย Payment Service Provider (PSP เช่น 2C2P,
Omise) ตามกฎ routing. Frontend ใช้ติดตาม lifecycle, จัดการ payment link, originator, webhook,
API client, audit และ report/reconciliation.

One-line pitch: frontend สอง surface สำหรับมองเห็นและปฏิบัติการรับชำระเบี้ยประกันข้าม PSP
โดยแยก deployment/runtime ownership ตั้งแต่ตอนนี้.

## Target Users

Admin app ใช้โดย **พนักงานภายในองค์กร**. RBAC แยกตาม role
(ดู `apps/admin/src/types/admin/role.ts` และ app-local mock):

- **System Admin** (`admin.system`) — คุมทั้งระบบ: จัดการ user/role, ตั้งค่า PSP/webhook/API client, ดู audit
- **Finance Admin** (`admin.finance`) — refund, reconciliation, financial report (PSP/channel breakdown, settlement)
- **Operator** (`admin.operator`) — ปฏิบัติการธุรกรรม: capture/void/refund, สร้าง payment link, ติดตามสถานะ
- **Viewer** (`admin.viewer`) — read-only: ธุรกรรม, policy, report, audit

Merchant app เป็น surface แยกบน port 3002 แต่รอบนี้ยังใช้ `AdminMe`, `getMe`, Admin session,
permissions, API และ navigation เหมือน Admin. ห้ามตีความ parity ชั่วคราวเป็น final Merchant model.

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

ฟีเจอร์หลักอยู่ใน app-local route/component trees ใต้ `apps/*/src` (ดู
[ARCHITECTURE.md](ARCHITECTURE.md)):

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

- **ยังไม่ใช่ final Merchant product surface** — route/auth/navigation pruning และ Merchant dashboard แยก spec ภายหลัง
- **ไม่ใช่ตัว hosted payment page** เอง — เป็นหน้าบริหารของระบบ ไม่ใช่หน้าที่ลูกค้าจ่ายเงิน
- **Domain data ส่วนใหญ่ยังเป็น mock** — app-local typed mock; auth และ API adapters บางส่วนเรียก BFF จริง
- **Minimals template demo pages ไม่นับเป็นฟีเจอร์ของผลิตภัณฑ์** — หน้า analytics/ecommerce/banking/
  booking/calendar/chat/mail/kanban/tour/post/job/product/order ฯลฯ ใต้ `apps/*/src/app/minimals/*`
  คือ scaffolding ที่สืบทอดมาจาก admin template ไม่ใช่ขอบเขตของ POL admin

## Current State (ground truth)

- Repo เป็น npm workspaces: `apps/admin`, `apps/merchant`, `packages/ui`, `packages/shared`.
- Admin และ Merchant มี app-local `src`, `public`, config, auth/API และ `.next`; ไม่มี app-to-app imports.
- Route equation ปัจจุบันคือ `Merchant routes = Admin routes ∪ {/register}`. ทั้งสอง app มี Admin routes จริง.
- `@pol/ui` เก็บเฉพาะ shared presentation ที่ใช้ร่วมจริง; `@pol/shared` เก็บ pure types/validation/utilities.
- ทั้งสอง app คง rewrites `/admin/*`, `/producer/*`, `/api/*`; Merchant registration ใช้
  `POST /producer/users/register`.
- Development ใช้ HTTPS Admin 3001/Merchant 3002; production local ใช้ HTTP ports เดิม.
- Root Docker image build/serve Admin เท่านั้น. Merchant deployment image ยังนอก scope.
- Domain UI จำนวนมากยังใช้ typed mock; Admin/Merchant auth เป็น server-side OIDC BFF pattern.
- Stack และ idiom ดู [stack/nextjs.md](stack/nextjs.md).
