"use client";

import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  PenLine,
  Trash2,
  AlertCircle,
  Star,
  Tag,
  Users,
  MessageCircle,
  MailOpen,
  Pencil,
  BadgePercent,
} from "lucide-react";
import type { MailLabel } from "@/types/mail";

interface LabelItem {
  id: MailLabel;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const LABELS: LabelItem[] = [
  { id: "all", label: "All", Icon: MailOpen, count: 3 },
  { id: "inbox", label: "Inbox", Icon: Inbox, count: 1 },
  { id: "sent", label: "Sent", Icon: Send },
  { id: "drafts", label: "Drafts", Icon: PenLine },
  { id: "trash", label: "Trash", Icon: Trash2 },
  { id: "spam", label: "Spam", Icon: AlertCircle, count: 1 },
  { id: "important", label: "Important", Icon: Tag, count: 1 },
  { id: "starred", label: "Starred", Icon: Star, count: 1 },
  { id: "social", label: "Social", Icon: Users },
  { id: "promotions", label: "Promotions", Icon: BadgePercent, count: 2 },
  { id: "forums", label: "Forums", Icon: MessageCircle, count: 1 },
];

interface MailLabelRailProps {
  activeLabel: MailLabel;
  onLabelChange: (label: MailLabel) => void;
}

export function MailLabelRail({ activeLabel, onLabelChange }: MailLabelRailProps) {
  return (
    <div className="flex w-full flex-col gap-1 px-3 py-2">
      {/* Compose button */}
      <button
        type="button"
        onClick={() => {}}
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-card transition-opacity hover:opacity-90"
      >
        <Pencil className="size-4" />
        Compose
      </button>

      {/* Label list */}
      {LABELS.map((item) => {
        const isActive = activeLabel === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onLabelChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-base leading-6 transition-colors",
              isActive
                ? "bg-grey-200 text-grey-800"
                : "text-grey-600 hover:bg-grey-100 hover:text-grey-800"
            )}
          >
            <item.Icon className="size-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.count != null && (
              <span
                className={cn(
                  "ml-auto min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold leading-none",
                  isActive
                    ? "bg-grey-300 text-grey-800"
                    : "bg-grey-200 text-grey-700"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
