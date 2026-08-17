"use client";

import { useState } from "react";
import Image from "next/image";
import { Reply, Smile, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/mock/chat";

interface MessageGroupProps {
  messages: ChatMessage[];
  isOwn: boolean;
  senderName: string;
  senderAvatar: string;
  /** Time label shown above the whole sender group */
  groupTime: string;
}

function MessageActions({ isOwn }: { isOwn: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg bg-card px-1 py-0.5 shadow-z8",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      <button
        type="button"
        className="flex size-7 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
        aria-label="Reply"
      >
        <Reply className="size-3.5" />
      </button>
      <button
        type="button"
        className="flex size-7 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
        aria-label="React"
      >
        <Smile className="size-3.5" />
      </button>
      <button
        type="button"
        className="flex size-7 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
        aria-label="Delete"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

interface SingleBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function SingleBubble({ message, isOwn }: SingleBubbleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-end gap-1",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover actions */}
      <div
        className={cn(
          "absolute bottom-0 z-10 transition-opacity duration-150",
          isOwn ? "right-full mr-1" : "left-full ml-1",
          hovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <MessageActions isOwn={isOwn} />
      </div>

      {/* Bubble content */}
      {message.type === "image" ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl",
            isOwn ? "rounded-br-sm" : "rounded-bl-sm"
          )}
          style={{ maxWidth: 280 }}
        >
          <Image
            src={message.imageUrl ?? ""}
            alt="Attachment"
            width={280}
            height={210}
            className="block object-cover"
            style={{ width: 280, height: "auto" }}
          />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[340px] rounded-2xl px-3.5 py-2 text-sm leading-[22px]",
            isOwn
              ? "rounded-br-sm bg-[#d3fcd2] text-grey-900"
              : "rounded-bl-sm bg-grey-100 text-grey-800"
          )}
        >
          {message.body}
        </div>
      )}
    </div>
  );
}

export function MessageGroup({
  messages,
  isOwn,
  senderName,
  senderAvatar,
  groupTime,
}: MessageGroupProps) {
  const first = messages[0];
  if (!first) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Time label above the group, aligned to the sender side */}
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <span className="text-xs leading-5 text-grey-400">{groupTime}</span>
      </div>

      <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar — incoming only, aligned to bottom of group */}
        {!isOwn && (
          <div className="shrink-0 self-end pb-0.5">
            <Image
              src={senderAvatar}
              alt={senderName}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
          </div>
        )}

        {/* Bubble column */}
        <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
          {/* Sender name — incoming only, above bubbles */}
          {!isOwn && (
            <p className="px-1 text-xs leading-5 text-grey-500">{senderName}</p>
          )}

          {messages.map((msg) => (
            <SingleBubble key={msg.id} message={msg} isOwn={isOwn} />
          ))}
        </div>
      </div>
    </div>
  );
}
