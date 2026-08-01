import type { Metadata } from "next";
import { CalendarPageClient } from "@/components/dashboard/calendar/calendar-page-client";

export const metadata: Metadata = {
  title: "Calendar | Dashboard - Minimal UI",
};

export default function CalendarPage() {
  return <CalendarPageClient />;
}
