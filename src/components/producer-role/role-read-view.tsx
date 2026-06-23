import Link from "next/link";
import { Check, Copy, Pencil } from "lucide-react";
import type { Permission, ResourceGroup, Role } from "@/types/producer-role";
import {
  grantedCount,
  groupGranted,
  groupedCatalog,
} from "@/lib/producer-role/role-permissions";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { RoleBadge } from "./role-badge";
import { RoleStatusBadge } from "./role-status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

interface RoleReadViewProps {
  role: Role;
  catalog: Permission[];
  groups: ResourceGroup[];
}

/** หน้าดูรายละเอียดบทบาทแบบเต็มหน้า (route แยก /producer/role/read). read-only. */
export function RoleReadView({
  role,
  catalog,
  groups,
}: RoleReadViewProps) {
  const granted = grantedCount(role.permissions, catalog);
  const total = catalog.length;
  const held = new Set(role.permissions);
  // เฉพาะกลุ่มที่บทบาทได้รับสิทธิ์อย่างน้อย 1 รายการ
  const grouped = groupedCatalog(catalog, groups)
    .map((entry) => ({
      group: entry.group,
      permissions: entry.permissions.filter((p) => held.has(p.key)),
      ...groupGranted(role, entry.group.key, catalog),
    }))
    .filter((entry) => entry.permissions.length > 0);

  return (
    <>
      <EditPageHeader
        title="ดูบทบาท"
        backHref="/producer/role/list"
        breadcrumbs={[
          { label: "Console" },
          { label: "บทบาทและสิทธิ์", href: "/producer/role/list" },
          { label: role.name },
        ]}
      />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        {/* Header: badge + รหัสบทบาท + สำเนา/แก้ไข */}
        <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge color={role.color} name={role.name} />
              <RoleStatusBadge status={role.status} />
            </div>
            <span className="font-mono text-xs text-grey-500">
              รหัสบทบาท: {role.code}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/producer/role/list"
              className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
            >
              ยกเลิก
            </Link>
            <Link
              href={`/producer/role/create?from=${encodeURIComponent(role.code)}`}
              className="inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-control border border-[var(--divider)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
            >
              <Copy className="size-4" />
              สำเนา
            </Link>
            <Link
              href={`/producer/role/edit?code=${encodeURIComponent(role.code)}`}
              className="inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
            >
              <Pencil className="size-4" />
              แก้ไข
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-4 px-6">
            <p className="text-sm text-grey-600">{role.description}</p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">สิทธิ์ที่ได้รับ</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {granted}/{total}
                </p>
              </div>
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">ผู้ใช้ที่ผูก</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {role.userCount}
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground">
              สิทธิ์ที่ได้รับ
            </p>
          </div>

          {/* Permissions grouped by resource — group band + flat rows */}
          <div className="flex flex-col">
            {grouped.map((entry) => (
              <div key={entry.group.key}>
                <div className="flex items-center justify-between bg-grey-100 px-6 py-2.5">
                  <span className="text-sm font-semibold text-grey-700">
                    {entry.group.label}
                  </span>
                  <span className="text-sm tabular-nums text-grey-500">
                    {entry.granted}/{entry.total}
                  </span>
                </div>
                <ul className="flex flex-col">
                  {entry.permissions.map((p) => (
                    <li
                      key={p.key}
                      className="flex items-center justify-between gap-3 border-b border-[var(--divider)] px-6 py-3"
                    >
                      <span className="flex items-center gap-3 text-sm text-foreground">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/16">
                          <Check className="size-3.5 text-success" />
                        </span>
                        {p.label}
                      </span>
                      <span className="font-mono text-xs text-grey-500">
                        {p.key}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
