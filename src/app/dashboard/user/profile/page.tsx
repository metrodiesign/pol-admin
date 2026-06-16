"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Mail,
  Building,
  GraduationCap,
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Radio,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  LayoutGrid,
  Users,
} from "lucide-react";
import { userProfile, posts } from "@/lib/mock/user-profile";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/mock/user-profile";

const TABS = [
  { key: "profile", label: "Profile", icon: LayoutGrid },
  { key: "followers", label: "Followers", icon: Heart },
  { key: "friends", label: "Friends", icon: Users },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
] as const;

const SOCIAL_ICONS: Record<string, string> = {
  facebook:
    "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  instagram:
    "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z",
  linkedin:
    "M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

const SOCIAL_COLORS: Record<string, string> = {
  facebook: "text-[#1877F2]",
  instagram: "text-[#E4405F]",
  linkedin: "text-[#0A66C2]",
  twitter: "text-grey-800",
};

function ProfileCover({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="relative h-[290px] overflow-hidden">
      {/* Teal-tinted cover image (flat rgba(0,75,80,0.8) over cover-4.webp) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,75,80,0.8), rgba(0,75,80,0.8)), url('${userProfile.cover}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Avatar + name (white) — overlaps the white tab strip below */}
      <div className="absolute bottom-[26px] left-6 z-20 flex items-center gap-4 sm:left-10">
        <Image
          src={userProfile.avatar}
          alt={userProfile.name}
          width={124}
          height={124}
          className="size-[124px] rounded-full border-4 border-white object-cover"
        />
        <div className="text-white">
          <h4 className="text-2xl font-bold">{userProfile.name}</h4>
          <p className="mt-0.5 text-sm opacity-70">{userProfile.role}</p>
        </div>
      </div>

      {/* White tab strip pinned to the bottom of the cover */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex h-12 items-center justify-center overflow-x-auto bg-card px-4 sm:justify-end sm:px-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-[9px] text-sm transition-colors sm:px-3",
              activeTab === tab.key
                ? "border-grey-800 font-semibold text-grey-800"
                : "border-transparent font-medium text-grey-600 hover:text-grey-800",
            )}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileStatsCard() {
  return (
    <div className="dashboard-card">
      <div className="flex items-center divide-x divide-grey-200">
        <div className="flex-1 py-6 text-center">
          <p className="text-2xl font-bold text-grey-800">{userProfile.followers}</p>
          <p className="mt-1 text-sm text-grey-600">Follower</p>
        </div>
        <div className="flex-1 py-6 text-center">
          <p className="text-2xl font-bold text-grey-800">{userProfile.following}</p>
          <p className="mt-1 text-sm text-grey-600">Following</p>
        </div>
      </div>
    </div>
  );
}

function ProfileAboutCard() {
  const { about } = userProfile;
  return (
    <div className="dashboard-card p-6">
      <h6 className="text-lg font-semibold text-grey-800">About</h6>
      <p className="mt-6 text-sm leading-[22px] text-grey-600">{about.bio}</p>
      <ul className="mt-6 space-y-4">
        <li className="flex items-center gap-2 text-sm text-grey-600">
          <MapPin className="size-5 shrink-0 text-grey-500" />
          <span>
            Live at{" "}
            <span className="font-semibold text-grey-800">{about.country}</span>
          </span>
        </li>
        <li className="flex items-center gap-2 text-sm text-grey-600">
          <Mail className="size-5 shrink-0 text-grey-500" />
          <span>{about.email}</span>
        </li>
        <li className="flex items-center gap-2 text-sm text-grey-600">
          <Building className="size-5 shrink-0 text-grey-500" />
          <span>
            <span className="font-semibold text-grey-800">{about.role}</span> at{" "}
            <span className="font-semibold text-grey-800">{about.company}</span>
          </span>
        </li>
        <li className="flex items-center gap-2 text-sm text-grey-600">
          <GraduationCap className="size-5 shrink-0 text-grey-500" />
          <span>
            Studied at{" "}
            <span className="font-semibold text-grey-800">{about.school}</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

function ProfileSocialCard() {
  const { social } = userProfile;
  return (
    <div className="dashboard-card p-6">
      <h6 className="text-lg font-semibold text-grey-800">Social</h6>
      <ul className="mt-6 space-y-4">
        {Object.entries(social).map(([key, url]) => (
          <li key={key} className="flex items-center gap-2 text-sm text-grey-600">
            <svg
              viewBox="0 0 24 24"
              className={cn("size-5 shrink-0 fill-current", SOCIAL_COLORS[key])}
            >
              <path d={SOCIAL_ICONS[key]} />
            </svg>
            <span className="truncate">{url}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostComposer() {
  return (
    <div className="dashboard-card p-6">
      <textarea
        aria-label="Share what you are thinking here"
        placeholder="Share what you are thinking here..."
        rows={4}
        className="w-full resize-none rounded-control border border-grey-200 bg-transparent px-4 py-3 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-400"
      />
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-full bg-[rgba(145,158,171,0.16)] px-2 text-[13px] font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
          >
            <ImageIcon className="size-4 text-success" />
            Image/Video
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-full bg-[rgba(145,158,171,0.16)] px-2 text-[13px] font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
          >
            <Radio className="size-4 text-error" />
            Streaming
          </button>
        </div>
        <button
          type="button"
          className="flex h-9 items-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900 dark:bg-white dark:text-grey-900 dark:hover:bg-grey-300"
        >
          Post
        </button>
      </div>
    </div>
  );
}

function AvatarStack({ likers, overflow }: { likers: string[]; overflow: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {likers.slice(0, 3).map((src, i) => (
          <Image
            key={i}
            src={src}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-full border-[1.5px] border-white object-cover"
            style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i, position: "relative" }}
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="text-xs text-grey-500">+{overflow}</span>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(true);

  return (
    <div className="dashboard-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Image
          src={post.user.avatar}
          alt={post.user.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-grey-800">{post.user.name}</p>
          <p className="text-xs text-grey-500">{post.createdAt}</p>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-grey-500 hover:bg-grey-100 hover:text-grey-700"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      {/* Content */}
      <p className="mt-6 text-sm leading-[22px] text-grey-800">{post.content}</p>

      {/* Media */}
      {post.image && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-grey-100">
          <Image src={post.image} alt="" fill className="object-cover" />
        </div>
      )}

      {/* Action bar */}
      <div className="mt-6 flex items-center justify-between border-t border-grey-200 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              liked ? "text-error" : "text-grey-500 hover:text-error",
            )}
          >
            <Heart
              className={cn("size-4", liked && "fill-current")}
            />
            <span>{liked ? post.likes + 1 : post.likes}</span>
          </button>
          <AvatarStack likers={post.likers} overflow={17} />
        </div>
        <div className="flex items-center gap-2 text-grey-500">
          <button
            type="button"
            className="rounded-full p-1 hover:bg-grey-100 hover:text-grey-700"
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-full p-1 hover:bg-grey-100 hover:text-grey-700"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="mt-6 space-y-4">
          {post.comments.map((comment, i) => (
            <div key={i} className="flex gap-3">
              <Image
                src={comment.user.avatar}
                alt={comment.user.name}
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-grey-800">{comment.user.name}</p>
                  <p className="text-xs text-grey-400">{comment.createdAt}</p>
                </div>
                <p className="mt-0.5 text-sm text-grey-600">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="mt-6 flex items-center gap-3 border-t border-grey-200 pt-4">
        <Image
          src={userProfile.avatar}
          alt="Me"
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-1 items-center rounded-control border border-grey-200 bg-transparent px-3 py-2">
          <input
            type="text"
            aria-label="Write a comment"
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-sm text-grey-800 outline-none placeholder:text-grey-400"
          />
          <div className="flex items-center gap-1 text-grey-400">
            <button type="button" className="hover:text-grey-600">
              <Smile className="size-4" />
            </button>
            <button type="button" className="hover:text-grey-600">
              <Paperclip className="size-4" />
            </button>
            <button type="button" className="hover:text-grey-600">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <PageHeader
        title="Profile"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User", href: "/dashboard/user/list" },
          { label: "Jaydon Frankie" },
        ]}
      />

      {/* Banner card */}
      <div className="dashboard-card mb-6 overflow-hidden">
        <ProfileCover activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
          {/* Left column */}
          <div className="space-y-6 mmd:col-span-4">
            <ProfileStatsCard />
            <ProfileAboutCard />
            <ProfileSocialCard />
          </div>
          {/* Right column (feed) */}
          <div className="space-y-6 mmd:col-span-8">
            <PostComposer />
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {activeTab !== "profile" && (
        <div className="dashboard-card flex min-h-[300px] items-center justify-center p-6">
          <p className="text-sm capitalize text-grey-400">{activeTab} content</p>
        </div>
      )}
    </>
  );
}
