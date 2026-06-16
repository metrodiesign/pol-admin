"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  src?: string;
  alt?: string;
  size?: number;
  onFileSelect?: (file: File) => void;
}

export function AvatarUpload({
  src,
  alt = "Avatar",
  size = 126,
  onFileSelect,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect?.(file);
  }

  const imageSrc = preview || src;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative overflow-hidden rounded-full border-2 border-dashed border-[rgba(145,158,171,0.2)] p-1 transition-colors hover:border-[rgba(145,158,171,0.32)]"
        style={{ width: size + 8, height: size + 8 }}
      >
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={alt}
              width={size}
              height={size}
              className="rounded-full object-cover"
              style={{ width: size, height: size }}
            />
            <div className="absolute inset-1 flex flex-col items-center justify-center gap-1 rounded-full bg-black/48 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6 text-white" />
              <span className="text-xs text-white">Update photo</span>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-1 rounded-full"
            style={{ width: size, height: size }}
          >
            <Camera className="size-8 text-grey-400 transition-colors group-hover:text-grey-600" />
            <span className="text-xs font-semibold text-grey-500">Upload photo</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpeg,.jpg,.png,.gif"
        className="hidden"
        onChange={handleChange}
      />
      <p className="mt-4 text-center text-xs leading-relaxed text-grey-500">
        Allowed *.jpeg, *.jpg, *.png, *.gif
        <br />
        max size of 3 Mb
      </p>
    </div>
  );
}
