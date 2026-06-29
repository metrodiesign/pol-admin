"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

function StatusChip({ status }: { status: "published" | "draft" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
        status === "published"
          ? "bg-info/16 text-info-dark"
          : "bg-grey-500/16 text-grey-800",
      )}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div
      className="relative flex overflow-hidden rounded-[16px] bg-card sm:h-[240px]"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* Content area (left side) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-6 pb-4 pt-6">
        {/* Status + date row */}
        <div className="mb-4 flex items-center gap-2">
          <StatusChip status={post.status} />
          <span className="text-xs text-grey-500">{post.date}</span>
        </div>

        {/* Title */}
        <Link
          href="/dashboard/post/details"
          className="mb-2 line-clamp-2 text-sm font-semibold leading-[1.5] text-grey-800 transition-colors hover:underline"
        >
          {post.title}
        </Link>

        {/* Description */}
        <p className="line-clamp-2 flex-1 text-xs leading-[1.7] text-grey-500">
          {post.description}
        </p>

        {/* Footer stats */}
        <div className="mt-auto flex items-center gap-4 pt-4 sm:pt-2">
          <span className="flex items-center gap-1 text-xs text-grey-500">
            <MessageCircle className="size-3.5" />
            {post.comments}
          </span>
          <span className="flex items-center gap-1 text-xs text-grey-500">
            <Eye className="size-3.5" />
            {post.views}
          </span>
          <span className="flex items-center gap-1 text-xs text-grey-500">
            <Share2 className="size-3.5" />
            {post.shares}
          </span>
          {/* Avatar shown on mobile (no cover image visible) */}
          <div className="ml-auto size-8 shrink-0 overflow-hidden rounded-full sm:hidden">
            <Image
              src={post.authorAvatarUrl}
              alt={post.authorName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Cover image (right side, inset rounded) — hidden on mobile */}
      <div className="relative hidden shrink-0 py-2 pr-2 sm:block">
        <div className="relative h-full w-[164px] overflow-hidden rounded-[12px]">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="164px"
          />
        </div>
        {/* Author avatar overlay — top-right corner of cover */}
        <div className="absolute right-4 top-4 size-10 overflow-hidden rounded-full ring-2 ring-card">
          <Image
            src={post.authorAvatarUrl}
            alt={post.authorName}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
