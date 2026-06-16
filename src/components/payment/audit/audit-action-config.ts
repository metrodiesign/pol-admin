import type { LucideIcon } from "lucide-react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Zap,
  Ban,
  RotateCcw,
  FileDown,
  Send,
  History,
} from "lucide-react";
import type { AuditAction } from "@/types/audit";

export type AuditTone = "primary" | "success" | "warning" | "danger" | "neutral";

export interface AuditActionConfig {
  label: string;
  tone: AuditTone;
  Icon: LucideIcon;
}

export const FALLBACK_ICON: LucideIcon = History;

export const AUDIT_ACTION_CONFIG: Record<AuditAction, AuditActionConfig> = {
  create:  { label: "สร้าง",         tone: "primary", Icon: PlusCircle },
  update:  { label: "อัปเดต",        tone: "primary", Icon: Pencil },
  delete:  { label: "ลบ",            tone: "danger",  Icon: Trash2 },
  approve: { label: "อนุมัติ",       tone: "success", Icon: CheckCircle2 },
  reject:  { label: "ปฏิเสธ",        tone: "danger",  Icon: XCircle },
  login:   { label: "เข้าสู่ระบบ",   tone: "neutral", Icon: LogIn },
  logout:  { label: "ออกจากระบบ",    tone: "neutral", Icon: LogOut },
  capture: { label: "Capture",       tone: "success", Icon: Zap },
  void:    { label: "Void",          tone: "warning", Icon: Ban },
  refund:  { label: "คืนเงิน",       tone: "warning", Icon: RotateCcw },
  export:  { label: "ส่งออก",        tone: "neutral", Icon: FileDown },
  send:    { label: "ส่ง",           tone: "primary", Icon: Send },
};

/** Tailwind classes per tone — bg + text for the icon chip */
export const TONE_CLASSES: Record<
  AuditTone,
  { bg: string; text: string; solidBg: string; border: string }
> = {
  primary: {
    bg:      "bg-primary/10",
    text:    "text-primary",
    solidBg: "bg-primary",
    border:  "border-primary/20",
  },
  success: {
    bg:      "bg-success/12",
    text:    "text-success-dark",
    solidBg: "bg-success-dark",
    border:  "border-success/20",
  },
  warning: {
    bg:      "bg-warning/12",
    text:    "text-warning-dark",
    solidBg: "bg-warning-dark",
    border:  "border-warning/20",
  },
  danger: {
    bg:      "bg-error/12",
    text:    "text-error-dark",
    solidBg: "bg-error-dark",
    border:  "border-error/20",
  },
  neutral: {
    bg:      "bg-grey-200 dark:bg-grey-700/60",
    text:    "text-grey-600 dark:text-grey-400",
    solidBg: "bg-grey-600",
    border:  "border-grey-300 dark:border-grey-600",
  },
};
