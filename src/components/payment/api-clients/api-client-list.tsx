"use client";

import { useId } from "react";
import { Search, BookOpen, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientRow } from "./api-client-row";
import type { ApiClient } from "@/types/api-client";

interface ApiClientListProps {
  clients: ApiClient[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onRotateSecret: (client: ApiClient) => void;
  onTogglePause: (client: ApiClient) => void;
  onRevoke: (client: ApiClient) => void;
  onCopyId: (id: string) => void;
}

export function ApiClientList({
  clients,
  search,
  onSearchChange,
  onCreateClick,
  onRotateSecret,
  onTogglePause,
  onRevoke,
  onCopyId,
}: ApiClientListProps) {
  const searchId = useId();
  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="py-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-3.5">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-500"
          />
          <Label id={searchId} className="sr-only">
            ค้นหา API Client
          </Label>
          <Input
            aria-labelledby={searchId}
            placeholder="ค้นหา Client ID, ชื่อ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8"
          />
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="default" className="gap-1.5">
          <BookOpen size={13} />
          OAuth Docs
        </Button>
        <Button size="default" onClick={onCreateClick} className="gap-1.5">
          <Plus size={13} />
          สร้าง Client ใหม่
        </Button>
      </div>

      {/* List */}
      <div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Search size={32} className="text-grey-400" strokeWidth={1.5} />
            <p className="text-sm font-medium text-grey-500">
              ไม่พบ API Client ที่ตรงกับ &ldquo;{search}&rdquo;
            </p>
          </div>
        ) : (
          filtered.map((client, i) => (
            <ApiClientRow
              key={client.id}
              client={client}
              isLast={i === filtered.length - 1}
              onRotateSecret={onRotateSecret}
              onTogglePause={onTogglePause}
              onRevoke={onRevoke}
              onCopyId={onCopyId}
            />
          ))
        )}
      </div>
    </Card>
  );
}
