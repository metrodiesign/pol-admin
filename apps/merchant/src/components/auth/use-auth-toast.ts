"use client";

import { useCallback, useState } from "react";

export type AuthToastVariant = "success" | "error";

export interface AuthToast {
  id: number;
  message: string;
  variant: AuthToastVariant;
}

// id ภายในโมดูล — เลี่ยง Date.now/Math.random, แค่ไม่ซ้ำใน session
let nextId = 0;

/**
 * Toast เล็กของโมดูล auth — extend pattern ของ use-role-toast แต่เพิ่ม `variant` (success/error)
 * เพราะ RoleToaster เดิม hardcode success icon (B4). ไม่เพิ่ม dependency. ใช้คู่ `<AuthToaster>`.
 */
export function useAuthToast() {
  const [toasts, setToasts] = useState<AuthToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: AuthToastVariant) => {
    nextId += 1;
    const id = nextId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show, dismiss };
}
