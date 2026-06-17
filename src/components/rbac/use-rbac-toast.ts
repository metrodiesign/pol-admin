"use client";

import { useCallback, useState } from "react";

export interface RbacToast {
  id: number;
  message: string;
}

// id ภายในโมดูล — เลี่ยง Date.now/Math.random, แค่ต้องไม่ซ้ำในหนึ่ง session
let nextId = 0;

/**
 * Toast ขนาดเล็กภายในโมดูล RBAC — ไม่มี dependency ใหม่ (repo ไม่มี toast lib).
 * `show(message)` เพิ่ม toast + auto-dismiss; ใช้คู่กับ `<RbacToaster>` (rbac-toaster.tsx).
 */
export function useRbacToast() {
  const [toasts, setToasts] = useState<RbacToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string) => {
    nextId += 1;
    const id = nextId;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show, dismiss };
}
