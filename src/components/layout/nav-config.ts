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
   * Base path used for active detection instead of `path`. The item is active on
   * `match` and any of its sub-paths — use when the link target is a child route
   * (e.g. path `/user/list`) but the menu should stay active across the whole
   * section (`match: "/user"` → active on /user/list, /user/new, /user/edit).
   */
  match?: string;
  /**
   * Sub-paths to carve OUT of this item's deep/match range so a sibling that
   * owns them stays the sole active item. Without it a broad `match` (e.g.
   * "/user") would also light up on a sibling's route (`/user/role`). The item
   * stays active on its own pages — only the listed prefixes are excluded.
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
    items: [{ title: "แดชบอร์ด", path: "/main", icon: "dashboard" }],
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

  // ── ผู้ใช้งาน & สิทธิ์ ─────────────────────────────────────────────────────
  {
    subheader: "ผู้ใช้งาน & สิทธิ์",
    items: [
      {
        title: "ผู้ใช้งาน",
        path: "/user/list",
        icon: "user",
        match: "/user",
        exclude: ["/user/role"],
      },
      {
        title: "บทบาทและสิทธิ์",
        path: "/user/role/list",
        icon: "lock",
        match: "/user/role",
      },
    ],
  },

  // ── ตัวแทน/นายหน้า ──────────────────────────────────────────────────────────
  {
    subheader: "ตัวแทน/นายหน้า",
    items: [
      {
        title: "ตัวแทน/นายหน้า",
        path: "/producer/list",
        icon: "user",
        match: "/producer",
        exclude: ["/producer/role"],
      },
      {
        title: "บทบาทและสิทธิ์",
        path: "/producer/role/list",
        icon: "lock",
        match: "/producer/role",
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
      { title: "App", path: "/dashboard", icon: "dashboard" },
      { title: "Ecommerce", path: "/dashboard/ecommerce", icon: "ecommerce" },
      { title: "Analytics", path: "/dashboard/analytics", icon: "analytics" },
      { title: "Banking", path: "/dashboard/banking", icon: "banking" },
      { title: "Booking", path: "/dashboard/booking", icon: "booking" },
      { title: "File", path: "/dashboard/file", icon: "file" },
      { title: "Course", path: "/dashboard/course", icon: "course" },
      {
        title: "User",
        path: "/dashboard/user",
        icon: "user",
        children: [
          { title: "Profile", path: "/dashboard/user/profile" },
          { title: "Cards", path: "/dashboard/user/cards" },
          { title: "List", path: "/dashboard/user/list" },
          { title: "Create", path: "/dashboard/user/new" },
          { title: "Edit", path: "/dashboard/user/edit" },
          { title: "Account", path: "/dashboard/user/account" },
        ],
      },
      {
        title: "Product",
        path: "/dashboard/product",
        icon: "product",
        children: [
          { title: "List", path: "/dashboard/product/list" },
          { title: "Details", path: "/dashboard/product/details" },
          { title: "Create", path: "/dashboard/product/new" },
          { title: "Edit", path: "/dashboard/product/edit" },
        ],
      },
      {
        title: "Order",
        path: "/dashboard/order",
        icon: "order",
        children: [
          { title: "List", path: "/dashboard/order/list" },
          { title: "Details", path: "/dashboard/order/details" },
        ],
      },
      {
        title: "Invoice",
        path: "/dashboard/invoice",
        icon: "invoice",
        children: [
          { title: "List", path: "/dashboard/invoice/list" },
          { title: "Details", path: "/dashboard/invoice/details" },
          { title: "Create", path: "/dashboard/invoice/new" },
          { title: "Edit", path: "/dashboard/invoice/edit" },
        ],
      },
      {
        title: "Blog",
        path: "/dashboard/post",
        icon: "blog",
        children: [
          { title: "List", path: "/dashboard/post/list" },
          { title: "Details", path: "/dashboard/post/details" },
          { title: "Create", path: "/dashboard/post/new" },
          { title: "Edit", path: "/dashboard/post/edit" },
        ],
      },
      {
        title: "Job",
        path: "/dashboard/job",
        icon: "job",
        children: [
          { title: "List", path: "/dashboard/job/list" },
          { title: "Details", path: "/dashboard/job/details" },
          { title: "Create", path: "/dashboard/job/new" },
          { title: "Edit", path: "/dashboard/job/edit" },
        ],
      },
      {
        title: "Tour",
        path: "/dashboard/tour",
        icon: "tour",
        children: [
          { title: "List", path: "/dashboard/tour/list" },
          { title: "Details", path: "/dashboard/tour/details" },
          { title: "Create", path: "/dashboard/tour/new" },
          { title: "Edit", path: "/dashboard/tour/edit" },
        ],
      },
      { title: "File manager", path: "/dashboard/file-manager", icon: "folder" },
      { title: "Mail", path: "/dashboard/mail", icon: "mail", badge: "+32" },
      { title: "Chat", path: "/dashboard/chat", icon: "chat" },
      { title: "Calendar", path: "/dashboard/calendar", icon: "calendar" },
      { title: "Kanban", path: "/dashboard/kanban", icon: "kanban" },
      {
        title: "Permission",
        path: "/dashboard/permission",
        icon: "lock",
        caption: "Only admin can see this item.",
      },
      { title: "Blank", path: "/dashboard/blank", icon: "blank" },
    ],
  },
];
