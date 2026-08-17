"use client";

import { useState, useMemo } from "react";
import { Mail, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MailLabel, MailMessage } from "@/types/mail";
import { MAIL_MESSAGES } from "@/lib/mock/mail";
import { MailLabelRail } from "./mail-label-rail";
import { MailList } from "./mail-list";
import { MailDetail } from "./mail-detail";
import { MailComposer } from "./mail-composer";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const INITIAL_SELECTED = "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1";

export function MailLayout() {
  const [activeLabel, setActiveLabel] = useState<MailLabel>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_SELECTED);

  const filteredMessages = useMemo<MailMessage[]>(() => {
    if (activeLabel === "all") return MAIL_MESSAGES;
    return MAIL_MESSAGES.filter((m) => m.labels.includes(activeLabel));
  }, [activeLabel]);

  const selectedMessage = useMemo(
    () => MAIL_MESSAGES.find((m) => m.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    /*
     * Outer surface: rounded "paper" card with grey-100 background.
     * On desktop: 3-column layout (label rail | message list | detail)
     * On mobile: single column — compact header row + full-width detail pane
     */
    <div className="overflow-hidden rounded-card bg-grey-100 shadow-card">
      {/* ── DESKTOP 3-COLUMN LAYOUT ── */}
      <div className="hidden mmd:flex" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* Column 1 — Label rail */}
        <div className="w-[200px] shrink-0 overflow-y-auto border-r border-grey-200 bg-card">
          <MailLabelRail activeLabel={activeLabel} onLabelChange={setActiveLabel} />
        </div>

        {/* Column 2 — Message list */}
        <div className="w-[300px] shrink-0 overflow-hidden border-r border-grey-200 bg-card">
          <MailList
            messages={filteredMessages}
            selectedId={selectedId}
            onSelectMessage={setSelectedId}
          />
        </div>

        {/* Column 3 — Message detail + composer */}
        <div className="flex min-w-0 flex-1 flex-col bg-card">
          {selectedMessage ? (
            <>
              <div className="flex-1 overflow-hidden">
                <MailDetail message={selectedMessage} />
              </div>
              <MailComposer />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-grey-400">
              Select a message to read
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex flex-col mmd:hidden" style={{ minHeight: "calc(100vh - 160px)" }}>
        {/* Mobile compact header */}
        <div className="flex items-center gap-2 border-b border-grey-200 bg-card p-3">
          {/* Labels drawer trigger */}
          <Sheet>
            <SheetTrigger
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-grey-100"
              )}
              aria-label="Open labels"
            >
              <Mail className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0" showCloseButton>
              <div className="overflow-y-auto pt-10">
                <MailLabelRail
                  activeLabel={activeLabel}
                  onLabelChange={setActiveLabel}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Message list drawer trigger */}
          <Sheet>
            <SheetTrigger
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-grey-100"
              )}
              aria-label="Open messages"
            >
              <MessageSquare className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0" showCloseButton>
              <div className="overflow-y-auto pt-10 h-full">
                <MailList
                  messages={filteredMessages}
                  selectedId={selectedId}
                  onSelectMessage={setSelectedId}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Search field */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grey-400" />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search mail"
              className="h-9 w-full rounded-lg border border-grey-300 bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-grey-400 focus:border-grey-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile detail + composer */}
        <div className="flex flex-1 flex-col bg-card">
          {selectedMessage ? (
            <>
              <div className="flex-1 overflow-auto">
                <MailDetail message={selectedMessage} />
              </div>
              <MailComposer />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-grey-400">
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
