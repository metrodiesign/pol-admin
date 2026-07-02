"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import SimpleBar from "simplebar-react";
import { NavIcon } from "./nav-icon";
import { navConfig, type NavGroup, type NavItem } from "./nav-config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

function SidebarLogo({
  collapsed,
  logoIdPrefix = "logo",
}: {
  collapsed?: boolean;
  logoIdPrefix?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", collapsed ? "px-0" : "px-1")}
    >
      {collapsed ? (
        <Logo size={40} idPrefix={logoIdPrefix} />
      ) : (
        <Image
          src="/viriyah-logo.png"
          alt="วิริยะประกันภัย"
          width={667}
          height={250}
          priority
          className="h-16 w-auto"
        />
      )}
    </Link>
  );
}

function isActivePath(pathname: string, item: NavItem): boolean {
  const base = item.match ?? item.path;
  if (item.path === pathname || base === pathname) return true;
  // A sibling owns these sub-paths — don't let this item's deep range claim them.
  if (item.exclude?.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return false;
  if ((item.deepMatch || item.match) && pathname.startsWith(base + "/"))
    return true;
  return (
    item.children?.some(
      (c) =>
        c.path === pathname ||
        (c.deepMatch && pathname.startsWith(c.path + "/")),
    ) ?? false
  );
}

function ChildLink({ child, treeline = true }: { child: NavItem; treeline?: boolean }) {
  const pathname = usePathname();
  const active =
    child.path === pathname ||
    (!!child.deepMatch && pathname.startsWith(child.path + "/"));

  const linkClass = cn(
    "flex h-9 items-center rounded-control pr-3 text-sm outline-none transition-colors",
    treeline ? "ml-7 pl-2" : "gap-3 pl-3",
    active
      ? "bg-crop-blue font-semibold text-crop-gold"
      : "text-grey-600 hover:bg-[var(--primary-soft)] hover:text-primary focus-visible:bg-[var(--primary-soft)] focus-visible:text-primary",
  );

  if (!treeline) {
    return (
      <Link href={child.path} className={linkClass}>
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            active ? "bg-crop-gold" : "bg-grey-400",
          )}
        />
        {child.title}
      </Link>
    );
  }

  return (
    <>
      {/* Dot node sits on the continuous line (centered at x=18) */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-[14px] top-1/2 size-2 -translate-y-1/2 rounded-full transition-colors",
          active ? "bg-crop-gold" : "bg-grey-400",
        )}
      />
      <Link href={child.path} className={linkClass}>
        {child.title}
      </Link>
    </>
  );
}

/* ---------------- Expanded rows ---------------- */

function ExpandedRow({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const hasChildren = !!item.children?.length;
  const active = isActivePath(pathname, item);
  const childActive = isActivePath(pathname, item);
  const [open, setOpen] = useState(() => isActivePath(pathname, item));

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 rounded-control py-1 pl-3 pr-2 text-sm font-medium outline-none transition-colors",
            // Live: primary tint only while a child route is active; a manually
            // expanded parent gets the neutral grey tint instead.
            childActive
              ? "bg-crop-blue text-crop-gold"
              : open
                ? "bg-[rgba(145,158,171,0.08)] text-grey-800"
                : "text-grey-600 hover:bg-[var(--primary-soft)] hover:text-primary focus-visible:bg-[var(--primary-soft)] focus-visible:text-primary",
          )}
        >
          {item.icon && <NavIcon icon={item.icon} />}
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-grey-500 transition-transform",
              open && "rotate-90",
            )}
          />
        </button>
        {open && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <li key={child.path} className="relative">
                <ChildLink child={child} />
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.path}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-control py-1 pl-3 pr-2 text-sm outline-none transition-colors",
          active
            ? "bg-crop-blue font-semibold text-crop-gold"
            : "font-medium text-grey-600 hover:bg-[var(--primary-soft)] hover:text-primary focus-visible:bg-[var(--primary-soft)] focus-visible:text-primary",
        )}
      >
        {item.icon && <NavIcon icon={item.icon} />}
        <span className="flex flex-1 flex-col">
          <span>{item.title}</span>
          {item.caption && (
            <span className="text-xs font-normal text-grey-500">
              {item.caption}
            </span>
          )}
        </span>
        {item.badge && (
          <span className="rounded-md bg-error/10 px-1.5 py-0.5 text-xs font-bold text-error">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ---------------- Mini (collapsed) rows ---------------- */

function MiniItemInner({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <span
      className={cn(
        "relative flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-control px-1 pb-1.5 pt-2 text-xs font-bold leading-none transition-colors",
        active
          ? "bg-crop-blue text-crop-gold"
          : "text-grey-600 hover:bg-[var(--primary-soft)] hover:text-primary",
      )}
    >
      {item.children?.length ? (
        <ChevronRight className="absolute right-0.5 top-1/2 size-3 -translate-y-1/2 text-grey-500" />
      ) : null}
      {item.icon && <NavIcon icon={item.icon} className="size-[22px]" />}
      <span className="line-clamp-1 max-w-full">{item.title}</span>
    </span>
  );
}

function MiniRow({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item);
  const hasChildren = !!item.children?.length;

  if (hasChildren) {
    return (
      <li>
        <Popover>
          <PopoverTrigger
            openOnHover
            delay={80}
            closeDelay={80}
            nativeButton={false}
            render={
              <Link
                href={item.path}
                className="relative block"
                aria-label={item.title}
              />
            }
          >
            <MiniItemInner item={item} active={active} />
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-44 gap-1 p-2"
          >
            <p className="px-3 pb-1 pt-1 text-xs font-semibold text-grey-600">
              {item.title}
            </p>
            <ul className="space-y-1">
              {item.children!.map((child) => (
                <li key={child.path}>
                  <ChildLink child={child} treeline={false} />
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.path} className="block" aria-label={item.title}>
        <MiniItemInner item={item} active={active} />
      </Link>
    </li>
  );
}

/* ---------------- Shell ---------------- */

export function SidebarNav({
  collapsed = false,
  groups = navConfig,
  logoIdPrefix,
}: {
  collapsed?: boolean;
  groups?: NavGroup[];
  /** Unique SVG gradient id prefix — required when a second nav instance
      mounts alongside a display:none one (e.g. mobile drawer), otherwise
      url(#...) resolves into the hidden copy and the logo paints empty. */
  logoIdPrefix?: string;
}) {
  const navContent = (
    <nav className={cn("pb-6", collapsed ? "px-2" : "px-4")}>
      {groups.map((group) => (
        <div key={group.subheader} className="pt-4">
          {collapsed ? (
            <span className="mx-auto mb-2 block h-px w-6 bg-[var(--divider)]" />
          ) : (
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-grey-600">
              {group.subheader}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) =>
              collapsed ? (
                <MiniRow key={item.path} item={item} />
              ) : (
                <ExpandedRow key={item.path} item={item} />
              ),
            )}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-full w-full flex-col bg-bg-paper">
      <div
        className={cn(
          "flex h-[72px] items-center",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <SidebarLogo collapsed={collapsed} logoIdPrefix={logoIdPrefix} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {collapsed ? (
          // Mini: native scroll, hidden scrollbar (matches minimals' .nav__section__mini)
          <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navContent}
          </div>
        ) : (
          <SimpleBar autoHide style={{ height: "100%" }}>
            {navContent}
          </SimpleBar>
        )}
      </div>
    </div>
  );
}
