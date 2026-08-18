"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Role = "admin" | "user";

interface RoleToggleProps {
  defaultRole?: Role;
}

export function RoleToggle({ defaultRole = "admin" }: RoleToggleProps) {
  const [role, setRole] = useState<Role>(defaultRole);

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm font-semibold text-grey-800">My role:</span>
      {/* Toggle group container — bordered pill group matching live reference */}
      <div className="flex items-center rounded-[8px] border border-[rgba(145,158,171,0.16)] p-1 gap-1">
        {(["admin", "user"] as const).map((r) => {
          const isActive = role === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-[8px] px-1 py-[5px] text-xs font-semibold capitalize leading-5 transition-colors",
                isActive
                  ? "bg-[rgba(28,37,46,0.08)] text-grey-800 dark:bg-[rgba(255,255,255,0.08)]"
                  : "bg-transparent text-grey-600 hover:bg-[rgba(28,37,46,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]",
              )}
            >
              {r === "admin" ? "Admin" : "User"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
