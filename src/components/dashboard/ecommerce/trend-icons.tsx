import type { SVGProps } from "react";

/** Minimals-style small arrow-up icon for KPI trend (matches live reference). */
export function ArrowUpward(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M7 14l5-5 5 5H7z" />
    </svg>
  );
}

/** Minimals-style small arrow-down icon for KPI trend (matches live reference). */
export function ArrowDownward(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}
