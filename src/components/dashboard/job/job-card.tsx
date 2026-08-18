"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreVertical,
  Users,
  Award,
  Briefcase,
  DollarSign,
  UserRound,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
}

function MoreMenu({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
        className="flex size-8 items-center justify-center rounded-full text-grey-400 transition-colors hover:bg-grey-200 hover:text-grey-700"
      >
        <MoreVertical className="size-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-50 min-w-[120px] rounded-xl bg-card py-1 shadow-[0_0_2px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)]"
          role="menu"
        >
          <Link
            href={`/minimals/job/${jobId}`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-grey-800 hover:bg-grey-100"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Eye className="size-4" /> View
          </Link>
          <Link
            href={`/minimals/job/edit`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-grey-800 hover:bg-grey-100"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Pencil className="size-4" /> Edit
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error hover:bg-grey-100"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div
      className="relative flex flex-col rounded-card bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* More-menu: absolute top-right */}
      <div className="absolute right-3 top-3">
        <MoreMenu jobId={job.id} />
      </div>

      {/* Top section: logo, title, posted, candidates */}
      <div className="p-6 pb-4">
        <div className="mb-4 size-12 overflow-hidden rounded-xl bg-grey-100">
          <Image
            src={job.logoUrl}
            alt={job.company}
            width={48}
            height={48}
            className="size-12 object-cover"
          />
        </div>

        {/* title + posted */}
        <Link
          href={`/minimals/job/${job.id}`}
          className="mb-0.5 block text-sm font-bold leading-snug text-grey-800 hover:underline"
        >
          {job.title}
        </Link>
        <p className="text-xs text-grey-400">
          Posted date: {job.posted}
        </p>

        {/* candidates */}
        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-success-dark">
          <Users className="size-3.5" />
          {job.candidates} candidates
        </p>
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-grey-200" />

      {/* Footer section: meta 2x2 grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-6">
        <div className="flex items-center gap-1.5 text-xs text-grey-500">
          <Award className="size-3.5 shrink-0" />
          <span className="truncate">{job.experience}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey-500">
          <Briefcase className="size-3.5 shrink-0" />
          <span className="truncate">{job.employmentType}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey-500">
          <DollarSign className="size-3.5 shrink-0" />
          <span className="truncate">{job.salary}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey-500">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">{job.role}</span>
        </div>
      </div>
    </div>
  );
}
