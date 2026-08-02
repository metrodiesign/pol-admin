import type { OrgUnitSegment } from "@/types/organization/org-unit";

// config ต่อ entity — จุดเดียวที่ 4 module ต่างกัน (REQ-7.2)

export type OrgUnitKey = "office" | "division" | "position" | "level";

export interface OrgUnitConfig {
  segment: OrgUnitSegment; // API path segment
  basePath: string; // route base เช่น "/organization/office"
  label: string; // label ไทย ใช้ใน title/breadcrumb/ข้อความ
}

export const ORG_UNIT_CONFIGS: Record<OrgUnitKey, OrgUnitConfig> = {
  office: { segment: "offices", basePath: "/organization/office", label: "สำนักงาน" },
  division: { segment: "divisions", basePath: "/organization/division", label: "แผนก" },
  position: { segment: "positions", basePath: "/organization/position", label: "ตำแหน่ง" },
  level: { segment: "levels", basePath: "/organization/level", label: "ระดับ" },
};
