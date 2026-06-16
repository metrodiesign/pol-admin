"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/payment/toast/toast-provider";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { EndpointList } from "./endpoint-list";
import { EndpointFormDialog } from "./endpoint-form-dialog";
import { EventLogTable } from "./event-log-table";
import { PayloadDrawer } from "./payload-drawer";
import { ApiKeysCard } from "./api-keys-card";
import { IntegrationGuide } from "./integration-guide";
import { WEBHOOK_ENDPOINTS, WEBHOOK_EVENTS } from "@/lib/mock/webhooks";
import type { WebhookEndpoint, WebhookEvent } from "@/types/webhook";

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; endpoint: WebhookEndpoint }
  | null;

export function WebhooksTabs() {
  const toast = useToast();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(WEBHOOK_ENDPOINTS);
  const [modal, setModal] = useState<ModalState>(null);
  const [payloadEvent, setPayloadEvent] = useState<WebhookEvent | null>(null);

  // Rotate secret confirm modal
  const [rotateTarget, setRotateTarget] = useState<WebhookEndpoint | null>(null);

  // Send test confirm modal
  const [sendTestTarget, setSendTestTarget] = useState<WebhookEndpoint | null>(null);

  function handleSaveEndpoint(data: { url: string; events: string[]; secret: string }) {
    if (modal?.mode === "create") {
      const newId = Math.max(0, ...endpoints.map((e) => e.id)) + 1;
      setEndpoints((prev) => [
        ...prev,
        { id: newId, status: "active", successRate: 99.0, ...data },
      ]);
      toast.success("เพิ่ม Endpoint แล้ว");
    } else if (modal?.mode === "edit") {
      const target = modal.endpoint;
      setEndpoints((prev) =>
        prev.map((e) => (e.id === target.id ? { ...e, ...data } : e))
      );
      toast.success("บันทึก Endpoint แล้ว");
    }
    setModal(null);
  }

  function handleToggleStatus(endpoint: WebhookEndpoint) {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === endpoint.id
          ? { ...e, status: e.status === "paused" ? "active" : "paused" }
          : e
      )
    );
  }

  function handleDelete(endpoint: WebhookEndpoint) {
    setEndpoints((prev) => prev.filter((e) => e.id !== endpoint.id));
    toast.success("ลบ Endpoint แล้ว");
  }

  function handleResend(event: WebhookEvent) {
    // In production: call API to re-queue the event.
    // For mock: state already re-renders closed via onClose in PayloadDrawer.
    void event;
    toast.success("ส่งซ้ำแล้ว");
  }

  return (
    <>
      <Tabs defaultValue="endpoints">
        <TabsList
          variant="line"
          className="mb-4 gap-0 border-b border-border w-full justify-start rounded-none"
        >
          <TabsTrigger value="endpoints" className="px-4">
            Webhook Endpoints
          </TabsTrigger>
          <TabsTrigger value="events" className="px-4">
            Event Log
          </TabsTrigger>
          <TabsTrigger value="keys" className="px-4">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs" className="px-4">
            Integration Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <EndpointList
            endpoints={endpoints}
            onAdd={() => setModal({ mode: "create" })}
            onEdit={(ep) => setModal({ mode: "edit", endpoint: ep })}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onSendTest={(ep) => setSendTestTarget(ep)}
            onRotateSecret={(ep) => setRotateTarget(ep)}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventLogTable events={WEBHOOK_EVENTS} onRowClick={setPayloadEvent} />
        </TabsContent>

        <TabsContent value="keys">
          <ApiKeysCard />
        </TabsContent>

        <TabsContent value="docs">
          <IntegrationGuide />
        </TabsContent>
      </Tabs>

      {/* Endpoint form dialog */}
      <EndpointFormDialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        endpoint={modal?.mode === "edit" ? modal.endpoint : undefined}
        onSave={handleSaveEndpoint}
      />

      {/* Payload drawer */}
      <PayloadDrawer
        event={payloadEvent}
        onClose={() => setPayloadEvent(null)}
        onResend={handleResend}
      />

      {/* Rotate signing secret confirmation */}
      <ConfirmModal
        open={rotateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRotateTarget(null);
        }}
        title="หมุน Signing Secret"
        description={
          rotateTarget
            ? `ระบบจะออก signing secret ใหม่สำหรับ ${rotateTarget.url} — secret เดิมยังใช้งานได้อีก 24 ชั่วโมง`
            : undefined
        }
        confirmLabel="หมุน Secret"
        onConfirm={() => {
          setRotateTarget(null);
          toast.success("หมุน secret แล้ว");
        }}
      />

      {/* Send test event confirmation */}
      <ConfirmModal
        open={sendTestTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSendTestTarget(null);
        }}
        title="ส่ง Test Event"
        description={
          sendTestTarget
            ? `ระบบจะส่ง payment.test event ไปยัง ${sendTestTarget.url}`
            : undefined
        }
        confirmLabel="ส่ง Test Event"
        onConfirm={() => setSendTestTarget(null)}
      />
    </>
  );
}
