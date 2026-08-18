"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { welcomeSlides } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const TRANSITION = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";

const BANNER_BACKGROUND =
  "linear-gradient(to right, rgba(20,26,33,0.88) 0%, rgb(20,26,33) 75%), url('/background-5.webp')";

export function WelcomeBanner() {
  const count = welcomeSlides.length;
  // Clone last slide before, first slide after, for a seamless infinite loop.
  const first = welcomeSlides[0];
  const last = welcomeSlides[count - 1];
  const display =
    count > 1 && first && last ? [last, ...welcomeSlides, first] : welcomeSlides;

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
            className="relative flex min-h-[288px] w-full shrink-0 select-none flex-col items-center px-6 py-8 text-center text-white sm:py-10 mmd:block mmd:pl-10 mmd:pr-6 mmd:text-left"
            style={{
              backgroundImage: BANNER_BACKGROUND,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 max-w-[360px]">
              <h4 className="text-2xl font-bold leading-9">
                {slide.title}
                {slide.highlight && (
                  <>
                    <br />
                    {slide.highlight}
                  </>
                )}
              </h4>
              <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-white/70">
                {slide.subtitle}
              </p>
              <button
                type="button"
                onPointerDown={stopDrag}
                className="mt-6 rounded-control px-3 py-1.5 text-sm font-bold leading-6 text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#00A76F" }}
              >
                {slide.cta}
              </button>
            </div>
            <Image
              src="/illustration-motivation.svg"
              alt=""
              width={260}
              height={195}
              unoptimized
              aria-hidden
              draggable={false}
              className="pointer-events-none mt-6 w-[260px] mmd:absolute mmd:bottom-0 mmd:right-4 mmd:mt-0 mmd:w-[200px] lg:w-[260px]"
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
        {welcomeSlides.map((slide, i) => (
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
