"use client";

import { useState } from "react";
import { Star, Minus, Plus, BarChart3, Heart, Share2, ShoppingCart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Red", value: "#FF4842" },
  { name: "Blue", value: "#1890FF" },
];

const SIZES = [6, 7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

interface ProductBuyPanelProps {
  name: string;
  price: number;
  priceSale: number;
  rating: number;
  reviews: string;
  description: string;
  status: "in stock" | "out of stock";
  available: number;
}

export function ProductBuyPanel({
  name,
  price,
  priceSale,
  rating,
  reviews,
  description,
  status,
  available,
}: ProductBuyPanelProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(9);
  const [quantity, setQuantity] = useState(0);

  const isOutOfStock = status === "out of stock";

  return (
    <div>
      {/* Status eyebrow */}
      <span
        className={cn(
          "text-[11px] font-bold uppercase tracking-wider",
          isOutOfStock ? "text-error" : "text-success-dark",
        )}
      >
        {isOutOfStock ? "OUT OF STOCK" : "IN STOCK"}
      </span>

      {/* Name */}
      <h5 className="mt-2 text-[19px] font-bold leading-tight text-foreground">
        {name}
      </h5>

      {/* Rating */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < Math.round(rating)
                  ? "fill-warning text-warning"
                  : "text-grey-300",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-grey-500">({reviews} reviews)</span>
      </div>

      {/* Price */}
      <div className="mt-3 flex items-center gap-2">
        {priceSale < price && (
          <span className="text-[19px] font-bold text-grey-500 line-through">
            ${price.toFixed(2)}
          </span>
        )}
        <span className="text-[19px] font-bold text-foreground">
          ${priceSale.toFixed(2)}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm leading-relaxed text-grey-600">
        {description}
      </p>

      <hr className="my-5 border-[var(--divider)]" />

      {/* Color */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Color</span>
        <div className="flex gap-2">
          {COLORS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(i)}
              aria-label={c.name}
              className={cn(
                "size-7 rounded-full border-2 transition-all",
                i === selectedColor
                  ? "border-grey-800 ring-2 ring-grey-800 ring-offset-2"
                  : "border-transparent hover:border-grey-300",
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Size</span>
        <div className="flex items-center gap-3">
          <Select
            value={String(selectedSize)}
            onValueChange={(v) => setSelectedSize(Number(v))}
          >
            <SelectTrigger aria-label="Size" className="h-10 w-[88px] text-[15px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button type="button" className="text-xs text-grey-800 underline">
            Size chart
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-4 flex items-start justify-between">
        <span className="text-sm font-semibold text-foreground">Quantity</span>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--divider)] px-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              disabled={isOutOfStock}
              className="rounded-full p-1.5 text-grey-600 transition-colors hover:bg-[var(--action-hover)] disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(available, q + 1))}
              disabled={isOutOfStock}
              className="rounded-full p-1.5 text-grey-600 transition-colors hover:bg-[var(--action-hover)] disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-xs text-grey-400">
            Available: {available}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={isOutOfStock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors",
            isOutOfStock
              ? "cursor-not-allowed bg-grey-500/24 text-grey-500/80"
              : "border border-grey-800 bg-transparent text-foreground hover:bg-grey-100",
          )}
        >
          <ShoppingCart className="size-4" />
          Add to cart
        </button>
        <button
          type="button"
          disabled={isOutOfStock}
          className={cn(
            "flex-1 rounded-lg py-3 text-sm font-bold transition-colors",
            isOutOfStock
              ? "cursor-not-allowed bg-grey-500/24 text-grey-500/80"
              : "bg-grey-800 text-white hover:bg-grey-900",
          )}
        >
          Buy now
        </button>
      </div>

      {/* Secondary actions */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {[
          { Icon: BarChart3, label: "Compare" },
          { Icon: Heart, label: "Favorite" },
          { Icon: Share2, label: "Share" },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-grey-600 transition-colors hover:text-foreground"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
