"use client";

import Image from "next/image";
import SimpleBar from "simplebar-react";
import { Plus, MoreVertical, ArrowRight } from "lucide-react";
import Link from "next/link";
import { folders } from "@/lib/mock/file";
import { FolderStarIcon } from "./folder-star-icon";

export function FileFolders() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h6 className="text-lg font-semibold text-grey-800">Folders</h6>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-full bg-grey-800 text-white hover:bg-grey-700"
            aria-label="Add folder"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <Link
          href="/dashboard/file-manager"
          className="-mr-3 inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Horizontal scroll row — desktop SimpleBar, 2-col grid on mobile */}
      <SimpleBar autoHide className="mt-4 hidden pb-1 sm:block">
        <div className="flex gap-4">
        {folders.map((folder) => (
          <div
            key={folder.name}
            className="shrink-0 rounded-card border border-grey-200 p-5"
            style={{ width: 240, minWidth: 240, minHeight: 176 }}
          >
            <div className="flex items-start justify-between">
              {/* Folder icon */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M3 9a4 4 0 014-4h6.17a4 4 0 012.83 1.17L17.83 7H29a4 4 0 014 4v16a4 4 0 01-4 4H7a4 4 0 01-4-4V9z"
                  fill="#FFAB00"
                  opacity="0.48"
                />
                <path
                  d="M7 13a4 4 0 014-4h14a4 4 0 014 4v12a4 4 0 01-4 4H7a4 4 0 01-4-4V13z"
                  fill="#FFAB00"
                />
              </svg>
              <div className="flex items-center gap-1">
                <FolderStarIcon starred={folder.starred} />
                <button
                  type="button"
                  className="rounded p-0.5 text-grey-400 hover:text-grey-600"
                  aria-label="More options"
                >
                  <MoreVertical className="size-4" />
                </button>
              </div>
            </div>
            <h6 className="mt-3 text-sm font-semibold leading-[22px] text-grey-800">{folder.name}</h6>
            <p className="mt-0.5 text-xs text-grey-500">
              {folder.size} / {folder.fileCount}
            </p>
            {/* Avatar group */}
            {(folder.shared.length > 0 || folder.overflow > 0) && (
              <div className="mt-3 flex items-center">
                <div className="flex -space-x-2">
                  {folder.shared.map((av) => (
                    <Image
                      key={av.src}
                      src={av.src}
                      alt={av.name}
                      width={24}
                      height={24}
                      className="size-6 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                {folder.overflow > 0 && (
                  <span className="ml-1 text-xs font-medium text-grey-500">
                    +{folder.overflow}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
      </SimpleBar>

      {/* 2-col grid on mobile */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
        {folders.slice(0, 4).map((folder) => (
          <div
            key={folder.name}
            className="rounded-card border border-grey-200 p-4"
          >
            <div className="flex items-start justify-between">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <path
                  d="M3 9a4 4 0 014-4h6.17a4 4 0 012.83 1.17L17.83 7H29a4 4 0 014 4v16a4 4 0 01-4 4H7a4 4 0 01-4-4V9z"
                  fill="#FFAB00"
                  opacity="0.48"
                />
                <path
                  d="M7 13a4 4 0 014-4h14a4 4 0 014 4v12a4 4 0 01-4 4H7a4 4 0 01-4-4V13z"
                  fill="#FFAB00"
                />
              </svg>
              <FolderStarIcon starred={folder.starred} />
            </div>
            <h6 className="mt-2 text-sm font-semibold leading-[22px] text-grey-800">{folder.name}</h6>
            <p className="text-xs text-grey-500">{folder.size}</p>
            <p className="text-xs text-grey-500">{folder.fileCount}</p>
            {folder.shared.length > 0 && (
              <div className="mt-2 flex -space-x-2">
                {folder.shared.slice(0, 2).map((av) => (
                  <Image
                    key={av.src}
                    src={av.src}
                    alt={av.name}
                    width={20}
                    height={20}
                    className="size-5 rounded-full border-2 border-white object-cover"
                  />
                ))}
                {folder.overflow > 0 && (
                  <span className="ml-1 text-xs font-medium text-grey-500">+{folder.overflow}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
