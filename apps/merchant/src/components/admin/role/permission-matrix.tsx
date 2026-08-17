"use client";

import type { Permission, ResourceGroup } from "@/types/admin/role";
import { groupedCatalog } from "@/lib/admin/role/permissions";
import { Checkbox } from "@/components/ui/checkbox";

interface RolePermissionMatrixProps {
  catalog: Permission[];
  groups: ResourceGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** Checkbox สิทธิ์จัดกลุ่มตาม resource + เลือก/ยกเลิกทั้งกลุ่ม (REQ-6.2). แถบกลุ่ม + row คั่นเส้น. */
export function RolePermissionMatrix({
  catalog,
  groups,
  selected,
  onChange,
}: RolePermissionMatrixProps) {
  const sel = new Set(selected);
  const grouped = groupedCatalog(catalog, groups);

  function togglePermission(key: string) {
    const next = new Set(sel);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  }

  function toggleGroup(permissions: Permission[], allSelected: boolean) {
    const next = new Set(sel);
    permissions.forEach((p) => {
      if (allSelected) next.delete(p.key);
      else next.add(p.key);
    });
    onChange([...next]);
  }

  return (
    <div className="flex flex-col">
      {grouped.map(({ group, permissions }) => {
        const inGroup = permissions.length;
        const grantedN = permissions.filter((p) => sel.has(p.key)).length;
        const allSelected = inGroup > 0 && grantedN === inGroup;
        const someSelected = grantedN > 0 && grantedN < inGroup;
        return (
          <div key={group.key}>
            <div className="flex items-center gap-2 bg-grey-100 px-4 py-1.5">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={() => toggleGroup(permissions, allSelected)}
                aria-label={`เลือกสิทธิ์ทั้งหมดในกลุ่ม ${group.label}`}
              />
              <span className="text-sm font-semibold text-grey-700">
                {group.label}
              </span>
              <span className="ml-auto text-sm tabular-nums text-grey-500">
                {grantedN}/{inGroup}
              </span>
            </div>
            <ul className="flex flex-col">
              {permissions.map((p) => (
                <li key={p.key}>
                  <label className="flex cursor-pointer items-center gap-2 border-b border-[var(--divider)] px-4 py-1.5 hover:bg-[var(--action-hover)]">
                    <Checkbox
                      checked={sel.has(p.key)}
                      onChange={() => togglePermission(p.key)}
                      aria-label={p.label}
                    />
                    <span className="text-sm text-foreground">{p.label}</span>
                    <span className="ml-auto font-mono text-xs text-grey-500">
                      {p.key}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
