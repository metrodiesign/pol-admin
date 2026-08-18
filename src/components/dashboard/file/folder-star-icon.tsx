"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FolderStarIconProps {
  starred: boolean;
}

export function FolderStarIcon({ starred: initialStarred }: FolderStarIconProps) {
  const [starred, setStarred] = useState(initialStarred);
  return (
    <button
      type="button"
      onClick={() => setStarred((v) => !v)}
      className="rounded p-0.5 text-grey-400 hover:text-warning"
      aria-label="Favorite"
    >
      <Star
        className={cn(
          "size-4",
          starred ? "fill-warning text-warning" : "text-grey-400",
        )}
      />
    </button>
  );
}
