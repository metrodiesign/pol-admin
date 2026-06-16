import { UploadCloud } from "lucide-react";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { FileManagerView } from "@/components/dashboard/file-manager/file-manager-view";

export const metadata = {
  title: "File manager | Dashboard - Minimal UI",
};

export default function FileManagerPage() {
  return (
    <>
      <CustomBreadcrumbs
        heading="File manager"
        action={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-bold text-card transition-opacity hover:opacity-90"
          >
            <UploadCloud className="size-4" />
            Upload
          </button>
        }
        className="mb-5"
      />

      <FileManagerView />
    </>
  );
}
