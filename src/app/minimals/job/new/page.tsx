import { PageHeader } from "@/components/shared/page-header";
import { JobForm } from "@/components/dashboard/job/job-form";

export const metadata = {
  title: "Create a new job | Dashboard - Minimal UI",
};

export default function JobNewPage() {
  return (
    <>
      <PageHeader
        title="Create a new job"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "Job", href: "/minimals/job/list" },
          { label: "Create" },
        ]}
      />
      <JobForm />
    </>
  );
}
