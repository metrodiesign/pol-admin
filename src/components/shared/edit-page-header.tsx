import type { ReactNode } from "react";
import Link from "next/link";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import type { BreadcrumbLink } from "@/lib/breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EditPageHeaderProps {
  title: string;
  backHref: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
  onBack?: () => void;
}

export function EditPageHeader({
  title,
  backHref,
  breadcrumbs,
  actions,
  onBack,
}: EditPageHeaderProps) {
  const links: BreadcrumbLink[] = breadcrumbs.map((b) => ({
    name: b.label,
    href: b.href,
  }));

  const headingClass =
    "inline-flex items-center text-left text-lg font-bold leading-9 text-foreground transition-opacity hover:opacity-80";
  const headingNode = onBack ? (
    <button type="button" onClick={onBack} className={headingClass}>
      {title}
    </button>
  ) : (
    <Link href={backHref} className={headingClass}>
      {title}
    </Link>
  );

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <CustomBreadcrumbs heading={headingNode} links={links} className="mb-0" />
      {actions != null && <div className="w-full shrink-0 sm:w-auto">{actions}</div>}
    </div>
  );
}
