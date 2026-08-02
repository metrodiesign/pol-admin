export interface NavItem {
  title: string;
  path: string;
  /** Icon asset key -> /assets/icons/navbar/ic-<icon>.svg (mask-image). */
  icon?: string;
  children?: NavItem[];
  badge?: string;
  caption?: string;
  disabled?: boolean;
  /** When true, the item is considered active on its path AND any sub-paths. */
  deepMatch?: boolean;
  /**
   * Base path (or paths) used for active detection instead of `path`. The item is
   * active on `match` and any of its sub-paths — use when the link target is a
   * child route (e.g. path `/admin/user/list`) but the menu should stay active across
   * the whole section (`match: "/admin/user"` → active on /admin/user/list,
   * /admin/user/new, /admin/user/edit). Pass an array when a second, unrelated
   * route also belongs to this section (e.g. a standalone checkout window opened
   * from policy).
   */
  match?: string | string[];
  /**
   * Sub-paths to carve OUT of this item's deep/match range so a sibling that
   * owns them stays the sole active item. Use when a broad `match` prefix would
   * also light up on a sibling's route nested under it. The item stays active
   * on its own pages — only the listed prefixes are excluded.
   */
  exclude?: string[];
}

export interface NavGroup {
  subheader: string;
  items: NavItem[];
}

export const navConfig: NavGroup[] = [
  // ── Main ─────────────────────────────────────────────────────────────────
  {
    subheader: "Main",
    items: [{ title: "แดชบอร์ด", path: "/dashboard", icon: "dashboard" }],
  },

  // ── กรมธรรม์ ───────────────────────────────────────────────────────────────
  {
    subheader: "ระบบงานขาย",
    items: [
      {
        title: "กรมธรรม์",
        path: "/policy/list",
        icon: "invoice",
        match: "/policy",
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

  // ── ตัวแทน/นายหน้า ──────────────────────────────────────────────────────────
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

  // ── ผู้ใช้งาน & สิทธิ์ ─────────────────────────────────────────────────────
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

  // ── Control plane · การเชื่อมต่อ & orchestration ───────────────────────────
  {
    subheader: "Control plane · การเชื่อมต่อ",
    items: [
      { title: "การเชื่อมต่อ PSP", path: "/control/psp/list", icon: "banking", match: "/control/psp" },
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

  // ── Control plane · การเงิน & กระทบยอด ──────────────────────────────────────
  {
    subheader: "Control plane · การเงิน",
    items: [
      { title: "การกระทบยอด", path: "/control/reconciliation", icon: "banking", match: "/control/reconciliation" },
      { title: "รายงาน", path: "/control/reports", icon: "analytics", match: "/control/reports" },
    ],
  },

  // ── Control plane · องค์กร & ระบบ ───────────────────────────────────────────
  {
    subheader: "Control plane · องค์กร",
    items: [
      { title: "Tenants & Workspaces", path: "/control/tenants", icon: "lock", match: "/control/tenants" },
      { title: "Originators", path: "/control/originators", icon: "user", match: "/control/originators" },
    ],
  },

  // ── Demo (minimals pages) ────────────────────────────────────────────────
  {
    subheader: "Demo",
    items: [
      { title: "App", path: "/minimals", icon: "dashboard" },
      { title: "Ecommerce", path: "/minimals/ecommerce", icon: "ecommerce" },
      { title: "Analytics", path: "/minimals/analytics", icon: "analytics" },
      { title: "Banking", path: "/minimals/banking", icon: "banking" },
      { title: "Booking", path: "/minimals/booking", icon: "booking" },
      { title: "File", path: "/minimals/file", icon: "file" },
      { title: "Course", path: "/minimals/course", icon: "course" },
      {
        title: "User",
        path: "/minimals/user",
        icon: "user",
        children: [
          { title: "Profile", path: "/minimals/user/profile" },
          { title: "Cards", path: "/minimals/user/cards" },
          { title: "List", path: "/minimals/user/list" },
          { title: "Create", path: "/minimals/user/new" },
          { title: "Edit", path: "/minimals/user/edit" },
          { title: "Account", path: "/minimals/user/account" },
        ],
      },
      {
        title: "Product",
        path: "/minimals/product",
        icon: "product",
        children: [
          { title: "List", path: "/minimals/product/list" },
          { title: "Details", path: "/minimals/product/details" },
          { title: "Create", path: "/minimals/product/new" },
          { title: "Edit", path: "/minimals/product/edit" },
        ],
      },
      {
        title: "Order",
        path: "/minimals/order",
        icon: "order",
        children: [
          { title: "List", path: "/minimals/order/list" },
          { title: "Details", path: "/minimals/order/details" },
        ],
      },
      {
        title: "Invoice",
        path: "/minimals/invoice",
        icon: "invoice",
        children: [
          { title: "List", path: "/minimals/invoice/list" },
          { title: "Details", path: "/minimals/invoice/details" },
          { title: "Create", path: "/minimals/invoice/new" },
          { title: "Edit", path: "/minimals/invoice/edit" },
        ],
      },
      {
        title: "Blog",
        path: "/minimals/post",
        icon: "blog",
        children: [
          { title: "List", path: "/minimals/post/list" },
          { title: "Details", path: "/minimals/post/details" },
          { title: "Create", path: "/minimals/post/new" },
          { title: "Edit", path: "/minimals/post/edit" },
        ],
      },
      {
        title: "Job",
        path: "/minimals/job",
        icon: "job",
        children: [
          { title: "List", path: "/minimals/job/list" },
          { title: "Details", path: "/minimals/job/details" },
          { title: "Create", path: "/minimals/job/new" },
          { title: "Edit", path: "/minimals/job/edit" },
        ],
      },
      {
        title: "Tour",
        path: "/minimals/tour",
        icon: "tour",
        children: [
          { title: "List", path: "/minimals/tour/list" },
          { title: "Details", path: "/minimals/tour/details" },
          { title: "Create", path: "/minimals/tour/new" },
          { title: "Edit", path: "/minimals/tour/edit" },
        ],
      },
      { title: "File manager", path: "/minimals/file-manager", icon: "folder" },
      { title: "Mail", path: "/minimals/mail", icon: "mail", badge: "+32" },
      { title: "Chat", path: "/minimals/chat", icon: "chat" },
      { title: "Calendar", path: "/minimals/calendar", icon: "calendar" },
      { title: "Kanban", path: "/minimals/kanban", icon: "kanban" },
      {
        title: "Permission",
        path: "/minimals/permission",
        icon: "lock",
        caption: "Only admin can see this item.",
      },
      { title: "Blank", path: "/minimals/blank", icon: "blank" },
    ],
  },
];
