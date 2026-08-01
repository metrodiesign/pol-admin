"use client";

import Image from "next/image";
import Link from "next/link";
import { EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react";
import type { MockProduct } from "@/lib/mock/product";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StockMeter } from "./stock-meter";
import { PublishChip } from "./publish-chip";

interface ProductTableRowProps {
  product: MockProduct;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

export function ProductTableRow({
  product,
  selected,
  onSelect,
}: ProductTableRowProps) {
  return (
    <tr
      className={`border-b border-dashed border-[var(--divider)] last:border-0 transition-colors ${
        selected
          ? "bg-[var(--action-selected)]"
          : "hover:bg-[var(--action-hover)]"
      }`}
    >
      {/* Checkbox */}
      <td className="w-12 pl-1 pr-0">
        <Checkbox
          checked={selected}
          onChange={onSelect}
          aria-label={`Select ${product.name}`}
        />
      </td>

      {/* Product */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-grey-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/minimals/product/details`}
              className="block truncate text-sm font-semibold text-foreground hover:underline"
            >
              {product.name}
            </Link>
            <span className="block text-sm text-grey-600">
              {product.category}
            </span>
          </div>
        </div>
      </td>

      {/* Create at */}
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{product.createdAt}</p>
        <p className="text-xs text-grey-500">{product.createdTime}</p>
      </td>

      {/* Stock */}
      <td className="px-4 py-4">
        <StockMeter
          count={product.stockCount}
          label={
            product.stockLabel === "out of stock"
              ? "out of stock"
              : `${product.stockCount} ${product.stockLabel}`
          }
          status={product.stockLabel}
        />
      </td>

      {/* Price */}
      <td className="px-4 py-4 text-sm font-semibold text-foreground">
        ${product.price.toFixed(2)}
      </td>

      {/* Publish */}
      <td className="px-4 py-4">
        <PublishChip status={product.publish} />
      </td>

      {/* Actions */}
      <td className="px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded-full p-2 text-grey-400 transition-colors hover:bg-[var(--action-hover)] hover:text-grey-700"
                aria-label="Row actions"
              />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem>
              <Eye className="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
