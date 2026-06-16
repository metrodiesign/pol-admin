import Image from "next/image";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 (lowercase). */
  iso2?: string;
  className?: string;
}

/** Round country flag served from flagcdn. */
export function CountryFlag({ iso2, className }: CountryFlagProps) {
  if (!iso2) return null;
  return (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      <Image
        src={`https://flagcdn.com/w40/${iso2}.png`}
        alt=""
        width={20}
        height={20}
        className="size-full object-cover"
        unoptimized
      />
    </span>
  );
}
