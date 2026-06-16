"use client";

import { useState, useCallback, useId } from "react";
import { Briefcase, Server } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiClientType } from "@/types/api-client";

const ALL_SCOPES = [
  "payment.create",
  "payment.read",
  "payment.capture",
  "policy.read",
  "report.read",
] as const;

type Scope = (typeof ALL_SCOPES)[number];

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (name: string, type: ApiClientType, scopes: Scope[]) => void;
}

export function CreateClientModal({
  open,
  onOpenChange,
  onCreated,
}: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ApiClientType>("app");
  const [selectedScopes, setSelectedScopes] = useState<Set<Scope>>(
    new Set(["payment.create", "payment.read"]),
  );
  const [nameError, setNameError] = useState(false);
  const nameId = useId();

  const toggleScope = useCallback((scope: Scope) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope); else next.add(scope);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onCreated(name.trim(), type, Array.from(selectedScopes));
  }, [name, type, selectedScopes, onCreated]);

  const handleClose = useCallback(() => {
    setName("");
    setType("app");
    setSelectedScopes(new Set(["payment.create", "payment.read"]));
    setNameError(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>สร้าง API Client ใหม่</DialogTitle>
          <DialogDescription>
            OAuth 2.0 — สำหรับเชื่อมต่อแอปหรือ service ภายนอก
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Client name */}
          <div className="flex flex-col gap-1.5">
            <Label id={nameId}>
              ชื่อ Client <span className="text-error">*</span>
            </Label>
            <Input
              aria-labelledby={nameId}
              placeholder="เช่น Mobile App v2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              aria-invalid={nameError}
              className={cn(nameError && "border-error focus:border-error")}
            />
            {nameError && (
              <p className="text-xs text-error">กรุณาระบุชื่อ Client</p>
            )}
          </div>

          {/* Type selection */}
          <div className="flex flex-col gap-1.5">
            <Label>ประเภท</Label>
            <div className="flex gap-2">
              {(["app", "service"] as ApiClientType[]).map((t) => {
                const isSelected = type === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center gap-2.5 rounded-[9px] border-[1.5px] px-3 py-2.5 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border bg-muted hover:border-grey-400",
                    )}
                  >
                    <input
                      type="radio"
                      name="client-type"
                      value={t}
                      checked={isSelected}
                      onChange={() => setType(t)}
                      className="sr-only"
                    />
                    {t === "app" ? (
                      <Briefcase
                        size={16}
                        className={isSelected ? "text-primary" : "text-grey-500"}
                      />
                    ) : (
                      <Server
                        size={16}
                        className={isSelected ? "text-primary" : "text-grey-500"}
                      />
                    )}
                    <span className="text-sm font-semibold">
                      {t === "app" ? "App (User flow)" : "Service (Server-to-server)"}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Scopes selection */}
          <div className="flex flex-col gap-1.5">
            <Label>Scopes</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SCOPES.map((scope) => {
                const isActive = selectedScopes.has(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-transparent text-grey-600 hover:border-grey-400 hover:text-foreground",
                    )}
                  >
                    {scope}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="ghost" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit}>สร้างและแสดง Secret</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
