import type React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { bookingStats, type BookingStat } from "@/lib/mock/booking";
import { cn } from "@/lib/utils";

// Card 1 — Total booking: traveller walking with roller luggage (green)
function IllustrationTotalBooking({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      {/* Ground shadow */}
      <ellipse cx="60" cy="105" rx="44" ry="5" fill={color} opacity="0.08" />

      {/* Roller luggage body */}
      <rect x="62" y="52" width="34" height="40" rx="7" fill={color} opacity="0.72" />
      {/* Luggage top strap */}
      <rect x="67" y="44" width="24" height="10" rx="4" fill={color} opacity="0.56" />
      {/* Luggage horizontal stripe */}
      <rect x="62" y="68" width="34" height="3" fill="white" opacity="0.2" rx="1" />
      {/* Luggage zipper details */}
      <rect x="66" y="56" width="22" height="2" rx="1" fill="white" opacity="0.15" />
      {/* Luggage handle pull */}
      <rect x="75" y="36" width="4" height="10" rx="2" fill={color} opacity="0.56" />
      <rect x="71" y="34" width="12" height="4" rx="2" fill={color} opacity="0.56" />
      {/* Luggage wheels */}
      <circle cx="70" cy="95" r="5" fill={color} opacity="0.48" />
      <circle cx="88" cy="95" r="5" fill={color} opacity="0.48" />
      <circle cx="70" cy="95" r="2.5" fill="white" opacity="0.2" />
      <circle cx="88" cy="95" r="2.5" fill="white" opacity="0.2" />

      {/* Person body */}
      {/* Head */}
      <circle cx="38" cy="22" r="13" fill={color} opacity="0.88" />
      {/* Hair detail */}
      <path d="M26 18 Q38 10 50 18" stroke={color} strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Torso / shirt */}
      <rect x="26" y="37" width="26" height="30" rx="8" fill={color} opacity="0.80" />
      {/* Collar */}
      <path d="M36 37 L39 44 L42 37" fill="white" opacity="0.15" />
      {/* Left arm (extended towards luggage handle) */}
      <path d="M52 48 Q60 50 64 52" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.72" />
      {/* Right arm (down) */}
      <rect x="18" y="40" width="8" height="22" rx="4" fill={color} opacity="0.64" />
      {/* Legs */}
      <rect x="27" y="65" width="10" height="28" rx="5" fill={color} opacity="0.72" />
      <rect x="40" y="65" width="10" height="28" rx="5" fill={color} opacity="0.72" />
      {/* Shoes */}
      <rect x="24" y="90" width="16" height="7" rx="3.5" fill={color} opacity="0.56" />
      <rect x="37" y="90" width="16" height="7" rx="3.5" fill={color} opacity="0.56" />
    </svg>
  );
}

// Card 2 — Sold: two travellers side by side with bags (purple)
function IllustrationSold({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      {/* Ground shadow */}
      <ellipse cx="60" cy="105" rx="46" ry="5" fill={color} opacity="0.08" />

      {/* Person 1 (left) */}
      <circle cx="34" cy="20" r="12" fill={color} opacity="0.88" />
      <rect x="22" y="34" width="24" height="28" rx="7" fill={color} opacity="0.80" />
      {/* P1 left arm with bag */}
      <rect x="10" y="40" width="12" height="4" rx="2" fill={color} opacity="0.64" />
      {/* P1 small hand-bag */}
      <rect x="4" y="42" width="14" height="18" rx="4" fill={color} opacity="0.60" />
      <rect x="7" y="36" width="8" height="8" rx="3" stroke={color} strokeWidth="2" fill="none" opacity="0.48" />
      <circle cx="8" cy="62" r="3.5" fill={color} opacity="0.44" />
      <circle cx="16" cy="62" r="3.5" fill={color} opacity="0.44" />
      {/* P1 right arm */}
      <rect x="46" y="40" width="10" height="4" rx="2" fill={color} opacity="0.60" />
      {/* P1 legs */}
      <rect x="24" y="60" width="10" height="25" rx="5" fill={color} opacity="0.72" />
      <rect x="36" y="60" width="10" height="25" rx="5" fill={color} opacity="0.72" />
      {/* P1 shoes */}
      <rect x="21" y="82" width="15" height="6" rx="3" fill={color} opacity="0.56" />
      <rect x="33" y="82" width="15" height="6" rx="3" fill={color} opacity="0.56" />

      {/* Person 2 (right) */}
      <circle cx="82" cy="24" r="12" fill={color} opacity="0.72" />
      <rect x="70" y="38" width="24" height="28" rx="7" fill={color} opacity="0.72" />
      {/* P2 backpack */}
      <rect x="93" y="38" width="18" height="24" rx="5" fill={color} opacity="0.56" />
      <rect x="96" y="32" width="12" height="8" rx="3" fill={color} opacity="0.44" />
      {/* Backpack strap horizontal */}
      <rect x="93" y="50" width="18" height="2" rx="1" fill="white" opacity="0.15" />
      {/* P2 legs */}
      <rect x="72" y="64" width="9" height="24" rx="4.5" fill={color} opacity="0.64" />
      <rect x="83" y="64" width="9" height="24" rx="4.5" fill={color} opacity="0.64" />
      {/* P2 shoes */}
      <rect x="69" y="85" width="14" height="6" rx="3" fill={color} opacity="0.52" />
      <rect x="80" y="85" width="14" height="6" rx="3" fill={color} opacity="0.52" />

      {/* Stars / sparkles between them */}
      <path d="M56 30 L57.2 33.6 L61 33.6 L58 35.8 L59.2 39.4 L56 37.2 L52.8 39.4 L54 35.8 L51 33.6 L54.8 33.6 Z" fill={color} opacity="0.28" />
    </svg>
  );
}

// Card 3 — Canceled: adult with child, roller bag (amber/yellow)
function IllustrationCanceled({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      {/* Ground shadow */}
      <ellipse cx="60" cy="105" rx="46" ry="5" fill={color} opacity="0.08" />

      {/* Adult */}
      <circle cx="38" cy="20" r="13" fill={color} opacity="0.88" />
      {/* Adult hair */}
      <path d="M26 16 Q38 8 50 16" stroke={color} strokeWidth="4" fill="none" opacity="0.36" strokeLinecap="round" />
      {/* Adult torso */}
      <rect x="26" y="35" width="26" height="30" rx="8" fill={color} opacity="0.80" />
      {/* Adult collar */}
      <path d="M36 35 L39 42 L42 35" fill="white" opacity="0.12" />
      {/* Adult right arm extended to child's hand */}
      <path d="M52 50 Q62 54 68 58" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.64" />
      {/* Adult left arm (holding luggage handle) */}
      <path d="M26 48 Q18 50 16 56" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.60" />
      {/* Adult legs */}
      <rect x="28" y="63" width="10" height="27" rx="5" fill={color} opacity="0.72" />
      <rect x="40" y="63" width="10" height="27" rx="5" fill={color} opacity="0.72" />
      {/* Adult shoes */}
      <rect x="25" y="87" width="15" height="7" rx="3.5" fill={color} opacity="0.56" />
      <rect x="37" y="87" width="15" height="7" rx="3.5" fill={color} opacity="0.56" />

      {/* Small rolling luggage (adult's left side) */}
      <rect x="4" y="56" width="16" height="22" rx="5" fill={color} opacity="0.60" />
      <rect x="7" y="49" width="10" height="9" rx="3" fill={color} opacity="0.48" />
      <rect x="4" y="66" width="16" height="2" rx="1" fill="white" opacity="0.18" />
      <circle cx="8" cy="80" r="3.5" fill={color} opacity="0.44" />
      <circle cx="16" cy="80" r="3.5" fill={color} opacity="0.44" />

      {/* Child */}
      <circle cx="80" cy="38" r="10" fill={color} opacity="0.72" />
      {/* Child torso */}
      <rect x="70" y="50" width="20" height="22" rx="6" fill={color} opacity="0.72" />
      {/* Child legs */}
      <rect x="72" y="70" width="8" height="20" rx="4" fill={color} opacity="0.64" />
      <rect x="82" y="70" width="8" height="20" rx="4" fill={color} opacity="0.64" />
      {/* Child shoes */}
      <rect x="69" y="87" width="13" height="6" rx="3" fill={color} opacity="0.52" />
      <rect x="79" y="87" width="13" height="6" rx="3" fill={color} opacity="0.52" />
      {/* Child's small backpack */}
      <rect x="89" y="50" width="16" height="18" rx="4" fill={color} opacity="0.52" />
      <rect x="92" y="44" width="10" height="8" rx="3" fill={color} opacity="0.44" />
      <rect x="89" y="58" width="16" height="2" rx="1" fill="white" opacity="0.15" />

      {/* Heart / sparkle detail */}
      <path d="M60 26 C60 23 56 20 56 24 C56 27 60 30 60 30 C60 30 64 27 64 24 C64 20 60 23 60 26Z" fill={color} opacity="0.24" />
    </svg>
  );
}

const ILLUSTRATIONS = [IllustrationTotalBooking, IllustrationSold, IllustrationCanceled];

const CARD_COLORS = [
  "#00A76F", // Total booking — teal/green
  "#8E33FF", // Sold — purple
  "#FFAB00", // Canceled — amber
];

function StatCard({
  stat,
  color,
  IllustrationComponent,
}: {
  stat: BookingStat;
  color: string;
  IllustrationComponent: React.ComponentType<{ color: string }>;
}) {
  const TrendIcon = stat.trend.up ? TrendingUp : TrendingDown;

  return (
    <div
      className="dashboard-card relative flex items-center overflow-hidden"
      style={{ padding: "16px 16px 16px 24px", minHeight: "152px" }}
    >
      {/* Left content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-grey-800">{stat.title}</p>
        <p
          className="mt-2 font-bold text-grey-800 leading-tight"
          style={{ fontSize: "2rem", letterSpacing: "-0.01em" }}
        >
          {stat.total}
        </p>
        <div className="mt-2 flex items-center gap-1 text-sm">
          <TrendIcon
            className={cn("size-4", stat.trend.up ? "text-success" : "text-error")}
          />
          <span
            className={cn("font-semibold", stat.trend.up ? "text-success" : "text-error")}
          >
            {stat.trend.up ? "+" : "-"}{stat.trend.value}%
          </span>
        </div>
      </div>

      {/* Right: travel illustration */}
      <div className="shrink-0 w-[110px] h-[110px]">
        <IllustrationComponent color={color} />
      </div>
    </div>
  );
}

export function BookingStatCards() {
  return (
    <>
      {bookingStats.map((stat, i) => {
        const IllustrationComponent = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0]!;
        const color = CARD_COLORS[i] ?? CARD_COLORS[0]!;
        return (
          <div key={stat.title} className="md:col-span-4">
            <StatCard stat={stat} color={color} IllustrationComponent={IllustrationComponent} />
          </div>
        );
      })}
    </>
  );
}
