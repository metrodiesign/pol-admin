# แผนปรับ Control Plane Badge Parity

> **สำหรับ agentic workers:** ต้องใช้ `superpowers:subagent-driven-development` หรือ `superpowers:executing-plans` เพื่อทำแผนนี้ทีละ task พร้อม checkpoint

**Goal:** ทำให้ status badge และ domain chips ทุกหน้า Control plane ใช้ pill geometry แบบ Merchant user/role โดยคง semantic tone, icon และ compact tab count

**Architecture:** เพิ่ม visual token `controlBadgeClass` ใน shared styles แล้วใช้กับ `ControlStatusBadge`, UI `Badge` consumers และ raw semantic markers ใต้ Control plane เท่านั้น ไม่แก้ global Badge primitive และไม่ import Merchant component

**Tech Stack:** Next.js 16.3.1, React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest 4.1.9

**Spec:** `.claude/specs/control-plane-ui-parity/{requirements,design,tasks}.md` — REQ-5.1–5.5, Task 7

## Global Constraints

- Geometry กลางคือ `inline-flex h-auto items-center gap-1 rounded-full px-4 py-1 text-sm font-semibold`
- คง `TONE_STYLE`, label, variant, uppercase และ semantic color เดิม
- ลบเฉพาะ default status dot; คง icon ของ PSP, signature, maker-checker, OAuth2, read-only และ legal marker
- คง notification tab count แบบ compact
- ไม่แก้ `src/components/ui/badge.tsx`
- ไม่ import `src/components/merchant/**` เข้า `src/components/control/**`
- ไม่เพิ่ม dependency และไม่เปลี่ยน mock/store/action behavior
- ห้าม commit หรือ push เว้นผู้ใช้สั่ง

---

## File Map

| หน้าที่ | ไฟล์ |
|---|---|
| Shared geometry | `src/components/control/shared/styles.ts` |
| Lifecycle status | `src/components/control/shared/status-badge.tsx`, `src/lib/control/status.ts` |
| Badge consumers | API client, notification, originator, tenant และ webhook columns/detail views |
| Raw semantic markers | API client, approval, audit, tenant และ webhook detail views |
| Regression coverage | `src/components/control/control-parity.test.ts` |
| Spec evidence | `.claude/specs/control-plane-ui-parity/tasks.md` |

## Task 1: Shared Badge Geometry และ Lifecycle Status

**Files:**

- Modify: `src/components/control/shared/styles.ts`
- Modify: `src/components/control/shared/status-badge.tsx`
- Modify: `src/lib/control/status.ts`
- Test: `src/components/control/control-parity.test.ts`

**Interfaces:**

- **Produces:** `controlBadgeClass: string`
- **Preserves:** `ControlStatusBadge({ tone, label, className?, icon? })`

- [ ] **Step 1: เพิ่ม failing test สำหรับ shared status geometry**

เพิ่ม import และ test ต่อไปนี้:

```tsx
import { ControlStatusBadge } from "@/components/control/shared/status-badge";

const MERCHANT_PILL_CLASSES = [
  "rounded-full",
  "px-4",
  "py-1",
  "text-sm",
  "font-semibold",
];

test("control status badge uses merchant pill geometry without a default dot", () => {
  const markup = renderToStaticMarkup(
    createElement(ControlStatusBadge, { tone: "ok", label: "ใช้งาน" }),
  );

  for (const className of MERCHANT_PILL_CLASSES) {
    assert.match(markup, new RegExp(className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(markup, /size-1\.5 rounded-full/);
});

test("control status badge preserves an explicit semantic icon", () => {
  const markup = renderToStaticMarkup(
    createElement(ControlStatusBadge, {
      tone: "warn",
      label: "รออนุมัติ",
      icon: createElement("svg", { "data-status-icon": true }),
    }),
  );

  assert.match(markup, /data-status-icon="true"/);
});
```

- [ ] **Step 2: รัน test เพื่อยืนยัน RED**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: geometry test fail เพราะยังมี `rounded-md`, `px-1.5`, `text-xs` และ default dot

- [ ] **Step 3: เพิ่ม shared token**

เพิ่มใน `shared/styles.ts`:

```ts
export const controlBadgeClass =
  "inline-flex h-auto items-center gap-1 rounded-full px-4 py-1 text-sm font-semibold";
```

- [ ] **Step 4: ใช้ token ใน `ControlStatusBadge`**

เปลี่ยน implementation เป็น:

```tsx
import { TONE_STYLE, type Tone } from "@/lib/control/status";
import { controlBadgeClass } from "@/components/control/shared/styles";

<span className={cn(controlBadgeClass, TONE_STYLE[tone], className)}>
  {icon}
  {label}
</span>
```

ลบ fallback dot และลบ `TONE_SOLID` จาก `src/lib/control/status.ts` เพราะไม่มีผู้ใช้เหลือ

- [ ] **Step 5: รัน focused test เพื่อยืนยัน GREEN**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: shared status tests และ parity tests เดิมผ่านทั้งหมด

## Task 2: UI Badge Consumers

**Files:**

- Modify: `src/components/control/api-client/columns.tsx`
- Modify: `src/components/control/api-client/detail-view.tsx`
- Modify: `src/components/control/notification/rule-columns.tsx`
- Modify: `src/components/control/notification/log-columns.tsx`
- Modify: `src/components/control/originator/columns.tsx`
- Modify: `src/components/control/originator/detail-view.tsx`
- Modify: `src/components/control/tenant/columns.tsx`
- Modify: `src/components/control/tenant/detail-view.tsx`
- Modify: `src/components/control/webhook/columns.tsx`
- Test: `src/components/control/control-parity.test.ts`

**Interfaces:**

- **Consumes:** `controlBadgeClass`
- **Preserves:** `Badge` variant, title, uppercase, icon และ displayed text เดิม

- [ ] **Step 1: เพิ่ม failing SSR test สำหรับ domain chips**

เพิ่ม list ต่อไปนี้ใน `control-parity.test.ts`:

```tsx
const DOMAIN_CHIP_VIEWS: [string, ComponentType, string][] = [
  ["api-client scopes", ApiClientsView, "payments:create"],
  ["notification channels", NotificationsView, "อีเมล"],
  ["originator types", OriginatorsView, "สาขา"],
  ["tenant SAQ", TenantsView, "SAQ A — redirect-only"],
  ["webhook signature", WebhooksView, "ยืนยันแล้ว"],
];

function assertPillText(markup: string, text: string) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const classLookaheads = MERCHANT_PILL_CLASSES.map((className) => {
    const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `(?=[^>]*\\b${escapedClass}\\b)`;
  }).join("");

  assert.match(
    markup,
    new RegExp(
      `<span${classLookaheads}[^>]*>(?:(?!<\\/span>)[\\s\\S])*?${escapedText}(?:(?!<\\/span>)[\\s\\S])*?<\\/span>`,
    ),
  );
}

test.each(DOMAIN_CHIP_VIEWS)("%s uses merchant pill geometry", (_name, View, text) => {
  assertPillText(render(View), text);
});
```

- [ ] **Step 2: รัน test เพื่อยืนยัน RED**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: domain chip cases fail เพราะ UI Badge ยัง render compact geometry

- [ ] **Step 3: เพิ่ม `controlBadgeClass` ให้ทุก UI Badge consumer**

ใช้รูปแบบต่อไปนี้:

```tsx
<Badge variant="outline" className={controlBadgeClass}>...</Badge>
<Badge variant="secondary" className={controlBadgeClass}>...</Badge>
<Badge className={`${controlBadgeClass} uppercase`} variant="secondary">...</Badge>
<Badge className={`${controlBadgeClass} border-success/40 text-success-dark`} variant="outline">...</Badge>
```

ใช้ exact mapping:

| ไฟล์ | Chips |
|---|---|
| `api-client/columns.tsx` | scope และ `+N` |
| `api-client/detail-view.tsx` | scope |
| `notification/rule-columns.tsx` | channel |
| `notification/log-columns.tsx` | channel |
| `originator/columns.tsx` | type |
| `originator/detail-view.tsx` | type |
| `tenant/columns.tsx` | SAQ และ uppercase PSP |
| `tenant/detail-view.tsx` | uppercase PSP |
| `webhook/columns.tsx` | verified และ warning signature |

ลบ `text-xs` จาก tenant chips เพื่อให้ `text-sm` จาก token มีผล

- [ ] **Step 4: รัน focused test เพื่อยืนยัน GREEN**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: domain chip tests ผ่านและ status tests ยังผ่าน

## Task 3: Raw Semantic Markers

**Files:**

- Modify: `src/components/control/api-client/detail-view.tsx`
- Modify: `src/components/control/approval/detail-view.tsx`
- Modify: `src/components/control/audit/detail-view.tsx`
- Modify: `src/components/control/tenant/detail-view.tsx`
- Modify: `src/components/control/webhook/detail-view.tsx`
- Test: `src/components/control/control-parity.test.ts`

**Interfaces:**

- **Consumes:** `controlBadgeClass`
- **Preserves:** icon, semantic background/text tone และ copy เดิม

- [ ] **Step 1: เพิ่ม detail-view regression cases**

เพิ่ม test ต่อไปนี้:

```tsx
const SEMANTIC_MARKER_DETAILS: [
  string,
  ComponentType<{ id?: string }>,
  string,
  string,
][] = [
  ["oauth", ApiClientDetailView, apiClientsStore.get()[0]!.id, "OAuth2 · client-credentials"],
  ["maker-checker", ApprovalDetailView, approvalsStore.get()[0]!.id, "Maker-checker"],
  ["read-only", AuditDetailView, AUDIT_LOG[0]!.id, "อ่านอย่างเดียว · เพิ่มต่อท้ายเท่านั้น"],
  ["legal entity", TenantDetailView, MERCHANTS[0]!.code, "นิติบุคคลแยกต่างหาก"],
  ["signature", WebhookDetailView, webhookStore.get()[0]!.id, "Signature ยืนยันแล้ว"],
];

test.each(SEMANTIC_MARKER_DETAILS)(
  "%s marker uses merchant pill geometry",
  (_name, View, id, text) => assertPillText(render(View, { id }), text),
);
```

- [ ] **Step 2: รัน test เพื่อยืนยัน RED**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: semantic marker cases fail เพราะ raw spans ยังใช้ `rounded-md px-1.5 text-xs`

- [ ] **Step 3: เปลี่ยน raw marker classes**

ใช้รูปแบบเดียวกันทุกไฟล์:

```tsx
<span className={`${controlBadgeClass} bg-success/12 text-success-dark`}>
  <ShieldCheck className="size-3.5" />
  Marker text
</span>
```

Exact tone mapping:

| Marker | Tone classes |
|---|---|
| OAuth2 | `bg-success/12 text-success-dark` |
| Maker-checker | `bg-success/12 text-success-dark` |
| Audit read-only | `bg-grey-100 text-grey-700 dark:bg-grey-900` |
| Tenant legal entity | `bg-grey-500/12 text-grey-700` |
| Signature verified | `bg-success/12 text-success-dark` |
| Signature failed | `bg-warning/12 text-warning-dark` |

- [ ] **Step 4: ยืนยัน compact tab count ไม่เปลี่ยน**

คง `notification/tabs.tsx` เดิม และเพิ่ม assertion:

```tsx
const markup = render(NotificationsView);
assert.match(markup, /h-5 min-w-5/);
assert.match(markup, /rounded px-1 text-xs font-bold/);
```

- [ ] **Step 5: รัน focused test เพื่อยืนยัน GREEN**

```bash
npx vitest run src/components/control/control-parity.test.ts
```

Expected: shared status, domain chip, semantic marker และ compact count tests ผ่านทั้งหมด

## Task 4: Browser และ Quality Gates

**Files:**

- Verify: `src/components/control/**`
- Verify: `src/app/control/**`
- Update evidence: `.claude/specs/control-plane-ui-parity/tasks.md`

**Interfaces:**

- **Consumes:** implementation จาก Tasks 1–3
- **Produces:** browser matrix และ gate evidence สำหรับ Task 7

- [ ] **Step 1: ตรวจ browser ทุก Control route**

ตรวจ list 11 หน้าและ detail 9 หน้า ที่ viewport 375, 768 และ 1440

Expected:

- Badge/chip เป็น rounded pill และไม่ถูกตัดบรรทัด
- Tone/icon/text ยังสื่อความหมายเดิม
- Status ที่ไม่มี icon ไม่มี dot
- PSP status icons ยังอยู่ครบ
- Notification tab counts ยัง compact
- ไม่มี body horizontal overflow หรือ console error

- [ ] **Step 2: รัน focused static gates**

```bash
npx vitest run src/components/control/control-parity.test.ts
npx eslint src/components/control src/app/control
npm run typecheck
```

Expected: exit code 0 ทุกคำสั่ง

- [ ] **Step 3: รัน full test และ spec trace**

หยุด local dev server ก่อน `npm test` แล้วเปิดกลับหลัง test

```bash
npm test
scripts/spec-trace.sh control-plane-ui-parity
```

Expected: test suites ผ่านทั้งหมดและ spec trace `29/29`

- [ ] **Step 4: ตรวจ scope boundary**

```bash
rg -n 'components/merchant' src/components/control
rg -n 'controlBadgeClass' src/components/control
```

Expected: คำสั่งแรกไม่มีผลลัพธ์ คำสั่งที่สองพบเฉพาะ shared token และ Control consumers ในแผนนี้

- [ ] **Step 5: บันทึก Evidence และปิด Task 7**

เปลี่ยน Task 7 เป็น `[x]` และเพิ่ม Evidence ที่ระบุ:

- รายการไฟล์ที่แก้
- focused/full test counts
- typecheck และ eslint result
- spec trace result
- browser route count, viewport และ console/overflow result

## Self-review

- **REQ-5.1:** Task 1 เปลี่ยน lifecycle status เป็น merchant pill geometry
- **REQ-5.2:** Task 1 ลบ default dot และ tests explicit icon
- **REQ-5.3:** Tasks 2–3 ครบ scope, channel, type, SAQ, PSP และ raw markers
- **REQ-5.4:** Task 3 ล็อก compact tab count
- **REQ-5.5:** Task 4 ครบ architecture boundary, tests และ browser matrix
- **Scope:** ไม่แก้ global Badge, Merchant, mock, store หรือ action handlers
