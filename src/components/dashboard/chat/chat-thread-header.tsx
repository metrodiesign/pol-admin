"use client";

import Image from "next/image";
import { Phone, Video, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatContact } from "@/lib/mock/chat";

interface ChatThreadHeaderProps {
  contact: ChatContact;
  onToggleInfo: () => void;
  infoOpen: boolean;
}

export function ChatThreadHeader({ contact, onToggleInfo, infoOpen }: ChatThreadHeaderProps) {
  const displayName = contact.isGroup
    ? contact.name.split(",").slice(0, 2).join(", ")
    : contact.name;

  return (
    <div className="flex items-center gap-3 border-b border-[rgba(145,158,171,0.2)] px-4 py-3">
      {/* Avatar + name */}
      <div className="relative shrink-0">
        <Image
          src={contact.avatar}
          alt={contact.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
        {contact.online && (
          <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-success" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold leading-[22px] text-grey-800">{displayName}</p>
        <p className={cn("text-[13px] leading-5", contact.online ? "text-success" : "text-grey-400")}>
          {contact.online ? "online" : "offline"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Call"
        >
          <Phone className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Video"
        >
          <Video className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToggleInfo}
          className={`flex size-9 items-center justify-center rounded-full transition-colors hover:bg-grey-100 ${infoOpen ? "bg-grey-100 text-grey-800" : "text-grey-500 hover:text-grey-800"}`}
          aria-label="Info panel"
        >
          {/* side-panel icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="More"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>
    </div>
  );
}
