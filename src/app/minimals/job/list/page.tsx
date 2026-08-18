import { PageHeader } from "@/components/shared/page-header";
import { JobListView } from "@/components/dashboard/job/job-list-view";

export const metadata = {
  title: "Job list | Dashboard - Minimal UI",
};

export default function JobListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "Job", href: "/minimals/job/list" },
          { label: "List" },
        ]}
        action={{ label: "Add job", href: "/minimals/job/new" }}
      />
      <JobListView />
    </>
  );
}
