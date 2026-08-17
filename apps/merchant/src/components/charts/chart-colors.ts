import type { AccentColor } from "@/lib/mock/dashboard";

export const ACCENT_HEX: Record<AccentColor, string> = {
  primary: "#00a76f",
  info: "#00b8d9",
  warning: "#ffab00",
  secondary: "#8e33ff",
  error: "#ff5630",
  success: "#22c55e",
};

/** Ordered palette used for multi-series / multi-slice charts. */
export const CATEGORICAL = ["#00a76f", "#ffab00", "#00b8d9", "#ff5630", "#8e33ff"];

/** Single-hue primary ramp (lighter -> darker) — /dashboard "Current download" donut. */
export const PRIMARY_RAMP = ["#d0ecfe", "#73bafb", "#0c68e9", "#063cb4"];

/** Dark variants — ใช้กับ gradient (dark -> main) + line sparkline แบบ analytics. */
export const ACCENT_DARK: Record<AccentColor, string> = {
  primary: "#007867",
  info: "#006c9c",
  warning: "#b76e00",
  secondary: "#5119b7",
  error: "#b71d18",
  success: "#118d57",
};

/** Axis tick color (เทียบ source text-disabled; grey-600 ใกล้พอ + คงพฤติกรรมเดิม). */
export const CHART_AXIS_TICK = "#637381";

/** Gridline / cursor color = divider. */
export const CHART_GRID = "rgba(145, 158, 171, 0.2)";
