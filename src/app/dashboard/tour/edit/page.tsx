import type { Metadata } from "next";
import { SAMPLE_TOUR, TOURS } from "@/lib/mock/tour";
import { TourForm } from "@/components/dashboard/tour/tour-form";

export const metadata: Metadata = {
  title: "Tour edit | Dashboard - Minimal UI",
};

interface TourEditPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function TourEditPage({ searchParams }: TourEditPageProps) {
  const { id } = await searchParams;
  const tour = id ? (TOURS.find((t) => t.id === id) ?? SAMPLE_TOUR) : SAMPLE_TOUR;
  return <TourForm mode="edit" tour={tour} />;
}
