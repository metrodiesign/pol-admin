"use client";

import { useState } from "react";

export function BankingInvite() {
  const [email, setEmail] = useState("");

  return (
    <div
      className="relative overflow-hidden rounded-card p-6 text-white"
      style={{ backgroundColor: "#004B50" }}
    >
      {/* Illustration */}
      <div className="absolute right-4 top-4 opacity-80">
        {/* Receipt/invoice illustration using CSS shapes */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect x="16" y="8" width="48" height="64" rx="4" fill="rgba(255,255,255,0.2)" />
          <rect x="16" y="8" width="48" height="64" rx="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <rect x="24" y="24" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
          <rect x="24" y="32" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
          <rect x="24" y="40" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
          <rect x="24" y="48" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
          {/* Coins */}
          <circle cx="60" cy="60" r="18" fill="#FFAB00" opacity="0.9" />
          <circle cx="60" cy="60" r="14" fill="#FFD666" opacity="0.9" />
          <text x="60" y="65" textAnchor="middle" fill="#B76E00" fontSize="14" fontWeight="700">$</text>
        </svg>
      </div>

      <div className="relative z-10 max-w-[200px]">
        <p className="text-base font-semibold leading-snug text-white">
          Invite friends
          <br />
          and earn
        </p>
        <p
          className="mt-2 text-4xl font-bold"
          style={{
            color: "#FFAB00",
            fontFamily: "var(--font-barlow, var(--font-sans))",
          }}
        >
          $50
        </p>
        <p className="mt-3 text-xs leading-relaxed text-white/64">
          Praesent egestas tristique nibh. Duis lobortis massa imperdiet quam.
        </p>

        {/* Email input */}
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            className="flex-1 rounded-control border border-white/24 bg-white/16 px-3 py-2 text-xs text-white placeholder-white/48 outline-none transition-colors focus:border-white/48"
          />
          <button
            type="button"
            className="shrink-0 rounded-control px-4 py-2 text-xs font-bold text-grey-900 transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FFAB00" }}
          >
            Invite
          </button>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-[120px] rounded-full bg-white/6" />
      <div className="pointer-events-none absolute -bottom-8 -right-4 size-[100px] rounded-full bg-white/6" />
      <div className="pointer-events-none absolute bottom-6 right-16 size-[60px] rounded-full bg-white/4" />
    </div>
  );
}
