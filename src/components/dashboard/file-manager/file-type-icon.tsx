import type { FileManagerItemType } from "@/lib/mock/file-manager";

interface FileTypeIconProps {
  type: FileManagerItemType;
  className?: string;
}

// Folder SVG — yellow fill matching the live screenshot
function FolderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="size-8"
    >
      {/* Back panel */}
      <path
        d="M4 20c0-5.5 4.5-10 10-10h4l4 4h12c5.5 0 10 4.5 10 10v8c0 5.5-4.5 10-10 10H14C8.5 42 4 37.5 4 32V20z"
        fill="#FFAB00"
        opacity="0.32"
      />
      {/* Front panel */}
      <path
        d="M4 26c0-3.3 2.7-6 6-6h28c3.3 0 6 2.7 6 6v8c0 3.3-2.7 6-6 6H10c-3.3 0-6-2.7-6-6v-8z"
        fill="#FFAB00"
      />
    </svg>
  );
}

// Image file SVG — green fill
function ImageFileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="size-8"
    >
      {/* File page */}
      <rect x="8" y="4" width="32" height="40" rx="4" fill="#22C55E" opacity="0.32" />
      <rect x="8" y="4" width="32" height="40" rx="4" fill="none" stroke="#22C55E" strokeWidth="0" />
      {/* Dog-ear fold */}
      <path d="M28 4l12 12H28V4z" fill="#22C55E" />
      {/* Image mountain icon inside */}
      <rect x="12" y="20" width="24" height="18" rx="2" fill="#22C55E" />
      <circle cx="18" cy="25" r="2.5" fill="white" opacity="0.7" />
      <path d="M12 34l7-7 4 4 4-5 7 8H12z" fill="white" opacity="0.7" />
    </svg>
  );
}

export function FileTypeIcon({ type }: FileTypeIconProps) {
  switch (type) {
    case "folder":
      return <FolderIcon />;
    case "jpg":
    case "png":
      return <ImageFileIcon />;
    default:
      return <ImageFileIcon />;
  }
}
