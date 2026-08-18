"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MailMessage } from "@/types/mail";

interface MailListProps {
  messages: MailMessage[];
  selectedId: string | null;
  onSelectMessage: (id: string) => void;
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

export function MailList({ messages, selectedId, onSelectMessage }: MailListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grey-400" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search mail"
            className="h-10 w-full rounded-lg border border-grey-300 bg-transparent pl-9 pr-3.5 text-sm text-foreground placeholder:text-grey-400 focus:border-grey-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Message rows */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = selectedId === msg.id;
          return (
            <button
              key={msg.id}
              type="button"
              onClick={() => onSelectMessage(msg.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-grey-100 px-3 py-3 text-left transition-colors",
                isSelected
                  ? "bg-grey-200"
                  : "hover:bg-grey-100"
              )}
            >
              <SenderAvatar from={msg.from} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "truncate text-sm",
                      !msg.isRead ? "font-bold text-grey-800" : "font-semibold text-grey-700"
                    )}
                  >
                    {msg.from.name}
                  </span>
                  <span className="shrink-0 text-xs text-grey-400">{msg.relativeTime}</span>
                </div>
                <p className="truncate text-xs text-grey-500">{msg.preview}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
