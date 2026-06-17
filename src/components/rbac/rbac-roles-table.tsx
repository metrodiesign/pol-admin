"use client";

import { Copy, Eye, Pencil, Trash2, Users } from "lucide-react";
import type { Permission, Role } from "@/types/rbac";
import { grantedCount, isRoleDeletable } from "@/lib/rbac/role-permissions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RbacRoleBadge } from "./rbac-role-badge";
import { RbacRoleStatusBadge } from "./rbac-role-status-badge";
import { RbacPermissionProgress } from "./rbac-permission-progress";

interface RbacRolesTableProps {
  /** บทบาทหลังกรอง (search) — แถวที่ render จริง */
  roles: Role[];
  /** seed ทั้งหมด > 0 ? ใช้แยก empty (ไม่มีบทบาทเลย) ออกจาก no-result (กรองไม่เจอ) */
  hasRoles: boolean;
  /** คำค้นปัจจุบัน (ใช้ข้อความ no-result) */
  query: string;
  catalog: Permission[];
  onSelect?: (role: Role) => void;
  onRead?: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RbacRolesTable({
  roles,
  hasRoles,
  query,
  catalog,
  onSelect,
  onRead,
  onEdit,
  onDuplicate,
  onDelete,
}: RbacRolesTableProps) {
  const total = catalog.length;

  if (!hasRoles) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">ยังไม่มีบทบาท</p>
        <p className="text-sm text-grey-500">
          เริ่มต้นด้วยการกด เพิ่มบทบาทใหม่ เพื่อสร้างบทบาทแรก
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-5">บทบาท</TableHead>
            <TableHead>คำอธิบาย</TableHead>
            <TableHead>สิทธิ์</TableHead>
            <TableHead>ผู้ใช้</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="w-40 px-5 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="px-5 py-16 text-center">
                <p className="text-sm font-semibold text-foreground">
                  ไม่พบบทบาทที่ตรงกับ “{query}”
                </p>
                <p className="mt-1 text-sm text-grey-500">
                  ลองใช้คำค้นอื่น หรือล้างช่องค้นหา
                </p>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.code}>
                <TableCell className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onSelect?.(role)}
                    className="flex flex-col items-start gap-1 rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-grey-800"
                    aria-label={`ดูรายละเอียดบทบาท ${role.name}`}
                  >
                    <RbacRoleBadge color={role.color} name={role.name} />
                    <span className="font-mono text-xs text-grey-500">
                      {role.code}
                    </span>
                  </button>
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal text-sm text-grey-600">
                  {role.description}
                </TableCell>
                <TableCell>
                  <RbacPermissionProgress
                    value={grantedCount(role.permissions, catalog)}
                    max={total}
                  />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                    <Users className="size-4 text-grey-500" />
                    {role.userCount}
                  </span>
                </TableCell>
                <TableCell>
                  <RbacRoleStatusBadge status={role.status} />
                </TableCell>
                <TableCell className="px-5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
                      aria-label={`ดูบทบาท ${role.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRead?.(role);
                      }}
                    >
                      <Eye className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
                      aria-label={`แก้ไขบทบาท ${role.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(role);
                      }}
                    >
                      <Pencil className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
                      aria-label={`ทำสำเนาบทบาท ${role.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.(role);
                      }}
                    >
                      <Copy className="size-5" />
                    </Button>
                    {isRoleDeletable(role) ? (
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-error hover:bg-error/8 hover:text-error"
                        aria-label={`ลบบทบาท ${role.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(role);
                        }}
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger
                          render={<span className="inline-flex" />}
                        >
                          <Button
                            variant="ghost"
                            size="icon-lg"
                            disabled
                            className="text-error hover:bg-error/8 hover:text-error"
                            aria-label={`ลบบทบาท ${role.name} (มีผู้ใช้ผูกอยู่ ลบไม่ได้)`}
                          >
                            <Trash2 className="size-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          มีผู้ใช้ผูกอยู่ — ลบบทบาทนี้ไม่ได้
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <p className="border-t border-[var(--divider)] px-5 py-4 text-xs text-grey-500">
        สิทธิ์รวมของผู้ใช้ = union ของสิทธิ์จากทุกบทบาทที่ได้รับ ·
        บทบาทที่มีผู้ใช้ผูกอยู่จะลบไม่ได้
      </p>
    </TooltipProvider>
  );
}
