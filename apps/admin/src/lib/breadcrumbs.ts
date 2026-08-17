import type { ReactNode } from "react";
import { navConfig } from "@/components/layout/nav-config";

export interface BreadcrumbLink {
  name: string;
  href?: string;
  icon?: ReactNode;
}

/** Walk navConfig and build a 3-crumb trail for a given path.
 *
 * Returns:
 *   [Dashboard, <group subheader (no href)>, <nav item title or currentLabel (no href)>]
 *
 * If path is not found in navConfig:
 *   - With `group` arg: returns [Dashboard, group, currentLabel ?? path]
 *   - Without: returns [Dashboard, currentLabel ?? path]
 */
export function buildBreadcrumbs(
  path: string,
  currentLabel?: string,
  group?: string,
): BreadcrumbLink[] {
  const dashboard: BreadcrumbLink = { name: "Dashboard", href: "/" };

  for (const navGroup of navConfig) {
    for (const item of navGroup.items) {
      if (item.path === path) {
        return [
          dashboard,
          { name: group ?? navGroup.subheader },
          { name: currentLabel ?? item.title },
        ];
      }
    }
  }

  // Path not found in nav
  if (group) {
    return [dashboard, { name: group }, { name: currentLabel ?? path }];
  }
  return [dashboard, { name: currentLabel ?? path }];
}
