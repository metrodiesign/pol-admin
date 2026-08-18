import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item with subpaths | Dashboard - Minimal UI",
};

/**
 * Match subpaths — routing-demo page. The "Subpaths" nav item links here and
 * stays active across any nested subpath (e.g. /sub-1/sub-2). Mirrors the
 * live site which redirects /minimals/subpaths -> /minimals/subpaths/sub-1/sub-2.
 */
export default function SubpathsPage() {
  return (
    <div className="-mt-2 flex flex-col">
      <h4
        className="font-bold text-grey-800"
        style={{ fontSize: "24px", lineHeight: "36px", fontWeight: 700 }}
      >
        Match subpaths
      </h4>
      <p className="mt-2 text-base text-grey-800">
        Active on matching path and its subpaths.
      </p>
    </div>
  );
}
