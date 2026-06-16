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
}

export function EditPageHeader({
  title,
  backHref,
  breadcrumbs,
}: EditPageHeaderProps) {
  const links: BreadcrumbLink[] = breadcrumbs.map((b) => ({
    name: b.label,
    href: b.href,
  }));

  const headingNode = (
    <Link
      href={backHref}
      className="inline-flex items-center text-2xl font-bold leading-9 text-foreground hover:opacity-80 transition-opacity"
    >
      {title}
    </Link>
  );

  return <CustomBreadcrumbs heading={headingNode} links={links} />;
}
