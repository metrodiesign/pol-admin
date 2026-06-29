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
    <div className="flex items-center gap-2">
      {actions}
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-9 items-center gap-1.5 rounded-control bg-grey-800 px-3 text-sm font-bold text-white hover:bg-grey-900 transition-colors"
        >
          <Plus className="size-4" />
          {action.label}
        </Link>
      )}
    </div>
  ) : undefined;

  return (
    <CustomBreadcrumbs
      heading={title}
      links={links}
      description={description}
      action={actionNode}
    />
  );
}
