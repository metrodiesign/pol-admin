import type { AuditEntry, AuditResult } from "@/types/control/audit";
import type { Tone } from "@/lib/control/status";

export const RESULT_LABEL: Record<AuditResult, string> = {
  success: "สำเร็จ",
  denied: "ถูกปฏิเสธ",
};

export function resultTone(result: AuditResult): Tone {
  switch (result) {
    case "success":
      return "ok";
    case "denied":
      return "error";
  }
}

/**
 * Human-readable Thai label for a dotted action key. Falls back to the raw key
 * when an action has no mapping yet — the trail must still render unknown actions.
 */
export const ACTION_LABEL: Record<string, string> = {
  "psp.credential.rotate": "หมุนเวียนคีย์ PSP",
  "psp.connection.disable": "ปิดใช้งานการเชื่อมต่อ PSP",
  "routing.rule.update": "แก้ไขกฎจัดเส้นทาง",
  "webhook.endpoint.update": "แก้ไขปลายทาง webhook",
  "approval.request.approve": "อนุมัติคำขอ",
  "approval.request.reject": "ปฏิเสธคำขอ",
  "admin.role.change": "เปลี่ยนสิทธิ์ผู้ดูแล",
  "admin.session.revoke": "เพิกถอนเซสชันผู้ดูแล",
  "tenant.settings.update": "แก้ไขการตั้งค่าบริษัท",
  "settlement.report.export": "ส่งออกรายงานการชำระเงิน",
};

export function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

/** Distinct action keys present, for the toolbar filter. Stable order. */
export function distinctActions(list: AuditEntry[]): string[] {
  return Array.from(new Set(list.map((e) => e.action)));
}

/** Distinct actor emails present, for the toolbar filter. Stable order. */
export function distinctActors(list: AuditEntry[]): string[] {
  return Array.from(new Set(list.map((e) => e.actor)));
}
