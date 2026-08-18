"use client";

import { useCallback, useState } from "react";

export interface Toast {
  id: number;
  message: string;
}

// id ภายใน module — เลี่ยง Date.now/Math.random, แค่ต้องไม่ซ้ำในหนึ่ง session
let nextId = 0;

/**
 * Toast ขนาดเล็กใช้ร่วมทุกโมดูล — ไม่มี dependency ใหม่ (repo ไม่มี toast lib).
 * ยกขึ้นเป็นของกลางจาก pattern เดิมของ admin/role + merchant/role (สำเนาเดิมยังไม่ migrate).
 * `show(message)` เพิ่ม toast + auto-dismiss; ใช้คู่กับ `<Toaster>` (components/shared/toaster.tsx).
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

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
