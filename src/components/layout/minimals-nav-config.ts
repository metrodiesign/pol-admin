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
    items: [{ title: "แดชบอร์ด", path: "/main", icon: "dashboard" }],
  },

  // ── กรมธรรม์ ──────────────────────────────────────────────────────────────
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

  // ── ผู้ใช้งาน & สิทธิ์ ──────────────────────────────────────────────────
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

  // ── ตัวแทน/นายหน้า ──────────────────────────────────────────────────────
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

  // ── Control plane · การเชื่อมต่อ ───────────────────────────────────────────
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

  // ── Overview ────────────────────────────────────────────────────────────
  {
    subheader: "Overview",
    items: [
      { title: "App", path: "/minimals", icon: "dashboard" },
      { title: "Ecommerce", path: "/minimals/ecommerce", icon: "ecommerce" },
      { title: "Analytics", path: "/minimals/analytics", icon: "analytics" },
      { title: "Banking", path: "/minimals/banking", icon: "banking" },
      { title: "Booking", path: "/minimals/booking", icon: "booking" },
      { title: "File", path: "/minimals/file", icon: "file" },
      { title: "Course", path: "/minimals/course", icon: "course" },
    ],
  },

  // ── Management ──────────────────────────────────────────────────────────
  {
    subheader: "Management",
    items: [
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
    ],
  },

  // ── Misc ────────────────────────────────────────────────────────────────
  {
    subheader: "Misc",
    items: [
      {
        title: "Permission",
        path: "/minimals/permission",
        icon: "lock",
        caption: "Only admin can see this item.",
      },
      {
        title: "Level",
        path: "#level",
        icon: "blank",
        children: [
          {
            title: "Level 2a",
            path: "#level-2a",
            children: [
              { title: "Level 3a", path: "#level-3a" },
              { title: "Level 3b", path: "#level-3b" },
            ],
          },
          { title: "Level 2b", path: "#level-2b" },
        ],
      },
      {
        title: "Disabled",
        path: "#disabled",
        icon: "blank",
        disabled: true,
      },
      {
        title: "Label",
        path: "#label",
        icon: "blank",
        badge: "NEW",
      },
      {
        title: "Caption",
        path: "#caption",
        icon: "blank",
        caption: "This is a caption item.",
      },
      {
        title: "Params",
        path: "/minimals/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1",
        icon: "blank",
      },
      {
        title: "Subpaths",
        path: "/minimals/subpaths",
        icon: "blank",
        deepMatch: true,
      },
      {
        title: "External link",
        path: "https://www.google.com/",
        icon: "blank",
      },
      {
        title: "Blank",
        path: "/minimals/blank",
        icon: "blank",
      },
    ],
  },

];
