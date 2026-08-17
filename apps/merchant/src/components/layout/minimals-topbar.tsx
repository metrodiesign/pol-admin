"use client";

import { Menu } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SearchDialog } from "./search-dialog";
import { LanguagePopover } from "./language-popover";
import { NotificationsDrawer } from "./notifications-drawer";
import { ContactsPopover } from "./contacts-popover";
import { SettingsDrawer } from "./settings-drawer";
import { AccountDrawer } from "./account-drawer";
import { cn } from "@/lib/utils";

interface MinimalsTopbarProps {
  onMenuClick?: () => void;
}

/**
 * Topbar for the /minimals (minimals clone) shell.
 *
 * - Always-on blurred backdrop (bg-default @ 80% + 6px backdrop-blur); sticky top.
 *   Content scrolls under it and is blurred/tinted — no JS, no scroll listener.
 * - Constant height: 64px below lg (1200px), 72px at lg+ — matches live minimals,
 *   which does NOT shrink on scroll (verified via Chrome DevTools: header ::before
 *   stays rgba(255,255,255,0.8) + blur(6px) at 72px across all scroll positions).
 * - Icons/buttons are GREY (text-grey-600/700), NOT white, NOT on a coloured bar.
 * - Reuses all existing child components via the "grey" variant prop.
 */
export function MinimalsTopbar({ onMenuClick }: MinimalsTopbarProps) {
  return (
    <header
      data-topbar
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-1 bg-crop-blue px-4 mlg:h-[72px] mlg:px-8",
      )}
    >
      {/* Mobile hamburger — mlg:hidden (hidden once the sidebar appears at 1200px) */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="flex size-10 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8 mlg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <WorkspaceSwitcher variant="grey" />

      <div className="ml-auto flex items-center gap-1">
        <SearchDialog variant="grey" />
        <LanguagePopover variant="grey" />
        <NotificationsDrawer variant="grey" />
        <ContactsPopover variant="grey" />
        <SettingsDrawer variant="grey" />
        <AccountDrawer variant="grey" />
      </div>
    </header>
  );
}
