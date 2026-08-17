"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SPECS = [
  { key: "Category", value: "Mobile" },
  { key: "Manufacturer", value: "Apple" },
  { key: "Warranty", value: "12 Months" },
  { key: "Serial number", value: "358607726380311" },
  { key: "Ships from", value: "United States" },
];

const PRODUCT_DETAILS = [
  "The foam sockliner feels soft and comfortable",
  "Pull tab",
  "Not intended for use as Personal Protective Equipment",
  "Colour Shown: White/Black/Oxygen Purple/Action Grape",
  "Style: 921826-109",
  "Country/Region of Origin: China",
];

const BENEFITS = [
  "Mesh and synthetic materials on the upper keep the foot feeling comfortable and durable",
  "Originally designed for performance running, the full-length Nike Air unit adds soft, comfortable cushioning underfoot",
  "The foam midsole feels springy and soft",
  "The rubber outsole adds better traction and durability",
];

const DELIVERY = [
  "Your order of $200 or more gets free standard delivery.",
  "Standard delivered 4-5 Business Days",
  "Express delivered 2-4 Business Days",
  "Orders are processed and delivered Monday–Friday (excluding public holidays)",
];

const TABS = ["Description", "Reviews (8)"] as const;
type Tab = (typeof TABS)[number];

export function ProductInfoTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Description");

  return (
    <div className="dashboard-card">
      {/* Tab bar */}
      <div className="border-b border-[var(--divider)]">
        <div role="tablist" className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "h-12 px-5 text-sm transition-colors",
                activeTab === tab
                  ? "border-b-2 border-grey-800 font-semibold text-foreground"
                  : "font-medium text-grey-600 hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "Description" && (
          <div className="space-y-6">
            {/* Specifications */}
            <section>
              <h6 className="mb-3 text-sm font-bold text-foreground">
                Specifications
              </h6>
              <div className="space-y-0">
                {SPECS.map(({ key, value }) => (
                  <div
                    key={key}
                    className="grid grid-cols-[160px_1fr] border-b border-[var(--divider)] py-2 text-sm last:border-0"
                  >
                    <span className="text-grey-500">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Product details */}
            <section>
              <h6 className="mb-3 text-sm font-bold text-foreground">
                Product details
              </h6>
              <ul className="space-y-1.5">
                {PRODUCT_DETAILS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-grey-600"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-grey-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section>
              <h6 className="mb-3 text-sm font-bold text-foreground">
                Benefits
              </h6>
              <ul className="space-y-1.5">
                {BENEFITS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-grey-600"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-grey-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Delivery and returns */}
            <section>
              <h6 className="mb-3 text-sm font-bold text-foreground">
                Delivery and returns
              </h6>
              <ul className="space-y-1.5">
                {DELIVERY.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-grey-600"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-grey-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {activeTab === "Reviews (8)" && (
          <div className="py-8 text-center text-sm text-grey-500">
            Reviews section coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
