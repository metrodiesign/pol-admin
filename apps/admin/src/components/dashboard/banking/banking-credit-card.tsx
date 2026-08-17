"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  Wifi,
} from "lucide-react";
import { creditCards } from "@/lib/mock/banking";
import { cn } from "@/lib/utils";

const TRANSITION = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";

const CARD_BACKGROUND =
  "linear-gradient(135deg, rgba(20,26,33,0.64) 0%, rgba(0,75,80,0.48) 100%), url('https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/background/background-4.webp')";

export function BankingCreditCard() {
  const count = creditCards.length;
  // Clone last card before, first card after, for a seamless infinite loop.
  const first = creditCards[0];
  const last = creditCards[count - 1];
  const display =
    count > 1 && first && last ? [last, ...creditCards, first] : creditCards;

  // `pos` indexes `display`; real cards occupy 1..count (pos 0 / count+1 are clones).
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const widthRef = useRef(1);
  const draggingRef = useRef(false);
  // Locks navigation while a transition is in flight, so `pos` can only ever
  // move one step from a real card — never overshooting the clone range.
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

  // Keep the eye / more buttons from starting a drag (and from being swallowed
  // by the track's pointer capture).
  const stopDrag = (e: React.PointerEvent<HTMLElement>) => e.stopPropagation();

  return (
    <div>
      {/* Sliding viewport */}
      <div className="relative min-h-[220px] overflow-hidden rounded-card">
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
          {display.map((card, i) => (
            <div
              key={i}
              className="relative h-full w-full shrink-0 select-none overflow-hidden p-6 text-white"
              style={{
                backgroundImage: CARD_BACKGROUND,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/64">Current balance</p>
                  <p
                    className="mt-1.5 text-2xl font-bold"
                    style={{ fontFamily: "var(--font-barlow, var(--font-sans))" }}
                  >
                    {card.balance}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onPointerDown={stopDrag}
                    onClick={() => setVisible((v) => !v)}
                    className="flex size-8 items-center justify-center rounded-full text-white/72 transition-colors hover:bg-white/12"
                    aria-label="Toggle card number visibility"
                  >
                    {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onPointerDown={stopDrag}
                    className="flex size-8 items-center justify-center rounded-full text-white/72 transition-colors hover:bg-white/12"
                    aria-label="More options"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              </div>

              {/* Card number */}
              <div className="mt-8">
                <p className="font-mono text-sm tracking-widest text-white/80">
                  {visible ? card.maskedNumber : "•••• •••• •••• ••••"}
                </p>
              </div>

              {/* Bottom row */}
              <div className="mt-6 flex items-end justify-between">
                <div className="flex gap-6 text-xs text-white/64">
                  <div>
                    <p className="uppercase tracking-wide">Card holder</p>
                    <p className="mt-1 text-sm font-semibold text-white">{card.cardHolder}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide">Expiration date</p>
                    <p className="mt-1 text-sm font-semibold text-white">{card.expiration}</p>
                  </div>
                </div>

                {/* Mastercard-style mark */}
                <div className="flex shrink-0">
                  <div className="size-8 rounded-full bg-red-500/72 -mr-3" />
                  <div className="size-8 rounded-full bg-yellow-400/72" />
                </div>
              </div>

              {/* Wifi / NFC icon */}
              <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-40">
                <Wifi className="size-16 rotate-90 text-white" />
              </div>

              {/* Decorative circles */}
              <div className="pointer-events-none absolute -left-8 -top-8 size-[160px] rounded-full bg-white/6" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 size-[160px] rounded-full bg-white/6" />
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
      </div>

      {/* Dot pagination */}
      <div className="mt-4 flex justify-center gap-1.5">
        {creditCards.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Card ${i + 1}`}
            onClick={() => step(i + 1 - pos)}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              i === activeDot ? "w-5 bg-grey-800" : "w-2 bg-grey-400",
            )}
          />
        ))}
      </div>
    </div>
  );
}
