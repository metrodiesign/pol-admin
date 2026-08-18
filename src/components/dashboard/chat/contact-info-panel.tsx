"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Download, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatContact, ChatAttachment } from "@/lib/mock/chat";

interface ContactInfoPanelProps {
  contact: ChatContact;
  attachments: ChatAttachment[];
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-bold tracking-wider text-grey-500 transition-colors hover:bg-grey-100"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function ContactInfoPanel({ contact, attachments }: ContactInfoPanelProps) {
  return (
    <div
      className="flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-l border-[rgba(145,158,171,0.2)]"
      aria-label="scrollable content"
    >
      {/* Avatar + name + role */}
      <div className="flex flex-col items-center gap-2 py-6 px-4">
        <Image
          src={contact.avatar}
          alt={contact.name}
          width={96}
          height={96}
          className="size-24 rounded-full object-cover"
        />
        <div className="text-center">
          <h6 className="text-base font-semibold leading-6 text-grey-800">{contact.name}</h6>
          {contact.role && (
            <p className="text-sm text-grey-500">{contact.role}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-[rgba(145,158,171,0.2)]" />

      {/* INFORMATION section */}
      <CollapsibleSection title="INFORMATION">
        <div className="flex flex-col gap-3 px-4 py-3 text-sm text-grey-600">
          {contact.address && (
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-grey-400" />
              <p className="leading-5">{contact.address}</p>
            </div>
          )}
          {contact.phone && (
            <div className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-grey-400" />
              <p className="leading-5">{contact.phone}</p>
            </div>
          )}
          {contact.email && (
            <div className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-grey-400" />
              <p className="leading-5 break-all">{contact.email}</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <div className="h-px bg-[rgba(145,158,171,0.2)]" />

      {/* ATTACHMENTS section */}
      <CollapsibleSection title={`ATTACHMENTS (${attachments.length})`}>
        <div className="flex flex-col">
          {attachments.map((att) => (
            <AttachmentRow key={att.id} attachment={att} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function AttachmentRow({ attachment }: { attachment: ChatAttachment }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-grey-100">
      {/* Icon or thumbnail */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-grey-100">
        <Image
          src={attachment.isImage ? (attachment.thumbUrl ?? attachment.iconUrl) : attachment.iconUrl}
          alt={attachment.name}
          width={40}
          height={40}
          className={cn(
            "size-10",
            attachment.isImage ? "object-cover" : "object-contain p-1"
          )}
        />
      </div>

      {/* Name + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-5 text-grey-800">
          {attachment.name}
        </p>
        <p className="text-xs leading-4 text-grey-400">{attachment.datetime}</p>
      </div>

      {/* Download button */}
      <button
        type="button"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-grey-400 opacity-0 transition-all hover:text-grey-800 group-hover:opacity-100"
        aria-label="Download"
      >
        <Download className="size-4" />
      </button>
    </div>
  );
}
