# Control Plane — design

## Architecture
Frontend-only, mock data, mirroring every existing feature. Routes under `/control/*`
behind `src/app/control/layout.tsx` (wraps `MinimalsLayout`). Each screen:
`page.tsx` (PageHeader + view) → `*-view.tsx` (state, useDataTable, ControlListToolbar,
DataTable) → `*-columns.tsx` (ColumnDef or a factory closing over action handlers) →
`*-detail-sheet.tsx` (read-only Sheet). Pure logic in `src/lib/control/*.ts`, mock in
`src/lib/mock/*.ts`, types in `src/types/*.ts`.

## Signature design language
- `--font-mono` (IBM Plex Mono) + `@utility text-data` — all machine identifiers.
- `@utility status-spine` + `<StatusSpine tone>` — leading health bar on rows (decorative;
  state also in a badge).
- Shared kit (`src/components/control/shared/`): `ControlListToolbar`, `ControlStatusBadge`,
  `StatusSpine`, `ReadField`. Tone system in `src/lib/control/status.ts` (ok/warn/error/info/muted
  → Minimals success/warning/error/info/grey families). `formatDateTime` in `lib/control/format.ts`.

## Module map
| Screen | Route | Type | Pure logic (tested) |
|---|---|---|---|
| PSP Connections | /control/psp/list | psp-connection | psp.ts: maskSecret, healthTone ✓ |
| Routing Rules | /control/routing | routing-rule | routing.ts: evaluateRouting ✓ |
| API Clients | /control/api-clients | api-client | api-client.ts: statusTone (reuses maskSecret) |
| Webhooks & Events | /control/webhooks | webhook-event | webhook.ts: deliveryTone |
| Approvals | /control/approvals | approval | approval.ts: canApprove ✓ |
| Audit Log | /control/audit | audit | audit.ts: resultTone |
| Notifications | /control/notifications | notification | notification.ts: logTone |
| Reconciliation | /control/reconciliation | settlement | settlement.ts: matchSettlement ✓ |
| Reports | /control/reports | (aggregates Transaction) | reports.ts: pspSplit/channelSplit/topOriginators |
| Tenants | /control/tenants | tenant (shared) | tenant.ts: tenantStatusTone |
| Originators | /control/originators | originator | originator.ts: statusTone |

## Key decisions
- Row actions use a columns factory (closure over handlers) instead of TableMeta augmentation,
  so the shared `src/types/table-meta.ts` is never edited by feature screens.
- Read-only detail uses the local `ReadField` helper (plain bold value style, mono for IDs),
  not the form components — avoids "use client" contamination / cross-module coupling (LESSONS.md).
- Credentials: mock stores fake secrets; `maskSecret` is the only sanctioned render path.
- Idempotent actions (replay, run reconciliation, approve) disable while in-flight via local state.
- Multi-tenant: every mock row is tenant-tagged; screens expose a tenant filter.

## Out of scope
Real backend, real auth/tenant context provider wiring (topbar workspace-switcher integration
noted as follow-up), live charts beyond mock aggregation.
