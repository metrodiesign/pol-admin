"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/payment/toast/toast-provider";
import { ApiClientKpiCards } from "./api-client-kpi-cards";
import { ApiClientList } from "./api-client-list";
import { SecretRevealModal } from "./secret-reveal-modal";
import { CreateClientModal } from "./create-client-modal";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { API_CLIENTS } from "@/lib/mock/api-clients";
import type { ApiClient, ApiClientType } from "@/types/api-client";

function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const random = Array.from({ length: 40 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `sk_live_${random}`;
}

interface ConfirmState {
  type: "revoke" | "pause" | "unpause" | "rotate";
  client: ApiClient;
}

export function ApiClientsView() {
  const toast = useToast();
  const [clients, setClients] = useState<ApiClient[]>(API_CLIENTS);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [secretState, setSecretState] = useState<{
    open: boolean;
    clientName: string;
    secret: string;
  }>({ open: false, clientName: "", secret: "" });
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // --- Copy to clipboard ---
  const handleCopyId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("คัดลอก Client ID แล้ว");
    } catch {
      // silent
    }
  }, [toast]);

  // --- Rotate secret: show confirm first ---
  const handleRotateSecret = useCallback((client: ApiClient) => {
    setConfirmState({ type: "rotate", client });
  }, []);

  // --- Toggle pause ---
  const handleTogglePause = useCallback((client: ApiClient) => {
    const type = client.status === "paused" ? "unpause" : "pause";
    setConfirmState({ type, client });
  }, []);

  // --- Revoke ---
  const handleRevoke = useCallback((client: ApiClient) => {
    setConfirmState({ type: "revoke", client });
  }, []);

  // --- Confirm action ---
  const handleConfirm = useCallback(async () => {
    if (!confirmState) return;
    setConfirmLoading(true);

    // Simulate async
    await new Promise<void>((resolve) => setTimeout(resolve, 400));

    const { type, client } = confirmState;

    if (type === "rotate") {
      const newSecret = generateSecret();
      setSecretState({ open: true, clientName: client.name, secret: newSecret });
      toast.success("สร้าง secret ใหม่แล้ว");
    } else if (type === "pause") {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: "paused" } : c,
        ),
      );
      toast.info("พักใช้งาน Client แล้ว");
    } else if (type === "unpause") {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: "active" } : c,
        ),
      );
      toast.info("เปิดใช้งาน Client แล้ว");
    } else if (type === "revoke") {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: "revoked" } : c,
        ),
      );
      toast.success("เพิกถอนแล้ว");
    }

    setConfirmLoading(false);
    setConfirmState(null);
  }, [confirmState, toast]);

  // --- Create new client ---
  const handleCreated = useCallback(
    (name: string, type: ApiClientType, scopes: string[]) => {
      const newClient: ApiClient = {
        id: `cli_${Date.now().toString(36).toUpperCase()}`,
        name,
        type,
        grants:
          type === "app"
            ? ["client_credentials", "authorization_code"]
            : ["client_credentials"],
        scopes,
        lastUsed: "เพิ่งสร้าง",
        createdAt: new Date().toISOString().slice(0, 10),
        status: "active",
        ipAllowlist: [],
        reqs24h: 0,
      };
      setClients((prev) => [newClient, ...prev]);
      setCreateOpen(false);
      const newSecret = generateSecret();
      setSecretState({ open: true, clientName: name, secret: newSecret });
      toast.success("สร้าง API Client แล้ว");
    },
    [toast],
  );

  // --- Confirm modal config ---
  const confirmConfig = confirmState
    ? {
        revoke: {
          title: `ยืนยันการยกเลิก "${confirmState.client.name}"`,
          description:
            "Client นี้จะไม่สามารถเชื่อมต่อได้อีก คุณแน่ใจหรือไม่?",
          confirmLabel: "ยกเลิก Client",
          destructive: true,
        },
        pause: {
          title: `พักใช้งาน "${confirmState.client.name}"`,
          description: "Client จะไม่สามารถรับ token ใหม่ได้จนกว่าจะเปิดใช้งาน",
          confirmLabel: "พักใช้งาน",
          destructive: false,
        },
        unpause: {
          title: `เปิดใช้งาน "${confirmState.client.name}"`,
          description: "Client จะกลับมาสามารถรับ token ได้อีกครั้ง",
          confirmLabel: "เปิดใช้งาน",
          destructive: false,
        },
        rotate: {
          title: `หมุน Secret ของ "${confirmState.client.name}"`,
          description:
            "Secret เดิมจะใช้ได้อีก 24 ชม. (grace period) หลังจากนั้นจะ revoke อัตโนมัติ",
          confirmLabel: "สร้าง Secret ใหม่",
          destructive: false,
        },
      }[confirmState.type]
    : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <ApiClientKpiCards clients={clients} />
        <ApiClientList
          clients={clients}
          search={search}
          onSearchChange={setSearch}
          onCreateClick={() => setCreateOpen(true)}
          onRotateSecret={handleRotateSecret}
          onTogglePause={handleTogglePause}
          onRevoke={handleRevoke}
          onCopyId={handleCopyId}
        />
      </div>

      {/* Create modal */}
      <CreateClientModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      {/* Secret reveal modal */}
      <SecretRevealModal
        open={secretState.open}
        onOpenChange={(open) =>
          setSecretState((prev) => ({ ...prev, open }))
        }
        clientName={secretState.clientName}
        secret={secretState.secret}
      />

      {/* Confirm modal */}
      {confirmState && confirmConfig && (
        <ConfirmModal
          open={!!confirmState}
          onOpenChange={(open) => { if (!open) setConfirmState(null); }}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          destructive={confirmConfig.destructive}
          onConfirm={handleConfirm}
          loading={confirmLoading}
        />
      )}
    </>
  );
}
