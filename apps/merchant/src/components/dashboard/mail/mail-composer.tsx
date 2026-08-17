"use client";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Link2Off,
  Image,
  CornerDownLeft,
  RemoveFormatting,
  Maximize2,
  Paperclip,
  SendHorizontal,
  ChevronDown,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolbarBtnClass =
  "flex size-7 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-grey-800";

function ToolbarBtn({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button type="button" aria-label={label} className={toolbarBtnClass}>
      <Icon className="size-4" />
    </button>
  );
}

export function MailComposer() {
  return (
    <div className="m-3 rounded-xl border border-grey-200 bg-grey-50">
      {/* Rich-text toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-grey-200 p-2">
        {/* Paragraph dropdown */}
        <button
          type="button"
          className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-grey-700 transition-colors hover:bg-grey-100"
        >
          Paragraph
          <ChevronDown className="size-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-grey-300" />

        <ToolbarBtn icon={Bold} label="Bold" />
        <ToolbarBtn icon={Italic} label="Italic" />
        <ToolbarBtn icon={Underline} label="Underline" />
        <ToolbarBtn icon={Strikethrough} label="Strikethrough" />

        <div className="mx-1 h-4 w-px bg-grey-300" />

        <ToolbarBtn icon={List} label="Bullet list" />
        <ToolbarBtn icon={ListOrdered} label="Ordered list" />

        <div className="mx-1 h-4 w-px bg-grey-300" />

        <ToolbarBtn icon={AlignLeft} label="Align left" />
        <ToolbarBtn icon={AlignCenter} label="Align center" />
        <ToolbarBtn icon={AlignRight} label="Align right" />
        <ToolbarBtn icon={AlignJustify} label="Justify" />

        <div className="mx-1 h-4 w-px bg-grey-300" />

        <ToolbarBtn icon={Link} label="Insert link" />
        <ToolbarBtn icon={Link2Off} label="Remove link" />
        <ToolbarBtn icon={Image} label="Insert image" />

        <div className="mx-1 h-4 w-px bg-grey-300" />

        <ToolbarBtn icon={CornerDownLeft} label="Hard break" />
        <ToolbarBtn icon={RemoveFormatting} label="Clear format" />
        <ToolbarBtn icon={Maximize2} label="Fullscreen" />
      </div>

      {/* Editor area */}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write something awesome..."
        className={cn(
          "min-h-[96px] px-3 py-3 text-sm leading-relaxed text-grey-800 outline-none",
          "empty:before:text-grey-400 empty:before:content-[attr(data-placeholder)]"
        )}
      />

      {/* Footer: attach + send */}
      <div className="flex items-center justify-between border-t border-grey-200 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Attach image"
            className={cn(toolbarBtnClass, "size-8 rounded-full")}
          >
            <Camera className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Attach file"
            className={cn(toolbarBtnClass, "size-8 rounded-full")}
          >
            <Paperclip className="size-4" />
          </button>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-success-dark"
        >
          Send
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
