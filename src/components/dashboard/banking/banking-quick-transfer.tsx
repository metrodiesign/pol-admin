"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { quickTransferContacts } from "@/lib/mock/banking";
import { cn } from "@/lib/utils";

const VISIBLE_COUNT = 4;

export function BankingQuickTransfer() {
  const [amount, setAmount] = useState(200);
  const [offset, setOffset] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const canPrev = offset > 0;
  const canNext = offset + VISIBLE_COUNT < quickTransferContacts.length;
  const visible = quickTransferContacts.slice(offset, offset + VISIBLE_COUNT);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) setAmount(Math.max(0, Math.min(1000, val)));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseInt(e.target.value, 10));
  };

  return (
    <div className="dashboard-card p-6">
      <h6 className="text-lg font-semibold text-grey-800">Quick transfer</h6>

      {/* RECENT label + View all */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-grey-500">Recent</span>
        <button
          type="button"
          className="-mr-3 inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Avatar carousel */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setOffset((o) => o - 1)}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border border-grey-300 text-grey-600 transition-colors",
            canPrev ? "hover:bg-grey-100" : "opacity-32 cursor-not-allowed",
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex flex-1 justify-around">
          {visible.map((c, i) => {
            const absoluteIdx = offset + i;
            const isSelected = selectedIdx === absoluteIdx;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedIdx(isSelected ? null : absoluteIdx)}
                className="flex flex-col items-center gap-1"
                aria-label={c.name}
              >
                <span
                  className={cn(
                    "block rounded-full p-0.5 transition-all",
                    isSelected ? "ring-2 ring-grey-800 ring-offset-1" : "",
                  )}
                >
                  <Image
                    src={c.avatar}
                    alt={c.name}
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover bg-grey-200"
                    unoptimized
                  />
                </span>
                <span className="w-14 truncate text-center text-[10px] font-medium text-grey-600">
                  {c.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => setOffset((o) => o + 1)}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border border-grey-300 text-grey-600 transition-colors",
            canNext ? "hover:bg-grey-100" : "opacity-32 cursor-not-allowed",
          )}
          aria-label="Next"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Insert amount */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-grey-500">
          Insert amount
        </p>
        <div className="mt-3 flex items-center justify-center gap-1">
          <span
            className="text-[2.5rem] font-bold leading-none text-grey-800"
            style={{ fontFamily: "var(--font-barlow, var(--font-sans))" }}
          >
            $
          </span>
          <input
            type="number"
            min={0}
            max={1000}
            value={amount}
            onChange={handleAmountChange}
            className="w-32 bg-transparent text-center text-[2.5rem] font-bold leading-none text-grey-800 outline-none"
            style={{ fontFamily: "var(--font-barlow, var(--font-sans))" }}
            aria-label="Insert amount"
          />
        </div>
      </div>

      {/* Slider */}
      <div className="mt-4 px-1">
        <input
          type="range"
          min={0}
          max={1000}
          step={10}
          value={amount}
          onChange={handleSliderChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-grey-300 accent-grey-800"
          style={{
            background: `linear-gradient(to right, #1C252E ${(amount / 1000) * 100}%, #DFE3E8 ${(amount / 1000) * 100}%)`,
          }}
        />
      </div>

      {/* Balance */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-grey-600">Your balance</span>
        <span className="font-semibold text-grey-800">$34,212</span>
      </div>

      {/* Transfer now button */}
      <button
        type="button"
        className="mt-4 w-full rounded-control bg-grey-800 py-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
      >
        Transfer now
      </button>
    </div>
  );
}
