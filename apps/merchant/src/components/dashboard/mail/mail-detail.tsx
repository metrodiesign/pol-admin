"use client";

import {
  Star,
  Tag,
  ArchiveRestore,
  MailOpen,
  Trash2,
  MoreVertical,
  Reply,
  ReplyAll,
  Forward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MailMessage } from "@/types/mail";

interface MailDetailProps {
  message: MailMessage;
}

function SenderAvatar({ from }: { from: MailMessage["from"] }) {
  if (from.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={from.avatarUrl}
        alt={from.name}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: from.color ?? "#637381" }}
    >
      {from.initials ?? from.name.charAt(0).toUpperCase()}
    </span>
  );
}

const iconBtnClass =
  "flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800";

export function MailDetail({ message }: MailDetailProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-1 border-b border-grey-100 px-4 py-2">
        <button type="button" aria-label="Star" className={iconBtnClass}>
          <Star className="size-4" />
        </button>
        <button type="button" aria-label="Label" className={iconBtnClass}>
          <Tag className="size-4" />
        </button>
        <button type="button" aria-label="Archive" className={iconBtnClass}>
          <ArchiveRestore className="size-4" />
        </button>
        <button type="button" aria-label="Mark as read" className={iconBtnClass}>
          <MailOpen className="size-4" />
        </button>
        <button type="button" aria-label="Delete" className={iconBtnClass}>
          <Trash2 className="size-4" />
        </button>
        <button type="button" aria-label="More" className={iconBtnClass}>
          <MoreVertical className="size-4" />
        </button>
        <span className="ml-2 text-xs text-grey-400">{message.timestamp}</span>
      </div>

      {/* Subject + reply cluster */}
      <div className="flex items-start justify-between gap-3 px-4 py-4">
        <h6 className="text-sm font-semibold leading-snug text-grey-800">
          {message.subject}
        </h6>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label="Reply" className={cn(iconBtnClass, "size-7")}>
            <Reply className="size-4" />
          </button>
          <button type="button" aria-label="Reply all" className={cn(iconBtnClass, "size-7")}>
            <ReplyAll className="size-4" />
          </button>
          <button type="button" aria-label="Forward" className={cn(iconBtnClass, "size-7")}>
            <Forward className="size-4" />
          </button>
        </div>
      </div>

      {/* Sender block */}
      <div className="flex items-start gap-3 px-4 pb-4">
        <SenderAvatar from={message.from} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-grey-800">
            {message.from.name}{" "}
            <span className="font-normal text-grey-500">&lt;{message.from.email}&gt;</span>
          </p>
          <p className="text-xs text-grey-500">
            To: {message.to.join(", ")},
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-sm leading-relaxed text-grey-600">{message.body}</p>
      </div>
    </div>
  );
}
