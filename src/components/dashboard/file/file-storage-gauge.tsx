import { storageOverview } from "@/lib/mock/file";

// Semi-circle SVG gauge constants
const CX = 110;
const CY = 110;
const R = 80;
const STROKE_WIDTH = 14;

function arcDash(progress: number): string {
  const fullArc = Math.PI * R;
  const filled = progress * fullArc;
  return `${filled} ${fullArc}`;
}

/** Semi-circle gauge + category breakdown. Used only on mobile as the first
 *  block. Desktop uses FileStorageOverview (which wraps gauge + upload zone). */
export function FileStorageGauge() {
  const { percent, used, total, breakdown } = storageOverview;
  const progress = percent / 100;

  return (
    <div className="dashboard-card p-6">
      {/* Semi-circle gauge — fluid width, preserving aspect ratio */}
      <div className="relative w-full" style={{ aspectRatio: "220/120" }}>
        <svg viewBox="0 0 220 120" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C684FF" />
              <stop offset="100%" stopColor="#8E33FF" />
            </linearGradient>
          </defs>
          {/* Track arc */}
          <path
            d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
            fill="none"
            stroke="rgba(145,158,171,0.16)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={arcDash(progress)}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-bold text-grey-800">{percent}%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-grey-500">
        Used of {used} Gb / {total} Gb
      </p>

      {/* Category breakdown */}
      <div className="mt-6 space-y-4">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${item.color}1A` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.label} className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-800">{item.label}</p>
              <p className="text-xs text-grey-500">{item.files}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-grey-800">
              {item.size}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
