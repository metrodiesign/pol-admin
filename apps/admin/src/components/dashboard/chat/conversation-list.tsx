"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatContact } from "@/lib/mock/chat";

interface ConversationListProps {
  contacts: ChatContact[];
  activeId: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  myAvatar: string;
}

function GroupAvatars({ avatars }: { avatars: string[] }) {
  const first = avatars[0] ?? "";
  const second = avatars[1] ?? first;
  return (
    <div className="relative size-10 shrink-0">
      <Image
        src={first}
        alt=""
        width={28}
        height={28}
        className="absolute top-0 left-0 size-7 rounded-full object-cover ring-2 ring-white"
      />
      <Image
        src={second}
        alt=""
        width={28}
        height={28}
        className="absolute right-0 bottom-0 size-7 rounded-full object-cover ring-2 ring-white"
      />
    </div>
  );
}

function OnlineDot() {
  return (
    <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-success" />
  );
}

export function ConversationList({
  contacts,
  activeId,
  search,
  onSearchChange,
  onSelect,
  myAvatar,
}: ConversationListProps) {
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-[rgba(145,158,171,0.2)]">
      {/* Sidebar header */}
      <div className="flex items-center gap-2 border-b border-[rgba(145,158,171,0.2)] px-3 py-3">
        <div className="relative size-10 shrink-0">
          <Image
            src={myAvatar}
            alt="Jaydon Frankie"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <OnlineDot />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-200 hover:text-grey-800"
            aria-label="New chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-200 hover:text-grey-800"
            aria-label="Options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-grey-100 px-3 py-2">
          <Search className="size-4 shrink-0 text-grey-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search contacts"
            className="flex-1 bg-transparent text-sm leading-6 text-grey-800 outline-none placeholder:text-grey-400"
          />
        </div>
      </div>

      {/* Conversation rows */}
      <nav className="flex-1 overflow-y-auto" aria-label="scrollable content">
        {filtered.map((contact) => {
          const isActive = contact.id === activeId;
          const displayName = contact.isGroup
            ? (contact.name.split(",")[0] ?? contact.name).trim()
            : contact.name;

          return (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSelect(contact.id)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                isActive ? "bg-[rgba(145,158,171,0.16)]" : "hover:bg-[rgba(145,158,171,0.08)]"
              )}
            >
              {/* Avatar */}
              {contact.isGroup && contact.groupAvatars ? (
                <GroupAvatars avatars={contact.groupAvatars} />
              ) : (
                <div className="relative shrink-0">
                  <Image
                    src={contact.avatar}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  {contact.online && <OnlineDot />}
                </div>
              )}

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-[22px] text-grey-800">{displayName}</p>
                <p className="truncate text-xs leading-5 text-grey-500">
                  {contact.lastMessageIsOwn ? (
                    <span className="text-grey-600">You: </span>
                  ) : null}
                  {contact.lastMessage}
                </p>
              </div>

              {/* Time */}
              <span className="shrink-0 text-xs text-grey-400">
                {contact.lastMessageTime}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
