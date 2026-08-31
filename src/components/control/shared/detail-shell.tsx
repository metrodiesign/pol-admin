import type { ReactNode } from "react";
import { cardStyle } from "./styles";

/** Identity band at the top of a detail card: title, subtitle, machine id and badges. */
export function DetailIdentity({
  title,
  subtitle,
  code,
  badges,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  code?: string;
  badges?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-7 text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 truncate text-sm text-grey-600">{subtitle}</p> : null}
        {code ? <p className="text-data mt-1 break-all text-xs text-grey-500">{code}</p> : null}
      </div>
      {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
    </div>
  );
}

export function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--divider)] p-6 last:border-b-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-grey-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DetailNotFound({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-card bg-card p-10 text-center" style={cardStyle}>
      <p className="text-h6 text-foreground">{title}</p>
      <p className="mt-1 text-sm text-grey-600">{message}</p>
    </div>
  );
}
