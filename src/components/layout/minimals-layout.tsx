"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { MinimalsTopbar } from "./minimals-topbar";
import { MinimalsHorizontalNav } from "./minimals-horizontal-nav";
import { Logo } from "./logo";
import { minimalsNavConfig } from "./minimals-nav-config";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";

/**
 * Shell for the /dashboard (minimals clone) route group.
 *
 * Identical structure to DashboardLayout but:
 *  - Uses MinimalsTopbar (transparent, grey icons) instead of Topbar.
 *  - Passes minimalsNavConfig to SidebarNav via the new optional `groups` prop.
 *  - Keeps the `theme-minimals` class on the root so the green primary stays.
 *  - Uses a separate localStorage key so collapse state is independent.
 *
 * DashboardLayout (and CentroPay's (app)/layout.tsx) are untouched.
 */
export function MinimalsLayout({ children }: { children: React.ReactNode }) {
  const { settings, setSetting } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [splash, setSplash] = useState(true);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Pages whose live minimals layout uses a fluid (no max-width) container.
  const fullBleed =
    pathname === "/dashboard/blank" || pathname === "/dashboard/kanban";

  // Nav layout/color are driven by the settings drawer (persisted via provider).
  const isHorizontal = settings.navLayout === "horizontal";
  const collapsed = settings.navLayout === "mini";
  const apparent = settings.navColor === "apparent";
  const toggleCollapsed = () =>
    setSetting("navLayout", collapsed ? "vertical" : "mini");

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Reset scroll to top on route change — the scroll container is this div,
  // not the window, so Next's default scroll-to-top doesn't reach it.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      className="theme-minimals flex h-screen overflow-hidden bg-bg"
      data-preset={settings.preset === "default" ? undefined : settings.preset}
    >
      {/* Desktop sidebar — hidden in horizontal layout (nav moves to top bar) */}
      {!isHorizontal && (
        <aside
          className={cn(
            "relative hidden shrink-0 border-r border-[rgba(145,158,171,0.12)] transition-[width] duration-300 ease-in-out mlg:flex",
            collapsed ? "w-[100px]" : "w-[300px]",
            apparent && "bg-bg-paper",
          )}
        >
          <SidebarNav collapsed={collapsed} groups={minimalsNavConfig} />
          {/* Edge collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            className="absolute right-0 top-6 z-50 flex size-[26px] translate-x-1/2 items-center justify-center rounded-full border border-[rgba(145,158,171,0.12)] bg-bg-paper text-grey-600 shadow-sm transition-colors hover:bg-bg-neutral hover:text-grey-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-500/40 active:bg-grey-300"
          >
            {collapsed ? (
              <ChevronRight className="size-4" strokeWidth={2} />
            ) : (
              <ChevronLeft className="size-4" strokeWidth={2} />
            )}
          </button>
        </aside>
      )}

      {/* Mobile drawer — live: 288px paper, no close button, grey-800/48 backdrop */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          overlayClassName="bg-[rgba(28,37,46,0.48)] supports-backdrop-filter:backdrop-blur-none"
          // theme-minimals must be re-applied here: the sheet portals to <body>,
          // outside the themed layout root, so tokens would fall back to :root blue.
          className="theme-minimals p-0 data-[side=left]:w-[288px] data-[side=left]:border-r-0 data-[side=left]:sm:max-w-[288px]"
          data-preset={
            settings.preset === "default" ? undefined : settings.preset
          }
          // Live closes the temporary drawer the moment a route link is clicked;
          // parent rows are <button> (expand only) so they keep it open.
          onClick={(e) => {
            if (e.target instanceof Element && e.target.closest("a")) {
              setDrawerOpen(false);
            }
          }}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav
            collapsed={false}
            groups={minimalsNavConfig}
            logoIdPrefix="minimals-drawer-logo"
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* data-minimals-scroll is the scroll target for MinimalsTopbar's scroll listener */}
        <div
          ref={scrollRef}
          data-minimals-scroll
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <MinimalsTopbar onMenuClick={() => setDrawerOpen(true)} />
          {isHorizontal && <MinimalsHorizontalNav />}
          <main
            data-dashboard-main
            className={cn(
              "mx-auto flex w-full flex-col px-4 pb-16 pt-4 sm:px-6 mlg:px-10",
              fullBleed ? "max-w-none" : "max-w-[1600px]",
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Splash screen — visible until hydration complete */}
      {splash && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white">
          <div
            className="relative inline-flex items-center justify-center"
            style={{ width: 120, height: 120 }}
          >
            <span
              className="relative z-[9] inline-flex"
              style={{
                animation: "splash-logo-pulse 3s ease-in-out infinite",
              }}
            >
              <Logo size={64} idPrefix="minimals-splash-logo" />
            </span>
            <span
              className="absolute"
              style={{
                width: "calc(100% - 20px)",
                height: "calc(100% - 20px)",
                border:
                  "solid 3px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
                animation: "splash-inner-ring 3.2s linear infinite",
              }}
            />
            <span
              className="absolute inset-0"
              style={{
                border:
                  "solid 8px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
                animation: "splash-outer-ring 3.2s linear infinite",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
