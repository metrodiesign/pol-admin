"use client";

import { useEffect, useRef, useCallback } from "react";
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
  Image as ImageIcon,
  Maximize,
  Minus,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  /**
   * Pre-built HTML string generated from controlled mock data (own structured
   * descriptionSections). Not user-supplied — no sanitization required here,
   * but add DOMPurify before using with real user content.
   */
  initialHtml?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  className?: string;
}

type FormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull"
  | "removeFormat";

function ToolbarBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        // Prevent editor blur before command runs
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[rgba(145,158,171,0.08)]",
        active ? "bg-[rgba(145,158,171,0.08)] text-grey-900" : "text-grey-600"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  initialHtml,
  placeholder = "Write something awesome...",
  onChange,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Set initial content on mount. Content is generated from controlled mock
  // data (descriptionSections), not from user input, so innerHTML is safe here.
  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml;
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((cmd: FormatCommand, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    if (onChange) onChange(editorRef.current?.textContent ?? "");
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (onChange) onChange(editorRef.current?.textContent ?? "");
  }, [onChange]);

  return (
    <div
      className={cn(
        "rounded-control border border-[var(--divider)] bg-card overflow-hidden",
        className
      )}
    >
      {/* Toolbar row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-grey-200 px-2 py-1.5">
        {/* Heading dropdown (simplified) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-grey-800 hover:bg-[rgba(145,158,171,0.08)]"
        >
          Paragraph <ChevronDown className="size-3.5" />
        </button>

        <div className="mx-1 h-5 w-px bg-grey-200" />

        <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
          <Bold className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
          <Italic className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
          <Underline className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough className="size-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-grey-200" />

        <ToolbarBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Ordered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="size-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-grey-200" />

        <ToolbarBtn title="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Justify" onClick={() => exec("justifyFull")}>
          <AlignJustify className="size-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-grey-200" />

        <ToolbarBtn title="Insert link" onClick={() => {}}>
          <Link className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Remove link" onClick={() => {}}>
          <Link2Off className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Insert image" onClick={() => {}}>
          <ImageIcon className="size-4" />
        </ToolbarBtn>
      </div>

      {/* Toolbar row 2 */}
      <div className="flex items-center gap-0.5 border-b border-grey-200 px-2 py-1.5">
        <ToolbarBtn title="Hard break" onClick={() => {}}>
          <Minus className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Clear formatting" onClick={() => exec("removeFormat")}>
          <RemoveFormatting className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Fullscreen" onClick={() => {}}>
          <Maximize className="size-4" />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[160px] px-4 py-3 text-sm text-grey-800 outline-none empty:before:text-grey-400 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
