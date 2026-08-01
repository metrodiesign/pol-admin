import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File | Dashboard - Minimal UI",
};

import { FileStorageCards } from "@/components/dashboard/file/file-storage-cards";
import { FileDataActivity } from "@/components/dashboard/file/file-data-activity";
import { FileStorageOverview } from "@/components/dashboard/file/file-storage-overview";
import { FileFolders } from "@/components/dashboard/file/file-folders";
import { FileRecent } from "@/components/dashboard/file/file-recent";
import { FileStorageGauge } from "@/components/dashboard/file/file-storage-gauge";
import { FileUploadZone } from "@/components/dashboard/file/file-upload-zone";
import { FileUpgradeCard } from "@/components/dashboard/file/file-upgrade-card";

/**
 * Desktop layout (sm+):
 *   Row 1 — 3 storage-app cards (4/12 each = 12 total)
 *   Row 2 — left 8/12: DataActivity + Folders + Recent
 *            right 4/12: [upload + gauge + categories] card + upgrade card
 *
 * Mobile layout (< sm):
 *   1. Gauge + categories
 *   2. Dropbox / Drive / OneDrive (stacked)
 *   3. Data activity
 *   4. Folders (2-col)
 *   5. Recent files
 *   6. Upload zone
 *   7. Upgrade card
 */
export default function FilePage() {
  return (
    <div className="-mt-2 pb-16">
      {/* ────────────────────────────────────────────────────────────────────
          DESKTOP grid (hidden on mobile, shown sm+)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="hidden sm:grid sm:grid-cols-12 sm:gap-6">
        {/* Row 1: storage-app cards */}
        <FileStorageCards />

        {/* Row 2 left: full-width <900, 6/12 at 900-1200, 8/12 at 1200+ */}
        <div className="col-span-12 mmd:col-span-6 mlg:col-span-8 space-y-6">
          <FileDataActivity />
          <FileFolders />
          <FileRecent />
        </div>

        {/* Row 2 right: full-width <900, 6/12 at 900-1200, 4/12 at 1200+ */}
        <div className="col-span-12 mmd:col-span-6 mlg:col-span-4">
          <FileStorageOverview />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          MOBILE stack (shown on mobile, hidden sm+)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:hidden">
        {/* 1. Gauge + categories */}
        <FileStorageGauge />

        {/* 2. Storage app cards — single column stack on mobile */}
        <FileStorageCards stacked />

        {/* 3. Data activity */}
        <FileDataActivity />

        {/* 4. Folders */}
        <FileFolders />

        {/* 5. Recent files */}
        <FileRecent />

        {/* 6. Upload zone — standalone dashed card on mobile */}
        <FileUploadZone />

        {/* 7. Upgrade card */}
        <FileUpgradeCard />
      </div>
    </div>
  );
}
