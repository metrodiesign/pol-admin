# Implementation Tasks: Policy Marketplace (รับชำระเบี้ย)

> Status: approved 2026-06-17

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. Domain foundation (types + pure logic + format + mock) — สร้าง `src/types/policy.ts`
     (`Policy`, `PolicyStatus`, `PremiumFrequency`), `src/lib/policy/policy.ts`
     (`CART_ELIGIBLE_STATUSES`, `isCartEligible`, `sumPremium`, `matchesPolicyFilter`,
     `countByStatus`, `buildTypeOptions`, `buildSourceOptions`), เติม `formatTHB` ใน
     `src/lib/utils.ts`, เพิ่ม `cart?: PolicyCartMeta` ใน `src/types/table-meta.ts`, และ
     `src/lib/mock/policies.ts` (`POLICIES: Policy[]` ~48 records กระจาย status: active 34 /
     due_soon 6 / awaiting 4 / lapsed 2 / cancelled 2, seed จาก screenshot). Done = pure logic
     ครบ ไม่มี React, `tsc` ผ่าน.
     Satisfies: REQ-1.2, REQ-2.2, REQ-3.4, REQ-4.1, REQ-4.6, REQ-4.7, REQ-5.4. Verify: `npx tsc --noEmit`.
     Evidence:
       - test: `npx tsc --noEmit` -> No errors found
       - data: POLICIES total 48, countByStatus = active 34 / due_soon 6 / awaiting 4 / lapsed 2 / cancelled 2, unique ids 48 (ตรง REQ-2.2)
       - viewports: n/a — logic-only
       - deviations: none

- [x] 2. Policy list table — `policy-status-badge.tsx` (badge dot+label 5 สถานะ + export label/สี map),
     `policy-table-columns.tsx` (ColumnDef: `policyNo`+effectiveDate, ลูกค้า+phone, ประเภท/แผน,
     ที่มา code chip+channel, `sumInsured`, `premium`+frequency, `nextDue` accessorFn=date, status badge,
     action cell — sortable ids `policyNo/sumInsured/premium/nextDue`), render ผ่าน `DataTable` ใน
     view เบื้องต้น (default sort `policyNo` asc, pageSize 10, options [10,25,50], empty state).
     Done = ตารางแสดงครบทุกคอลัมน์ + sort/pagination + empty state.
     Satisfies: REQ-1. Depends on: 1. Verify: `npm run build`; เปิด `/policy/list` เห็นตาราง.
     Evidence:
       - test: `npx tsc --noEmit` -> No errors found (columns + badge + view + row-actions + formatThaiShortDate)
       - viewports: n/a — route ยังไม่มี (สร้าง task 6); visual verify เลื่อนไป assembly task 6
       - deviations: action cell (`policy-row-actions.tsx`) สร้างเต็มตั้งแต่ task 2 (ปุ่ม cart/ซื้อเลย) แต่ cart meta wire ใน task 4 — task 2 fallback chevron
       - amended 2026-06-17: rebuild ตารางเป็น motor-insurance schema (REQ-1.1/1.3/1.4 + REQ-1.7 ใหม่) — คอลัมน์ใหม่ ประเภทประกันภัย VMI/CMI, ประเภทเลขอ้างอิง, หมายเลขอ้างอิง(link), ชื่อผู้เอาประกัน, ข้อมูลเพิ่มเติม(+tooltip), เบี้ยสุทธิ, เบี้ยรวม, สถานะตัดชำระเบี้ย, VCP badge; ลบคอลัมน์ ช่วงคุ้มครอง; action = icon ซื้อเลย+ตะกร้า disable เมื่อ vcp=paid; เพิ่ม `formatThaiSlashDate`. browser-verified prod :5311 (10 header, disable ตรง paid, no overflow 375/768/1440). spec-trace 50 ข้อ exit 0

- [x] 3. Tabs + toolbar + filter — `policy-status-tabs.tsx` (count badge ต่อสถานะ, reuse สี map จาก badge),
     `policy-list-toolbar.tsx` (SearchField + SelectField ประเภท/ที่มา + stubs CSV/ตัวกรองเพิ่มเติม/date
     แบบ disabled+aria-disabled), wire globalFilter `{search,type,source,status}` ผ่าน
     `matchesPolicyFilter`, ทุก handler `setPageIndex(0)`, `autoResetPageIndex:false`. Done = tabs/ค้นหา/
     filter AND ทำงาน, count ตรงชุดเต็ม.
     Satisfies: REQ-2, REQ-3. Depends on: 1, 2. Verify: `npm run build`; กรอง tab+search+filter เห็นผลถูก.
     Evidence:
       - test: `npx tsc --noEmit` -> No errors found (tabs + toolbar + globalFilter wire)
       - logic: globalFilter `{search,type,source,status}` -> matchesPolicyFilter (AND); ทุก handler setPageIndex(0); counts=countByStatus(POLICIES เต็ม); stubs disabled+aria-disabled
       - viewports: n/a — visual verify เลื่อนไป assembly task 6
       - deviations: toolbar เป็น compact markup เอง (native select + token เดิม + sr-only/aria-label) แทน SelectField/TextField (label-above) เพื่อ fidelity กับ screenshot — ยัง reuse design token, ไม่เพิ่ม primitive
       - scope change (2026-06-17, user): ลบ status tabs (REQ-2 ทั้งหมด out of scope) + ปุ่ม "ส่งออก CSV"; ลบไฟล์ `policy-status-tabs.tsx`, ถอด counts/status ออกจาก hook+view; toolbar token ปรับให้ตรง `/user/role/list` (h-12, text-[15px]). search + filter ประเภท/ที่มา + stub (date, ตัวกรองเพิ่มเติม) ยังอยู่

- [x] 4. Cart state + add-to-cart UI — `src/hooks/use-policy-table-with-cart.ts` (รวม table +
     cart reducer add/remove/clear, guard eligibility + dedupe, derived count/total/has, counts),
     action cell แสดงปุ่ม "เพิ่มลงตะกร้า"/"อยู่ในตะกร้า" เฉพาะ row eligible (อ่าน `meta.cart`, aria-label
     ผูก id), `premium-cart-panel.tsx` (header+count, empty state+info, list, เบี้ยรวม, ปุ่มดำเนินการ
     disabled เมื่อว่าง) + `premium-cart-item.tsx`. Done = เพิ่ม/ลบ/toggle อัปเดต panel ทันที, ใบไม่
     eligible ไม่มีปุ่ม.
     Satisfies: REQ-4, REQ-5. Depends on: 1, 2. Verify: `npm run build`; เพิ่ม/ลบเห็น total/count อัปเดต.
     Evidence:
       - test: `npx tsc --noEmit` -> No errors found (hook + panel + item + meta.cart wire)
       - logic: cartReducer guard isCartEligible + dedupe by id (REQ-4.1/4.6/4.7); cart.total=sumPremium; meta.cart={has,toggle,buyNow}; panel empty state + info box + filled list + เบี้ยรวม + ปุ่ม disabled เมื่อว่าง (REQ-5.2–5.6, 6.2)
       - viewports: n/a — visual verify เลื่อนไป assembly task 6
       - deviations: cart in-memory (useReducer, ไม่ persist) ตาม REQ-5.6; buyNow callback ส่งจาก view (task 5 dialog)
       - scope change (2026-06-17, user: "ครบทุกรายการ"): ลบ eligibility gate ทั้งหมด — ปุ่ม "เพิ่มลงตะกร้า"/"ซื้อเลย" แสดงทุกแถว, cartReducer เพิ่มได้ทุกสถานะ (กันซ้ำอย่างเดียว). REQ-4.1/4.2 amended, REQ-4.3/4.6 removed, REQ-5.2/7.1 amended. ถอด isCartEligible ออกจาก row-actions+hook (ยัง export ใน lib). verify: tsc/lint/build เขียว; browser :5311 ทุก 10 แถว (รวม ยกเลิก/มีผลบังคับ) มีปุ่มครบ, เพิ่ม cancelled เข้าตะกร้าได้ count=1

- [x] 5. Checkout + buy-now + toast — `premium-checkout-dialog.tsx` (parameterized `policies: Policy[]`,
     props `onConfirm/onSuccess/onClose`; cart mode `onConfirm=cart.clear`, single mode no-op),
     ปุ่ม "ซื้อเลย" ใน action cell เรียก `cart.buyNow`, `use-policy-toast.ts` + `policy-toaster.tsx`
     (mirror role), view ถือ toast + ส่ง `onSuccess`. Done = ดำเนินการ/ซื้อเลย -> modal สรุปถูก ->
     ยืนยัน -> toast + (cart mode) เคลียร์ตะกร้า; ซื้อเลยไม่แตะ cart.
     Satisfies: REQ-6, REQ-7. Depends on: 4. Verify: `npm run build`; checkout เห็น toast + ตะกร้าเคลียร์.
     Evidence:
       - test: `npx tsc --noEmit` -> No errors found (dialog + toast + view wiring)
       - logic: dialog parameterized `policies[]` (cart=N ใบ, ซื้อเลย=1 ใบ); onConfirm = clearCart ? cart.clear : no-op (REQ-7.4); onSuccess -> show toast (REQ-6.4/7.3); ยกเลิก = DialogClose ไม่แตะ cart (REQ-6.5)
       - viewports: n/a — visual verify เลื่อนไป assembly task 6
       - deviations: none

- [x] 6. Route + nav + responsive + a11y — `src/app/policy/layout.tsx` (MinimalsLayout) +
     `src/app/policy/list/page.tsx` (PageHeader+breadcrumbs+`PolicyMarketplaceView`), nav item ใน
     `nav-config.ts` (`{title:"กรมธรรม์",path:"/policy/list",match:"/policy",icon:"invoice"}`, subheader
     "กรมธรรม์"), layout `grid grid-cols-1 mlg:grid-cols-[1fr_360px]` + `min-w-0` + cart sticky desktop,
     `premium-cart-sheet.tsx` (FAB+count badge + `ui/sheet` ครอบ panel) สำหรับ `<mlg`, ตรวจ aria-label/
     focus/keyboard ทุก control. Done = เข้าหน้าได้จากเมนู active ถูก, responsive ไม่ overflow, a11y ผ่าน.
     Satisfies: REQ-8, REQ-9. Depends on: 2, 3, 4, 5. Verify: `npm run build`; เมนู active บน `/policy/*`,
     ย่อจอ <mlg cart เป็น sheet, ไม่มี horizontal scroll หน้า.
     Evidence:
       - test: `npm run build` -> Compiled successfully (/policy/list prerendered); `npm run lint` -> No issues; `npx tsc --noEmit` -> No errors; `scripts/spec-trace.sh` -> 46 เกณฑ์ครบ
       - browser (Playwright vs production build :5311):
         - interaction: tab "รอชำระเบี้ย" -> 4 rows ทุกใบ awaiting + 4 add/4 buy (eligibility gating REQ-4.2/4.3); add 2 -> cart 2 ใบ total ฿69,150.00 (=Σ premium, REQ-5.4); ดำเนินการ -> dialog 2 ใบ -> ยืนยัน -> cart เคลียร์ 0 + rows reset (REQ-6); ซื้อเลย -> dialog 1 ใบ -> ยืนยัน -> toast "รับชำระเบี้ยสำเร็จ 1 กรมธรรม์" + cart ยังว่าง (REQ-7.4)
         - nav: sidebar group "กรมธรรม์" active บน /policy/list (bg primary/8, color primary, weight 600 vs inactive grey) (REQ-8.2)
         - a11y: focus-visible ring จริงผ่าน Tab (outline 2px + :focus-visible=true); aria-label ครบทุกปุ่ม (probe หาเจอด้วย aria-label); status badge dot+ข้อความ (REQ-9.1/9.2/9.3)
       - viewports: clientWidth 1440 OK (grid 1fr+360px, no overflow) | 768 OK (1-col 720px, desktop panel display:none, FAB block, no overflow) | 375 OK (1-col 328px, no overflow culprit, FAB flex) — REQ-8.3/8.4/8.5
       - deviations: nav ต้องแก้ **2 ไฟล์** — `nav-config.ts` (breadcrumb/search) + `minimals-nav-config.ts` (sidebar จริงที่ MinimalsLayout ใช้ render); plan ระบุแค่ nav-config.ts. รวมเป็น 4 ไฟล์เดิม additive (utils, table-meta, nav-config, minimals-nav-config). Gotcha: ต้อง rebuild + restart prod server ก่อน browser verify (server เก่า serve build เดิม)

- [x] 7. [optional] Unit/property tests for pure logic — เพิ่ม test runner (vitest, devDependency —
     ต้องอนุมัติ dependency แยกตาม CODING_STANDARDS) + co-located `src/lib/policy/policy.test.ts`
     (`isCartEligible`, `sumPremium`, `matchesPolicyFilter` AND, `countByStatus`) + reducer ของ cart.
     Done = test เขียว, รองรับ `/spec-pbt` ต่อ.
     Satisfies: (testing strategy — design.md) Depends on: 1, 4. Verify: `npx vitest run`.
     Evidence:
       - dep: อนุมัติ `vitest@^4.1.9` (MIT) เป็น devDependency (user approve 2026-06-18)
       - extract: ย้าย `cartReducer` -> `src/lib/policy/cart.ts` (pure, ไม่ดึง React) เพื่อ test ตรง; hook import จาก module ใหม่ (behavior เดิม)
       - test: `npx vitest run` -> 2 files / 22 tests passed (policy.test.ts 15 + cart.test.ts 7)
       - gates: `npx tsc --noEmit` 0 errors | `npm run lint` clean | `npm run build` Compiled successfully
       - config: `vitest.config.ts` (alias @ -> ./src, env node, include `src/**/*.test.ts`); script `npm test` = `vitest run`
       - viewports: n/a — logic-only (unit tests, ไม่มี UI)
       - deviations: none

## Suggested execution batches

> Feature นี้ COUPLED (ทุก task ใช้ types/lib/hook/components ร่วมกัน) → DEFAULT รันทั้งหมดใน
> session เดียว: `/spec-implement all` (หรือ `scripts/pane-loop.sh policy-marketplace all-in-one`).
> แยก session เฉพาะเพื่อ accuracy: task 7 (optional, อิสระ + เป็น dependency decision) แยกได้.
> ลำดับ: 1 -> 2 -> (3, 4 ขนานเชิงตรรกะ แต่แชร์ columns/view) -> 5 -> 6. ไม่มี Batch tag (แต่ละ task
> distinct domain, ต้องการ session โฟกัส).
