import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import type { BreadcrumbLink } from "@/lib/breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  description?: ReactNode;
  action?: {
    label: string;
    href: string;
  };
  actions?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, description, action, actions }: PageHeaderProps) {
  const links: BreadcrumbLink[] = breadcrumbs.map((b) => ({
    name: b.label,
    href: b.href,
  }));

  const actionNode = (action || actions) ? (
    <div className="flex items-center gap-2 shrink-0">
      {actions}
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          {action.label}
        </Link>
      )}
    </div>
  ) : undefined;

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <CustomBreadcrumbs
        heading={title}
        links={links}
        description={description}
        className="mb-0"
      />
      {actionNode}
    </div>
  );
}
