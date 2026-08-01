import type { Metadata } from "next";
import { TourListView } from "@/components/dashboard/tour/tour-list-view";

export const metadata: Metadata = {
  title: "Tour list | Dashboard - Minimal UI",
};

export default function TourListPage() {
  return <TourListView />;
}
