import { cn } from "@/lib/utils";

interface NavIconProps {
  /** Asset key -> /assets/icons/navbar/ic-<icon>.svg */
  icon: string;
  className?: string;
}

/**
 * Mirrors minimals' `svg__color__root` pattern: the duotone SVG is applied as a
 * CSS mask and tinted with `currentColor`, so the icon inherits the nav link
 * color (primary when active, grey-600 otherwise). The SVG's 0.4-opacity path
 * survives as mask alpha, preserving the two-tone look.
 */
export function NavIcon({ icon, className }: NavIconProps) {
  const url = `/assets/icons/navbar/ic-${icon}.svg`;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-6 shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
