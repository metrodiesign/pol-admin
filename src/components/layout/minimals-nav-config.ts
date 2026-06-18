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
    subheader: "กรมธรรม์",
    items: [
      {
        title: "กรมธรรม์",
        path: "/policy/list",
        icon: "invoice",
        match: "/policy",
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

  // ── Overview ────────────────────────────────────────────────────────────
  {
    subheader: "Overview",
    items: [
      { title: "App", path: "/dashboard", icon: "dashboard" },
      { title: "Ecommerce", path: "/dashboard/ecommerce", icon: "ecommerce" },
      { title: "Analytics", path: "/dashboard/analytics", icon: "analytics" },
      { title: "Banking", path: "/dashboard/banking", icon: "banking" },
      { title: "Booking", path: "/dashboard/booking", icon: "booking" },
      { title: "File", path: "/dashboard/file", icon: "file" },
      { title: "Course", path: "/dashboard/course", icon: "course" },
    ],
  },

  // ── Management ──────────────────────────────────────────────────────────
  {
    subheader: "Management",
    items: [
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
    ],
  },

  // ── Misc ────────────────────────────────────────────────────────────────
  {
    subheader: "Misc",
    items: [
      {
        title: "Permission",
        path: "/dashboard/permission",
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
        path: "/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1",
        icon: "blank",
      },
      {
        title: "Subpaths",
        path: "/dashboard/subpaths",
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
        path: "/dashboard/blank",
        icon: "blank",
      },
    ],
  },

];
