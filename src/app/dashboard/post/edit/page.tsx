import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post edit | Dashboard - Minimal UI",
};

import { notFound } from "next/navigation";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { PostNewEditForm } from "@/components/dashboard/post/post-new-edit-form";
import { POSTS } from "@/lib/mock/post";

// The edit page loads the demo post (slug: climate-change-...)
// In a real app this would be a dynamic [slug]/edit route that fetches by slug.
const DEMO_SLUG = "climate-change-and-its-effects-on-global-food-security";

export default function PostEditPage() {
  const post = POSTS.find((p) => p.slug === DEMO_SLUG) ?? POSTS[2];
  if (!post) notFound();

  const coverPreview =
    "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-3.webp";

  return (
    <>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Blog", href: "/dashboard/post/list" },
          { name: post.title },
        ]}
        className="mb-6"
      />
      <PostNewEditForm
        mode="edit"
        defaultValues={post}
        coverPreview={coverPreview}
      />
    </>
  );
}
