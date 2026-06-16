import type { Metadata } from "next";
import { TourForm } from "@/components/dashboard/tour/tour-form";

export const metadata: Metadata = {
  title: "Create a new tour | Dashboard - Minimal UI",
};

export default function TourNewPage() {
  return <TourForm mode="create" />;
}
