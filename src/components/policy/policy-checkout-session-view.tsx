"use client";

import { useEffect, useState } from "react";
import { readCheckoutSession } from "@/lib/policy/checkout";
import { PolicyCheckoutView } from "./policy-checkout-view";

interface PolicyCheckoutSessionViewProps {
  sessionId: string;
}

/** resolve sessionId -> ids จาก localStorage (client-only) ก่อนส่งต่อ PolicyCheckoutView. */
export function PolicyCheckoutSessionView({ sessionId }: PolicyCheckoutSessionViewProps) {
  const [ids, setIds] = useState<string[] | null>(null);

  // localStorage ไม่มีตอน SSR — ต้องอ่านหลัง mount เพื่อให้ markup รอบแรกตรงกับ server (กัน hydration mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only read, ไม่ใช่ subscription
    setIds(readCheckoutSession(sessionId) ?? []);
  }, [sessionId]);

  if (ids === null) return null;
  return <PolicyCheckoutView ids={ids} sessionId={sessionId} />;
}
