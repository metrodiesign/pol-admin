"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { ALLOWED_HOSTED_DOMAINS, getClientId } from "@/lib/auth/auth-config";
import {
  getGisApi,
  renderAudienceButton,
  type GisCredentialResponse,
} from "@/lib/auth/gis";
import {
  chooseLanding,
  isSessionValid,
  verifyAndBuildSession,
} from "@/lib/auth/session";
import {
  clearSession,
  readSession,
  writeSession,
} from "@/lib/auth/session-storage";
import type { Audience } from "@/types/auth";

import { AuthToaster } from "./auth-toaster";
import { useAuthToast } from "./use-auth-toast";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const LOGIN_FAILED = "เข้าสู่ระบบไม่สำเร็จ";

const AUDIENCES: { audience: Audience; label: string; short: string }[] = [
  { audience: "admin", label: "เข้าสู่ระบบสำหรับผู้ดูแลระบบ (Admin)", short: "ผู้ดูแลระบบ (Admin)" },
  { audience: "producer", label: "เข้าสู่ระบบสำหรับผู้ผลิต (Producer)", short: "ผู้ผลิต (Producer)" },
];

type GisStatus = "loading" | "ready" | "error";

const nowSec = () => Math.floor(Date.now() / 1000);
const noopSubscribe = () => () => {};

export function LoginView() {
  const router = useRouter();
  const { toasts, show, dismiss } = useAuthToast();
  // client-only "hydrated" flag (blessed API, ไม่ setState ใน effect) — กัน hydration mismatch
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [gisStatus, setGisStatus] = useState<GisStatus>("loading");
  const [scriptKey, setScriptKey] = useState(0);
  const [selected, setSelected] = useState<Audience | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);

  // หลัง hydrate: มี session ยังไม่หมดอายุ -> เด้งไป landing (REQ-4.4); หมดอายุ -> ล้าง (REQ-4.5)
  useEffect(() => {
    if (!hydrated) return;
    const session = readSession();
    if (session && isSessionValid(session, nowSec())) {
      router.replace(chooseLanding(session.audience));
    } else if (session) {
      clearSession();
    }
  }, [hydrated, router]);

  const onCredential = useCallback(
    (audience: Audience, clientId: string, response: GisCredentialResponse) => {
      // ไม่ log credential/claim ทุกกรณี (REQ-3.7)
      if (!response || typeof response.credential !== "string" || !response.credential) {
        show(LOGIN_FAILED, "error"); // REQ-5.2
        return;
      }
      const result = verifyAndBuildSession(response.credential, {
        audience,
        expectedClientId: clientId,
        allowedHostedDomains: ALLOWED_HOSTED_DOMAINS[audience],
        nowSec: nowSec(),
      });
      if (!result.ok) {
        show(LOGIN_FAILED, "error"); // REQ-3.x reject / REQ-5.3
        return;
      }
      writeSession(result.session); // REQ-3.6
      show("เข้าสู่ระบบสำเร็จ", "success");
      router.replace(chooseLanding(audience)); // REQ-4.2 / 4.3
    },
    [router, show],
  );

  // render-on-demand: เลือก audience + GIS พร้อม -> วาดปุ่ม Google ของ audience นั้นลง slot เดียว (REQ-2.3/2.4)
  useEffect(() => {
    if (!selected || gisStatus !== "ready") return;
    const api = getGisApi();
    const slot = slotRef.current;
    const clientId = getClientId(selected);
    if (!api || !slot || !clientId) return;
    slot.replaceChildren(); // เคลียร์ปุ่มเดิมก่อนวาดใหม่เมื่อสลับ audience (เลี่ยง innerHTML)
    renderAudienceButton({ api, audience: selected, clientId, slot, onCredential });
  }, [selected, gisStatus, onCredential]);

  // ก่อน hydrate หรือกำลังจะ redirect (มี session ใช้ได้) -> spinner กัน flash ฟอร์ม (m1, REQ-4.4)
  const pendingSession = hydrated ? readSession() : null;
  const redirecting = !!pendingSession && isSessionValid(pendingSession, nowSec());
  if (!hydrated || redirecting) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
        <p className="text-sm text-muted-foreground" role="status">
          กำลังตรวจสอบสถานะ...
        </p>
      </main>
    );
  }

  const adminId = getClientId("admin");
  const producerId = getClientId("producer");
  const bothMissing = !adminId && !producerId;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <Script
        key={scriptKey}
        src={GIS_SRC}
        strategy="afterInteractive"
        onLoad={() => setGisStatus("ready")}
        onError={() => setGisStatus("error")}
      />
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบ POL</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกประเภทผู้ใช้เพื่อเข้าสู่ระบบด้วย Google
        </p>

        {bothMissing ? (
          <p
            className="mt-6 rounded-control bg-error-lighter px-4 py-3 text-sm text-error-dark"
            role="alert"
          >
            ยังไม่ได้ตั้งค่า Google client id — กำหนด NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN /
            _PRODUCER ใน .env.local
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-2">
              {AUDIENCES.map(({ audience, label, short }) => {
                const id = getClientId(audience);
                const disabled = !id || gisStatus !== "ready";
                return (
                  <div key={audience}>
                    <Button
                      type="button"
                      variant={selected === audience ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      disabled={disabled}
                      aria-label={label}
                      aria-pressed={selected === audience}
                      onClick={() => setSelected(audience)}
                    >
                      {short}
                    </Button>
                    {!id && (
                      <p className="mt-1 text-xs text-error" role="alert">
                        ยังไม่ได้ตั้ง client id ของ {audience}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* slot ปุ่ม Google (render-on-demand ต่อ audience) */}
            <div ref={slotRef} className="mt-4 flex min-h-[44px] justify-center" />

            {gisStatus === "loading" && (
              <p className="mt-2 text-center text-xs text-muted-foreground" role="status">
                กำลังโหลด Google…
              </p>
            )}
            {gisStatus === "error" && (
              <div className="mt-2 text-center">
                <p className="text-xs text-error" role="alert">
                  โหลด Google Identity Services ไม่สำเร็จ
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    setGisStatus("loading");
                    setScriptKey((k) => k + 1);
                  }}
                >
                  ลองใหม่
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <AuthToaster toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
