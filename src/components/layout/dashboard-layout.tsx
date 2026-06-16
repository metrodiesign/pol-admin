"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "dashboard:nav-collapsed";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [splash, setSplash] = useState(true);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");

    const timer = setTimeout(() => setSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Reset scroll to top on route change — the scroll container is this div,
  // not the window, so Next's default scroll-to-top doesn't reach it.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-[rgba(145,158,171,0.12)] transition-[width] duration-300 ease-in-out lg:flex",
          collapsed ? "w-[100px]" : "w-[300px]",
        )}
      >
        <SidebarNav collapsed={collapsed} />
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

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[300px] p-0 sm:max-w-[300px]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav collapsed={false} logoIdPrefix="app-drawer-logo" />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
          <Topbar onMenuClick={() => setDrawerOpen(true)} />
          <main
            data-dashboard-main
            className="mx-auto flex w-full max-w-[1200px] flex-col px-4 pb-16 pt-4 sm:px-6 md:px-8 lg:px-10"
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
              <Logo size={64} idPrefix="splash-logo" />
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
