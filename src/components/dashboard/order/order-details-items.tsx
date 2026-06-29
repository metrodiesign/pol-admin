import Image from "next/image";
import type { OrderItem } from "@/types/order";

interface OrderDetailItemsProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  taxes: number;
  total: number;
}

function formatCurrency(value: number, showSign?: boolean): string {
  const abs = Math.abs(value);
  // Show decimals only when the value is not a whole number
  const str = Number.isInteger(abs) ? `$${abs}` : `$${abs.toFixed(2)}`;
  if (showSign && value < 0) return `- ${str}`;
  return str;
}

export function OrderDetailItems({
  items,
  subtotal,
  shipping,
  discount,
  taxes,
  total,
}: OrderDetailItemsProps) {
  return (
    <div>
      {/* Line items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.sku} className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-grey-200">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.name}
              </p>
              <p className="text-xs text-grey-600">{item.sku}</p>
            </div>
            <div className="flex items-center gap-8 text-sm text-foreground">
              <span className="text-grey-600">x{item.qty}</span>
              <span className="w-20 text-right font-semibold">
                {formatCurrency(item.price * item.qty)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-dashed border-[var(--divider)]" />

      {/* Price summary */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-end gap-2">
          <span className="w-48 text-right text-grey-600">
            Subtotal
          </span>
          <span className="w-24 text-right font-semibold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="w-48 text-right text-grey-600">
            Shipping
          </span>
          <span className="w-24 text-right font-semibold text-error">
            {formatCurrency(shipping, true)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="w-48 text-right text-grey-600">
            Discount
          </span>
          <span className="w-24 text-right font-semibold text-error">
            {formatCurrency(discount, true)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="w-48 text-right text-grey-600">Taxes</span>
          <span className="w-24 text-right font-semibold text-foreground">
            {formatCurrency(taxes)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <span className="w-48 text-right text-base font-semibold text-foreground">
            Total
          </span>
          <span className="w-24 text-right text-base font-bold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
