import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { FeaturedCarousel } from "@/components/dashboard/featured-carousel";
import { SummaryWidgets } from "@/components/dashboard/summary-widget";
import { CurrentDownload } from "@/components/dashboard/current-download";
import { AreaInstalled } from "@/components/dashboard/area-installed";
import { NewInvoices } from "@/components/dashboard/new-invoices";
import { RelatedApplications } from "@/components/dashboard/related-applications";
import { TopCountries } from "@/components/dashboard/top-countries";
import { TopAuthors } from "@/components/dashboard/top-authors";
import { WidgetCircularGroup } from "@/components/dashboard/widget-circular";

export default function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        {/* Row 1 */}
        <div className="mmd:col-span-8">
          <WelcomeBanner />
        </div>
        <div className="mmd:col-span-4">
          <FeaturedCarousel />
        </div>

        {/* Row 2 — summary KPIs */}
        <SummaryWidgets />

        {/* Row 3 — charts */}
        <div className="mmd:col-span-4">
          <CurrentDownload />
        </div>
        <div className="mmd:col-span-8">
          <AreaInstalled />
        </div>

        {/* Row 4 — table + apps */}
        <div className="mmd:col-span-8">
          <NewInvoices />
        </div>
        <div className="mmd:col-span-4">
          <RelatedApplications />
        </div>

        {/* Row 5 — countries + authors + circular */}
        <div className="mmd:col-span-4">
          <TopCountries />
        </div>
        <div className="mmd:col-span-4">
          <TopAuthors />
        </div>
        <div className="flex flex-col mmd:col-span-4">
          <WidgetCircularGroup />
        </div>
      </div>
    </div>
  );
}
