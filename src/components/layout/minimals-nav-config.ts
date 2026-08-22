import { type NavGroup } from "./nav-config";

/**
 * Minimals nav — mirrors the live minimals.cc/dashboard sidebar exactly
 * per app.snapshot.txt.  Items that point to demo/inert routes use "#" as
 * the path so the sidebar renders them visually without creating real pages.
 */
export const minimalsNavConfig: NavGroup[] = [
  // ── Main ────────────────────────────────────────────────────────────────
  {
    subheader: "Main",
    items: [{ title: "แดชบอร์ด", path: "/dashboard", icon: "dashboard" }],
  },

  // ── กรมธรรม์ ──────────────────────────────────────────────────────────────
  {
    subheader: "ระบบงานขาย",
    items: [
      {
        title: "กรมธรรม์",
        path: "/policy/list",
        icon: "invoice",
        match: ["/policy", "/checkout"],
      },
      {
        title: "คำสั่งซื้อ",
        path: "/order/list",
        icon: "order",
        match: "/order",
      },
      {
        title: "รายการชำระเงิน",
        path: "/transaction/list",
        icon: "invoice",
        match: "/transaction",
      },
    ],
  },

  // ── ตัวแทน/นายหน้า ──────────────────────────────────────────────────────
  {
    subheader: "ตัวแทน/นายหน้า",
    items: [
      {
        title: "ตัวแทน/นายหน้า",
        path: "/merchant/user/list",
        icon: "user",
        match: "/merchant/user",
      },
      {
        title: "บทบาทและสิทธิ์",
        path: "/merchant/role/list",
        icon: "lock",
        match: "/merchant/role",
      },
    ],
  },

  // ── ผู้ใช้งาน & สิทธิ์ ──────────────────────────────────────────────────
  {
    subheader: "ผู้ใช้งาน & สิทธิ์",
    items: [
      {
        title: "ผู้ใช้งาน",
        path: "/admin/user/list",
        icon: "user",
        match: "/admin/user",
      },
      {
        title: "บทบาทและสิทธิ์",
        path: "/admin/role/list",
        icon: "lock",
        match: "/admin/role",
      },
    ],
  },

  // ── โครงสร้างองค์กร (master data ผูกกับ admin user profile) ────────────────
  {
    subheader: "โครงสร้างองค์กร",
    items: [
      {
        title: "สำนักงาน",
        path: "/organization/office/list",
        icon: "building",
        match: "/organization/office",
      },
      {
        title: "แผนก",
        path: "/organization/division/list",
        icon: "sitemap",
        match: "/organization/division",
      },
      {
        title: "ตำแหน่ง",
        path: "/organization/position/list",
        icon: "badge",
        match: "/organization/position",
      },
      {
        title: "ระดับ",
        path: "/organization/level/list",
        icon: "ranking",
        match: "/organization/level",
      },
    ],
  },

  // ── Control plane · การเชื่อมต่อ ───────────────────────────────────────────
  {
    subheader: "Control plane · การเชื่อมต่อ",
    items: [
      { title: "การเชื่อมต่อ PSP", path: "/control/psp/list", icon: "banking", match: "/control/psp", requiredPermission: "settings.manage" },
      { title: "กฎการกำหนดเส้นทาง", path: "/control/routing", icon: "analytics", match: "/control/routing" },
      { title: "ไคลเอนต์ API", path: "/control/api-clients", icon: "lock", match: "/control/api-clients" },
      { title: "Webhooks และเหตุการณ์", path: "/control/webhooks", icon: "folder", match: "/control/webhooks" },
    ],
  },

  // ── Control plane · การกำกับดูแล ────────────────────────────────────────────
  {
    subheader: "Control plane · การกำกับดูแล",
    items: [
      { title: "การอนุมัติ", path: "/control/approvals", icon: "invoice", match: "/control/approvals" },
      { title: "บันทึกการตรวจสอบ", path: "/control/audit", icon: "file", match: "/control/audit" },
      { title: "การแจ้งเตือน", path: "/control/notifications", icon: "mail", match: "/control/notifications" },
    ],
  },

  // ── Control plane · การเงิน ─────────────────────────────────────────────────
  {
    subheader: "Control plane · การเงิน",
    items: [
      { title: "การกระทบยอด", path: "/control/reconciliation", icon: "banking", match: "/control/reconciliation" },
      { title: "รายงาน", path: "/control/reports", icon: "analytics", match: "/control/reports" },
    ],
  },

  // ── Control plane · องค์กร ──────────────────────────────────────────────────
  {
    subheader: "Control plane · องค์กร",
    items: [
      { title: "Tenants & Workspaces", path: "/control/tenants", icon: "lock", match: "/control/tenants" },
      { title: "Originators", path: "/control/originators", icon: "user", match: "/control/originators" },
    ],
  },

  // ponytail: minimals demo group ซ่อนจาก sidebar, เปิดกลับด้วย git revert commit นี้
];
