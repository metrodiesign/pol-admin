"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";

interface UploadDropzoneProps {
  initialImages?: string[];
}

export function UploadDropzone({ initialImages = [] }: UploadDropzoneProps) {
  const [previews, setPreviews] = useState<string[]>(initialImages);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function removeAll() {
    setPreviews([]);
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragging
            ? "border-primary bg-primary/8"
            : "border-grey-300 bg-grey-50 hover:border-grey-400 hover:bg-grey-100"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          aria-label="Upload images"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          {/* Upload illustration — bucket with confetti, matching live reference */}
          <div className="mb-1 flex size-20 items-center justify-center">
            <svg
              viewBox="0 0 160 160"
              className="size-20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Confetti dots */}
              <circle cx="32" cy="36" r="5" fill="#FFC107" />
              <circle cx="128" cy="44" r="4" fill="#00B8D9" />
              <circle cx="140" cy="96" r="6" fill="#FF5630" />
              <circle cx="20" cy="100" r="4" fill="#36B37E" />
              <circle cx="112" cy="24" r="3" fill="#FF5630" />
              <circle cx="44" cy="128" r="3" fill="#00B8D9" />
              <circle cx="124" cy="132" r="5" fill="#FFC107" />
              <circle cx="56" cy="20" r="4" fill="#36B37E" />
              {/* Bucket body */}
              <path
                d="M50 72 L56 120 Q56 126 62 126 L98 126 Q104 126 104 120 L110 72 Z"
                fill="#1A9C3E"
              />
              {/* Bucket top rim */}
              <rect x="44" y="64" width="72" height="12" rx="6" fill="#22C55E" />
              {/* Bucket handle */}
              <path
                d="M68 64 Q68 44 80 44 Q92 44 92 64"
                stroke="#22C55E"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Paint drip */}
              <path
                d="M76 126 Q76 136 80 140 Q84 136 84 126"
                fill="#22C55E"
              />
              {/* Shine on bucket */}
              <ellipse cx="68" cy="88" rx="5" ry="10" fill="#36B37E" opacity="0.5" />
            </svg>
          </div>
          <p className="text-sm font-bold text-foreground">
            Drop or select files
          </p>
          <p className="text-sm text-grey-500">
            Drag files here, or{" "}
            <span className="font-semibold text-primary underline">browse</span>{" "}
            your device.
          </p>
        </div>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="group relative size-20 shrink-0 overflow-hidden rounded-xl border border-[var(--divider)] bg-grey-100"
              >
                <Image
                  src={src}
                  alt={`Preview ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute right-0.5 top-0.5 hidden rounded-full bg-grey-800/80 p-0.5 text-white group-hover:flex"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={removeAll}
              className="text-sm font-semibold text-grey-600 transition-colors hover:text-error"
            >
              Remove All
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-grey-800 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-grey-900"
            >
              <Upload className="size-3.5" />
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
