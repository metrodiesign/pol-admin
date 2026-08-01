import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a new post | Dashboard - Minimal UI",
};

import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { PostNewEditForm } from "@/components/dashboard/post/post-new-edit-form";

export default function PostCreatePage() {
  return (
    <>
      <CustomBreadcrumbs
        heading="Create a new post"
        links={[
          { name: "Dashboard", href: "/minimals" },
          { name: "Blog", href: "/minimals/post/list" },
          { name: "Create" },
        ]}
        className="mb-6"
      />
      <PostNewEditForm mode="create" />
    </>
  );
}
