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
}

export function EditPageHeader({
  title,
  backHref,
  breadcrumbs,
  actions,
}: EditPageHeaderProps) {
  const links: BreadcrumbLink[] = breadcrumbs.map((b) => ({
    name: b.label,
    href: b.href,
  }));

  const headingNode = (
    <Link
      href={backHref}
      className="inline-flex items-center text-lg font-bold leading-9 text-foreground hover:opacity-80 transition-opacity"
    >
      {title}
    </Link>
  );

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <CustomBreadcrumbs heading={headingNode} links={links} className="mb-0" />
      {actions != null && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
