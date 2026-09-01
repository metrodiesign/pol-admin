// Class/style constants copied verbatim from the merchant user/role modules so every
// control-plane screen renders identical headers, buttons and cards without importing
// across modules (LESSONS.md: no cross-module component imports).

export const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)] disabled:pointer-events-none disabled:opacity-50";

export const primaryClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50";

export const warningClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-control bg-warning px-3 text-sm font-bold text-white transition-colors hover:bg-warning/90 disabled:pointer-events-none disabled:opacity-50";

export const controlBadgeClass =
  "inline-flex h-[30px] items-center gap-1 rounded-full px-4 py-1 text-sm font-semibold";

export const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};
