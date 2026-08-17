"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NavIcon } from "./nav-icon";
import { minimalsNavConfig } from "./minimals-nav-config";
import type { NavItem } from "./nav-config";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

/**
 * Horizontal nav bar — rendered below the topbar when settings.navLayout is
 * "horizontal". Flattens the minimals nav config into a single horizontal row:
 * leaf items are links, parent items open a dropdown (nested groups use a
 * submenu). Hidden below lg, where the mobile drawer is used instead.
 */

function cleanPath(path: string): string {
  return path.split("?")[0] ?? path;
}

function isRealPath(path: string): boolean {
  return !!path && !path.startsWith("#") && !path.startsWith("http");
}

function isActive(pathname: string, path: string): boolean {
  if (!isRealPath(path)) return false;
  const c = cleanPath(path);
  if (pathname === c) return true;
  // The dashboard root ("/minimals" = App) is a prefix of every page, so it
  // must match exactly only — never via the deep subpath rule below.
  if (c === "/minimals") return false;
  return pathname.startsWith(`${c}/`);
}

function itemActive(pathname: string, item: NavItem): boolean {
  if (isActive(pathname, item.path)) return true;
  return (item.children ?? []).some((c) => itemActive(pathname, c));
}

const ENTRIES: NavItem[] = minimalsNavConfig.flatMap((g) => g.items);

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-0.5 rounded-md bg-grey-200 px-1 py-0.5 text-xs font-bold leading-none text-grey-700">
      {children}
    </span>
  );
}

function navigate(router: ReturnType<typeof useRouter>, path: string) {
  if (path.startsWith("http")) {
    window.open(path, "_blank", "noopener,noreferrer");
  } else if (isRealPath(path)) {
    router.push(path);
  }
}

function ChildItems({
  items,
  pathname,
  router,
}: {
  items: NavItem[];
  pathname: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      {items.map((child) =>
        child.children?.length ? (
          <DropdownMenuSub key={child.title}>
            <DropdownMenuSubTrigger
              className={cn(itemActive(pathname, child) && "text-primary")}
            >
              {child.title}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <ChildItems
                items={child.children}
                pathname={pathname}
                router={router}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            key={child.title}
            disabled={child.disabled}
            onClick={() => navigate(router, child.path)}
            className={cn(
              isActive(pathname, child.path) && "font-semibold text-primary",
            )}
          >
            {child.title}
          </DropdownMenuItem>
        ),
      )}
    </>
  );
}

export function MinimalsHorizontalNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav data-hnav className="hidden border-b border-white/10 bg-bg lg:block">
      <ul className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 mlg:px-10">
        {ENTRIES.map((item) => {
          const active = itemActive(pathname, item);
          const base =
            "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none";
          const tone = active
            ? "text-primary"
            : "text-grey-600 hover:bg-grey-200 hover:text-grey-800";
          const inner = (
            <>
              {item.icon ? <NavIcon icon={item.icon} className="size-5" /> : null}
              {item.title}
              {item.badge ? <Badge>{item.badge}</Badge> : null}
            </>
          );

          if (!item.children?.length) {
            if (item.path.startsWith("http")) {
              return (
                <li key={item.title}>
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(base, tone)}
                  >
                    {inner}
                  </a>
                </li>
              );
            }
            if (!isRealPath(item.path)) {
              return (
                <li key={item.title}>
                  <span className={cn(base, tone, item.disabled && "opacity-40")}>
                    {inner}
                  </span>
                </li>
              );
            }
            return (
              <li key={item.title}>
                <Link href={item.path} className={cn(base, tone)}>
                  {inner}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.title}>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(base, tone)}>
                  {inner}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  <ChildItems
                    items={item.children}
                    pathname={pathname}
                    router={router}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
