import type { Metadata } from "next";
import { SAMPLE_TOUR, TOURS } from "@/lib/mock/tour";
import { TourDetailsView } from "@/components/dashboard/tour/tour-details-view";

export const metadata: Metadata = {
  title: "Tour details | Dashboard - Minimal UI",
};

interface TourDetailsPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function TourDetailsPage({ searchParams }: TourDetailsPageProps) {
  const { id } = await searchParams;
  const tour = id ? (TOURS.find((t) => t.id === id) ?? SAMPLE_TOUR) : SAMPLE_TOUR;
  return <TourDetailsView tour={tour} />;
}
