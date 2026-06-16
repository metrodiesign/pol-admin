"use client";

import { useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/mock/chat";
import { MessageGroup } from "./message-bubble";

interface MessageStreamProps {
  messages: ChatMessage[];
}

interface GroupedMessages {
  senderId: string;
  isOwn: boolean;
  senderName: string;
  senderAvatar: string;
  /** Time of the first message in the group — shown as the group header */
  groupTime: string;
  messages: ChatMessage[];
}

/** Group consecutive messages from the same sender into one visual block. */
function groupMessages(messages: ChatMessage[]): GroupedMessages[] {
  const groups: GroupedMessages[] = [];
  for (const msg of messages) {
    const isOwn = msg.senderId === "me";
    const last = groups[groups.length - 1];
    if (last && last.senderId === msg.senderId) {
      last.messages.push(msg);
    } else {
      groups.push({
        senderId: msg.senderId,
        isOwn,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        groupTime: msg.time,
        messages: [msg],
      });
    }
  }
  return groups;
}

export function MessageStream({ messages }: MessageStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Snap the scroll container to the bottom immediately on mount so that
    // the latest messages are visible (not the top of the history).
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const groups = groupMessages(messages);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" aria-label="scrollable content">
      <div className="flex flex-col gap-5 px-4 py-6">
        {groups.map((group, idx) => (
          <MessageGroup
            key={idx}
            messages={group.messages}
            isOwn={group.isOwn}
            senderName={group.senderName}
            senderAvatar={group.senderAvatar}
            groupTime={group.groupTime}
          />
        ))}
      </div>
    </div>
  );
}
