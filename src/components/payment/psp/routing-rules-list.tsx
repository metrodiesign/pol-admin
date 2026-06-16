"use client";

import { Plus, GripVertical, ChevronRight, MoreHorizontal, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PspRoutingRule } from "@/types/psp";

function PspTargetBadge({ pspName }: { pspName: string }) {
  const is2c2p = pspName === "2C2P";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[rgba(145,158,171,0.12)] bg-background px-2.5 py-1.5">
      <div
        className={cn(
          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white",
          is2c2p
            ? "bg-gradient-to-br from-red-600 to-red-800"
            : "bg-gradient-to-br from-blue-600 to-blue-800",
        )}
      >
        {is2c2p ? "2C" : "OMS"}
      </div>
      <div>
        <p className="text-sm font-bold leading-none">{pspName}</p>
      </div>
    </div>
  );
}

interface RoutingRulesListProps {
  rules: PspRoutingRule[];
  onToggleRule: (id: number) => void;
  onEditRule: (rule: PspRoutingRule) => void;
  onDuplicateRule: (rule: PspRoutingRule) => void;
  onDeleteRule: (id: number) => void;
  onAddRule: () => void;
}

export function RoutingRulesList({
  rules,
  onToggleRule,
  onEditRule,
  onDuplicateRule,
  onDeleteRule,
  onAddRule,
}: RoutingRulesListProps) {
  return (
    <Card>
      <CardHeader className="border-b border-[rgba(145,158,171,0.12)] px-5 py-4">
        <div>
          <CardTitle>กฎการกระจายธุรกรรม (Routing Rules)</CardTitle>
          <p className="mt-0.5 text-xs text-grey-500">
            กำหนดว่าธุรกรรมแต่ละแบบจะถูกส่งไปยัง PSP ใด
            · ระบบจะตรวจตามลำดับและใช้กฎข้อแรกที่ตรง
          </p>
        </div>
        <CardAction>
          <Button size="sm" onClick={onAddRule}>
            <Plus className="size-3.5" />
            เพิ่มกฎ
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-3.5">
        <div className="flex flex-col gap-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(145,158,171,0.12)] bg-grey-500/5 px-3.5 py-3 transition-opacity",
                !r.enabled && "opacity-55",
              )}
            >
              {/* Drag handle (visual only) */}
              <GripVertical className="size-4 shrink-0 text-grey-400" />

              {/* Priority pill */}
              <div className="grid size-[30px] shrink-0 place-items-center rounded-lg border border-[rgba(145,158,171,0.12)] bg-background text-sm font-bold text-grey-600">
                {r.priority}
              </div>

              {/* Rule name + condition */}
              <div className="min-w-[200px] flex-1">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="mt-0.5 text-sm text-grey-500">
                  <span className="font-mono">IF</span>{" "}
                  <code className="rounded bg-grey-500/8 px-1 py-0.5 font-mono text-xs">
                    {r.when}
                  </code>
                </p>
              </div>

              <ChevronRight className="size-3.5 shrink-0 text-grey-400" />

              {/* Target PSP */}
              <PspTargetBadge pspName={r.then} />

              {/* Enabled switch */}
              <Switch
                checked={r.enabled}
                onCheckedChange={() => onToggleRule(r.id)}
                size="sm"
              />

              {/* More menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="ตัวเลือก" />
                  }
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEditRule(r)}>
                    แก้ไขกฎ
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicateRule(r)}>
                    ทำซ้ำกฎนี้
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onDeleteRule(r.id)}
                  >
                    ลบกฎนี้
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {/* Fallback notice */}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-grey-600">
            ระบบจะลองส่งผ่าน PSP ตามกฎข้อแรกที่ตรง
            หากเกิดข้อผิดพลาด (เช่น PSP ขัดข้อง) จะ{" "}
            <strong>fallback ไปยัง PSP รอง</strong> อัตโนมัติภายใน 3 วินาที
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
