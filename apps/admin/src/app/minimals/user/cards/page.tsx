"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { userCards } from "@/lib/mock/user-profile";
import { cn } from "@/lib/utils";
import type { UserCard } from "@/lib/mock/user-profile";

const SOCIAL_ICONS: Record<string, string> = {
  facebook:
    "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  instagram:
    "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z",
  linkedin:
    "M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

const SOCIAL_COLORS: Record<string, string> = {
  facebook: "text-[#1877F2]",
  instagram: "text-[#E4405F]",
  linkedin: "text-[#0A66C2]",
  twitter: "text-grey-800",
};

function SocialIcons() {
  return (
    <div className="flex items-center justify-center gap-2">
      {Object.entries(SOCIAL_ICONS).map(([name, path]) => (
        <button
          key={name}
          type="button"
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[rgba(145,158,171,0.08)]",
            SOCIAL_COLORS[name],
          )}
          aria-label={name}
        >
          <svg viewBox="0 0 24 24" className="size-6 fill-current">
            <path d={path} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function UserCardItem({ card }: { card: UserCard }) {
  const hasCover = !!card.cover;
  return (
    <div className="dashboard-card overflow-hidden">
      {/* Cover image (16:9, matches live) */}
      <div className="relative aspect-[16/9] bg-grey-300">
        {hasCover && (
          <Image src={card.cover} alt="" fill className="object-cover" />
        )}
      </div>

      {/* Avatar overlapping cover */}
      <div className="relative -mt-10 flex flex-col items-center px-6 pb-6">
        <div className="size-20 rounded-full border-4 border-white shadow-z8 overflow-hidden bg-grey-200">
          <Image
            src={card.avatar}
            alt={card.name}
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
        <p className="mt-4 text-base font-semibold text-grey-800">{card.name}</p>
        <p className="mt-1 text-sm text-grey-600">{card.role}</p>

        <div className="mt-4 mb-2">
          <SocialIcons />
        </div>

        {/* Dashed divider */}
        <div className="w-full border-t border-dashed border-[rgba(145,158,171,0.2)]" />

        {/* Stats */}
        <div className="mt-6 flex w-full items-start justify-around">
          <div className="text-center">
            <p className="text-xs font-normal text-grey-600">
              Follower
            </p>
            <p className="mt-1 text-base font-semibold text-grey-800">{card.totalFollowers}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-normal text-grey-600">
              Following
            </p>
            <p className="mt-1 text-base font-semibold text-grey-800">{card.totalFollowing}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-normal text-grey-600">
              Total post
            </p>
            <p className="mt-1 text-base font-semibold text-grey-800">{card.totalPosts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CARDS_PER_PAGE = 12;
const TOTAL_PAGES = 2;

export default function UserCardsPage() {
  const [page, setPage] = useState(1);

  const start = (page - 1) * CARDS_PER_PAGE;
  const paginated = userCards.slice(start, start + CARDS_PER_PAGE);

  return (
    <>
      <PageHeader
        title="Cards"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "User", href: "/minimals/user/list" },
          { label: "Cards" },
        ]}
        action={{ label: "Add user", href: "/minimals/user/new" }}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mmd:grid-cols-3">
        {paginated.map((card) => (
          <UserCardItem key={card.name} card={card} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-sm transition-colors",
              page === p
                ? "bg-grey-800 text-white font-semibold"
                : "font-normal text-grey-800 hover:bg-[rgba(145,158,171,0.08)]",
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page === TOTAL_PAGES}
          onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          className="flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </>
  );
}
