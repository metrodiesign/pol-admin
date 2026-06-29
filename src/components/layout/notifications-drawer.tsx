"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import Image from "next/image";
import {
  Bell,
  CheckCheck,
  Settings,
  ShoppingBag,
  Truck,
  MessageSquare,
  Mail,
  Music,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  notifications,
  notificationTabs,
  type AppNotification,
  type NotifTone,
} from "@/lib/mock/topbar";
import { cn } from "@/lib/utils";

const categoryIcon = {
  order: { Icon: ShoppingBag, tone: "bg-warning/16 text-warning-dark" },
  delivery: { Icon: Truck, tone: "bg-info/16 text-info-dark" },
  chat: { Icon: MessageSquare, tone: "bg-primary/16 text-primary" },
  mail: { Icon: Mail, tone: "bg-error/16 text-error-dark" },
};

const tagTone: Record<NotifTone, string> = {
  info: "border-info/40 text-info",
  warning: "border-warning/50 text-warning-dark",
  neutral: "border-grey-500/32 text-grey-800",
};

function NotifTabBadge({ value, count }: { value: string; count: number }) {
  const tone =
    value === "all"
      ? "bg-grey-800 text-white"
      : value === "unread"
        ? "bg-info/16 text-info-dark group-data-active/tab:bg-info group-data-active/tab:text-white"
        : "bg-success/16 text-success-dark group-data-active/tab:bg-success group-data-active/tab:text-white";
  return (
    <span
      className={cn(
        "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold transition-colors",
        tone,
      )}
    >
      {count}
    </span>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-lg bg-grey-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-grey-900"
    >
      {children}
    </button>
  );
}

function OutlineButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-grey-500/32 px-3 py-1.5 text-xs font-bold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
    >
      {children}
    </button>
  );
}

function NotificationActions({ action }: { action: AppNotification["action"] }) {
  switch (action.kind) {
    case "friend":
      return (
        <div className="mt-2 flex gap-2">
          <PrimaryButton>Accept</PrimaryButton>
          <OutlineButton>Decline</OutlineButton>
        </div>
      );
    case "payment":
      return (
        <div className="mt-2 flex gap-2">
          <PrimaryButton>Pay</PrimaryButton>
          <OutlineButton>Decline</OutlineButton>
        </div>
      );
    case "reply":
      return (
        <>
          <div className="mt-2 rounded-lg bg-grey-500/8 p-3 text-sm leading-relaxed text-grey-600">
            {action.quote}
          </div>
          <div className="mt-2">
            <PrimaryButton>Reply</PrimaryButton>
          </div>
        </>
      );
    case "file":
      return (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-grey-500/16 p-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/16 text-secondary">
            <Music className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-grey-800">{action.name}</p>
            <p className="text-xs text-grey-500">{action.size}</p>
          </div>
          <OutlineButton>Download</OutlineButton>
        </div>
      );
    case "tags":
      return (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {action.tags.map((t) => (
            <span
              key={t.label}
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs font-semibold",
                tagTone[t.tone],
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function NotificationRow({ n }: { n: AppNotification }) {
  const cat = n.icon ? categoryIcon[n.icon] : null;
  return (
    <li className="relative flex gap-3 px-5 py-4">
      {n.avatar ? (
        <Image
          src={n.avatar}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
      ) : cat ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            cat.tone,
          )}
        >
          <cat.Icon className="size-5" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="pr-4 text-sm leading-snug text-grey-800">
          {n.title.map((seg, i) => (
            <span key={i} className={seg.bold ? "font-semibold" : "text-grey-600"}>
              {seg.text}
            </span>
          ))}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-grey-500">
          {n.time}
          <span className="size-0.5 rounded-full bg-grey-400" />
          {n.category}
        </p>
        <NotificationActions action={n.action} />
      </div>

      {n.unread && (
        <span className="absolute right-5 top-5 size-2 shrink-0 rounded-full bg-info" />
      )}
    </li>
  );
}

interface NotificationsDrawerProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function NotificationsDrawer({ variant = "white" }: NotificationsDrawerProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const unread = notifications.filter((n) => n.unread);
  const triggerClass = variant === "grey"
    ? "relative flex size-10 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
    : "relative flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Notifications"
        className={triggerClass}
      >
        <Bell className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-medium text-white">
            {unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[420px] gap-0 p-0 sm:max-w-[420px]"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <SheetTitle className="text-lg font-semibold text-grey-800">
            Notifications
          </SheetTitle>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Mark all as read"
              className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-[var(--action-hover)]"
            >
              <CheckCheck className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Settings"
              className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
            >
              <Settings className="size-5" />
            </button>
          </div>
        </div>

        <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="pb-4">
            <TabsList variant="segment">
              {notificationTabs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="group/tab gap-2 group-data-[variant=segment]/tabs-list:data-active:shadow-z8"
                >
                  {t.label}
                  <NotifTabBadge value={t.value} count={t.count} />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="min-h-0 flex-1">
            <SimpleBar autoHide={false} style={{ height: "100%" }}>
              <ul className="divide-y divide-dashed divide-[var(--divider)]">
                {notifications.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </ul>
            </SimpleBar>
          </TabsContent>
          <TabsContent value="unread" className="min-h-0 flex-1">
            <SimpleBar autoHide={false} style={{ height: "100%" }}>
              <ul className="divide-y divide-dashed divide-[var(--divider)]">
                {unread.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </ul>
            </SimpleBar>
          </TabsContent>
          <TabsContent value="archived" className="min-h-0 flex-1">
            <SimpleBar autoHide={false} style={{ height: "100%" }}>
              <p className="px-5 py-16 text-center text-sm text-grey-500">
                No archived notifications
              </p>
            </SimpleBar>
          </TabsContent>
        </Tabs>

        <div className="mt-auto border-t border-dashed border-[var(--divider)] p-4">
          <button
            type="button"
            className="w-full rounded-control py-2.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
          >
            View all
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
