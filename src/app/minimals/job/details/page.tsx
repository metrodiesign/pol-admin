import { notFound } from "next/navigation";
import { FIRST_JOB } from "@/lib/mock/job";
import { JobDetailsView } from "@/components/dashboard/job/job-details-view";

export const metadata = {
  title: "Job details | Dashboard - Minimal UI",
};

/**
 * Static details page using the first job as the demo target.
 * In a real app this would be a dynamic [id] route reading from params.
 */
export default function JobDetailsPage() {
  if (!FIRST_JOB) notFound();
  return (
    <>
      <JobDetailsView job={FIRST_JOB} />
    </>
  );
}
