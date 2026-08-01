import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Dashboard - Minimal UI",
};

import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary";
import { AnalyticsCurrentVisits } from "@/components/dashboard/analytics/analytics-current-visits";
import { AnalyticsWebsiteVisits } from "@/components/dashboard/analytics/analytics-website-visits";
import { AnalyticsConversionRates } from "@/components/dashboard/analytics/analytics-conversion-rates";
import { AnalyticsCurrentSubject } from "@/components/dashboard/analytics/analytics-current-subject";
import { AnalyticsNews } from "@/components/dashboard/analytics/analytics-news";
import { AnalyticsOrderTimeline } from "@/components/dashboard/analytics/analytics-order-timeline";
import { AnalyticsTrafficSite } from "@/components/dashboard/analytics/analytics-traffic-site";
import { AnalyticsTasks } from "@/components/dashboard/analytics/analytics-tasks";

export default function AnalyticsPage() {
  return (
    <>
      {/* Greeting */}
      <h4 className="mb-6 text-h4 text-grey-800">
        Hi, Welcome back 👋
      </h4>

      <div className="grid grid-cols-12 gap-6">
        {/* Row 1 — KPI summary cards (each 3/12 on lg, 6/12 on sm, 12/12 on xs) */}
        <AnalyticsSummary />

        {/* Row 2 — Current visits (4/12) + Website visits (8/12) */}
        <div className="col-span-12 mmd:col-span-4">
          <AnalyticsCurrentVisits />
        </div>
        <div className="col-span-12 mmd:col-span-8">
          <AnalyticsWebsiteVisits />
        </div>

        {/* Row 3 — Conversion rates (8/12) + Current subject (4/12) */}
        <div className="col-span-12 mmd:col-span-8">
          <AnalyticsConversionRates />
        </div>
        <div className="col-span-12 mmd:col-span-4">
          <AnalyticsCurrentSubject />
        </div>

        {/* Row 4 — News (8/12) + Order timeline (4/12) */}
        <div className="col-span-12 mmd:col-span-8">
          <AnalyticsNews />
        </div>
        <div className="col-span-12 mmd:col-span-4">
          <AnalyticsOrderTimeline />
        </div>

        {/* Row 5 — Traffic by site (5/12) + Tasks (7/12) */}
        <div className="col-span-12 mmd:col-span-5">
          <AnalyticsTrafficSite />
        </div>
        <div className="col-span-12 mmd:col-span-7">
          <AnalyticsTasks />
        </div>
      </div>
    </>
  );
}
