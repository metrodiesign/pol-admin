"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Heart,
  Reply,
  Paperclip,
  ImageIcon,
  Smile,
  ChevronDown,
} from "lucide-react";

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconTwitter({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { POST_COMMENTS, FAVORITE_AVATARS } from "@/lib/mock/post";
import type { PostComment } from "@/types/post";

const COVER_URL =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-3.webp";

const ARTICLE_IMAGE_URL =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-4.webp";

function CommentItem({ comment }: { comment: PostComment }) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <Avatar size="default" className="shrink-0">
          <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-grey-800">
              {comment.authorName}
            </span>
            <span className="text-xs text-grey-500">{comment.date}</span>
          </div>
          <p className="text-sm text-grey-600 leading-relaxed">{comment.body}</p>
          <button className="mt-2 flex items-center gap-1 text-xs text-grey-500 hover:text-grey-800 transition-colors">
            <Reply className="size-3.5" />
            Reply
          </button>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <Avatar size="default" className="shrink-0">
                <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-grey-800">
                    {reply.authorName}
                  </span>
                  <span className="text-xs text-grey-500">{reply.date}</span>
                </div>
                <p className="text-sm text-grey-600 leading-relaxed">
                  {reply.mentionName && (
                    <span className="font-semibold text-grey-800">
                      @{reply.mentionName}{" "}
                    </span>
                  )}
                  {reply.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaginationBar({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const pages = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &lsaquo;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
            page === p
              ? "bg-grey-800 text-white font-bold"
              : "text-grey-700 hover:bg-grey-100"
          }`}
        >
          {p}
        </button>
      ))}
      <span className="flex size-9 items-center justify-center text-sm text-grey-500">
        &hellip;
      </span>
      <button
        onClick={() => onPageChange(total)}
        className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
          page === total
            ? "bg-grey-800 text-white font-bold"
            : "text-grey-700 hover:bg-grey-100"
        }`}
      >
        {total}
      </button>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === total}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &rsaquo;
      </button>
    </div>
  );
}

export function PostDetailsView() {
  const [liked, setLiked] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentPage, setCommentPage] = useState(1);

  return (
    <div className="mx-auto max-w-[672px] py-4">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/post/list"
          className="flex items-center gap-1.5 text-sm font-semibold text-grey-800 hover:text-grey-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="https://minimals.cc/post/climate-change-and-its-effects-on-global-food-security"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[8px] border border-grey-300 px-3 h-9 text-sm font-semibold text-grey-800 hover:bg-grey-100 transition-colors"
          >
            <ExternalLink className="size-4" />
            Go live
          </a>
          <Link
            href="/dashboard/post/edit"
            className="flex items-center gap-1.5 rounded-[8px] border border-grey-300 px-3 h-9 text-sm font-semibold text-grey-800 hover:bg-grey-100 transition-colors"
          >
            <Pencil className="size-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Hero / cover */}
      <div className="relative h-[360px] overflow-hidden rounded-[16px] mb-8">
        <Image
          src={COVER_URL}
          alt="Climate Change and Its Effects on Global Food Security"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-grey-900/80 via-grey-900/40 to-transparent" />

        {/* Published chip — top-left */}
        <div className="absolute top-5 left-6 sm:top-6 sm:left-8">
          <span className="inline-flex h-6 items-center rounded-md bg-info/16 px-1.5 text-xs font-bold text-info-dark">
            Published
          </span>
        </div>

        {/* Title — bottom-left */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-20">
          <h1
            className="max-w-[480px] text-[28px] sm:text-[32px] font-bold leading-tight text-white"
            style={{ fontFamily: "var(--font-barlow, var(--font-sans))" }}
          >
            Climate Change and Its Effects on Global Food Security
          </h1>
        </div>

        {/* Share button */}
        <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex items-center gap-1.5 rounded-[8px] bg-white/10 backdrop-blur-sm border border-white/20 px-3 h-9 text-sm font-semibold text-white hover:bg-white/20 transition-colors outline-none"
                  type="button"
                />
              }
            >
              Share post
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={8}>
              <DropdownMenuItem>
                <IconFacebook className="mr-1 size-4" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconInstagram className="mr-1 size-4" />
                Instagram
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconLinkedin className="mr-1 size-4" />
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconTwitter className="mr-1 size-4" />
                Twitter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Article body */}
      <div className="prose-article mb-8">
        {/* Lead subtitle */}
        <p className="text-base font-semibold text-grey-800 mb-6 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s.
        </p>

        <h1 className="text-h1 text-grey-800 mb-3">
          Heading H1
        </h1>
        <h2 className="text-h2 text-grey-800 mb-3">
          Heading H2
        </h2>
        <h3 className="text-h3 text-grey-800 mb-3">Heading H3</h3>
        <h4 className="text-h4 text-grey-800 mb-3">Heading H4</h4>
        <h5 className="text-h5 text-grey-800 mb-3">Heading H5</h5>
        <h6 className="text-h6 text-grey-800 mb-4">Heading H6</h6>

        <h4 className="text-h4 text-grey-800 mb-3">Paragraph</h4>
        <p className="text-base text-grey-800 mb-4 leading-7">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </p>
        <p className="text-base text-grey-800 mb-4 leading-7">
          This is a{" "}
          <a
            href="https://mtaweb.com"
            className="text-grey-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            MTAweb.com
          </a>{" "}
          link. It was <strong>popularised</strong> in the <em>1960s</em> with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like{" "}
          <u>Aldus PageMaker</u> including versions of Lorem Ipsum.
        </p>

        <h4 className="text-h4 text-grey-800 mb-3">
          Unordered list
        </h4>
        <ul className="list-disc list-inside mb-4 space-y-1 text-base text-grey-800 leading-7">
          <li>
            <a
              href="https://www.freecodecamp.org"
              className="text-grey-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              External link - www.freecodecamp.org
            </a>
          </li>
          <li>
            <Link href="/" className="text-grey-800 underline">
              Inside link
            </Link>
          </li>
          <li>Normal text</li>
        </ul>

        <h4 className="text-h4 text-grey-800 mb-3">
          Ordered list
        </h4>
        <ol className="list-decimal list-inside mb-4 space-y-1 text-base text-grey-800 leading-7">
          <li>Analysis</li>
          <li>Design</li>
          <li>Implementation</li>
        </ol>

        <h4 className="text-h4 text-grey-800 mb-3">Blockquote</h4>
        <blockquote className="relative border-l-4 border-grey-300 pl-6 mb-4 py-2">
          <span className="absolute left-4 -top-1 text-5xl text-grey-300 font-serif leading-none select-none">
            &ldquo;
          </span>
          <p className="text-base text-grey-700 italic leading-7 mt-4">
            Life is short, Smile while you still have teeth!
          </p>
        </blockquote>

        <h4 className="text-h4 text-grey-800 mb-3">Block code</h4>
        <pre className="rounded-[12px] bg-grey-900 text-grey-100 p-5 mb-6 overflow-x-auto text-sm leading-6 font-mono">
          <code>{`for (var i=1; i <= 20; i++) {
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}`}</code>
        </pre>

        <p className="text-base text-grey-800 mb-4 leading-7">
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
          magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a
          pharetra augue.
        </p>

        {/* Inline image 1 — light placeholder */}
        <div className="relative h-[240px] rounded-[12px] overflow-hidden mb-4 bg-grey-100">
          <Image
            src="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-14.webp"
            alt="Article image placeholder"
            fill
            className="object-cover opacity-60"
          />
        </div>

        {/* Inline image 2 — nature/landscape */}
        <div className="relative h-[240px] rounded-[12px] overflow-hidden mb-4">
          <Image
            src={ARTICLE_IMAGE_URL}
            alt="Article image"
            fill
            className="object-cover"
          />
        </div>

        <h5 className="text-h5 text-grey-800 mb-3">
          Why do we use it?
        </h5>
        <p className="text-base text-grey-800 mb-6 leading-7">
          It is a long established fact that a reader will be distracted by the
          readable content of a page when looking at its layout. The point of
          using Lorem Ipsum is that it has a more-or-less normal distribution of
          letters, as opposed to using &ldquo;Content here, content here&rdquo;.
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Technology", "Health and Wellness", "Travel", "Finance", "Education"].map(
          (tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-[6px] border border-grey-300 px-3 py-1 text-sm text-grey-700 hover:bg-grey-100 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          )
        )}
      </div>

      {/* Engagement row */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-grey-200">
        <button
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? "text-error" : "text-grey-500 hover:text-error"
          }`}
        >
          <Heart
            className={`size-5 ${liked ? "fill-current" : ""}`}
          />
          <span className="font-semibold">2.03k</span>
        </button>

        <AvatarGroup>
          {FAVORITE_AVATARS.map((url, i) => (
            <Avatar key={i} size="sm">
              <AvatarImage src={url} alt={`User ${i + 1}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount className="text-xs text-grey-600">
            +17
          </AvatarGroupCount>
        </AvatarGroup>
      </div>

      {/* Comments section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <h4 className="text-[18px] font-bold text-grey-800">Comments</h4>
          <span className="text-[14px] text-grey-500 font-medium">
            ({POST_COMMENTS.length})
          </span>
        </div>

        {/* Comment composer */}
        <div
          className="rounded-[12px] p-4 mb-6"
          style={{
            boxShadow:
              "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          }}
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write some of your comments..."
            aria-label="Write a comment"
            rows={4}
            className="w-full resize-none text-sm text-grey-800 placeholder:text-grey-400 outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-grey-200">
            <div className="flex items-center gap-1">
              <button className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors">
                <ImageIcon className="size-4" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors">
                <Paperclip className="size-4" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors">
                <Smile className="size-4" />
              </button>
            </div>
            <button className="rounded-[8px] bg-foreground px-4 h-9 text-sm font-bold text-card hover:opacity-90 transition-opacity">
              Post comment
            </button>
          </div>
        </div>

        {/* Comment list */}
        <div className="divide-y divide-grey-200">
          {POST_COMMENTS.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Comment pagination */}
        <PaginationBar
          page={commentPage}
          total={8}
          onPageChange={setCommentPage}
        />
      </div>
    </div>
  );
}
