import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { ProductGallery } from "@/components/dashboard/product/product-gallery";
import { ProductBuyPanel } from "@/components/dashboard/product/product-buy-panel";
import { ProductFeatureStrip } from "@/components/dashboard/product/product-feature-strip";
import { ProductInfoTabs } from "@/components/dashboard/product/product-info-tabs";
import { ProductPublishButton } from "@/components/dashboard/product/product-publish-button";
import { SAMPLE_PRODUCT } from "@/lib/mock/product";

export const metadata = {
  title: "Product details | Dashboard - Minimal UI",
};

export default function ProductDetailsPage() {
  const product = SAMPLE_PRODUCT;
  const isOutOfStock = product.stockLabel === "out of stock";

  return (
    <>
      {/* Top action bar */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/dashboard/product/list"
          className="flex items-center gap-1 text-sm font-semibold text-foreground transition-opacity hover:opacity-70"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/product/edit"
            className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-[var(--action-hover)] hover:text-foreground"
            aria-label="Edit product"
          >
            <Pencil className="size-4" />
          </Link>
          <ProductPublishButton defaultStatus={product.publish} />
        </div>
      </div>

      {/* Hero: gallery + buy panel — plain background, no card */}
      <div className="mb-6 grid grid-cols-1 gap-8 mmd:grid-cols-12">
        <div className="mmd:col-span-6 mlg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="mmd:col-span-6 mlg:col-span-5">
          <ProductBuyPanel
            name={product.name}
            price={product.price}
            priceSale={product.priceSale}
            rating={4.2}
            reviews="1.95k"
            description="Featuring the original ripple design inspired by Japanese bullet trains, the Nike Air Max 97 lets you push your style full speed ahead."
            status={isOutOfStock ? "out of stock" : "in stock"}
            available={product.stockCount}
          />
        </div>
      </div>

      {/* Feature strip */}
      <ProductFeatureStrip />

      {/* Tabs: Description / Reviews */}
      <ProductInfoTabs />
    </>
  );
}
