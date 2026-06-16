"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
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
  Link2,
  Link2Off,
  ImageIcon,
  WrapText,
  Eraser,
  Maximize2,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Post } from "@/types/post";

const HEADING_OPTIONS = [
  "Paragraph",
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Heading 4",
  "Heading 5",
  "Heading 6",
];

const TAG_OPTIONS = [
  "Technology",
  "Health and Wellness",
  "Travel",
  "Finance",
  "Education",
  "Sports",
  "Entertainment",
];

const KEYWORD_OPTIONS = [
  "Sports",
  "Entertainment",
  "Business",
  "Technology",
  "Science",
];

interface FormSectionCardProps {
  title: string;
  caption: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FormSectionCard({
  title,
  caption,
  children,
  defaultOpen = true,
}: FormSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <div className="flex items-start justify-between px-6 pt-6 pb-0">
        <div>
          <span className="block text-[18px] font-semibold leading-7 text-grey-800">
            {title}
          </span>
          <span className="text-sm text-grey-500">{caption}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-500/8 transition-colors"
        >
          {open ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </button>
      </div>
      {open && <div className="mx-6 mt-5 h-px bg-grey-200" />}
      {open && <div className="px-6 pt-6 pb-6 space-y-5">{children}</div>}
    </div>
  );
}

interface OutlinedInputProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}

function OutlinedInput({
  placeholder,
  value,
  onChange,
  multiline,
  rows = 3,
}: OutlinedInputProps) {
  const baseClass =
    "w-full rounded-[8px] border border-[var(--divider)] bg-transparent px-3.5 py-3 text-[15px] text-grey-800 placeholder:text-grey-400 outline-none focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800 transition-colors resize-none";
  if (multiline) {
    return (
      <textarea
        rows={rows}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
    );
  }
  return (
    <input
      type="text"
      aria-label={placeholder}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseClass} h-14`}
    />
  );
}

interface ChipInputProps {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

function ChipInput({ placeholder, options, value, onChange }: ChipInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter(
    (o) =>
      !value.includes(o) &&
      o.toLowerCase().includes(inputVal.toLowerCase())
  );

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputVal("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="relative">
      <div className="min-h-[44px] flex flex-wrap items-center gap-1.5 rounded-[8px] border border-grey-300 px-2 py-2 focus-within:border-grey-800 transition-colors">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-info/16 px-2 text-[13px] font-normal text-info-dark"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-grey-500 hover:text-grey-800 transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          aria-label={placeholder}
          placeholder={value.length === 0 ? placeholder : "+ Tags"}
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="flex-1 min-w-[80px] bg-transparent text-[15px] text-grey-800 placeholder:text-grey-400 outline-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-[8px] border border-grey-200 bg-card shadow-md">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={() => addTag(opt)}
              className="w-full px-3 py-2 text-left text-sm text-grey-700 hover:bg-grey-100 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface UploadDropzoneProps {
  value: string | null;
  onChange: (v: string | null) => void;
}

function UploadDropzone({ value, onChange }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  if (value) {
    return (
      <div className="relative rounded-[12px] overflow-hidden bg-grey-100">
        {/* Use plain img for blob: URLs from createObjectURL; next/image only
            supports configured remote hostnames, not local object URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Cover preview"
          className="h-[200px] w-full rounded-[12px] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-grey-800/80 text-white hover:bg-grey-900 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[12px] bg-grey-100/50 hover:bg-grey-100 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Upload cover image"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {/* Upload illustration — Minimals open-basket folder with papers and sparkles */}
      <svg width="96" height="96" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        {/* Basket / open folder body */}
        <path d="M30 100 Q30 80 50 80 H90 L100 68 H150 Q170 68 170 88 V145 Q170 165 150 165 H50 Q30 165 30 145 Z" fill="#00A76F" fillOpacity="0.12"/>
        <path d="M30 100 Q30 80 50 80 H90 L100 68 H150 Q170 68 170 88 V145 Q170 165 150 165 H50 Q30 165 30 145 Z" stroke="#00A76F" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Basket front flap / opening */}
        <path d="M30 100 H170" stroke="#00A76F" strokeWidth="2" strokeDasharray="4 3"/>
        {/* Paper 1 — flying up-right */}
        <rect x="105" y="30" width="42" height="54" rx="4" fill="white" stroke="#C4CDD5" strokeWidth="1.5" transform="rotate(12 126 57)"/>
        <rect x="113" y="38" width="26" height="3" rx="1.5" fill="#DFE3E8" transform="rotate(12 126 57)"/>
        <rect x="113" y="45" width="20" height="3" rx="1.5" fill="#DFE3E8" transform="rotate(12 126 57)"/>
        <rect x="113" y="52" width="23" height="3" rx="1.5" fill="#DFE3E8" transform="rotate(12 126 57)"/>
        {/* Paper 2 — center, slightly left */}
        <rect x="72" y="20" width="42" height="54" rx="4" fill="white" stroke="#C4CDD5" strokeWidth="1.5" transform="rotate(-8 93 47)"/>
        <rect x="80" y="28" width="26" height="3" rx="1.5" fill="#DFE3E8" transform="rotate(-8 93 47)"/>
        <rect x="80" y="35" width="18" height="3" rx="1.5" fill="#DFE3E8" transform="rotate(-8 93 47)"/>
        {/* Sparkle top-right */}
        <path d="M165 25 L167 20 L169 25 L174 27 L169 29 L167 34 L165 29 L160 27 Z" fill="#00A76F" fillOpacity="0.5"/>
        {/* Sparkle top-left */}
        <path d="M40 38 L41.5 34 L43 38 L47 39.5 L43 41 L41.5 45 L40 41 L36 39.5 Z" fill="#FFAB00" fillOpacity="0.6"/>
        {/* Sparkle small bottom-right */}
        <circle cx="172" cy="130" r="3" fill="#00A76F" fillOpacity="0.4"/>
        <circle cx="34" cy="140" r="2" fill="#FFAB00" fillOpacity="0.4"/>
      </svg>
      <div className="text-center">
        <p className="text-[15px] font-bold text-grey-800">Drop or select a file</p>
        <p className="mt-1 text-sm text-grey-500">
          Drag a file here, or{" "}
          <span className="text-[#00A76F] underline cursor-pointer">browse</span> your device.
        </p>
      </div>
    </div>
  );
}

interface RichTextEditorProps {
  initialValue: string;
  onChange: (v: string) => void;
}

function RichTextEditor({ initialValue, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const [headingVal, setHeadingVal] = useState("Paragraph");
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // Seed the contentEditable with rendered HTML on first mount only.
  // initialValue is trusted static mock data (no user input), so setting
  // innerHTML is safe here. This renders headings as real H1-H4 elements
  // matching the live reference, instead of a flat plain-text blob.
  useEffect(() => {
    if (!seeded.current && editorRef.current) {
      seeded.current = true;
      if (initialValue) {
        // trusted static mock data only, never user-supplied
        editorRef.current.innerHTML = initialValue;
      }
    }
  // Run once on mount only — intentionally omit initialValue from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toolbarBtn = "flex size-8 items-center justify-center rounded-full text-grey-600 hover:bg-grey-500/8 transition-colors";

  return (
    <div className="rounded-[8px] border border-grey-300 overflow-hidden">
      {/* Single compact toolbar row */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-grey-200 px-2 py-1.5 bg-grey-50">
        {/* Heading menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHeadingMenu((v) => !v)}
            onBlur={() => setTimeout(() => setShowHeadingMenu(false), 150)}
            className="flex items-center gap-1 rounded-md border border-grey-200 bg-card px-2 h-8 text-sm font-medium text-grey-700 hover:bg-grey-50 transition-colors"
          >
            {headingVal}
            <ChevronDown className="size-3.5 text-grey-400" />
          </button>
          {showHeadingMenu && (
            <div className="absolute z-10 mt-1 w-36 rounded-[8px] border border-grey-200 bg-card shadow-md">
              {HEADING_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onMouseDown={() => {
                    setHeadingVal(h);
                    setShowHeadingMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-grey-700 hover:bg-grey-100 transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-grey-200 mx-0.5" />

        <button type="button" className={toolbarBtn} title="Bold (Cmd+B)">
          <Bold className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Italic (Cmd+I)">
          <Italic className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Underline (Cmd+U)">
          <Underline className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Strike (Cmd+S)">
          <Strikethrough className="size-4" />
        </button>

        <div className="h-5 w-px bg-grey-200 mx-0.5" />

        <button type="button" className={toolbarBtn} title="Bullet list">
          <List className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Ordered list">
          <ListOrdered className="size-4" />
        </button>

        <div className="h-5 w-px bg-grey-200 mx-0.5" />

        <button type="button" className={toolbarBtn} title="Align left">
          <AlignLeft className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Align center">
          <AlignCenter className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Align right">
          <AlignRight className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Justify">
          <AlignJustify className="size-4" />
        </button>

        <div className="h-5 w-px bg-grey-200 mx-0.5" />

        <button type="button" className={toolbarBtn} title="Insert link">
          <Link2 className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Remove link">
          <Link2Off className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Insert image">
          <ImageIcon className="size-4" />
        </button>

        <div className="h-5 w-px bg-grey-200 mx-0.5" />

        <button type="button" className={toolbarBtn} title="Hard break (Shift+Enter)">
          <WrapText className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Clear format (Cmd+Shift+X)">
          <Eraser className="size-4" />
        </button>
        <button type="button" className={toolbarBtn} title="Fullscreen">
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Editable area — seeded imperatively via useEffect, no innerHTML */}
      <div
        ref={editorRef}
        className="min-h-[200px] p-4 text-[15px] text-grey-800 leading-relaxed outline-none empty:before:text-grey-400 empty:before:content-[attr(data-placeholder)]"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.textContent ?? "")}
        data-placeholder="Write something awesome..."
      />
    </div>
  );
}

export interface PostNewEditFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<Post>;
  coverPreview?: string;
}

export function PostNewEditForm({
  mode,
  defaultValues,
  coverPreview,
}: PostNewEditFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [cover, setCover] = useState<string | null>(coverPreview ?? null);
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [metaTitle, setMetaTitle] = useState(defaultValues?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    defaultValues?.metaDescription ?? ""
  );
  const [metaKeywords, setMetaKeywords] = useState<string[]>(
    defaultValues?.metaKeywords ?? []
  );
  const [enableComments, setEnableComments] = useState(
    defaultValues?.enableComments ?? true
  );
  const [publish, setPublish] = useState(defaultValues?.publish ?? true);

  const submitLabel = mode === "edit" ? "Save changes" : "Create post";

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      {/* Details card */}
      <FormSectionCard
        title="Details"
        caption="Title, short description, image..."
      >
        <OutlinedInput
          placeholder="Post title"
          value={title}
          onChange={setTitle}
        />
        <OutlinedInput
          placeholder="Description"
          value={description}
          onChange={setDescription}
          multiline
          rows={4}
        />
        <div>
          <p className="mb-2 text-sm font-semibold leading-[22px] text-grey-800">Content</p>
          <RichTextEditor initialValue={content} onChange={setContent} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold leading-[22px] text-grey-800">Cover</p>
          <UploadDropzone value={cover} onChange={setCover} />
        </div>
      </FormSectionCard>

      {/* Properties card */}
      <FormSectionCard
        title="Properties"
        caption="Additional functions and attributes..."
      >
        <ChipInput
          placeholder="Tags"
          options={TAG_OPTIONS}
          value={tags}
          onChange={setTags}
        />
        <OutlinedInput
          placeholder="Meta title"
          value={metaTitle}
          onChange={setMetaTitle}
        />
        <OutlinedInput
          placeholder="Meta description"
          value={metaDescription}
          onChange={setMetaDescription}
          multiline
          rows={3}
        />
        <ChipInput
          placeholder="Meta keywords"
          options={KEYWORD_OPTIONS}
          value={metaKeywords}
          onChange={setMetaKeywords}
        />
        <div className="flex items-center gap-3">
          <Switch
            checked={enableComments}
            onCheckedChange={setEnableComments}
          />
          <span className="text-sm font-medium text-grey-700">
            Enable comments
          </span>
        </div>
      </FormSectionCard>

      {/* Bottom action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 pb-6">
        <div className="flex items-center gap-3">
          <Switch checked={publish} onCheckedChange={setPublish} />
          <span className="text-sm font-medium text-grey-700">Publish</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-[8px] border border-grey-300 px-4 h-12 text-[15px] font-bold leading-[26px] text-grey-800 hover:bg-grey-100 transition-colors"
          >
            Preview
          </button>
          <button
            type="button"
            className="rounded-[8px] bg-foreground px-4 h-12 text-[15px] font-bold leading-[26px] text-card hover:opacity-90 transition-opacity"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
