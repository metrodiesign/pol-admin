"use client";

import { useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import { useRouter } from "next/navigation";
import { Search, FilePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { navConfig } from "./nav-config";

type FlatItem = {
  title: string;
  path: string;
  group: string;
  /** "nav" items come from navConfig; "action" items are quick-actions */
  kind: "nav" | "action";
  Icon?: React.ComponentType<{ className?: string }>;
  description?: string;
};

const navItems: FlatItem[] = navConfig.flatMap((group) =>
  group.items.flatMap((item) => [
    { title: item.title, path: item.path, group: group.subheader, kind: "nav" as const },
    ...(item.children?.map((child) => ({
      title: child.title,
      path: child.path,
      group: item.title,
      kind: "nav" as const,
    })) ?? []),
  ]),
);

const actionItems: FlatItem[] = [
  {
    title: "สร้างใบแจ้งหนี้ใหม่",
    path: "/invoices/new",
    group: "การกระทำ",
    kind: "action",
    Icon: FilePlus,
    description: "ออกใบแจ้งหนี้ส่งลิงก์ชำระให้ลูกค้า",
  },
];

interface SearchDialogProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function SearchDialog({ variant = "white" }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    // ⌘K / Ctrl+K
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  // Merge nav + action items; action items always shown first when no query
  const allItems: FlatItem[] = useMemo(
    () => [...actionItems, ...navItems],
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.path.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q),
    );
  }, [query, allItems]);

  // Group results by their `group` field
  const grouped = useMemo(() => {
    const map = new Map<string, FlatItem[]>();
    // Ensure "การกระทำ" section appears first
    const order = ["การกระทำ"];
    results.forEach((item) => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    });
    const sections: [string, FlatItem[]][] = [];
    // Insert ordered sections first
    order.forEach((sec) => {
      if (map.has(sec)) sections.push([sec, map.get(sec)!]);
    });
    map.forEach((items, sec) => {
      if (!order.includes(sec)) sections.push([sec, items]);
    });
    return sections;
  }, [results]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const isGrey = variant === "grey";
  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center transition-colors",
          // mobile: round icon button (matches the other topbar action icons)
          "size-10 justify-center rounded-full",
          // lg+: expands to the ⌘K pill
          "lg:h-9 lg:w-auto lg:justify-start lg:gap-2 lg:rounded-xl lg:px-2",
          isGrey
            ? "text-grey-600 hover:bg-grey-500/8 lg:bg-grey-500/8 lg:hover:bg-grey-500/16"
            : "text-white hover:bg-white/8 lg:bg-white/10 lg:hover:bg-white/16",
        )}
      >
        <Search className="size-5 lg:size-5" />
        <kbd className={cn(
          "hidden h-6 items-center rounded-md px-1.5 text-xs font-bold shadow-none lg:flex",
          isGrey
            ? "bg-grey-500/16 text-grey-600"
            : "bg-white/20 text-white",
        )}>
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="top-[15%] w-[calc(100%_-_64px)] max-w-[600px] sm:max-w-[600px] translate-y-0 gap-0 overflow-hidden rounded-2xl p-0"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Search input row */}
          <div className="flex h-20 items-center gap-4 border-b border-[var(--divider)] px-6">
            <Search className="size-5 shrink-0 text-grey-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-base text-grey-800 outline-none placeholder:text-grey-500"
            />
            <span className="flex h-6 items-center rounded-md bg-grey-500/16 px-1.5 text-xs font-bold text-grey-600">
              Esc
            </span>
          </div>

          {/* Results grouped by section */}
          <SimpleBar autoHide={false} style={{ maxHeight: "60vh" }}>
            <div className="p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-grey-500">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                grouped.map(([section, items]) => (
                  <div key={section}>
                    <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-grey-500">
                      {section}
                    </p>
                    {items.map((item) => {
                      const ItemIcon = item.Icon;
                      return (
                        <button
                          key={`${item.kind}-${item.path}`}
                          type="button"
                          onClick={() => go(item.path)}
                          className="flex w-full items-center gap-3 rounded-control px-4 py-2 text-left transition-colors hover:bg-[var(--action-hover)]"
                        >
                          {ItemIcon && (
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-grey-500/8 text-grey-600">
                              <ItemIcon className="size-4" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-grey-800">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="truncate text-xs text-grey-500">
                                {item.description}
                              </p>
                            ) : (
                              <p className="truncate text-xs text-grey-500">
                                {item.path}
                              </p>
                            )}
                          </div>
                          <span className="flex h-6 shrink-0 items-center rounded-md bg-grey-500/16 px-1.5 text-xs font-bold text-grey-800">
                            {item.group}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </SimpleBar>
        </DialogContent>
      </Dialog>
    </>
  );
}
