import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item match params | Dashboard - Minimal UI",
};

/**
 * Match params — routing-demo page. The "Params" nav item links here with a
 * `?id=...` query; the page itself renders a static heading + description
 * matching the source. The id is only meaningful to the nav active-state demo.
 */
export default function ParamsPage() {
  return (
    <div className="-mt-2 flex flex-col">
      <h4
        className="font-bold text-grey-800"
        style={{ fontSize: "24px", lineHeight: "36px", fontWeight: 700 }}
      >
        Match params
      </h4>
      <p className="mt-2 text-base text-grey-800">
        Active on matching path with dynamic parameters.
      </p>
    </div>
  );
}
