import type { AuditLog, AuditAction, AuditEntity, AuditActor } from "@/types/audit";

const ACTORS: AuditActor[] = [
  { id: "U-1001", name: "ธนกฤต ตันติเวช", portal: "admin" },
  { id: "U-1002", name: "พรพิมล ภัทรพิพัฒน์", portal: "admin" },
  { id: "U-1003", name: "อนุภัทร์ วิวัฒน์โสภณ", portal: "admin" },
  { id: "U-1004", name: "กชพร พฤกษากิจ", portal: "admin" },
  { id: "U-2010", name: "สรพงศ์ รักษ์เกษม", portal: "merchant" },
  { id: "U-2011", name: "รวิภา จิรพัฒน์กุล", portal: "merchant" },
  { id: "U-2012", name: "บมจ.เซเฟอร์อินชัวร์โบรกเกอร์", portal: "merchant" },
];

const ACTIONS: AuditAction[] = ["create", "update", "delete", "approve", "reject", "login", "logout", "capture", "void", "refund", "export", "send"];
const ENTITIES: AuditEntity[] = ["payment_link", "transaction", "policy", "user", "role", "apiclient", "psp", "webhook", "report", "config"];
const ENTITY_LABELS: Record<AuditEntity, string> = {
  payment_link: "ลิงก์ชำระเงิน",
  transaction: "ธุรกรรม",
  policy: "กรมธรรม์",
  user: "ผู้ใช้งาน",
  role: "บทบาท",
  apiclient: "API Client",
  psp: "PSP",
  webhook: "Webhook",
  report: "รายงาน",
  config: "การตั้งค่า",
};
const IP_POOL = ["203.150.224.18", "203.150.224.42", "54.255.10.66", "172.18.0.12", "118.172.44.10"];
const UA_POOL = ["Chrome/126 · macOS", "Chrome/124 · Windows", "Safari/17 · iPhone"];
const CLIENT_IDS = ["iPOL_8821", "RNWL_4412", "BRK_GOLD"];

function buildAuditLog(n = 60): AuditLog[] {
  const out: AuditLog[] = [];
  let t = new Date("2026-05-24T14:32:00").getTime();

  for (let i = 0; i < n; i++) {
    const actor = ACTORS[i % ACTORS.length] as AuditActor;
    const action = ACTIONS[Math.floor((i * 7) % ACTIONS.length)] as AuditAction;
    const entity = ENTITIES[Math.floor((i * 11) % ENTITIES.length)] as AuditEntity;

    const entityId =
      entity === "transaction" ? "TXN-2605" + (2000 + i).toString().slice(-4) :
      entity === "payment_link" ? "PL-2605" + (3100 + i).toString().slice(-4) :
      entity === "policy" ? "POL-2415" + (888 - i).toString().padStart(3, "0") :
      entity === "user" ? "U-" + (1000 + (i % 50)).toString() :
      entity === "apiclient" ? "cli_" + (CLIENT_IDS[i % 3] ?? "iPOL_8821") :
      entity.toUpperCase() + "-" + (i + 100);

    t -= (60 + (i * 37) % 800) * 1000;

    const entityLabel = ENTITY_LABELS[entity];
    const summary =
      action === "create" ? "สร้าง " + entityLabel + " ใหม่" :
      action === "update" ? "อัปเดตข้อมูล " + entityLabel :
      action === "delete" ? "ลบ " + entityLabel :
      action === "approve" ? "อนุมัติ " + entityLabel :
      action === "reject" ? "ปฏิเสธ " + entityLabel :
      action === "login" ? "เข้าสู่ระบบสำเร็จ" :
      action === "logout" ? "ออกจากระบบ" :
      action === "capture" ? "Capture ธุรกรรม" :
      action === "void" ? "Void ธุรกรรม" :
      action === "refund" ? "คืนเงิน " + ((i % 5 + 1) * 1240) + " บาท" :
      action === "export" ? "ส่งออก CSV " + entityLabel :
      "ส่งการแจ้งเตือน";

    out.push({
      id: "AL-" + (50000 + i),
      ts: new Date(t).toISOString(),
      actor,
      action,
      entity,
      entityId,
      ip: IP_POOL[i % IP_POOL.length] as string,
      ua: UA_POOL[i % UA_POOL.length] as string,
      summary,
    });
  }
  return out;
}

export const AUDIT_LOGS: AuditLog[] = buildAuditLog(60);
