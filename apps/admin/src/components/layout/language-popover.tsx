"use client";

import { useState } from "react";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { languages } from "@/lib/mock/topbar";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";

interface LanguagePopoverProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function LanguagePopover({ variant = "white" }: LanguagePopoverProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("en");
  const current = languages.find((l) => l.code === active) ?? languages[0];
  const triggerClass = variant === "grey"
    ? "flex size-10 items-center justify-center rounded-full transition-colors hover:bg-grey-500/8"
    : "flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/8";

  useScrollLock(open);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Languages button"
        className={triggerClass}
      >
        <Image
          src={`/flags/${current?.flag ?? "GB"}.svg`}
          alt={current?.label ?? ""}
          width={26}
          height={20}
          className="h-5 w-[26px] rounded-sm object-cover"
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[168px] p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => { setActive(lang.code); setOpen(false); }}
            className={cn(
              "flex w-full items-center gap-4 rounded-control px-2 py-1.5 text-sm transition-colors hover:bg-[var(--action-hover)]",
              active === lang.code && "bg-[rgba(145,158,171,0.16)] font-semibold text-grey-800",
            )}
          >
            <Image
              src={`/flags/${lang.flag}.svg`}
              alt=""
              width={26}
              height={20}
              className="h-5 w-[26px] shrink-0 rounded-sm object-cover"
            />
            {lang.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
