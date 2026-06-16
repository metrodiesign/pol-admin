"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Role, RoleColor, RolePortal } from "@/types/role";
import { PERMISSIONS } from "@/lib/mock/roles";
import { RoleBadge, PortalBadge } from "./role-badge";

const ROLE_COLORS: { id: RoleColor; label: string }[] = [
  { id: "danger",  label: "แดง" },
  { id: "warning", label: "ส้ม" },
  { id: "info",    label: "น้ำเงิน" },
  { id: "success", label: "เขียว" },
  { id: "neutral", label: "เทา" },
];

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w฀-๿]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32) || "role";
}

export interface NewRolePayload {
  __new: true;
  portal: RolePortal;
  name: string;
  desc: string;
  color: RoleColor;
  id: string;
  __perms: string[];
}

export interface EditRolePayload extends Role {
  __new?: false;
  __perms: string[];
}

export type EditorRole = NewRolePayload | EditRolePayload;

interface RoleEditorDrawerProps {
  role: EditorRole | null;
  rolePerms: Record<string, string[]>;
  open: boolean;
  onClose: () => void;
  onSave: (role: EditorRole, isNew: boolean) => void;
}

export function RoleEditorDrawer({
  role,
  rolePerms,
  open,
  onClose,
  onSave,
}: RoleEditorDrawerProps) {
  const isNew = role !== null && !!(role as NewRolePayload).__new;

  const getInitialPerms = (r: EditorRole | null): string[] => {
    if (!r) return [];
    if ((r as NewRolePayload).__new) return (r as NewRolePayload).__perms ?? [];
    return rolePerms[(r as EditRolePayload).id] ?? [];
  };

  const getInitialSlug = (r: EditorRole | null): string => {
    if (!r) return "";
    if ((r as NewRolePayload).__new) return r.id ?? "";
    const parts = (r as EditRolePayload).id.split(".");
    return parts.slice(1).join(".") || "";
  };

  // Derive a stable "role key" that changes whenever role identity changes
  const roleKey = role ? `${role.id}|${String(!!(role as NewRolePayload).__new)}` : "";

  const [prevRoleKey, setPrevRoleKey] = useState(roleKey);
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.desc ?? "");
  const [color, setColor] = useState<RoleColor>(role?.color ?? "info");
  const [manualSlug, setManualSlug] = useState(getInitialSlug(role));
  const [slugDirty, setSlugDirty] = useState(!isNew);
  const [perms, setPerms] = useState<Set<string>>(
    new Set(getInitialPerms(role)),
  );

  // Previous-prop pattern: reset state when role identity changes (replaces useEffect)
  if (roleKey !== prevRoleKey) {
    setPrevRoleKey(roleKey);
    if (role) {
      const newIsNew = !!(role as NewRolePayload).__new;
      setName(role.name ?? "");
      setDesc(role.desc ?? "");
      setColor(role.color ?? "info");
      setManualSlug(getInitialSlug(role));
      setSlugDirty(!newIsNew);
      setPerms(new Set(getInitialPerms(role)));
    }
  }

  // Derive slug during render instead of in a useEffect
  const slug = isNew && !slugDirty ? slugify(name) : manualSlug;

  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];

  const togglePerm = (id: string) => {
    const s = new Set(perms);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setPerms(s);
  };

  const toggleGroup = (g: string) => {
    const ids = PERMISSIONS.filter((p) => p.group === g).map((p) => p.id);
    const allOn = ids.every((id) => perms.has(id));
    const s = new Set(perms);
    ids.forEach((id) => (allOn ? s.delete(id) : s.add(id)));
    setPerms(s);
  };

  const toggleAll = () => {
    if (perms.size === PERMISSIONS.length) {
      setPerms(new Set());
    } else {
      setPerms(new Set(PERMISSIONS.map((p) => p.id)));
    }
  };

  const canSave =
    name.trim().length > 0 && (slug.trim().length > 0 || !isNew);

  const handleSave = () => {
    if (!role || !canSave) return;
    onSave(
      {
        ...role,
        name: name.trim(),
        desc: desc.trim(),
        color,
        id: isNew ? slugify(slug) : (role as EditRolePayload).id,
        __perms: [...perms],
      } as EditorRole,
      isNew,
    );
  };

  const portal = role?.portal ?? "admin";
  const previewSlug = isNew
    ? slug
      ? slugify(slug)
      : "___"
    : (role as EditRolePayload | null)?.id.split(".").slice(1).join(".") ?? "";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[580px]"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center gap-3 border-b border-[rgba(145,158,171,0.12)] px-5 py-4">
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-200"
            aria-label="ปิด"
          >
            <X className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xs font-semibold uppercase tracking-widest text-grey-500">
              {isNew ? "สร้าง Role ใหม่" : "แก้ไข Role"}
            </SheetTitle>
            <p className="mt-0.5 font-mono text-xs font-bold text-foreground">
              {portal}.{previewSlug}
            </p>
          </div>
          <PortalBadge portal={portal} />
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="space-y-5 px-5 py-4">
            {/* Metadata */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-grey-500">
                ข้อมูล Role
              </p>

              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-grey-700">
                  ชื่อ Role{" "}
                  <span className="text-error-dark">*</span>
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-grey-300 bg-transparent px-3 text-sm text-foreground placeholder:text-grey-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="เช่น ผู้ดูแลฝ่ายปฏิบัติการ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-grey-700">
                  คำอธิบาย
                </span>
                <textarea
                  className="w-full rounded-lg border border-grey-300 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-grey-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  placeholder="อธิบายขอบเขตของ role นี้ จะแสดงตอนผูก role ให้ผู้ใช้"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </label>

              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-grey-700">
                  รหัส Role (slug)
                </span>
                <div className="flex h-10 items-center rounded-lg border border-grey-300 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="shrink-0 px-3 font-mono text-sm text-grey-500">
                    {portal}.
                  </span>
                  <div className="h-full w-px bg-grey-300" />
                  <input
                    className="flex-1 bg-transparent px-3 font-mono text-sm text-foreground placeholder:text-grey-400 focus:outline-none disabled:text-grey-500 disabled:cursor-not-allowed"
                    placeholder="role_id"
                    value={slug}
                    disabled={!isNew}
                    onChange={(e) => {
                      setManualSlug(e.target.value);
                      setSlugDirty(true);
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-grey-500">
                  {isNew
                    ? "จะถูกใช้เป็น identifier ในระบบ · เปลี่ยนภายหลังไม่ได้"
                    : "รหัสนี้ถูกใช้อ้างอิงทั้งระบบและไม่สามารถแก้ไขได้"}
                </p>
              </label>

              <div>
                <p className="mb-1.5 text-sm text-grey-700">สีป้าย</p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors",
                        color === c.id
                          ? "border-grey-700 bg-grey-100"
                          : "border-[rgba(145,158,171,0.24)] hover:bg-grey-100",
                      )}
                    >
                      <RoleBadge color={c.id} name={c.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="mb-2 flex items-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                  Permissions ({perms.size}/{PERMISSIONS.length})
                </p>
                <button
                  className="ml-auto text-sm text-primary hover:underline"
                  onClick={toggleAll}
                >
                  {perms.size === PERMISSIONS.length
                    ? "ล้างทั้งหมด"
                    : "เลือกทั้งหมด"}
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.24)]">
                {groups.map((g, gi) => {
                  const groupPerms = PERMISSIONS.filter((p) => p.group === g);
                  const onCount = groupPerms.filter((p) => perms.has(p.id)).length;
                  const allOn = onCount === groupPerms.length;
                  return (
                    <div
                      key={g}
                      className={cn(gi > 0 && "border-t border-[rgba(145,158,171,0.12)]")}
                    >
                      <div className="flex items-center gap-2 bg-grey-100 px-3.5 py-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-grey-600">
                          {g}
                        </span>
                        <span className="tabular-nums text-xs text-grey-500">
                          {onCount}/{groupPerms.length}
                        </span>
                        <div className="flex-1" />
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => toggleGroup(g)}
                        >
                          {allOn ? "ล้างกลุ่ม" : "เลือกทั้งกลุ่ม"}
                        </button>
                      </div>
                      {groupPerms.map((p) => {
                        const on = perms.has(p.id);
                        return (
                          <label
                            key={p.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 border-t border-[rgba(145,158,171,0.12)] px-3.5 py-2.5 transition-colors hover:bg-grey-100",
                              on && "bg-primary/5",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => togglePerm(p.id)}
                              className="h-4 w-4 rounded border-grey-300 accent-primary"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{p.label}</p>
                              <code className="text-xs text-grey-500">
                                {p.id}
                              </code>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-[rgba(145,158,171,0.12)] px-5 py-4">
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <div className="flex-1" />
          <Button
            className="gap-1.5"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
            {isNew ? "สร้าง Role" : "บันทึก"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
