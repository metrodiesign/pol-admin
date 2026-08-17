"use client";

import Image from "next/image";
import { Plus, MoreVertical, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { recentFiles } from "@/lib/mock/file";
import { cn } from "@/lib/utils";

const R2 = "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets";

const FALLBACK_ICON = `${R2}/icons/files/ic-file.svg`;
const FILE_TYPE_ICONS: Partial<Record<string, string>> = {
  jpg: `${R2}/icons/files/ic-img.svg`,
  png: `${R2}/icons/files/ic-img.svg`,
  mp3: `${R2}/icons/files/ic-audio.svg`,
  mp4: `${R2}/icons/files/ic-video.svg`,
  pdf: `${R2}/icons/files/ic-pdf.svg`,
};

export function FileRecent() {
  const [starred, setStarred] = useState<Set<string>>(
    () => new Set(recentFiles.filter((f) => f.starred).map((f) => f.name)),
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h6 className="text-lg font-semibold text-grey-800">Recent files</h6>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-full bg-success text-white hover:bg-success-dark"
            aria-label="Add file"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <Link
          href="/minimals/file-manager"
          className="-mr-3 inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-grey-200">
        {recentFiles.map((file) => {
          const iconSrc = FILE_TYPE_ICONS[file.type] ?? FALLBACK_ICON;
          const isStarred = starred.has(file.name);
          return (
            <li
              key={file.name}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {/* File icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconSrc} alt={file.type} className="size-10 shrink-0" />

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-grey-800">{file.name}</p>
                <p className="mt-0.5 text-xs text-grey-500">
                  {file.size}&nbsp;&nbsp;·&nbsp;&nbsp;{file.modifiedAt}
                </p>
              </div>

              {/* Avatar group + overflow */}
              {(file.shared.length > 0 || file.overflow > 0) && (
                <div className="flex shrink-0 items-center">
                  <div className="flex -space-x-2">
                    {file.shared.map((av) => (
                      <Image
                        key={av.src}
                        src={av.src}
                        alt={av.name}
                        width={24}
                        height={24}
                        className="size-6 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  {file.overflow > 0 && (
                    <span className="ml-1 text-xs font-medium text-grey-500">
                      +{file.overflow}
                    </span>
                  )}
                </div>
              )}

              {/* Favorite star */}
              <button
                type="button"
                onClick={() =>
                  setStarred((prev) => {
                    const next = new Set(prev);
                    if (next.has(file.name)) next.delete(file.name);
                    else next.add(file.name);
                    return next;
                  })
                }
                className="shrink-0 text-grey-400 hover:text-warning"
                aria-label="Favorite"
              >
                <Star
                  className={cn(
                    "size-4",
                    isStarred ? "fill-warning text-warning" : "",
                  )}
                />
              </button>

              {/* Kebab */}
              <button
                type="button"
                className="shrink-0 text-grey-400 hover:text-grey-600"
                aria-label="More options"
              >
                <MoreVertical className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
