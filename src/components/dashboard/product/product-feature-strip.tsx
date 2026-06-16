import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    title: "100% original",
    caption:
      "Chocolate bar candy canes ice cream toffee cookie halvah.",
  },
  {
    title: "10 days replacement",
    caption:
      "Marshmallow biscuit donut dragée fruitcake wafer.",
  },
  {
    title: "Year warranty",
    caption:
      "Cotton candy gingerbread cake I love sugar sweet.",
  },
];

export function ProductFeatureStrip() {
  return (
    <div className="grid grid-cols-1 gap-6 py-8 mmd:grid-cols-3">
      {FEATURES.map((f) => (
        <div key={f.title} className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-3 size-8 text-success" />
          <p className="text-sm font-semibold text-foreground">{f.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-grey-500">
            {f.caption}
          </p>
        </div>
      ))}
    </div>
  );
}
