"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { accountUser } from "@/lib/mock/topbar";

// Nav icons — SVG paths extracted from minimals.cc live source
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="M13.106 22h-2.212c-3.447 0-5.17 0-6.345-1.012s-1.419-2.705-1.906-6.093l-.279-1.937c-.38-2.637-.57-3.956-.029-5.083s1.691-1.813 3.992-3.183l1.385-.825C9.8 2.622 10.846 2 12 2s2.199.622 4.288 1.867l1.385.825c2.3 1.37 3.451 2.056 3.992 3.183s.35 2.446-.03 5.083l-.278 1.937c-.487 3.388-.731 5.081-1.906 6.093S16.553 22 13.106 22" />
      <path fill="currentColor" d="M8.25 18a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="M2.281 19.657C2.37 20.516 2.933 21.196 3.777 21.376C5.11 21.659 7.622 22 12 22C16.378 22 18.891 21.659 20.223 21.376C21.067 21.196 21.63 20.516 21.719 19.657C21.851 18.384 22 16.047 22 12C22 7.953 21.851 5.616 21.719 4.343C21.63 3.484 21.067 2.804 20.223 2.625C18.891 2.341 16.378 2 12 2C7.622 2 5.11 2.341 3.777 2.625C2.933 2.804 2.37 3.484 2.281 4.343C2.15 5.616 2 7.953 2 12C2 16.047 2.15 18.384 2.281 19.657Z" />
      <path fill="currentColor" d="M13.938 13.856C15.263 13.158 16.166 11.768 16.166 10.167C16.166 7.866 14.301 6 11.9 6C9.698 6 7.833 7.866 7.833 10.167C7.833 11.768 8.736 13.158 10.061 13.856C8.287 14.532 6.932 16.109 6.513 18.053C6.454 18.322 6.602 18.598 6.873 18.647C7.846 18.823 9.456 19 12.001 19C14.545 19 16.155 18.823 17.128 18.647C17.398 18.598 17.545 18.323 17.488 18.055C17.069 16.11 15.713 14.532 13.938 13.856Z" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="m20.83 10.715l-.518 1.932c-.605 2.255-.907 3.383-1.592 4.114a4 4 0 0 1-2.01 1.161q-.145.034-.295.052c-.915.113-2.032-.186-4.064-.73c-2.255-.605-3.383-.907-4.114-1.592a4 4 0 0 1-1.161-2.011c-.228-.976.074-2.103.679-4.358l.517-1.932l.244-.905c.455-1.666.761-2.583 1.348-3.21a4 4 0 0 1 2.01-1.16c.976-.228 2.104.074 4.36.679c2.254.604 3.382.906 4.113 1.59a4 4 0 0 1 1.161 2.012c.228.976-.075 2.103-.679 4.358m-9.778-.91a.75.75 0 0 1 .919-.53l4.83 1.295a.75.75 0 1 1-.389 1.448l-4.83-1.294a.75.75 0 0 1-.53-.918m-.776 2.898a.75.75 0 0 1 .918-.53l2.898.777a.75.75 0 1 1-.388 1.448l-2.898-.776a.75.75 0 0 1-.53-.919" />
      <path fill="currentColor" d="M16.415 17.975a4 4 0 0 1-1.068 1.677c-.731.685-1.859.987-4.114 1.591s-3.383.907-4.358.679a4 4 0 0 1-2.011-1.161c-.685-.731-.988-1.859-1.592-4.114l-.517-1.932c-.605-2.255-.907-3.383-.68-4.358a4 4 0 0 1 1.162-2.011c.731-.685 1.859-.987 4.114-1.592q.638-.172 1.165-.309l-.244.906l-.517 1.932c-.605 2.255-.907 3.382-.68 4.358a4 4 0 0 0 1.162 2.011c.731.685 1.859.987 4.114 1.592c2.032.544 3.149.843 4.064.73" />
    </svg>
  );
}

function IconSubscription() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="M17.756 2.301C17.352 2.114 17.117 2.089 17.063 2.086C15.766 2.035 14.109 2 11.999 2C7.724 2 5.306 2.143 3.98 2.276C3.04 2.37 2.369 3.041 2.275 3.981C2.142 5.307 1.999 7.725 1.999 12C1.999 16.645 2.168 19.604 2.309 21.269C2.374 22.039 3.245 22.378 3.839 21.883L5.499 20.5L6.866 21.867C7.226 22.227 7.8 22.259 8.198 21.941L9.999 20.5L11.292 21.793C11.682 22.183 12.316 22.183 12.706 21.793L13.999 20.5L15.8 21.941C16.198 22.259 16.772 22.227 17.132 21.867L18.499 20.5L20.159 21.883C20.753 22.378 21.624 22.039 21.689 21.269C21.831 19.604 21.999 16.645 21.999 12C21.999 9.873 21.964 8.205 21.912 6.903C21.474 6.957 20.856 7 20 7C19.371 7 18.87 6.977 18.475 6.943C17.615 6.87 17.056 6.212 17.023 5.349C17.009 4.992 17 4.549 17 4C17 3.114 17.024 2.501 17.052 2.086C17.052 2.086 17.293 2.086 17.756 2.301ZM11.659 15.267C12.203 15.267 12.596 15.175 12.838 14.991C13.09 14.807 13.216 14.582 13.216 14.315C13.216 14.076 13.12 13.883 12.929 13.735C12.737 13.588 12.45 13.459 12.067 13.349L11.236 13.1C10.822 12.981 10.449 12.852 10.117 12.714C9.784 12.576 9.503 12.41 9.271 12.217C9.039 12.024 8.857 11.794 8.727 11.527C8.596 11.26 8.53 10.943 8.53 10.575C8.53 9.949 8.742 9.429 9.165 9.015C9.589 8.601 10.193 8.325 10.979 8.187V7.794C10.979 7.386 11.262 7.021 11.67 7.003C11.722 7.001 11.774 7 11.825 7C12.198 7 12.465 7.06 12.627 7.179C12.798 7.299 12.884 7.515 12.884 7.828V8.132C13.529 8.196 14.053 8.339 14.456 8.56C14.859 8.771 15.061 9.052 15.061 9.402C15.061 9.557 15.019 9.701 14.948 9.832C14.759 10.18 14.285 10.155 13.91 10.028C13.802 9.992 13.687 9.958 13.564 9.926C13.181 9.816 12.763 9.76 12.309 9.76C11.805 9.76 11.427 9.839 11.175 9.995C10.933 10.142 10.812 10.335 10.812 10.575C10.812 10.768 10.893 10.924 11.054 11.044C11.225 11.164 11.482 11.274 11.825 11.375L12.672 11.61C13.579 11.867 14.274 12.208 14.758 12.631C15.252 13.054 15.499 13.625 15.499 14.343C15.499 14.977 15.277 15.516 14.834 15.957C14.39 16.39 13.74 16.68 12.884 16.827V17.206C12.884 17.614 12.601 17.979 12.193 17.997C12.141 17.999 12.089 18 12.037 18C11.664 18 11.392 17.94 11.221 17.821C11.059 17.701 10.979 17.485 10.979 17.172V16.896C10.243 16.822 9.643 16.661 9.18 16.413C8.726 16.155 8.499 15.833 8.499 15.447C8.499 15.221 8.586 15.025 8.725 14.86C8.974 14.565 9.417 14.638 9.76 14.816C9.906 14.891 10.065 14.963 10.238 15.033C10.651 15.189 11.125 15.267 11.659 15.267Z" />
      <path fill="currentColor" d="M21.913 6.903C21.475 6.957 20.857 7 20 7C19.371 7 18.87 6.977 18.475 6.943C17.615 6.87 17.056 6.212 17.023 5.349C17.009 4.992 17 4.549 17 4C17 3.114 17.024 2.501 17.052 2.086C17.052 2.086 18.087 2.088 20 4C21.913 5.913 21.913 6.903 21.913 6.903Z" />
    </svg>
  );
}

function IconSecurity() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z" />
      <path fill="currentColor" d="M13.5 15a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1.401A2.999 2.999 0 0 1 12 8a3 3 0 0 1 1.5 5.599z" />
    </svg>
  );
}

function IconAccountSettings() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-grey-600" aria-hidden>
      <path fill="currentColor" d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2 2 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.62 1.62 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.03 2.03 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361s-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a2 2 0 0 0-.399 1.479c.053.394.287.798.757 1.605s.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2 2 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a2 2 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361s.306-1.064.782-1.36c.324-.203.533-.364.682-.556a2 2 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605s-.704-1.21-1.022-1.453a2.03 2.03 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.62 1.62 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2 2 0 0 0-1.09-1.083" />
      <path fill="currentColor" d="M15.523 12c0 1.657-1.354 3-3.023 3s-3.023-1.343-3.023-3S10.83 9 12.5 9s3.023 1.343 3.023 3" />
    </svg>
  );
}

type NavItem = { label: string; icon: () => React.JSX.Element; badge?: number };

const navItems: NavItem[] = [
  { label: "Home", icon: IconHome },
  { label: "Profile", icon: IconProfile },
  { label: "Projects", icon: IconProjects, badge: 3 },
  { label: "Subscription", icon: IconSubscription },
  { label: "Security", icon: IconSecurity },
  { label: "Account settings", icon: IconAccountSettings },
];

const switcherAvatars = [
  { src: "/avatars/avatar-25.webp", alt: "Jaydon Frankie" },
  { src: "/avatars/avatar-2.webp", alt: "Lucian Obrien" },
  { src: "/avatars/avatar-3.webp", alt: "Deja Brady" },
];

interface AccountDrawerProps {
  /** "white" = on coloured topbar (default); "grey" = on transparent topbar */
  variant?: "white" | "grey";
}

export function AccountDrawer({ variant = "white" }: AccountDrawerProps) {
  const [open, setOpen] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const triggerClass = variant === "grey"
    ? "ml-1 rounded-full ring-2 ring-grey-500/30 transition-shadow hover:ring-grey-500/60"
    : "ml-1 rounded-full ring-2 ring-white/30 transition-shadow hover:ring-white/60";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Account button"
        className={triggerClass}
      >
        <Avatar className="size-10">
          <AvatarImage
            src="/avatars/avatar-25.webp"
            alt={accountUser.name}
            onLoadingStatusChange={setAvatarStatus}
          />
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {avatarStatus === "error" ? (
              "JF"
            ) : (
              <Skeleton className="size-full rounded-full" />
            )}
          </AvatarFallback>
        </Avatar>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[320px] gap-0 p-0 sm:max-w-[320px]"
      >
        <SheetTitle className="sr-only">Account</SheetTitle>
        <SheetClose className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-[var(--action-hover)]">
          <X className="size-5" />
        </SheetClose>

        {/* Header */}
        <div className="flex flex-col items-center gap-1 px-6 pt-10 pb-4 text-center">
          {/* Avatar with animated conic ring */}
          <div className="relative inline-flex size-24 items-center justify-center shrink-0">
            <span
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: "conic-gradient(from 0deg, #00A76F, #FFAB00, #00A76F)",
                animationDuration: "6s",
              }}
            />
            <span className="absolute inset-[3px] rounded-full bg-white" />
            <Avatar className="size-[84px]">
              <AvatarImage src="/avatars/avatar-25.webp" alt={accountUser.name} />
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                JF
              </AvatarFallback>
            </Avatar>
          </div>

          <p className="mt-2 text-base font-semibold text-grey-800">{accountUser.name}</p>
          <p className="text-sm text-grey-600">{accountUser.email}</p>

          {/* Account switcher */}
          <div className="mt-3 flex items-center gap-2">
            {switcherAvatars.map((a) => (
              <button
                key={a.src}
                type="button"
                aria-label={`Switch to ${a.alt}`}
                className="rounded-full ring-1 ring-[var(--divider)] transition-opacity hover:opacity-80"
              >
                <Avatar className="size-10">
                  <AvatarImage src={a.src} alt={a.alt} />
                  <AvatarFallback className="bg-grey-200 text-xs font-semibold text-grey-700">
                    {a.alt.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
            ))}
            <button
              type="button"
              aria-label="Add account"
              className="flex size-10 items-center justify-center rounded-full border border-dashed border-[var(--divider)] text-grey-500 transition-colors hover:bg-[var(--action-hover)]"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        </div>

        {/* Nav items — border-y acts as divider above and below */}
        <ul className="px-5 py-6 border-y border-dashed border-[var(--divider)]">
          {navItems.map(({ label, icon: Icon, badge }) => (
            <li key={label} className="rounded-[6px] overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-2 py-3 text-sm transition-colors hover:bg-[var(--action-hover)]"
              >
                <Icon />
                <span className="flex-1 text-left text-sm font-medium text-grey-800">{label}</span>
                {badge !== undefined && (
                  <span
                    className="flex size-6 items-center justify-center rounded-[6px] text-xs font-bold"
                    style={{
                      background: "rgba(255, 86, 48, 0.16)",
                      color: "rgb(183, 29, 24)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Promo card + Logout pinned to bottom */}
        <div className="mt-auto px-5 py-6">
          {/* Promo card */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255, 172, 130, 0.92) 0%, rgba(81, 25, 183, 0.92) 100%), url('/background-7.webp')",
              backgroundSize: "cover",
            }}
          >
            <div className="px-6 py-8">
              <p className="text-xl font-extrabold text-white">35% OFF</p>
              <p className="mt-0.5 text-sm font-semibold text-white">Power up Productivity!</p>
              <button
                type="button"
                className="mt-4 rounded-lg px-2 py-1 text-[13px] font-bold text-grey-900"
                style={{ background: "rgb(255, 171, 0)" }}
              >
                Upgrade to Pro
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustration-rocket-small.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-3 h-28 w-28 object-contain"
            />
          </div>

          {/* Logout */}
          <button
            type="button"
            className="mt-3 w-full rounded-lg py-2 text-sm font-bold transition-colors hover:opacity-90"
            style={{
              background: "rgba(255, 86, 48, 0.16)",
              color: "rgb(183, 29, 24)",
            }}
          >
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
