"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
  ChevronDown,
  Calendar,
  CalendarX,
  Briefcase,
  DollarSign,
  Award,
  MapPin,
  Phone,
} from "lucide-react";
import type { Job } from "@/types/job";

interface JobDetailsViewProps {
  job: Job;
}

function StatusBadge({ status }: { status: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(status);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-control bg-foreground px-3 text-sm font-bold text-card transition-opacity hover:opacity-90"
      >
        {current}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[130px] rounded-xl bg-card py-1 shadow-[0_0_2px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)]">
          {["Draft", "Published"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCurrent(s);
                setOpen(false);
              }}
              className={`flex w-full px-4 py-2 text-sm transition-colors hover:bg-grey-100 ${current === s ? "font-semibold text-grey-900" : "text-grey-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-[10px] bg-grey-500/16 px-2.5 py-0.5 text-xs text-grey-800">
      {label}
    </span>
  );
}

function CandidateRow({
  name,
  role,
  avatarUrl,
}: {
  name: string;
  role: string;
  avatarUrl: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Image
        src={avatarUrl}
        alt={name}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"

      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-grey-800 truncate">{name}</p>
        <p className="text-xs text-grey-500 truncate">{role}</p>
      </div>
    </div>
  );
}

const CANDIDATES = [
  {
    name: "Angelique Morse",
    role: "Content Creator",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-17.webp",
  },
  {
    name: "Ariana Lang",
    role: "IT Administrator",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-20.webp",
  },
  {
    name: "Aspen Schmitt",
    role: "UX Designer",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-3.webp",
  },
  {
    name: "Bradley Weber",
    role: "Frontend Dev",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-4.webp",
  },
  {
    name: "Camila Bell",
    role: "Product Manager",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-5.webp",
  },
  {
    name: "Damon Harrison",
    role: "Backend Dev",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-6.webp",
  },
  {
    name: "Elena Fisher",
    role: "Data Analyst",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-7.webp",
  },
  {
    name: "Frank Torres",
    role: "DevOps Engineer",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-8.webp",
  },
  {
    name: "Grace Nguyen",
    role: "QA Engineer",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-9.webp",
  },
  {
    name: "Henry Kim",
    role: "Marketing Lead",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-10.webp",
  },
  {
    name: "Irene Lawson",
    role: "Sales Rep",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-11.webp",
  },
  {
    name: "James Wright",
    role: "Operations",
    avatarUrl:
      "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-12.webp",
  },
];

/** Convert MM/DD/YYYY (expired field) to "DD Mon YYYY" display format. Falls back to raw string. */
function formatExpired(raw: string): string {
  const parts = raw.split("/");
  if (parts.length !== 3) return raw;
  const [mm, dd, yyyy] = parts;
  if (!mm || !dd || !yyyy) return raw;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[parseInt(mm, 10) - 1];
  if (!monthName) return raw;
  return `${dd} ${monthName} ${yyyy}`;
}

export function JobDetailsView({ job }: JobDetailsViewProps) {
  const [tab, setTab] = useState<"content" | "candidates">("content");

  const expirationDisplay = job.expired ? formatExpired(job.expired) : job.posted;

  const overviewRows = [
    { icon: <Calendar className="size-4" />, label: "Date posted", value: job.posted },
    { icon: <CalendarX className="size-4" />, label: "Expiration date", value: expirationDisplay },
    { icon: <Briefcase className="size-4" />, label: "Employment type", value: job.employmentType },
    { icon: <DollarSign className="size-4" />, label: "Offered salary", value: job.salary },
    { icon: <Award className="size-4" />, label: "Experience", value: job.experience },
  ];

  return (
    <div>
      {/* Action bar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/job/list"
          className="flex items-center gap-0.5 rounded-control px-2 py-1.5 text-sm font-bold text-grey-800 transition-colors hover:bg-grey-100"
        >
          <ChevronLeft className="size-5" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/job/edit"
            aria-label="Edit job"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-grey-100"
          >
            <Pencil className="size-4 text-grey-600" />
          </Link>
          <StatusBadge status={job.status} />
        </div>
      </div>

      {/* Underline tabs */}
      <div className="mb-6 flex border-b border-grey-200">
        <button
          type="button"
          onClick={() => setTab("content")}
          className={`relative flex h-12 items-center pr-6 text-sm transition-colors ${
            tab === "content"
              ? "font-semibold text-grey-800 after:absolute after:bottom-0 after:left-0 after:right-6 after:h-0.5 after:rounded-t-full after:bg-foreground"
              : "font-medium text-grey-600 hover:text-grey-800"
          }`}
        >
          Job content
        </button>
        <button
          type="button"
          onClick={() => setTab("candidates")}
          className={`relative flex h-12 items-center pr-6 text-sm transition-colors ${
            tab === "candidates"
              ? "font-semibold text-grey-800 after:absolute after:bottom-0 after:left-0 after:right-6 after:h-0.5 after:rounded-t-full after:bg-foreground"
              : "font-medium text-grey-600 hover:text-grey-800"
          }`}
        >
          Candidates{" "}
          <span className="ml-1 rounded-md bg-foreground px-1.5 py-0.5 text-xs font-bold text-card">
            {job.candidates}
          </span>
        </button>
      </div>

      {/* Content */}
      {tab === "content" ? (
        <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
          {/* Main content */}
          <div className="min-w-0 mmd:col-span-8">
            <h1 className="mb-5 text-xl font-bold leading-9 text-grey-800">
              {job.title}
            </h1>
            {job.descriptionSections ? (
              <div className="space-y-6">
                {job.descriptionSections.map((section, i) => (
                  <div key={i}>
                    <h3 className="mb-2 text-base font-semibold leading-7 text-grey-800">
                      {section.heading}
                    </h3>
                    {section.paragraph && (
                      <p className="leading-7 text-grey-800">{section.paragraph}</p>
                    )}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1">
                        {section.bullets.map((b, j) => (
                          <li key={j} className="leading-7 text-grey-800">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grey-500">No description provided.</p>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-grey-800">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <Chip key={s} label={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-grey-800">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <Chip key={b} label={b} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 mmd:col-span-4">
            {/* Overview card */}
            <div
              className="rounded-card bg-card p-6"
              style={{
                boxShadow:
                  "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
              }}
            >
              <h6 className="mb-4 text-base font-semibold text-grey-800">Overview</h6>
              <div className="flex flex-col gap-4">
                {overviewRows.map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-grey-500">{row.icon}</span>
                    <div>
                      <p className="text-xs text-grey-500">{row.label}</p>
                      <p className="text-sm font-semibold text-grey-800">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div
              className="rounded-card bg-card p-6"
              style={{
                boxShadow:
                  "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
              }}
            >
              <div className="mb-3 size-14 overflow-hidden rounded-xl bg-grey-100">
                <Image
                  src={job.logoUrl}
                  alt={job.company}
                  width={56}
                  height={56}
                  className="size-14 object-cover"
          
                />
              </div>
              <h6 className="text-base font-semibold text-grey-800">{job.company}</h6>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-sm text-grey-600">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-grey-400" />
                  <span>19034 Verna Unions Apt. 164 - Honolulu, RI / 87535</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-grey-600">
                  <Phone className="size-4 shrink-0 text-grey-400" />
                  +1 202-555-0143
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-card bg-card p-6"
          style={{
            boxShadow:
              "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          }}
        >
          <h6 className="mb-4 text-base font-semibold text-grey-800">
            Candidates ({CANDIDATES.length})
          </h6>
          <div className="divide-y divide-grey-100">
            {CANDIDATES.map((c) => (
              <CandidateRow key={c.name} {...c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
