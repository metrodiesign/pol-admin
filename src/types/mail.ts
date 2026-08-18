export type MailLabel =
  | "all"
  | "inbox"
  | "sent"
  | "drafts"
  | "trash"
  | "spam"
  | "important"
  | "starred"
  | "social"
  | "promotions"
  | "forums";

export interface MailMessage {
  id: string;
  from: {
    name: string;
    email: string;
    avatarUrl?: string;
    initials?: string;
    color?: string;
  };
  to: string[];
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  relativeTime: string;
  labels: MailLabel[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

export interface MailLabelItem {
  id: MailLabel;
  label: string;
  icon: string;
  count?: number;
}
