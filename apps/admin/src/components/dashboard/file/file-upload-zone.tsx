import { Upload } from "lucide-react";

/** Upload file zone — standalone on mobile (after Recent files),
 *  embedded inside the right-rail gauge card on desktop. */
export function FileUploadZone() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-grey-300 px-4 py-6">
      <Upload className="size-8 text-grey-400" />
      <p className="text-sm font-semibold text-grey-700">Upload file</p>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <span className="rounded-md border border-grey-300 px-3 py-1.5 text-xs font-medium text-grey-700 hover:bg-grey-100">
            Choose Files
          </span>
          <input type="file" className="sr-only" multiple />
        </label>
        <span className="text-xs text-grey-400">No file chosen</span>
      </div>
    </div>
  );
}
