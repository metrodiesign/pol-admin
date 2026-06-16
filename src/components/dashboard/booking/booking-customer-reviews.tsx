"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { customerReviews } from "@/lib/mock/booking";

export function BookingCustomerReviews() {
  const [index, setIndex] = useState(0);
  const total = customerReviews.length;
  const review = customerReviews[index]!;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  return (
    <div className="dashboard-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h6 className="text-lg font-semibold text-grey-800">Customer reviews</h6>
          <p className="mt-0.5 text-sm text-grey-500">{total} Reviews</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="flex size-8 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-32"
            aria-label="Previous review"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="flex size-8 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-32"
            aria-label="Next review"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Review content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Reviewer */}
        <div className="flex items-center gap-3">
          <Image
            src={review.avatar}
            alt={review.name}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-grey-800">{review.name}</p>
            <p className="text-xs text-grey-500">{review.postedAt}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${i < review.rating ? "fill-warning text-warning" : "fill-grey-300 text-grey-300"}`}
            />
          ))}
        </div>

        {/* Comment */}
        <p className="text-sm text-grey-600 line-clamp-5 leading-relaxed">{review.comment}</p>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-grey-100 px-2.5 py-1 text-xs font-semibold text-grey-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="flex-1 rounded-control border border-grey-300 py-2 text-sm font-semibold text-grey-800 transition-colors hover:bg-grey-100"
          >
            Reject
          </button>
          <button
            type="button"
            className="flex-1 rounded-control bg-grey-800 py-2 text-sm font-semibold text-white transition-colors hover:bg-grey-900"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
