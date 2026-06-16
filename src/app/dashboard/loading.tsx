import { Logo } from "@/components/layout/logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white">
      <div className="relative inline-flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* Logo — pulse animation */}
        <span
          className="relative z-[9] inline-flex"
          style={{ animation: "splash-logo-pulse 3s ease-in-out infinite" }}
        >
          <Logo size={64} idPrefix="splash-logo" />
        </span>

        {/* Inner ring — 3px border, morph square↔circle */}
        <span
          className="absolute"
          style={{
            width: "calc(100% - 20px)",
            height: "calc(100% - 20px)",
            border: "solid 3px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
            animation: "splash-inner-ring 3.2s linear infinite",
          }}
        />

        {/* Outer ring — 8px border, morph square↔circle */}
        <span
          className="absolute inset-0"
          style={{
            border: "solid 8px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
            animation: "splash-outer-ring 3.2s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
