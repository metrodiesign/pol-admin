"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  ALLOWED_HOSTED_DOMAINS,
  audienceForClientId,
  getClientId,
} from "@/lib/auth/auth-config";
import {
  getGisApi,
  renderAudienceButton,
  type GisCredentialResponse,
} from "@/lib/auth/gis";
import { chooseLanding, isSessionValid, resolveCredential } from "@/lib/auth/session";
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
  { audience: "admin", label: "เข้าสู่ระบบสำหรับพนักงาน", short: "สำหรับพนักงาน" },
  { audience: "producer", label: "เข้าสู่ระบบสำหรับตัวแทน", short: "สำหรับตัวแทน" },
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
  const slotRefs = useRef<Partial<Record<Audience, HTMLDivElement | null>>>({});

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

  // callback ร่วม (audience-agnostic): derive audience จาก aud ใน token (REQ-3, 5). ไม่ log token/PII (REQ-3.7)
  const handleCredential = useCallback(
    (response: GisCredentialResponse) => {
      if (!response || typeof response.credential !== "string" || !response.credential) {
        show(LOGIN_FAILED, "error"); // REQ-5.2
        return;
      }
      const result = resolveCredential(response.credential, {
        audienceForClientId,
        allowedHostedDomains: (a) => ALLOWED_HOSTED_DOMAINS[a],
        nowSec: nowSec(),
      });
      if (!result.ok) {
        show(LOGIN_FAILED, "error"); // REQ-3.x reject / REQ-5.3
        return;
      }
      writeSession(result.session); // REQ-3.6
      show("เข้าสู่ระบบสำเร็จ", "success");
      router.replace(chooseLanding(result.session.audience)); // REQ-4.2 / 4.3
    },
    [router, show],
  );

  // GIS พร้อม -> วาดปุ่ม Google ทุก audience; ResizeObserver re-render ให้ width = slot เสมอ
  // (GIS รับ width เป็น px คงที่ -> ถ้าไม่ track resize ปุ่มจะล้น/หดเมื่อจอเปลี่ยน) (REQ-1.3, 2.3/2.4, 7.3)
  useEffect(() => {
    if (!hydrated || gisStatus !== "ready") return;
    const api = getGisApi();
    if (!api) return;
    const observers: ResizeObserver[] = [];
    for (const { audience } of AUDIENCES) {
      const clientId = getClientId(audience);
      const slot = slotRefs.current[audience];
      if (!clientId || !slot) continue;
      let lastWidth = 0;
      // GIS ปุ่มสูง ~40px native — สเกล 1.2 ให้ตัวปุ่มจริง ~48px; ชดเชย width (=slot/1.2) ให้สเกลแล้วเต็ม slot
      const SCALE = 1.1;
      const renderBtn = () => {
        const slotW = Math.round(slot.clientWidth) || 280;
        const width = Math.min(400, Math.round(slotW / SCALE));
        if (width === lastWidth) return; // กัน re-render ซ้ำ/ลูป
        lastWidth = width;
        slot.replaceChildren();
        const inner = document.createElement("div");
        inner.style.transform = `scale(${SCALE})`;
        inner.style.transformOrigin = "center";
        slot.appendChild(inner);
        renderAudienceButton({
          api,
          clientId,
          slot: inner,
          onCredential: handleCredential,
          buttonOptions: { width, size: "large" },
        });
      };
      const ro = new ResizeObserver(renderBtn);
      ro.observe(slot); // fire ครั้งแรก + ทุกครั้งที่ slot กว้างเปลี่ยน
      observers.push(ro);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [hydrated, gisStatus, handleCredential]);

  // ก่อน hydrate หรือกำลังจะ redirect (มี session ใช้ได้) -> spinner กัน flash การ์ด (m1, REQ-4.4)
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

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <Script
        key={scriptKey}
        src={GIS_SRC}
        strategy="afterInteractive"
        onLoad={() => setGisStatus("ready")}
        onError={() => setGisStatus("error")}
      />
      <div className="w-full max-w-3xl">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบ vCentral Pay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกประเภทผู้ใช้เพื่อเข้าสู่ระบบด้วย Google
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {AUDIENCES.map(({ audience, label, short }) => {
            const clientId = getClientId(audience);
            return (
              <section
                key={audience}
                aria-label={label}
                className="flex h-[240px] flex-col justify-center rounded-2xl bg-background px-5 pb-10 shadow-card"
              >
                <h2 className="text-center text-base font-semibold text-foreground">{short}</h2>
                {clientId ? (
                  <div className="mt-10">
                    {/* slot ของ GIS — React ไม่จัดการ child ภายใน (GIS inject เอง) */}
                    <div
                      ref={(el) => {
                        slotRefs.current[audience] = el;
                      }}
                      className="flex h-[44px] items-center justify-center overflow-hidden"
                    />
                    {gisStatus !== "ready" && gisStatus !== "error" && (
                      <p className="mt-1 text-center text-xs text-muted-foreground" role="status">
                        กำลังโหลด Google…
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-error" role="alert">
                    ยังไม่ได้ตั้ง client id ของ {audience} — กำหนดใน .env.local
                  </p>
                )}
              </section>
            );
          })}
        </div>

        {gisStatus === "error" && (
          <div className="mt-4 text-center">
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
      </div>
      <AuthToaster toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
