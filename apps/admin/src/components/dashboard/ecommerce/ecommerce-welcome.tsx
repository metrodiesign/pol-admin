"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ecommerceWelcomeSlides } from "@/lib/mock/ecommerce";
import { cn } from "@/lib/utils";

const TRANSITION = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";

const BANNER_BACKGROUND =
  "linear-gradient(to right, rgb(20,26,33) 25%, rgba(0,75,80,0.88)), url('/background-6.webp')";

export function EcommerceWelcome() {
  const count = ecommerceWelcomeSlides.length;
  // Clone last slide before, first slide after, for a seamless infinite loop.
  const first = ecommerceWelcomeSlides[0];
  const last = ecommerceWelcomeSlides[count - 1];
  const display =
    count > 1 && first && last
      ? [last, ...ecommerceWelcomeSlides, first]
      : ecommerceWelcomeSlides;

  // `pos` indexes `display`; real slides occupy 1..count (pos 0 / count+1 are clones).
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const widthRef = useRef(1);
  const draggingRef = useRef(false);
  // Locks navigation while a transition is in flight, so `pos` can only ever
  // move one step from a real slide — never overshooting the clone range.
  const animatingRef = useRef(false);

  const activeDot = count > 1 ? (((pos - 1) % count) + count) % count : 0;

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

  const stopDrag = (e: React.PointerEvent<HTMLElement>) => e.stopPropagation();

  return (
    <div className="relative h-full overflow-hidden rounded-card">
      {/* Sliding track — adaptive height, slides set the height */}
      <div
        ref={trackRef}
        className={cn(
          "flex h-full touch-pan-y",
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
          <div
            key={i}
            className="relative flex min-h-[288px] w-full shrink-0 select-none items-center px-6 py-10 text-white sm:pl-10 sm:pr-6"
            style={{
              backgroundImage: BANNER_BACKGROUND,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 max-w-sm">
              <h4 className="text-2xl font-bold leading-9">
                {slide.title}
                {slide.highlight && (
                  <>
                    <br />
                    {slide.highlight}
                  </>
                )}
              </h4>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {slide.subtitle}
              </p>
              <button
                type="button"
                onPointerDown={stopDrag}
                className="mt-6 rounded-control bg-[#00A76F] px-3 py-1.5 text-sm font-bold leading-6 text-white transition-colors hover:bg-[#007867]"
              >
                {slide.cta}
              </button>
            </div>
            <Image
              src="/character-present.webp"
              alt=""
              width={240}
              height={240}
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute bottom-0 right-4 block w-[140px] object-contain sm:w-[180px] lg:w-[220px]"
            />
          </div>
        ))}
      </div>

      {/* Prev / next arrows */}
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Prev button"
        className="absolute right-14 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next button"
        className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
        {ecommerceWelcomeSlides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`dot-${i}`}
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
