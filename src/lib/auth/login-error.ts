export interface LoginErrorContent {
  title: string;
  message: string;
  isPending: boolean;
}

const REASON_MESSAGES: Readonly<Record<string, string>> = {
  "workforce-access-denied":
    "บัญชีนี้ไม่ผ่านนโยบายพนักงานขององค์กร กรุณาใช้บัญชี Microsoft ขององค์กรที่ได้รับอนุญาต",
  "workforce-email-unavailable":
    "บัญชี Microsoft นี้ไม่มีอีเมลที่ใช้ติดต่อได้ (ไม่มี mailbox) กรุณาติดต่อผู้ดูแลระบบ",
  "identity-conflict":
    "ไม่สามารถเชื่อมโยง identity นี้กับบัญชีผู้ดูแลได้ กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไข identity binding",
  "not-provisioned": "บัญชีนี้ยังไม่ได้รับสิทธิ์เข้าถึงระบบผู้ดูแล ติดต่อผู้ดูแลระบบ",
  suspended: "บัญชีถูกระงับการใช้งาน ติดต่อผู้ดูแลระบบ",
  "access-denied": "การเข้าสู่ระบบถูกยกเลิก",
  "missing-subject": "ไม่พบข้อมูลบัญชีสำหรับเข้าสู่ระบบ",
  "resolve-failed": "ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่",
  "session-write-failed": "สร้าง session ไม่สำเร็จ กรุณาลองใหม่",
  "email-unverified": "อีเมลของบัญชีนี้ยังไม่ได้ยืนยัน กรุณายืนยันอีเมลแล้วลองใหม่",
  "hd-mismatch": "กรุณาใช้บัญชีอีเมลขององค์กรที่ได้รับอนุญาต",
  "auth-failed": "การยืนยันตัวตนล้มเหลว กรุณาลองใหม่",
  "ticket-issue-failed": "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่",
  "missing-identity": "ไม่พบข้อมูลบัญชีสำหรับเข้าสู่ระบบ",
  "registration-link-invalid": "ลิงก์ลงทะเบียนไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
  "already-registered": "บัญชีนี้ลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ",
  // employee stack (IdentityAccess) policy codes — kebab ของ HumanIdentityPolicy/EmployeeJit
  "workforce-not-eligible": "บัญชีนี้ไม่ใช่บัญชีพนักงานที่ได้รับอนุญาต กรุณาใช้บัญชี Microsoft ขององค์กร",
  "issuer-mismatch": "บัญชี Microsoft นี้ไม่ได้อยู่ในองค์กรที่ได้รับอนุญาต",
  "tenant-mismatch": "บัญชี Microsoft นี้ไม่ได้อยู่ในองค์กรที่ได้รับอนุญาต",
  "audience-mismatch": "การยืนยันตัวตนไม่ถูกต้อง กรุณาลองใหม่",
  "account-suspended": "บัญชีถูกระงับการใช้งาน ติดต่อผู้ดูแลระบบ",
  "identity-account-type-conflict":
    "identity นี้ผูกกับบัญชีประเภทอื่นอยู่แล้ว กรุณาติดต่อผู้ดูแลระบบ",
};

const DEFAULT_MESSAGE = "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
const PENDING_REASON = "awaiting-approval";
const PENDING_MESSAGE = "ระบบได้รับข้อมูลการลงทะเบียนของคุณแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ";

export function getLoginErrorContent(reason?: string): LoginErrorContent {
  if (reason === PENDING_REASON) {
    return { title: "รอการอนุมัติ", message: PENDING_MESSAGE, isPending: true };
  }

  return {
    title: "เข้าสู่ระบบไม่สำเร็จ",
    message: (reason && REASON_MESSAGES[reason]) || DEFAULT_MESSAGE,
    isPending: false,
  };
}
