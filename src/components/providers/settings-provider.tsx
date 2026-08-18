"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = "light" | "dark";
export type PresetName =
  | "default"
  | "cyan"
  | "purple"
  | "blue"
  | "orange"
  | "red";
export type NavLayout = "vertical" | "horizontal" | "mini";
export type NavColor = "integrate" | "apparent";
export type FontFamily = "Public Sans" | "Inter" | "DM Sans" | "Nunito Sans";

export interface Settings {
  mode: ThemeMode;
  preset: PresetName;
  contrast: boolean;
  rtl: boolean;
  compact: boolean;
  fontSize: number;
  navLayout: NavLayout;
  navColor: NavColor;
  fontFamily: FontFamily;
}

/** Maps a font-family setting to its loaded next/font CSS variable (see app/layout.tsx). */
export const FONT_FAMILY_VARS: Record<FontFamily, string> = {
  "Public Sans": "var(--font-public-sans)",
  Inter: "var(--font-inter)",
  "DM Sans": "var(--font-dm-sans)",
  "Nunito Sans": "var(--font-nunito-sans)",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: Settings = {
  mode: "light",
  preset: "default",
  contrast: false,
  rtl: false,
  compact: false,
  fontSize: 16,
  navLayout: "vertical",
  navColor: "integrate",
  fontFamily: "Public Sans",
};

export const SETTINGS_STORAGE_KEY = "minimals-settings";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// DOM application helper
// ---------------------------------------------------------------------------

function applySettings(s: Settings): void {
  const root = document.documentElement;

  // mode
  root.classList.toggle("dark", s.mode === "dark");

  // rtl
  root.setAttribute("dir", s.rtl ? "rtl" : "ltr");

  // compact
  root.setAttribute("data-compact", String(s.compact));

  // contrast
  root.setAttribute("data-contrast", String(s.contrast));

  // fontSize (clear when equal to default 16)
  if (s.fontSize !== 16) {
    root.style.fontSize = `${s.fontSize}px`;
  } else {
    root.style.fontSize = "";
  }

  // nav layout + color (CSS hooks; navLayout is also read from context by MinimalsLayout)
  root.setAttribute("data-nav-layout", s.navLayout);
  root.setAttribute("data-nav-color", s.navColor);

  // font family — override --font-active (consumed by --font-sans in globals.css)
  root.style.setProperty(
    "--font-active",
    FONT_FAMILY_VARS[s.fontFamily] ?? FONT_FAMILY_VARS["Public Sans"],
  );

  // preset is NOT applied to <html> by the provider;
  // layout divs render data-preset via context.
}

// ---------------------------------------------------------------------------
// Hydration helper — reads localStorage on mount
// ---------------------------------------------------------------------------

function hydrateSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    // Legacy fallback: honour old "theme" key
    const legacyTheme = localStorage.getItem("theme");
    if (legacyTheme === "dark") {
      return { ...DEFAULT_SETTINGS, mode: "dark" };
    }
  } catch {
    // ignore – return defaults
  }
  return { ...DEFAULT_SETTINGS };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const firstSettingsRun = useRef(true);

  // Hydrate from localStorage on mount. Apply the hydrated values immediately
  // (idempotent with SETTINGS_INIT_SCRIPT) so the DOM is correct even if the
  // inline script failed — without ever applying DEFAULT_SETTINGS, which would
  // clobber the pre-paint theme and cause a flash.
  useEffect(() => {
    const hydrated = hydrateSettings();
    applySettings(hydrated);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(hydrated);
  }, []);

  // Apply DOM side-effects + persist whenever settings change. Skip the first
  // run: the pre-hydration value is DEFAULT_SETTINGS (already handled by the
  // hydrate effect + init script), so applying/persisting it here would flash
  // and overwrite saved data.
  useEffect(() => {
    if (firstSettingsRun.current) {
      firstSettingsRun.current = false;
      return;
    }
    applySettings(settings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore write failures (private browsing, quota exceeded, etc.)
    }
  }, [settings]);

  const setSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback((): void => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const value = useMemo(
    () => ({ settings, setSetting, reset }),
    [settings, setSetting, reset],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SETTINGS_INIT_SCRIPT
// Inline IIFE to be injected as a <script dangerouslySetInnerHTML> in the
// root layout <head> so HTML attributes are applied before first paint,
// eliminating flash-of-wrong-theme / flash-of-wrong-direction.
// ---------------------------------------------------------------------------

export const SETTINGS_INIT_SCRIPT: string = `(function(){try{var s=localStorage.getItem("minimals-settings");var m,r,co,ct,fs,nl,nc,ff;if(s){var p=JSON.parse(s);m=p.mode;r=p.rtl;co=p.compact;ct=p.contrast;fs=p.fontSize;nl=p.navLayout;nc=p.navColor;ff=p.fontFamily;}else{var lt=localStorage.getItem("theme");if(lt==="dark"){m="dark";}}var root=document.documentElement;if(m==="dark"){root.classList.add("dark");}else{root.classList.remove("dark");}root.setAttribute("dir",r?"rtl":"ltr");root.setAttribute("data-compact",String(!!co));root.setAttribute("data-contrast",String(!!ct));if(fs&&fs!==16){root.style.fontSize=fs+"px";}else{root.style.fontSize="";}root.setAttribute("data-nav-layout",nl||"vertical");root.setAttribute("data-nav-color",nc||"integrate");var fm={"Public Sans":"var(--font-public-sans)","Inter":"var(--font-inter)","DM Sans":"var(--font-dm-sans)","Nunito Sans":"var(--font-nunito-sans)"};root.style.setProperty("--font-active",fm[ff]||fm["Public Sans"]);}catch(e){}})();`;
