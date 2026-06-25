import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbLink } from "@/lib/breadcrumbs";

interface CustomBreadcrumbsProps {
  heading?: ReactNode;
  links?: BreadcrumbLink[];
  action?: ReactNode;
  moreLink?: { name: string; href: string }[];
  /** Optional plain-language line under the heading — explains what the page is for. */
  description?: ReactNode;
  className?: string;
}

export function CustomBreadcrumbs({
  heading,
  links,
  action,
  moreLink,
  description,
  className,
}: CustomBreadcrumbsProps) {
  const hasLinks = links && links.length > 0;

  return (
    <div className={cn("mb-5 flex flex-col", className)}>
      {/* Row 1: heading + action */}
      {(heading != null || action != null) && (
        <div className="flex items-center justify-between gap-2">
          <div>
            {typeof heading === "string" ? (
              <h4 className="text-2xl font-bold leading-9 text-foreground">{heading}</h4>
            ) : (
              heading
            )}
          </div>
          {action != null && <div>{action}</div>}
        </div>
      )}

      {/* Row 2: breadcrumb trail */}
      {hasLinks && (
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center text-sm text-grey-600">
            {links.map((link, i) => {
              const isLast = i === links.length - 1;
              return (
                <li key={i} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="mx-2 inline-block size-1 rounded-full bg-grey-500"
                    />
                  )}
                  {!isLast && link.href ? (
                    <Link
                      href={link.href}
                      className="text-grey-600 no-underline hover:underline"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <span className="text-grey-600">{link.name}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Optional plain-language description */}
      {description != null && (
        <p className="mt-1.5 max-w-3xl text-sm text-grey-600">{description}</p>
      )}

      {/* Optional moreLink block */}
      {moreLink && moreLink.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {moreLink.map((ml) => (
            <Link
              key={ml.href}
              href={ml.href}
              className="text-xs text-grey-500 hover:underline"
            >
              {ml.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
