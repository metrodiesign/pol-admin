import type { ReactNode } from "react";
import { cardStyle } from "./styles";

/** Summary tile shared by control-plane screens; same card shell as merchant modules. */
export function StatCard({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-card bg-card p-6"
      style={cardStyle}
    >
      <div>
        <p className="text-lg font-semibold text-grey-600">{label}</p>
        <p className="mt-2 text-4xl font-semibold text-foreground md:text-5xl">{value}</p>
      </div>
      {trailing}
    </div>
  );
}
