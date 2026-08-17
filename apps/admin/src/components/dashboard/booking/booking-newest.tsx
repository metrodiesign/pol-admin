"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoreVertical, Users, Moon } from "lucide-react";
import { newestBookings, type NewestBooking } from "@/lib/mock/booking";

const VISIBLE = 4;

function BookingCard({ booking }: { booking: NewestBooking }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-grey-200 bg-white flex flex-col" style={{ minWidth: 0 }}>
      {/* Card header: avatar + name + date + kebab */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <Image
          src={booking.avatar}
          alt={booking.name}
          width={36}
          height={36}
          className="size-9 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-grey-800 truncate">{booking.name}</p>
          <p className="text-xs text-grey-500">{booking.bookedAt}</p>
        </div>
        <button
          type="button"
          className="shrink-0 flex size-7 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      {/* Cover image */}
      <div className="relative mx-3 overflow-hidden rounded-xl" style={{ height: 160 }}>
        <Image
          src={booking.coverImage}
          alt={`Tour by ${booking.name}`}
          fill
          className="object-cover"
        />
        {/* Hot / price badge at bottom */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          {booking.isHot && (
            <span className="flex items-center gap-1 rounded-full bg-grey-800/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
              🔥 {booking.price}
            </span>
          )}
          {!booking.isHot && (
            <span className="rounded-full bg-grey-800/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
              {booking.price}
            </span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3 text-xs text-grey-500">
          <span className="flex items-center gap-1">
            <Moon className="size-3.5" />
            {booking.duration}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-grey-500">
          <Users className="size-3.5" />
          {booking.guests}
        </div>
      </div>
    </div>
  );
}

export function BookingNewest() {
  const [startIndex, setStartIndex] = useState(0);
  const total = newestBookings.length;
  const maxStart = Math.max(0, total - VISIBLE);

  const prev = () => setStartIndex((i) => Math.max(0, i - 1));
  const next = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  const visible = newestBookings.slice(startIndex, startIndex + VISIBLE);

  return (
    <div className="dashboard-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h6 className="text-lg font-semibold text-grey-800">Newest booking</h6>
          <p className="text-sm text-grey-500">{total} bookings</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            disabled={startIndex === 0}
            className="flex size-8 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-32"
            aria-label="Previous bookings"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={startIndex >= maxStart}
            className="flex size-8 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-32"
            aria-label="Next bookings"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mmd:grid-cols-4">
        {visible.map((booking) => (
          <BookingCard key={`${booking.name}-${booking.bookedAt}`} booking={booking} />
        ))}
      </div>
    </div>
  );
}
