"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(images.length - 1, c + 1));

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-grey-100">
        <Image
          src={images[current]!}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Prev / Next */}
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white disabled:opacity-30"
        >
          <ChevronLeft className="size-4 text-grey-700" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={current === images.length - 1}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white disabled:opacity-30"
        >
          <ChevronRight className="size-4 text-grey-700" />
        </button>
        {/* Counter */}
        <span className="absolute bottom-4 right-4 rounded-md bg-grey-800/64 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {current + 1}/{images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Image ${i + 1}`}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-[10px] border-2 transition-colors",
              i === current
                ? "border-grey-800"
                : "border-transparent hover:border-grey-300",
            )}
          >
            <Image
              src={img}
              alt=""
              width={64}
              height={64}
              className="size-16 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
