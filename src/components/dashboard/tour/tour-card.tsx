"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Calendar, Users, EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react";
import type { Tour } from "@/types/tour";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TourCardProps {
  tour: Tour;
  onDelete?: (id: string) => void;
}

export function TourCard({ tour, onDelete }: TourCardProps) {
  // Shorten date range: "06 Jun 2026" + "07 Jun 2026" → "06 - 07 Jun 2026"
  function formatDateRange(start: string, end: string): string {
    if (start === end) return start;
    const [sDay, sMon, sYr] = start.split(" ");
    const [eDay, eMon, eYr] = end.split(" ");
    if (sDay && sMon && sYr && eDay && eMon && eYr && sYr === eYr && sMon === eMon) {
      return `${sDay} - ${eDay} ${sMon} ${sYr}`;
    }
    return `${start} - ${end}`;
  }
  const dateRange = formatDateRange(tour.startDate, tour.endDate);

  // Collage uses the first three gallery images (big + two stacked thumbs)
  const [big, thumbA, thumbB] = [
    tour.images[0] ?? tour.heroImage,
    tour.images[1] ?? tour.heroImage,
    tour.images[2] ?? tour.heroImage,
  ];

  return (
    <div
      className="overflow-hidden rounded-card bg-card transition-shadow hover:shadow-z20"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* Image collage — big left + two stacked thumbs right, inset 8px / gap 4px */}
      <div className="flex gap-1 p-2">
        {/* Big image with price + rating overlays */}
        <div className="relative h-[164px] flex-1 overflow-hidden rounded-control bg-grey-200">
          <Image
            src={big}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
          {/* Price chip — top left (fixed dark, not theme-flipped) */}
          <span className="absolute left-2 top-2 rounded-control bg-grey-800 px-1.5 py-0.5 text-sm font-semibold text-white">
            ${tour.price.toFixed(2)}
          </span>
          {/* Rating chip — top right */}
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-control bg-warning-lighter px-1.5 py-0.5 text-sm font-semibold text-grey-900">
            <Star className="size-3.5 fill-warning text-warning" />
            {tour.rating}
          </span>
        </div>

        {/* Right column — two stacked thumbnails */}
        <div className="flex h-[164px] w-20 shrink-0 flex-col gap-1">
          <div className="relative flex-1 overflow-hidden rounded-control bg-grey-200">
            <Image src={thumbA} alt={`${tour.title} 2`} fill sizes="80px" className="object-cover" />
          </div>
          <div className="relative flex-1 overflow-hidden rounded-control bg-grey-200">
            <Image src={thumbB} alt={`${tour.title} 3`} fill sizes="80px" className="object-cover" />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="relative px-5 pb-4 pt-5">
        {/* Posted date caption */}
        <p className="text-xs text-grey-500">Posted date: {tour.postedAt}</p>

        {/* Title */}
        <Link
          href={`/dashboard/tour/details?id=${tour.id}`}
          className="mt-1.5 block truncate text-base font-semibold text-grey-800 hover:underline"
          title={tour.title}
        >
          {tour.title}
        </Link>

        {/* Meta rows — colored icons */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm text-grey-800">
            <MapPin className="size-5 shrink-0 text-error" />
            {tour.country}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-grey-800">
            <Calendar className="size-5 shrink-0 text-info" />
            {dateRange}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-grey-800">
            <Users className="size-5 shrink-0 text-primary" />
            {tour.bookedCount} Booked
          </div>
        </div>

        {/* 3-dot menu — bottom right */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="absolute bottom-4 right-3 flex size-9 items-center justify-center rounded-full text-grey-600 hover:bg-grey-100 transition-colors outline-none"
            aria-label="More actions"
          >
            <EllipsisVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-36">
            <DropdownMenuItem>
              <Link
                href={`/dashboard/tour/details?id=${tour.id}`}
                className="flex w-full items-center gap-2"
              >
                <Eye className="size-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/tour/edit?id=${tour.id}`}
                className="flex w-full items-center gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete?.(tour.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
