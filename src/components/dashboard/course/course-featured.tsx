"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredCourses } from "@/lib/mock/course";
import { cn } from "@/lib/utils";

const GAP = 24; // px, matches gap-6

/** Returns the number of visible slides for the current viewport width. */
function getVisibleCount(): number {
  if (typeof window === "undefined") return 3;
  // mmd breakpoint = 900px (matches Tailwind mmd in this project)
  if (window.innerWidth >= 900) return 3;
  // sm breakpoint = 600px
  if (window.innerWidth >= 600) return 2;
  return 1;
}

export function CourseFeatured() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const total = featuredCourses.length;
  const maxIndex = Math.max(0, total - visibleCount);

  useEffect(() => {
    function handleResize() {
      const vc = getVisibleCount();
      setVisibleCount(vc);
      // Re-clamp startIndex when viewport shrinks visible count
      setStartIndex((prev) => {
        const clamped = Math.min(prev, Math.max(0, total - vc));
        if (clamped !== prev && trackRef.current) {
          const firstSlide = trackRef.current.firstElementChild as HTMLElement | null;
          if (firstSlide) {
            const slideW = firstSlide.getBoundingClientRect().width;
            trackRef.current.style.transform = `translateX(-${clamped * (slideW + GAP)}px)`;
          }
        }
        return clamped;
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [total]);

  const canPrev = startIndex > 0;
  const canNext = startIndex < maxIndex;

  function slide(delta: number) {
    if (!trackRef.current) return;
    const firstSlide = trackRef.current.firstElementChild as HTMLElement | null;
    if (!firstSlide) return;
    const slideW = firstSlide.getBoundingClientRect().width;
    const step = slideW + GAP;

    setStartIndex((prev) => {
      const next = Math.max(0, Math.min(maxIndex, prev + delta));
      trackRef.current!.style.transform = `translateX(-${next * step}px)`;
      return next;
    });
  }

  return (
    <div>
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <h6 className="text-lg font-semibold text-grey-800">Featured course</h6>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous courses"
            disabled={!canPrev}
            onClick={() => slide(-1)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-grey-300 transition-colors",
              canPrev
                ? "text-grey-700 hover:border-grey-800 hover:bg-grey-200"
                : "cursor-default text-grey-400 opacity-40",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next courses"
            disabled={!canNext}
            onClick={() => slide(1)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-grey-300 transition-colors",
              canNext
                ? "text-grey-700 hover:border-grey-800 hover:bg-grey-200"
                : "cursor-default text-grey-400 opacity-40",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Carousel viewport — overflow hidden, no scrollbar */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 transition-transform duration-300"
        >
          {featuredCourses.map((course) => (
            <div
              key={course.title}
              className="w-full shrink-0 sm:w-[calc((100%-24px)/2)] mmd:w-[calc((100%-48px)/3)] dashboard-card overflow-hidden"
            >
              {/* Cover image */}
              <div className="relative aspect-[4/3] bg-grey-200">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* Card body */}
              <div className="px-4 py-5">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(145,158,171,0.16)] px-1.5 py-0.5 text-xs text-grey-600">
                    <Clock className="size-3.5" />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(145,158,171,0.16)] px-1.5 py-0.5 text-xs text-grey-600">
                    <Users className="size-3.5" />
                    {course.students}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-grey-800">
                  {course.title}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-bold text-grey-800">{course.price}</span>
                    <span className="text-grey-500"> /year</span>
                  </p>
                  <button
                    type="button"
                    className="rounded-control bg-foreground px-2 py-1 text-xs font-bold text-card transition-opacity hover:opacity-90"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
