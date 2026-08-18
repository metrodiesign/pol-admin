"use client";

import { useState, useRef, useId } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Link,
  Unlink,
  ImageIcon,
  WrapText,
  RemoveFormatting,
  Maximize2,
  Upload,
  X,
} from "lucide-react";
import type { Tour, TourGuide } from "@/types/tour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TOUR_DESTINATIONS, TOUR_GUIDES } from "@/lib/mock/tour";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";

const SERVICES_COL_A = [
  "Audio guide",
  "Lunch",
  "Special activities",
  "Gratuities",
  "Professional guide",
];
const SERVICES_COL_B = [
  "Food and drinks",
  "Private tour",
  "Entrance fees",
  "Pick-up and drop off",
  "Transport by air-conditioned",
];

interface TourFormProps {
  mode: "create" | "edit";
  tour?: Tour;
}

interface FormCardProps {
  title: string;
  caption: string;
  children: React.ReactNode;
}

function FormCard({ title, caption, children }: FormCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="overflow-hidden rounded-card bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <div className="flex items-start justify-between px-6 py-5">
        <div>
          <h2 className="text-base font-bold text-grey-800">{title}</h2>
          <p className="text-sm text-grey-500">{caption}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label={open ? "Collapse section" : "Expand section"}
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
      </div>

      {open && (
        <>
          <div className="h-px w-full bg-border" />
          <div className="px-6 py-5">{children}</div>
        </>
      )}
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Simple contenteditable-based editor (visual approximation)
  const editorRef = useRef<HTMLDivElement>(null);

  const toolbarButtons = [
    { icon: <Bold className="size-4" />, cmd: "bold", title: "Bold" },
    { icon: <Italic className="size-4" />, cmd: "italic", title: "Italic" },
    { icon: <Underline className="size-4" />, cmd: "underline", title: "Underline" },
    { icon: <Strikethrough className="size-4" />, cmd: "strikeThrough", title: "Strike" },
  ];
  const listButtons = [
    { icon: <List className="size-4" />, cmd: "insertUnorderedList", title: "Bullet list" },
    { icon: <ListOrdered className="size-4" />, cmd: "insertOrderedList", title: "Ordered list" },
  ];
  const alignButtons = [
    { icon: <AlignLeft className="size-4" />, cmd: "justifyLeft", title: "Align left" },
    { icon: <AlignCenter className="size-4" />, cmd: "justifyCenter", title: "Align center" },
    { icon: <AlignRight className="size-4" />, cmd: "justifyRight", title: "Align right" },
    { icon: <AlignJustify className="size-4" />, cmd: "justifyFull", title: "Justify" },
  ];

  function execCmd(cmd: string) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  }

  return (
    <div className="overflow-hidden rounded-control border border-[var(--divider)] focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-grey-200 px-2 py-1.5">
        {/* Format select */}
        <Select defaultValue="Paragraph">
          <SelectTrigger
            aria-label="Text format"
            className="mr-1 h-8 w-auto gap-1 border-none px-2 text-sm font-medium text-grey-800"
          >
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paragraph">Paragraph</SelectItem>
            <SelectItem value="Heading 1">Heading 1</SelectItem>
            <SelectItem value="Heading 2">Heading 2</SelectItem>
            <SelectItem value="Heading 3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        {toolbarButtons.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd); }}
            className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors"
          >
            {btn.icon}
          </button>
        ))}

        {listButtons.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd); }}
            className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors"
          >
            {btn.icon}
          </button>
        ))}

        {alignButtons.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd); }}
            className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors"
          >
            {btn.icon}
          </button>
        ))}

        <button type="button" title="Insert link" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <Link className="size-4" />
        </button>
        <button type="button" title="Remove link" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <Unlink className="size-4" />
        </button>
        <button type="button" title="Insert image" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <ImageIcon className="size-4" />
        </button>

        {/* Second row items */}
        <button type="button" title="Hard break" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <WrapText className="size-4" />
        </button>
        <button type="button" title="Clear formatting" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <RemoveFormatting className="size-4" />
        </button>
        <button type="button" title="Fullscreen" className="flex size-7 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors">
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[200px] px-4 py-3 text-sm text-grey-800 outline-none"
        data-placeholder="Write something awesome..."
        aria-label="Content editor"
        style={{
          lineHeight: 1.75,
        }}
      />
    </div>
  );
}

interface ImageDropzoneProps {
  existingImages?: string[];
  onExistingRemove?: (idx: number) => void;
  onRemoveAll?: () => void;
}

function ImageDropzone({ existingImages = [], onExistingRemove, onRemoveAll }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        className={`flex flex-col items-center justify-center rounded-card border-2 border-dashed bg-grey-50 py-10 transition-colors ${
          isDragging ? "border-grey-500 bg-grey-100" : "border-grey-300"
        }`}
      >
        {/* Folder + files illustration */}
        <div className="mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Back folder */}
            <path d="M14 36C14 29.373 19.373 24 26 24H50L58 32H94C100.627 32 106 37.373 106 44V88C106 94.627 100.627 100 94 100H26C19.373 100 14 94.627 14 88V36Z" fill="#00A76F" fillOpacity="0.12"/>
            {/* Folder tab */}
            <path d="M14 44C14 37.373 19.373 32 26 32H94C100.627 32 106 37.373 106 44V88C106 94.627 100.627 100 94 100H26C19.373 100 14 94.627 14 88V44Z" fill="#00A76F" fillOpacity="0.24"/>
            {/* Document 1 (white, slightly rotated left) */}
            <rect x="28" y="50" width="26" height="34" rx="4" fill="white" stroke="#DFE3E8" strokeWidth="1.5" transform="rotate(-8 28 50)"/>
            <rect x="32" y="57" width="16" height="2.5" rx="1.25" fill="#00A76F" fillOpacity="0.4" transform="rotate(-8 32 57)"/>
            <rect x="32" y="63" width="12" height="2.5" rx="1.25" fill="#DFE3E8" transform="rotate(-8 32 63)"/>
            <rect x="32" y="68" width="14" height="2.5" rx="1.25" fill="#DFE3E8" transform="rotate(-8 32 68)"/>
            {/* Document 2 (white, slightly rotated right) */}
            <rect x="62" y="50" width="26" height="34" rx="4" fill="white" stroke="#DFE3E8" strokeWidth="1.5" transform="rotate(8 62 50)"/>
            <rect x="66" y="57" width="16" height="2.5" rx="1.25" fill="#FFAB00" fillOpacity="0.5" transform="rotate(8 66 57)"/>
            <rect x="66" y="63" width="12" height="2.5" rx="1.25" fill="#DFE3E8" transform="rotate(8 66 63)"/>
            <rect x="66" y="68" width="14" height="2.5" rx="1.25" fill="#DFE3E8" transform="rotate(8 66 68)"/>
            {/* Upload arrow in center */}
            <circle cx="60" cy="68" r="14" fill="#00A76F" fillOpacity="0.16"/>
            <path d="M60 75V61M60 61L55 66M60 61L65 66" stroke="#00A76F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Decorative dots */}
            <circle cx="96" cy="38" r="4" fill="#FFAB00" fillOpacity="0.6"/>
            <circle cx="108" cy="52" r="3" fill="#00A76F" fillOpacity="0.4"/>
            <circle cx="20" cy="54" r="3" fill="#FF5630" fillOpacity="0.4"/>
            <circle cx="14" cy="38" r="4" fill="#2196F3" fillOpacity="0.4"/>
          </svg>
        </div>
        <p className="text-base font-bold text-grey-800">Drop or select files</p>
        <p className="mt-1 text-sm text-grey-500">
          Drag files here, or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-grey-800 underline hover:text-grey-900"
          >
            browse
          </button>{" "}
          your device.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          aria-label="Choose files"
        />
      </div>

      {/* Existing images thumbnails (edit mode) */}
      {existingImages.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, i) => (
              <div key={i} className="group relative size-20 overflow-hidden rounded-[10px] border border-grey-200">
                <Image
                  src={img}
                  alt={`Upload ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => onExistingRemove?.(i)}
                  className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-grey-800/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Thumbnail actions */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onRemoveAll}
              className="text-sm text-grey-600 hover:text-grey-800 transition-colors"
            >
              Remove All
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-control bg-foreground px-2.5 py-1 text-xs leading-[22px] font-bold text-card hover:opacity-90 transition-opacity"
            >
              <Upload className="size-4" />
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TourForm({ mode, tour }: TourFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const nameId = useId();
  const durationId = useId();
  const destinationId = useId();

  const [name, setName] = useState(isEdit && tour ? tour.title : "");
  const [content, setContent] = useState(
    isEdit && tour
      ? `<h6>Description</h6><p>${tour.description}</p><h6>Highlights</h6><ul>${tour.highlights.map((h) => `<li>${h}</li>`).join("")}</ul><h6>Program</h6>${tour.program.map((p) => `<p><strong>${p.heading}</strong></p><p>${p.body}</p>`).join("")}`
      : ""
  );
  const [duration, setDuration] = useState(isEdit && tour ? tour.duration : "");
  const [destination, setDestination] = useState(
    isEdit && tour ? tour.destination : ""
  );
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(isEdit && tour ? tour.services : [])
  );
  const [selectedGuides, setSelectedGuides] = useState<TourGuide[]>(
    isEdit && tour ? tour.guides.slice(0, 1) : []
  );
  const [startDate, setStartDate] = useState(isEdit && tour ? "06/06/2026" : "");
  const [endDate, setEndDate] = useState(isEdit && tour ? "06/07/2026" : "");
  const [tags, setTags] = useState<string[]>(
    isEdit && tour ? tour.tags : []
  );
  const [tagInput, setTagInput] = useState("");
  const [publish, setPublish] = useState(isEdit && tour ? tour.publish : true);
  const [existingImages, setExistingImages] = useState<string[]>(
    isEdit && tour ? tour.images : []
  );

  function toggleService(s: string) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function addTag(tag: string) {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function removeGuide(id: string) {
    setSelectedGuides((prev) => prev.filter((g) => g.id !== id));
  }

  function addGuide(guide: TourGuide) {
    if (!selectedGuides.find((g) => g.id === guide.id)) {
      setSelectedGuides((prev) => [...prev, guide]);
    }
  }

  function handleRemoveImage(idx: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/minimals/tour/list");
  }

  const breadcrumbs = isEdit
    ? [
        { name: "Dashboard", href: "/minimals" },
        { name: "Tour", href: "/minimals/tour/list" },
        { name: tour?.title ?? "Edit" },
      ]
    : [
        { name: "Dashboard", href: "/minimals" },
        { name: "Tour", href: "/minimals/tour/list" },
        { name: "Create" },
      ];

  return (
    <div className="w-full pt-2">
      {/* Page Header */}
      <CustomBreadcrumbs
        heading={isEdit ? "Edit" : "Create a new tour"}
        links={breadcrumbs}
        className="mb-6"
      />

      <form onSubmit={handleSubmit}>
        {/* Centered form column */}
        <div className="mx-auto w-full max-w-[720px] space-y-4">
          {/* Card 1: Details */}
          <FormCard
            title="Details"
            caption="Title, short description, image..."
          >
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label
                  id={nameId}
                  className="mb-1.5 block text-sm font-semibold text-grey-800"
                >
                  Name
                </label>
                <input
                  aria-labelledby={nameId}
                  type="text"
                  placeholder="Ex: Adventure seekers expedition..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-control border border-[var(--divider)] h-14 px-3.5 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Content
                </label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>

              {/* Images */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Images
                </label>
                <ImageDropzone
                  existingImages={isEdit ? existingImages : []}
                  onExistingRemove={handleRemoveImage}
                  onRemoveAll={() => setExistingImages([])}
                />
              </div>
            </div>
          </FormCard>

          {/* Card 2: Properties */}
          <FormCard
            title="Properties"
            caption="Additional functions and attributes..."
          >
            <div className="space-y-5">
              {/* Tour guide */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Tour guide
                </label>
                <div className="rounded-control border border-[var(--divider)] px-3 py-2 focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGuides.map((guide) => (
                      <span
                        key={guide.id}
                        className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-[rgba(145,158,171,0.16)] py-0.5 pl-1 pr-2 text-xs font-normal text-grey-800"
                      >
                        <span className="relative size-5 overflow-hidden rounded-full bg-grey-200 shrink-0">
                          <Image
                            src={guide.avatarUrl}
                            alt={guide.name}
                            fill
                            sizes="20px"
                            className="object-cover"
                          />
                        </span>
                        {guide.name}
                        <button
                          type="button"
                          onClick={() => removeGuide(guide.id)}
                          className="ml-0.5 text-grey-400 hover:text-grey-600"
                          aria-label={`Remove ${guide.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      aria-label="Tour guide"
                      placeholder={selectedGuides.length === 0 ? "+ Tour guides" : ""}
                      className="min-w-[120px] flex-1 bg-transparent text-sm text-grey-800 outline-none placeholder:text-grey-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          // Find a matching guide
                          const val = (e.target as HTMLInputElement).value.toLowerCase();
                          const guide = TOUR_GUIDES.find((g) =>
                            g.name.toLowerCase().includes(val)
                          );
                          if (guide) addGuide(guide);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <ChevronDown className="size-4 shrink-0 text-grey-400" />
                  </div>
                </div>
              </div>

              {/* Available: Start + End date */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Available
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="text"
                      aria-label="Start date"
                      placeholder="Start date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-control border border-[var(--divider)] h-14 px-3.5 pr-10 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400"
                      aria-label="Choose start date"
                    >
                      <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      aria-label="End date"
                      placeholder="End date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-control border border-[var(--divider)] h-14 px-3.5 pr-10 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400"
                      aria-label="Choose end date"
                    >
                      <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label
                  id={durationId}
                  className="mb-1.5 block text-sm font-semibold text-grey-800"
                >
                  Duration
                </label>
                <input
                  aria-labelledby={durationId}
                  type="text"
                  placeholder="Ex: 2 days, 4 days 3 nights..."
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-control border border-[var(--divider)] h-14 px-3.5 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                />
              </div>

              {/* Destination */}
              <div>
                <label
                  id={destinationId}
                  className="mb-1.5 block text-sm font-semibold text-grey-800"
                >
                  Destination
                </label>
                <Select
                  value={destination}
                  onValueChange={(v) => setDestination(v ?? "")}
                >
                  <SelectTrigger
                    aria-labelledby={destinationId}
                    className="w-full h-14 text-sm text-grey-800"
                  >
                    <SelectValue placeholder="+ Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOUR_DESTINATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Services */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Services
                </label>
                <div className="grid grid-cols-2 gap-y-2">
                  {[SERVICES_COL_A, SERVICES_COL_B].map((col, ci) => (
                    <div key={ci} className="space-y-2">
                      {col.map((service) => (
                        <label
                          key={service}
                          className="flex cursor-pointer items-center gap-2 text-sm text-grey-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.has(service)}
                            onChange={() => toggleService(service)}
                            className="size-4 rounded border-grey-400 accent-primary"
                          />
                          {service}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-grey-800">
                  Tags
                </label>
                <div className="rounded-control border border-[var(--divider)] px-3 py-2 focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-primary px-2 py-0.5 text-xs font-semibold text-primary-dark"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary-dark hover:text-primary"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      aria-label="Tags"
                      placeholder={tags.length === 0 ? "+ Tags" : ""}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      className="min-w-[80px] flex-1 bg-transparent text-sm text-grey-800 outline-none placeholder:text-grey-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          {/* Footer */}
          <div className="flex items-center justify-between py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-grey-700">
              <Switch
                checked={publish}
                onCheckedChange={setPublish}
                aria-label="Publish tour"
              />
              Publish
            </label>
            <button
              type="submit"
              className="h-12 rounded-control bg-foreground px-4 text-sm font-bold text-card hover:opacity-90 transition-opacity"
            >
              {isEdit ? "Save changes" : "Create tour"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
