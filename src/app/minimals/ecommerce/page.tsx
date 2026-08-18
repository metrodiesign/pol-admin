import type { Metadata } from "next";
import { EcommerceWelcome } from "@/components/dashboard/ecommerce/ecommerce-welcome";
import { ProductCarousel } from "@/components/dashboard/ecommerce/product-carousel";
import { EcommerceSummary } from "@/components/dashboard/ecommerce/ecommerce-summary";
import { SaleByGender } from "@/components/dashboard/ecommerce/sale-by-gender";
import { YearlySales } from "@/components/dashboard/ecommerce/yearly-sales";
import { SalesOverview } from "@/components/dashboard/ecommerce/sales-overview";
import { CurrentBalance } from "@/components/dashboard/ecommerce/current-balance";
import { BestSalesman } from "@/components/dashboard/ecommerce/best-salesman";
import { LatestProducts } from "@/components/dashboard/ecommerce/latest-products";

export const metadata: Metadata = {
  title: "E-commerce | Dashboard - Minimal UI",
};

export default function EcommercePage() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        {/* Row 1 — Welcome + Product carousel */}
        <div className="mmd:col-span-8">
          <EcommerceWelcome />
        </div>
        <div className="mmd:col-span-4">
          <ProductCarousel />
        </div>

        {/* Row 2 — KPI stats */}
        <EcommerceSummary />

        {/* Row 3 — Sale by gender + Yearly sales */}
        <div className="mmd:col-span-4">
          <SaleByGender />
        </div>
        <div className="mmd:col-span-8">
          <YearlySales />
        </div>

        {/* Row 4 — Sales overview + Current balance */}
        <div className="mmd:col-span-8">
          <SalesOverview />
        </div>
        <div className="mmd:col-span-4">
          <CurrentBalance />
        </div>

        {/* Row 5 — Best salesman + Latest products */}
        <div className="mmd:col-span-8">
          <BestSalesman />
        </div>
        <div className="mmd:col-span-4">
          <LatestProducts />
        </div>
      </div>
    </div>
  );
}
