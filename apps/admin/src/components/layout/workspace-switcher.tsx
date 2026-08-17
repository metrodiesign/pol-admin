import Image from "next/image";

interface WorkspaceSwitcherProps {
  /** "white" = on coloured topbar; "grey" = on transparent minimals topbar */
  variant?: "white" | "grey";
}

export function WorkspaceSwitcher({ variant = "white" }: WorkspaceSwitcherProps) {
  const isGrey = variant === "grey";
  return (
    <div className="flex items-center gap-2 px-1.5 py-1">
      <Image
        src="/logo-1.webp"
        alt="Company"
        width={24}
        height={24}
        style={{ height: "auto" }}
        className="size-6 rounded-md object-contain"
      />
      <span className={isGrey ? "hidden truncate text-sm font-semibold text-grey-800 lg:inline" : "hidden truncate text-sm font-semibold text-white lg:inline"}>
        Team 1
      </span>
      <span className={isGrey ? "hidden rounded-md bg-grey-500/16 px-1.5 py-0.5 text-xs font-bold text-grey-600 lg:inline" : "hidden rounded-md bg-white/16 px-1.5 py-0.5 text-xs font-bold text-white lg:inline"}>
        {isGrey ? "Free" : "HQ-001"}
      </span>
    </div>
  );
}
