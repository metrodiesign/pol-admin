"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import {
  Settings,
  Moon,
  Contrast,
  PanelRight,
  Shrink,
  Info,
  RotateCcw,
  X,
  Maximize,
  PanelLeft,
  PanelTop,
  LayoutGrid,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useSettings,
  FONT_FAMILY_VARS,
  type PresetName,
  type FontFamily,
} from "@/components/providers/settings-provider";

const presets: { name: PresetName; color: string; dark: string }[] = [
  { name: "default", color: "#00a76f", dark: "#007867" },
  { name: "cyan", color: "#078dee", dark: "#0351ab" },
  { name: "purple", color: "#7635dc", dark: "#431a9e" },
  { name: "blue", color: "#0c68e9", dark: "#063cb4" },
  { name: "orange", color: "#fda92d", dark: "#b66816" },
  { name: "red", color: "#ff3030", dark: "#b71833" },
];

const fonts: FontFamily[] = ["Public Sans", "Inter", "DM Sans", "Nunito Sans"];

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
    >
      {children}
    </button>
  );
}

function SwitchCard({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
  info,
}: {
  icon: typeof Moon;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  info?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[100px] flex-col justify-between rounded-2xl border border-grey-500/12 p-4 transition-colors",
        checked && "bg-grey-500/8",
      )}
    >
      <div className="flex items-start justify-between">
        <Icon className="size-6 text-grey-700" />
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="data-checked:bg-grey-800"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-grey-800">{label}</span>
        {info && <Info className="size-4 text-grey-400" />}
      </div>
    </div>
  );
}

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-grey-500/12 px-4 pb-4 pt-7">
      <span className="absolute -top-[11px] left-3 flex h-[22px] items-center rounded-full bg-grey-800 px-2.5 text-xs font-semibold text-white">
        {label}
      </span>
      {children}
    </div>
  );
}

function PresetGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
      <rect width="28" height="28" rx="8" fill={color} />
      <rect x="7" y="7" width="3" height="14" rx="1.5" fill="#fff" />
      <circle cx="17.5" cy="10" r="2" fill="#fff" />
      <rect x="14" y="15" width="7" height="2.4" rx="1.2" fill="#fff" opacity="0.9" />
    </svg>
  );
}

interface SettingsDrawerProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function SettingsDrawer({ variant = "white" }: SettingsDrawerProps) {
  const [open, setOpen] = useState(false);

  const { settings, setSetting, reset } = useSettings();
  const { mode, contrast, rtl, compact, fontSize, navLayout, navColor, fontFamily } =
    settings;

  const sizePct = ((fontSize - 12) / (20 - 12)) * 100;
  const layoutIcons = [PanelLeft, PanelTop, LayoutGrid];
  // index → navLayout (matches layoutIcons order: vertical / horizontal / mini)
  const NAV_LAYOUTS = ["vertical", "horizontal", "mini"] as const;

  const triggerClass = variant === "grey"
    ? "flex size-10 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
    : "flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Settings"
        className={triggerClass}
      >
        <Settings className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[360px] gap-0 p-0 sm:max-w-[360px]"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <SheetTitle className="text-lg font-semibold text-grey-800">Settings</SheetTitle>
          <div className="flex items-center gap-1">
            <IconButton label="Fullscreen">
              <Maximize className="size-5" />
            </IconButton>
            <IconButton label="Reset all" onClick={reset}>
              <RotateCcw className="size-5" />
            </IconButton>
            <SheetClose className="flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-[var(--action-hover)]">
              <X className="size-5" />
            </SheetClose>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SimpleBar autoHide={false} style={{ height: "100%" }}>
            <div className="space-y-6 px-5 pb-10 pt-2">
          {/* Switch cards */}
          <div className="grid grid-cols-2 gap-4">
            <SwitchCard
              icon={Moon}
              label="Mode"
              checked={mode === "dark"}
              onCheckedChange={(dark) => setSetting("mode", dark ? "dark" : "light")}
            />
            <SwitchCard
              icon={Contrast}
              label="Contrast"
              checked={contrast}
              onCheckedChange={(v) => setSetting("contrast", v)}
            />
            <SwitchCard
              icon={PanelRight}
              label="Right to left"
              checked={rtl}
              onCheckedChange={(v) => setSetting("rtl", v)}
            />
            <SwitchCard
              icon={Shrink}
              label="Compact"
              checked={compact}
              onCheckedChange={(v) => setSetting("compact", v)}
              info
            />
          </div>

          {/* Nav */}
          <SectionCard label="Nav">
            <p className="mb-2 text-sm font-medium text-grey-600">Layout</p>
            <div className="flex gap-3">
              {layoutIcons.map((LIcon, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Layout ${i + 1}`}
                  onClick={() => setSetting("navLayout", NAV_LAYOUTS[i] ?? "vertical")}
                  className={cn(
                    "flex h-16 flex-1 items-center justify-center rounded-xl border transition-colors",
                    NAV_LAYOUTS[i] === navLayout
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-grey-500/12 text-grey-400",
                  )}
                >
                  <LIcon className="size-6" />
                </button>
              ))}
            </div>

            <p className="mb-2 mt-4 text-sm font-medium text-grey-600">Color</p>
            <div className="flex gap-3">
              {(["integrate", "apparent"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSetting("navColor", c)}
                  className={cn(
                    "flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-semibold capitalize transition-colors",
                    navColor === c
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-grey-500/12 text-grey-400",
                  )}
                >
                  <PanelLeft className="size-5" />
                  {c}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Presets */}
          <SectionCard label="Presets">
            <div className="grid grid-cols-3 gap-3">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  aria-label={`Preset ${p.name}`}
                  onClick={() => setSetting("preset", p.name)}
                  className={cn(
                    "flex h-16 items-center justify-center rounded-xl border transition-colors",
                    settings.preset === p.name ? "border" : "border-grey-500/12",
                  )}
                  style={
                    settings.preset === p.name
                      ? { borderColor: p.color, backgroundColor: `${p.color}14` }
                      : undefined
                  }
                >
                  <PresetGlyph color={p.color} />
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Font */}
          <SectionCard label="Font">
            <p className="mb-2 text-sm font-medium text-grey-600">Family</p>
            <div className="grid grid-cols-2 gap-3">
              {fonts.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSetting("fontFamily", f)}
                  className={cn(
                    "flex h-[86px] flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors",
                    fontFamily === f
                      ? "border-primary shadow-z8"
                      : "border-grey-500/12",
                  )}
                  style={{ fontFamily: FONT_FAMILY_VARS[f] }}
                >
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      fontFamily === f ? "text-primary" : "text-grey-400",
                    )}
                  >
                    Aa
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      fontFamily === f ? "text-grey-800" : "text-grey-500",
                    )}
                  >
                    {f}
                  </span>
                </button>
              ))}
            </div>

            <p className="mb-1 mt-4 text-sm font-medium text-grey-600">Size</p>
            <div className="relative pb-1 pt-7">
              <span
                className="absolute top-0 z-10 -translate-x-1/2 rounded-md bg-grey-800 px-2 py-0.5 text-xs font-semibold text-white"
                style={{ left: `${sizePct}%` }}
              >
                {fontSize}px
              </span>
              <input
                type="range"
                min={12}
                max={20}
                value={fontSize}
                onChange={(e) => setSetting("fontSize", Number(e.target.value))}
                aria-label="Change font size"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-grey-500/24 accent-primary"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${sizePct}%, rgba(145,158,171,0.24) ${sizePct}%)`,
                }}
              />
            </div>
          </SectionCard>
            </div>
          </SimpleBar>
        </div>
      </SheetContent>
    </Sheet>
  );
}
