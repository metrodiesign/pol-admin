# Control Plane — tasks

AFK /spec-quick build, 2026-06-24. Foundation + 11 screens. Reuses minimals theme.

Central verification (T12) covers all screens: `npm run build` green (all 11 `/control/*`
routes prerendered to static HTML), `npx vitest run` 109/109 PASS, ESLint clean, browser
spot-check with no console errors.

- [x] T0 Foundation — signature CSS (`--font-mono`, `text-data`, `status-spine`), IBM Plex Mono
  in layout.tsx, nav groups (A–D) in BOTH nav-config.ts and minimals-nav-config.ts (sidebar uses
  the latter), shared control kit, tenant type + mock, `src/app/control/layout.tsx`.
  Evidence: n/a (logic/config-only) — build green; sidebar renders the 4 Control plane groups.
- [x] T1 PSP Connections — canonical screen; maskSecret + healthTone tested.
  Evidence: psp.test.ts PASS (5); build prerendered; viewports 1440 verified (768 fluid, 375 sidebar→drawer).
- [x] T2 Routing Rules — evaluateRouting + test.
  Evidence: routing.test.ts PASS; build prerendered; viewports 1440 verified.
- [x] T3 API Clients — revoke confirm; reuses maskSecret.
  Evidence: build prerendered; tsc/lint clean; viewports 1440 verified.
- [x] T4 Webhooks & Events — replay (idempotent, disabled for delivered), payload view, source-of-truth note.
  Evidence: build prerendered; browser-verified replay disabled-state + no console errors; viewports 1440.
- [x] T5 Approvals — canApprove + test; self-approval blocked w/ tooltip; confirm dialog.
  Evidence: approval.test.ts PASS; build prerendered; browser-verified money-as-reference column; viewports 1440.
- [x] T6 Audit Log — immutable, before/after diff.
  Evidence: build prerendered; tsc/lint clean; viewports 1440 (fluid).
- [x] T7 Notifications — rules (toggle) + delivery log tabs.
  Evidence: build prerendered; tsc/lint clean; viewports 1440 (fluid).
- [x] T8 Reconciliation — matchSettlement + test; run (idempotent); settle note.
  Evidence: settlement.test.ts PASS (8); build prerendered; viewports 1440 (fluid).
- [x] T9 Reports — charts (PSP donut, channel bar, volume sparklines, top originators).
  Evidence: build prerendered; browser-verified charts render, no console errors; viewports 1440.
  Known nit: shared StackedBarChart Y-axis tick labels clip for large baht values (legend shows exact values) — see follow-up.
- [x] T10 Tenants — Super-only note, read-only.
  Evidence: build prerendered; browser-verified at viewports 1440 AND 375 (mobile drawer, table scroll-in-card).
- [x] T11 Originators — payment sources.
  Evidence: build prerendered; tsc/lint clean; viewports 1440 (fluid).
- [x] T12 Integrate + verify — build + 109 tests + lint green; no regression; nav wired in sidebar.
  Evidence: see central verification block above; data-plane screens (transaction/policy/etc.) unchanged.

- [x] T13 Full detail PAGES for every list record (`/control/<x>/read?id=`) — replaced detail
  sheets with full pages (richer: 2-col summary + grouped DetailCards), row click navigates,
  orphan sheets deleted. Covers psp, routing, api-clients, webhooks, approvals, audit,
  reconciliation, tenants, originators, notifications(log). Actions preserved on the page
  (api-client revoke, approval approve/reject w/ maker-checker self-block).
  Evidence: build green — 10 `/control/*/read` routes compiled; 109 tests PASS; lint clean;
  browser-verified Reconciliation detail (line-items sum) + Approvals detail (self-approval
  disabled w/ reason) at viewport 1440. Reports has no per-record list → no read page (n/a).

- [x] T14 Realistic behavior — actions now mutate a shared reactive store (module singleton,
  `useSyncExternalStore`) so changes persist across client navigation and reflect in
  list + detail + stat cards. Added async in-flight spinners + a global toaster (mounted in
  control layout). Wired: approvals (approve/reject + maker-checker), api-clients (revoke),
  webhooks (replay → delivered, attempts+1), reconciliation (run → resolve unreconciled),
  routing (toggle/reorder), notifications (rule toggle), PSP (rotate → creates a real pending
  Approvals request). Read-only screens (audit/tenants/originators/reports) unchanged.
  Evidence: build green; 109 tests PASS; lint clean; browser at 1440 — webhook replay flipped
  ส่งล้มเหลว→ส่งสำเร็จ + attempts 4→5 + button disabled; approval confirm→approve dropped
  pending 5→4, raised approved 2→3, row status flipped, all from the shared store; maker-checker
  self-block preserved.

- [x] T15 Human-readable copy + responsive verification (Desktop/Tablet/Mobile).
  Added an optional `description` slot to PageHeader/CustomBreadcrumbs and a plain-Thai purpose
  line to all 11 control list pages (e.g. PSP: "การเชื่อมต่อกับผู้ให้บริการรับชำระเงิน (PSP)…").
  Fixed the Reports bar-chart Y-axis clipping via an additive optional `valueFormatter` prop on
  the shared StackedBarChart (default behavior preserved → dashboard unaffected); reports now
  shows ฿800K/฿600K/… cleanly.
  Evidence: build green; 109 tests PASS; lint clean. Browser-verified at THREE viewports —
  Desktop 1440, Tablet 768 (sidebar→drawer, stat cards 2-col, toolbar stacked, table scroll-in-card),
  Mobile 375 (stat cards 1-col, description wraps, charts/filters stack); description renders and
  Reports axis no longer clipped.

## Follow-ups (non-blocking)
- Wire tenant context into the topbar workspace-switcher (currently per-screen tenant filter).
- Detail pages (EditPageHeader) could also carry a description line — list pages cover the main need.
