"use client";

import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS = [
  "กรุงเทพฯ",
  "ภาคเหนือ",
  "ภาคใต้",
  "ภาคอีสาน",
  "ภาคตะวันออก",
  "ภาคตะวันตก",
  "ภาคกลาง",
];

interface BranchesFilterBarProps {
  search: string;
  regionFilter: string;
  statusFilter: string;
  onSearchChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onAddBranch: () => void;
}

export function BranchesFilterBar({
  search,
  regionFilter,
  statusFilter,
  onSearchChange,
  onRegionChange,
  onStatusChange,
  onAddBranch,
}: BranchesFilterBarProps) {
  return (
    <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="flex items-center gap-2 h-9 rounded-lg border border-grey-300 px-3 min-w-[240px] flex-1 max-w-[320px] focus-within:border-grey-800 transition-colors">
        <Search size={15} className="text-grey-500 shrink-0" />
        <input
          type="text"
          placeholder="ค้นหาสาขา, รหัส, ผู้จัดการ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
        />
      </div>

      {/* Region filter */}
      <Select
        value={regionFilter}
        onValueChange={(v) => {
          if (v !== null) onRegionChange(v);
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="ภูมิภาค: ทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">ภูมิภาค: ทั้งหมด</SelectItem>
          {REGIONS.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(v) => {
          if (v !== null) onStatusChange(v);
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="สถานะ: ทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">สถานะ: ทั้งหมด</SelectItem>
          <SelectItem value="active">พร้อมใช้งาน</SelectItem>
          <SelectItem value="paused">พักใช้งาน</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <Button variant="outline" size="sm" disabled title="ยังไม่รองรับ">
        <Download size={13} />
        ส่งออก
      </Button>
      <Button size="sm" onClick={onAddBranch}>
        <Plus size={13} />
        เพิ่มสาขา
      </Button>
    </div>
  );
}
