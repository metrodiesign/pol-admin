"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productSlides } from "@/lib/mock/ecommerce";
import { cn } from "@/lib/utils";

const TRANSITION = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";

export function ProductCarousel() {
  const count = productSlides.length;
  // Clone last slide before, first slide after, for a seamless infinite loop.
  const first = productSlides[0];
  const last = productSlides[count - 1];
  const display =
    count > 1 && first && last ? [last, ...productSlides, first] : productSlides;

  // `pos` indexes `display`; real slides occupy 1..count (pos 0 / count+1 are clones).
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const widthRef = useRef(1);
  const draggingRef = useRef(false);
  // Locks navigation while a slide transition is in flight, so `pos` can only
  // ever move one step from a real slide — never overshooting the clone range.
  const animatingRef = useRef(false);

  const activeDot = count > 1 ? ((pos - 1) % count + count) % count : 0;

  // Instantly reposition onto the real twin of a clone, then unlock.
  const settle = (real: number) => {
    setAnimate(false);
    setPos(real);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        animatingRef.current = false;
      }),
    );
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (pos === 0) settle(count);
    else if (pos === count + 1) settle(1);
    else animatingRef.current = false;
  };

  const step = (delta: number) => {
    if (delta === 0 || count <= 1 || animatingRef.current || draggingRef.current) return;
    animatingRef.current = true;
    setAnimate(true);
    setPos((p) => p + delta);
  };

  // Autoplay (skipped while dragging or mid-transition).
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      if (!draggingRef.current && !animatingRef.current) {
        animatingRef.current = true;
        setAnimate(true);
        setPos((p) => p + 1);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [count]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1 || animatingRef.current) return;
    draggingRef.current = true;
    setDragging(true);
    setAnimate(false);
    startX.current = e.clientX;
    widthRef.current = trackRef.current?.clientWidth ?? 1;
    try {
      trackRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture unsupported / invalid pointer */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setDragPx(e.clientX - startX.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const dx = e.clientX - startX.current;
    const threshold = widthRef.current * 0.2;
    setAnimate(true);
    setDragPx(0);
    if (Math.abs(dx) >= threshold) {
      animatingRef.current = true;
      setPos((p) => (dx < 0 ? p + 1 : p - 1));
    }
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  return (
    <div className="relative h-full min-h-[280px] overflow-hidden rounded-card bg-grey-900">
      {/* Sliding track */}
      <div
        ref={trackRef}
        className={cn(
          "absolute inset-0 flex touch-pan-y",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{
          transform: `translateX(calc(${-pos * 100}% + ${dragPx}px))`,
          transition: dragging || !animate ? "none" : TRANSITION,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTransitionEnd={handleTransitionEnd}
      >
        {display.map((slide, i) => (
          <div key={i} className="relative h-full w-full shrink-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="select-none object-cover"
              draggable={false}
              priority={i === 1}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
              <span className="inline-block rounded-md bg-[#00A76F] px-2 py-0.5 text-xs font-bold uppercase text-white">
                {slide.label}
              </span>
              <p className="mt-2 line-clamp-2 max-w-xs text-lg font-semibold text-white">
                {slide.title}
              </p>
              <button
                type="button"
                className="pointer-events-auto mt-3 rounded-control bg-[#00A76F] px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#007867]"
              >
                Buy now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / next arrows */}
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Prev button"
        className="absolute left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next button"
        className="absolute right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-6 z-10 flex items-center gap-1.5">
        {productSlides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => step(i + 1 - pos)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === activeDot ? "w-5 bg-white" : "w-2 bg-white/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
