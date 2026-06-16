import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking | Dashboard - Minimal UI",
};

import { BookingStatCards } from "@/components/dashboard/booking/booking-stat-cards";
import { BookingTotalIncomes } from "@/components/dashboard/booking/booking-total-incomes";
import { BookingBooked } from "@/components/dashboard/booking/booking-booked";
import { BookingToursAvailable } from "@/components/dashboard/booking/booking-tours-available";
import { BookingStatistics } from "@/components/dashboard/booking/booking-statistics";
import { BookingCustomerReviews } from "@/components/dashboard/booking/booking-customer-reviews";
import { BookingNewest } from "@/components/dashboard/booking/booking-newest";
import { BookingDetails } from "@/components/dashboard/booking/booking-details";

export default function BookingPage() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        {/* Row 1 — Three KPI stat cards */}
        <BookingStatCards />

        {/* Row 2 — Total incomes | Booked | Tours available (each 4/12) */}
        <div className="mmd:col-span-4 flex flex-col">
          <BookingTotalIncomes />
        </div>
        <div className="mmd:col-span-4 flex flex-col">
          <BookingBooked />
        </div>
        <div className="mmd:col-span-4 flex flex-col">
          <BookingToursAvailable />
        </div>

        {/* Row 3 — Statistics (8/12) + Customer reviews (4/12) */}
        <div className="mmd:col-span-8 flex flex-col">
          <BookingStatistics />
        </div>
        <div className="mmd:col-span-4 flex flex-col">
          <BookingCustomerReviews />
        </div>

        {/* Row 4 — Newest booking carousel */}
        <div className="mmd:col-span-12">
          <BookingNewest />
        </div>

        {/* Row 5 — Booking details table */}
        <div className="mmd:col-span-12">
          <BookingDetails />
        </div>
      </div>
    </>
  );
}
