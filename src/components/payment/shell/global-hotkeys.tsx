"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * GlobalHotkeys — vim-style g-sequence navigation + single-key shortcuts
 *
 * Sequences (pressed within 1200ms):
 *   g d → /            (Dashboard)
 *   g t → /transactions
 *   g i → /invoices
 *   g p → /policy/list
 *   g u → /users
 *   g r → /reports
 *   g a → /audit
 *
 * Single-key:
 *   c   → /invoices/new
 *   ?   → open command palette (dispatches "centropay:open-palette" event)
 *
 * Ignored when focus is in input / textarea / select / contenteditable.
 */

const G_SEQUENCE_MAP: Record<string, string> = {
  d: "/",
  t: "/transactions",
  i: "/invoices",
  p: "/policy/list",
  u: "/users",
  r: "/reports",
  a: "/audit",
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function GlobalHotkeys() {
  const router = useRouter();
  // Holds first key of a g-sequence; reset after timeout or match
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearSequence() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingRef.current = null;
    }

    function onKeyDown(e: KeyboardEvent) {
      // Ignore when focus is in an editable element
      if (isEditableTarget(e.target)) {
        clearSequence();
        return;
      }

      // Ignore when any modifier key (except Shift for '?') is held
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;
      if (hasModifier) {
        clearSequence();
        return;
      }

      const key = e.key;

      // ── Handle second key of g-sequence ───────────────────────────────────
      if (pendingRef.current === "g") {
        clearSequence();
        const dest = G_SEQUENCE_MAP[key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      // ── Single-char keys (no modifier) ────────────────────────────────────
      if (key.length !== 1) return;

      if (key === "g") {
        // Start g-sequence
        e.preventDefault();
        pendingRef.current = "g";
        timerRef.current = setTimeout(clearSequence, 1200);
        return;
      }

      if (key === "c") {
        e.preventDefault();
        router.push("/invoices/new");
        return;
      }

      if (key === "?") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("centropay:open-palette"));
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearSequence();
    };
  }, [router]);

  // Renders nothing — side-effect only
  return null;
}
