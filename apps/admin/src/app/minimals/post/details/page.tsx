import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post details | Dashboard - Minimal UI",
};

import { PostDetailsView } from "@/components/dashboard/post/post-details-view";

export default function PostDetailsPage() {
  return <PostDetailsView />;
}
