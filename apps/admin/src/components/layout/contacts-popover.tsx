"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import { Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { contacts, type Contact } from "@/lib/mock/topbar";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";

const statusColor: Record<Contact["status"], string> = {
  online: "bg-success",
  busy: "bg-error",
  away: "bg-warning",
  offline: "bg-grey-400",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

interface ContactsPopoverProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function ContactsPopover({ variant = "white" }: ContactsPopoverProps) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);
  const triggerClass = variant === "grey"
    ? "flex size-10 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
    : "flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Contacts button"
        className={triggerClass}
      >
        <Users className="size-6" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[328px] p-0">
        <p className="p-3 text-base font-semibold text-grey-800">
          Contacts{" "}
          <span className="text-grey-500">({contacts.length})</span>
        </p>
        <SimpleBar autoHide={false} style={{ maxHeight: 320 }}>
        <ul className="pb-1">
          {contacts.map((c) => (
            <li
              key={c.name}
              className="flex cursor-pointer items-center gap-4 p-2 transition-colors hover:bg-[var(--action-hover)]"
            >
              <span className="relative shrink-0">
                <Avatar className="size-10">
                  <AvatarImage src={c.avatar} alt={c.name} />
                  <AvatarFallback className="bg-grey-200 text-xs font-semibold text-grey-700">
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white",
                    statusColor[c.status],
                  )}
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-grey-800">
                  {c.name}
                </span>
                {c.lastSeen && (
                  <span className="text-xs text-grey-500">{c.lastSeen}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        </SimpleBar>
      </PopoverContent>
    </Popover>
  );
}
