"use client";

import { ShoppingCart } from "lucide-react";

interface PaymentCartFabProps {
  count: number;
  onClick: () => void;
}

export function PaymentCartFab({ count, onClick }: PaymentCartFabProps) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_16px_rgba(12,104,233,0.24)] transition-transform hover:scale-110 active:scale-95"
      aria-label={`เปิดตะกร้า (${count} รายการ)`}
    >
      <ShoppingCart className="size-6" />
      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-error text-[11px] font-bold text-white ring-2 ring-white">
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
