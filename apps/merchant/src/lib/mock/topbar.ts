export interface Language {
  code: string;
  label: string;
  flag: string;
}

export const languages: Language[] = [
  { code: "en", label: "English", flag: "GB" },
  { code: "fr", label: "French", flag: "FR" },
  { code: "vi", label: "Vietnamese", flag: "VN" },
  { code: "cn", label: "Chinese", flag: "CN" },
  { code: "ar", label: "Arabic", flag: "SA" },
];

export interface Contact {
  name: string;
  avatar: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: string;
}

export const contacts: Contact[] = [
  { name: "Jayvion Simon", avatar: "/avatars/avatar-1.webp", status: "busy" },
  { name: "Lucian Obrien", avatar: "/avatars/avatar-2.webp", status: "online" },
  { name: "Deja Brady", avatar: "/avatars/avatar-3.webp", status: "away", lastSeen: "2 days" },
  { name: "Harrison Stein", avatar: "/avatars/avatar-4.webp", status: "offline" },
  { name: "Reece Chung", avatar: "/avatars/avatar-5.webp", status: "online", lastSeen: "4 days" },
  { name: "Lainey Davidson", avatar: "/avatars/avatar-6.webp", status: "online" },
  { name: "Cristopher Cardenas", avatar: "/avatars/avatar-1.webp", status: "offline" },
  { name: "Melanie Noble", avatar: "/avatars/avatar-2.webp", status: "busy" },
];

export type NotifTone = "info" | "warning" | "neutral";

export interface NotifTag {
  label: string;
  tone: NotifTone;
}

export type NotifAction =
  | { kind: "friend" }
  | { kind: "payment" }
  | { kind: "reply"; quote: string }
  | { kind: "file"; name: string; size: string }
  | { kind: "tags"; tags: NotifTag[] }
  | { kind: "none" };

export interface TitleSegment {
  text: string;
  bold?: boolean;
}

export interface AppNotification {
  id: string;
  avatar?: string;
  icon?: "order" | "delivery" | "chat" | "mail";
  title: TitleSegment[];
  time: string;
  category: string;
  unread: boolean;
  action: NotifAction;
}

export const notifications: AppNotification[] = [
  {
    id: "1",
    avatar: "/avatars/avatar-2.webp",
    title: [{ text: "Deja Brady", bold: true }, { text: " sent you a friend request" }],
    time: "a few seconds",
    category: "Communication",
    unread: true,
    action: { kind: "friend" },
  },
  {
    id: "2",
    avatar: "/avatars/avatar-3.webp",
    title: [
      { text: "Jayvon Hull", bold: true },
      { text: " mentioned you in " },
      { text: "Minimal UI", bold: true },
    ],
    time: "a day",
    category: "Project UI",
    unread: true,
    action: {
      kind: "reply",
      quote:
        "@Jaydon Frankie feedback by asking questions or just leave a note of appreciation.",
    },
  },
  {
    id: "3",
    avatar: "/avatars/avatar-4.webp",
    title: [
      { text: "Lainey Davidson", bold: true },
      { text: " added file to " },
      { text: "File manager", bold: true },
    ],
    time: "2 days",
    category: "File manager",
    unread: true,
    action: { kind: "file", name: "design-suriname-2015.mp3", size: "2.3 Mb" },
  },
  {
    id: "4",
    avatar: "/avatars/avatar-5.webp",
    title: [
      { text: "Angelique Morse", bold: true },
      { text: " added new tags to " },
      { text: "File manager", bold: true },
    ],
    time: "3 days",
    category: "File manager",
    unread: false,
    action: {
      kind: "tags",
      tags: [
        { label: "Design", tone: "info" },
        { label: "Dashboard", tone: "warning" },
        { label: "Design system", tone: "neutral" },
      ],
    },
  },
  {
    id: "5",
    avatar: "/avatars/avatar-6.webp",
    title: [
      { text: "Giana Brandt", bold: true },
      { text: " request a payment of " },
      { text: "$200", bold: true },
    ],
    time: "4 days",
    category: "File manager",
    unread: false,
    action: { kind: "payment" },
  },
  {
    id: "6",
    icon: "order",
    title: [{ text: "Your order is placed", bold: true }, { text: " waiting for shipping" }],
    time: "5 days",
    category: "Order",
    unread: true,
    action: { kind: "none" },
  },
  {
    id: "7",
    icon: "delivery",
    title: [
      { text: "Delivery processing", bold: true },
      { text: " your order is being shipped" },
    ],
    time: "6 days",
    category: "Order",
    unread: false,
    action: { kind: "none" },
  },
  {
    id: "8",
    icon: "chat",
    title: [{ text: "You have new message", bold: true }, { text: " 5 unread messages" }],
    time: "7 days",
    category: "Communication",
    unread: false,
    action: { kind: "none" },
  },
  {
    id: "9",
    icon: "mail",
    title: [{ text: "You have new mail", bold: true }, { text: " sent from Guido Padberg" }],
    time: "8 days",
    category: "Communication",
    unread: false,
    action: { kind: "none" },
  },
];

export const notificationTabs = [
  { value: "all", label: "All", count: 22 },
  { value: "unread", label: "Unread", count: 12 },
  { value: "archived", label: "Archived", count: 10 },
];

export interface AccountMenuItem {
  label: string;
}

export const accountMenu: AccountMenuItem[] = [
  { label: "Home" },
  { label: "Profile" },
  { label: "Projects" },
  { label: "Subscription" },
  { label: "Security" },
  { label: "Account settings" },
];

export const accountUser = {
  name: "Jaydon Frankie",
  email: "demo@minimals.cc",
};
