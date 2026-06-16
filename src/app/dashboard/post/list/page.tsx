import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post list | Dashboard - Minimal UI",
};

import Link from "next/link";
import { Plus } from "lucide-react";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { PostListView } from "@/components/dashboard/post/post-list-view";

export default function PostListPage() {
  return (
    <>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Blog" },
          { name: "List" },
        ]}
        action={
          <Link
            href="/dashboard/post/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-foreground px-3 text-sm font-bold text-card hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" />
            Add post
          </Link>
        }
        className="mb-5"
      />
      <PostListView />
    </>
  );
}
