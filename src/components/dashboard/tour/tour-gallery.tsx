"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface TourGalleryProps {
  images: string[];
  title: string;
}

export function TourGallery({ images, title }: TourGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [hero, ...thumbs] = images;
  const displayThumbs = thumbs.slice(0, 4);

  return (
    <>
      {/* Gallery grid — desktop: hero left (2/3) + 2x2 thumbs right (1/3) */}
      <div className="hidden sm:flex gap-2 overflow-hidden rounded-card h-[400px]">
        {/* Large hero image */}
        <button
          type="button"
          className="relative block flex-[2] cursor-zoom-in overflow-hidden rounded-card"
          onClick={() => setLightbox(hero ?? null)}
          aria-label={`View ${title} hero image`}
        >
          {hero && (
            <Image
              src={hero}
              alt={title}
              fill
              sizes="(max-width: 900px) 60vw, 50vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          )}
        </button>

        {/* 2x2 thumbnail grid */}
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-2">
          {displayThumbs.map((img, i) => (
            <button
              key={i}
              type="button"
              className="relative block w-full cursor-zoom-in overflow-hidden rounded-card"
              onClick={() => setLightbox(img)}
              aria-label={`View image ${i + 2}`}
            >
              <Image
                src={img}
                alt={`${title} ${i + 2}`}
                fill
                sizes="(max-width: 900px) 20vw, 15vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile stacked layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        {hero && (
          <button
            type="button"
            className="relative block w-full overflow-hidden rounded-card cursor-zoom-in"
            style={{ height: 240 }}
            onClick={() => setLightbox(hero)}
            aria-label={`View ${title} hero image`}
          >
            <Image src={hero} alt={title} fill className="object-cover" sizes="100vw" priority />
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          {displayThumbs.map((img, i) => (
            <button
              key={i}
              type="button"
              className="relative block w-full overflow-hidden rounded-card cursor-zoom-in"
              style={{ height: 120 }}
              onClick={() => setLightbox(img)}
              aria-label={`View image ${i + 2}`}
            >
              <Image src={img} alt={`${title} ${i + 2}`} fill className="object-cover" sizes="50vw" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt="Lightbox"
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
