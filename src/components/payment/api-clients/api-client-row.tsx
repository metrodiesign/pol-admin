"use client";

import { useCallback } from "react";
import {
  Briefcase,
  Server,
  Copy,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  XCircle,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import { cn } from "@/lib/utils";
import type { ApiClient } from "@/types/api-client";

interface ApiClientRowProps {
  client: ApiClient;
  isLast: boolean;
  onRotateSecret: (client: ApiClient) => void;
  onTogglePause: (client: ApiClient) => void;
  onRevoke: (client: ApiClient) => void;
  onCopyId: (id: string) => void;
}

const GRANT_LABEL: Record<string, string> = {
  client_credentials: "Service",
  authorization_code: "User flow",
};

export function ApiClientRow({
  client,
  isLast,
  onRotateSecret,
  onTogglePause,
  onRevoke,
  onCopyId,
}: ApiClientRowProps) {
  const isRevoked = client.status === "revoked";
  const isPaused = client.status === "paused";

  const handleCopy = useCallback(() => {
    onCopyId(client.id);
  }, [client.id, onCopyId]);

  return (
    <div
      className={cn(
        "grid items-center gap-3.5 px-5 py-4",
        "grid-cols-[44px_1fr_auto_auto]",
        !isLast && "border-b border-border",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-[10px] border border-border",
          client.type === "app"
            ? "bg-primary/8 text-primary"
            : "bg-muted text-grey-600",
        )}
      >
        {client.type === "app" ? <Briefcase size={20} /> : <Server size={20} />}
      </div>

      {/* Info */}
      <div className="min-w-0">
        {/* Name + status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{client.name}</span>
          <StatusBadge status={client.status} />
          {client.env === "sandbox" && (
            <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning-dark">
              SANDBOX
            </span>
          )}
        </div>

        {/* Client ID + copy */}
        <div className="mt-1.5 flex items-center gap-2">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {client.id}
          </code>
          <button
            type="button"
            aria-label="คัดลอก Client ID"
            onClick={handleCopy}
            className="grid h-[22px] w-[22px] place-items-center rounded-full text-grey-500 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Copy size={11} />
          </button>
        </div>

        {/* Scopes */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {client.scopes.map((scope) => (
            <code
              key={scope}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-grey-600"
            >
              {scope}
            </code>
          ))}
        </div>

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap gap-3.5 text-sm text-grey-500">
          <span className="inline-flex items-center gap-1">
            <Zap size={11} />
            {client.reqs24h.toLocaleString("en-US")} req/24h
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            ใช้ล่าสุด {client.lastUsed}
          </span>
          <span>สร้าง {client.createdAt}</span>
          {client.ipAllowlist.length > 0 && (
            <span>IP allowlist: {client.ipAllowlist.length}</span>
          )}
        </div>
      </div>

      {/* Grant types */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-grey-500">
          Grants
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {client.grants.map((g) => (
            <span
              key={g}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-grey-600"
            >
              {GRANT_LABEL[g] ?? g}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        {!isRevoked && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="หมุน Secret"
            onClick={() => onRotateSecret(client)}
          >
            <RefreshCw size={15} />
          </Button>
        )}
        {!isRevoked && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isPaused ? "เปิดใช้งาน" : "พักใช้งาน"}
            onClick={() => onTogglePause(client)}
          >
            {isPaused ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
          </Button>
        )}
        {!isRevoked && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="ยกเลิก (Revoke)"
            className="text-error hover:bg-error/10 hover:text-error"
            onClick={() => onRevoke(client)}
          >
            <XCircle size={15} />
          </Button>
        )}
      </div>
    </div>
  );
}
