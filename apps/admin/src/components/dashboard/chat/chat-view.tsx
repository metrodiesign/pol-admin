"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CHAT_CONTACTS, LUCIAN_MESSAGES, LUCIAN_ATTACHMENTS, MY_AVATAR } from "@/lib/mock/chat";
import { ConversationList } from "./conversation-list";
import { ChatThreadHeader } from "./chat-thread-header";
import { MessageStream } from "./message-stream";
import { ChatComposer } from "./chat-composer";
import { ContactInfoPanel } from "./contact-info-panel";

const DEFAULT_CONVERSATION_ID = "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2";

// CHAT_CONTACTS is always non-empty (defined in mock data); this satisfies strict typing.
const FIRST_CONTACT = CHAT_CONTACTS[0] ?? {
  id: "",
  name: "",
  avatar: "",
  online: false,
  lastMessage: "",
  lastMessageIsOwn: false,
  lastMessageTime: "",
};

export function ChatView() {
  const [activeId, setActiveId] = useState(DEFAULT_CONVERSATION_ID);
  const [search, setSearch] = useState("");
  const [infoOpen, setInfoOpen] = useState(true);

  const activeContact = CHAT_CONTACTS.find((c) => c.id === activeId) ?? FIRST_CONTACT;

  return (
    <div
      className="flex overflow-hidden rounded-card bg-card"
      style={{
        height: "calc(100vh - 180px)",
        minHeight: 560,
        boxShadow: "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Column 1: Conversations sidebar — hidden on mobile (drawer instead) */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden w-[320px] shrink-0 mmd:flex mmd:flex-col">
        <ConversationList
          contacts={CHAT_CONTACTS}
          activeId={activeId}
          search={search}
          onSearchChange={setSearch}
          onSelect={setActiveId}
          myAvatar={MY_AVATAR}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Column 2: Thread                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile: floating chat-bubble button to open sidebar drawer */}
        <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2 mmd:hidden">
          <Sheet>
            <SheetTrigger
              className="flex size-10 items-center justify-center rounded-r-xl bg-success text-white shadow-z8"
              aria-label="Open conversations"
            >
              <MessageSquare className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" showCloseButton className="w-[300px] p-0">
              <div className="flex h-full flex-col">
                <ConversationList
                  contacts={CHAT_CONTACTS}
                  activeId={activeId}
                  search={search}
                  onSearchChange={setSearch}
                  onSelect={(id) => {
                    setActiveId(id);
                  }}
                  myAvatar={MY_AVATAR}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <ChatThreadHeader
          contact={activeContact}
          onToggleInfo={() => setInfoOpen((v) => !v)}
          infoOpen={infoOpen}
        />

        <MessageStream messages={LUCIAN_MESSAGES} />

        <ChatComposer />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Column 3: Contact info panel — hidden on mobile                    */}
      {/* ------------------------------------------------------------------ */}
      {infoOpen && (
        <div className="hidden mlg:flex">
          <ContactInfoPanel contact={activeContact} attachments={LUCIAN_ATTACHMENTS} />
        </div>
      )}
    </div>
  );
}
