"use client";

import Image from "next/image";
import { MessageCircle, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import type { KanbanCard as KanbanCardType, Priority } from "@/types/kanban";

interface KanbanCardProps {
  card: KanbanCardType;
  onClick?: () => void;
}

function PriorityFlag({ priority }: { priority: Priority }) {
  if (priority === "high") {
    return (
      <span aria-label="High priority" title="High">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-error"
        >
          <path
            d="M7 14l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 18l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (priority === "medium") {
    return (
      <span aria-label="Medium priority" title="Medium">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-warning"
        >
          <path
            d="M7 16l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  // low — teal/info
  return (
    <span aria-label="Low priority" title="Low">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="text-info"
      >
        <path
          d="M7 8l5 5 5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const MAX_VISIBLE_AVATARS = 3;

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const visibleAssignees = card.assignees.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = card.assignees.length - MAX_VISIBLE_AVATARS;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl bg-card",
        "transition-shadow hover:shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      {/* Cover image */}
      {card.coverImageUrl && (
        <div className="relative h-[180px] w-full overflow-hidden">
          <Image
            src={card.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="304px"
          />
        </div>
      )}

      {/* Card body */}
      <div className="relative p-3">
        {/* Priority flag — absolute top-right */}
        <div className="absolute top-2.5 right-2.5">
          <PriorityFlag priority={card.priority} />
        </div>

        {/* Title */}
        <p className="pr-6 text-sm font-semibold leading-[22px] text-grey-800">
          {card.title}
        </p>

        {/* Footer meta */}
        <div className="mt-2 flex items-center gap-3">
          {/* Comment count */}
          <span className="flex items-center gap-1 text-xs text-grey-500">
            <MessageCircle className="size-[14px]" strokeWidth={1.5} />
            {card.commentCount}
          </span>

          {/* Attachment count */}
          {card.attachmentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-grey-500">
              <Paperclip className="size-[14px]" strokeWidth={1.5} />
              {card.attachmentCount}
            </span>
          )}

          {/* Assignee avatars */}
          {card.assignees.length > 0 && (
            <div className="ml-auto">
              <AvatarGroup>
                {visibleAssignees.map((assignee) => (
                  <Avatar key={assignee.name} size="sm">
                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                    <AvatarFallback>
                      {assignee.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {overflowCount > 0 && (
                  <AvatarGroupCount className="size-6 text-[10px] font-bold">
                    +{overflowCount}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
