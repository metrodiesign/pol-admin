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
}

export interface NavGroup {
  subheader: string;
  items: NavItem[];
}

export const navConfig: NavGroup[] = [
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
