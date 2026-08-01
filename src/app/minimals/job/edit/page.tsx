import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { JobForm } from "@/components/dashboard/job/job-form";
import { FIRST_JOB } from "@/lib/mock/job";

export const metadata = {
  title: "Job edit | Dashboard - Minimal UI",
};

/**
 * Edit page pre-filled with the first job.
 * In a real app this would be a dynamic [id]/edit route.
 */
export default function JobEditPage() {
  if (!FIRST_JOB) notFound();
  return (
    <>
      <PageHeader
        title="Edit"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "Job", href: "/minimals/job/list" },
          { label: FIRST_JOB.title },
        ]}
      />
      <JobForm currentJob={FIRST_JOB} />
    </>
  );
}
