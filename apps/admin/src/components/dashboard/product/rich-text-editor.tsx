"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Minus,
  Eraser,
  Maximize2,
  CornerDownLeft,
} from "lucide-react";

interface RichTextEditorProps {
  /** Pass raw text for an empty create form, or HTML string for edit mode */
  defaultValue?: string;
  placeholder?: string;
}

const HEADING_OPTIONS = ["Paragraph", "Heading 1", "Heading 2", "Heading 3"];

/** Returns true when the string contains HTML tags — used to decide render mode */
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function RichTextEditor({
  defaultValue = "",
  placeholder = "Write something awesome...",
}: RichTextEditorProps) {
  const [heading, setHeading] = useState("Paragraph");
  const [focused, setFocused] = useState(false);

  const toolbarBtn =
    "rounded-full p-1.5 text-grey-600 transition-colors hover:bg-[var(--action-hover)] hover:text-foreground";

  // If defaultValue is HTML render it directly; plain-text is shown as-is
  const initialHtml = isHtml(defaultValue)
    ? defaultValue
    : defaultValue
        .split("\n")
        .map((line) => `<p>${line || "<br>"}</p>`)
        .join("");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors",
        focused ? "border-grey-800" : "border-[var(--divider)]",
      )}
    >
      {/* Toolbar row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--divider)] bg-grey-50 px-2 py-1.5">
        {/* Heading dropdown */}
        <Select value={heading} onValueChange={(v) => setHeading(v ?? "")}>
          <SelectTrigger
            aria-label="Text style"
            className="h-8 w-auto gap-1 border-none px-2 text-sm font-medium text-grey-800 hover:bg-[var(--action-hover)]"
          >
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-1 h-5 w-px bg-grey-200" />

        {[Bold, Italic, Underline, Strikethrough].map((Icon, i) => (
          <button key={i} type="button" className={toolbarBtn}>
            <Icon className="size-4" />
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-grey-200" />

        {[List, ListOrdered].map((Icon, i) => (
          <button key={i} type="button" className={toolbarBtn}>
            <Icon className="size-4" />
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-grey-200" />

        {[AlignLeft, AlignCenter, AlignRight, AlignJustify].map((Icon, i) => (
          <button key={i} type="button" className={toolbarBtn}>
            <Icon className="size-4" />
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-grey-200" />

        {[Link, Link2Off, Image].map((Icon, i) => (
          <button key={i} type="button" className={toolbarBtn}>
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      {/* Toolbar row 2 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--divider)] bg-grey-50 px-2 py-1.5">
        {[Minus, CornerDownLeft, Eraser, Maximize2].map((Icon, i) => (
          <button key={i} type="button" className={toolbarBtn}>
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      {/* Editor area — contenteditable renders HTML in edit mode */}
      {defaultValue ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Content is hardcoded mock data, not user input — no XSS risk
          dangerouslySetInnerHTML={{ __html: initialHtml }}
          className="min-h-[200px] bg-grey-50 px-4 py-3 text-sm text-foreground outline-none [&_h6]:mb-1 [&_h6]:mt-3 [&_h6]:text-sm [&_h6]:font-bold [&_h6]:text-foreground [&_li]:text-grey-600 [&_p]:my-0.5 [&_p]:text-grey-600 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1"
        />
      ) : (
        <div
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-placeholder={placeholder}
          className="min-h-[200px] bg-grey-50 px-4 py-3 text-sm text-foreground outline-none empty:before:text-grey-400 empty:before:content-[attr(data-placeholder)]"
        />
      )}
    </div>
  );
}
