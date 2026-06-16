"use client";

import { Menu } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SearchDialog } from "./search-dialog";
import { LanguagePopover } from "./language-popover";
import { NotificationsDrawer } from "./notifications-drawer";
import { ContactsPopover } from "./contacts-popover";
import { SettingsDrawer } from "./settings-drawer";
import { AccountDrawer } from "./account-drawer";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-1 bg-primary px-4 lg:h-[72px] lg:px-8">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8 lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <WorkspaceSwitcher />

      <div className="ml-auto flex items-center gap-1">
        <SearchDialog />
        <LanguagePopover />
        <NotificationsDrawer />
        <ContactsPopover />
        <SettingsDrawer />
        <AccountDrawer />
      </div>
    </header>
  );
}
