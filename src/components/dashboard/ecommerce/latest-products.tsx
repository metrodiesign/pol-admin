import Image from "next/image";
import { WidgetCard } from "../widget-card";
import { latestProducts } from "@/lib/mock/ecommerce";

const MAX_SWATCHES = 3;

export function LatestProducts() {
  return (
    <WidgetCard title="Latest products" bodyClassName="p-0">
      <ul>
        {latestProducts.map((product, i) => {
          const visibleColors = product.colors.slice(0, MAX_SWATCHES);
          const extraCount = product.colors.length - visibleColors.length;

          return (
            <li
              key={product.name}
              className={`flex items-center gap-4 px-6 py-3 transition-colors hover:bg-grey-50 ${
                i < latestProducts.length - 1
                  ? "border-b border-dashed border-grey-300"
                  : ""
              }`}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-grey-800">
                  {product.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {product.priceSale && (
                    <span className="text-sm text-grey-400 line-through">
                      {product.priceSale}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-grey-800">
                    {product.price}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {visibleColors.map((color) => (
                  <span
                    key={color}
                    className="size-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {extraCount > 0 && (
                  <span className="ml-0.5 text-xs font-medium text-grey-500">
                    +{extraCount}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
