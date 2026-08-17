import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blank | Dashboard - Minimal UI",
};

/**
 * Blank page — canonical "empty starter" template.
 *
 * Spec: content padding 8px top / 40px sides / 64px bottom, full width.
 * The shared <main> in MinimalsLayout already provides responsive side
 * padding and pb-16. We only need to correct the top (-mt-2 brings pt-4
 * down to the spec's 8px top gap) and ensure content fills available width.
 */
export default function BlankPage() {
  return (
    <div className="-mt-2 flex flex-col">
      <h4
        className="mb-10 font-bold text-grey-800"
        style={{ fontSize: "24px", lineHeight: "36px", fontWeight: 700 }}
      >
        Blank
      </h4>

      <div
        className="h-[320px] w-full rounded-card border border-dashed"
        style={{
          borderColor: "rgba(145,158,171,0.2)",
          backgroundColor: "rgba(145,158,171,0.04)",
        }}
      />
    </div>
  );
}
