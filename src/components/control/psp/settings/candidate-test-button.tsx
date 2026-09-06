"use client";

import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";

import { PspApiError, getPspConnection } from "@/lib/api/control/psp";
import { testCandidateCredential } from "@/lib/api/control/merchant-payment-settings";
import { mapSettingsProblem } from "@/lib/control/merchant-psp-settings";
import { formatDateTime } from "@/lib/control/format";

/**
 * ทดสอบชุด credential ที่รออนุมัติ — sanitized result เท่านั้น, ไม่บล็อก approval flow.
 * ดึง ETag ล่าสุดของ connection ก่อนยิงเพื่อให้ If-Match ถูกต้อง.
 */
export function CandidateTestButton({
  connectionId,
  approvalId,
}: {
  connectionId: string;
  approvalId: string;
}) {
  const [status, setStatus] = useState<"idle" | "testing">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (status === "testing") return;
    setStatus("testing");
    setError(null);
    try {
      const resource = await getPspConnection(connectionId);
      if (!resource.etag) {
        setError("ไม่มี ETag ล่าสุด กรุณาโหลดข้อมูลใหม่");
        return;
      }
      const outcome = await testCandidateCredential(
        connectionId,
        approvalId,
        resource.etag,
        crypto.randomUUID(),
      );
      const when = outcome.testedAt ? ` (${formatDateTime(outcome.testedAt)})` : "";
      setResult(`${outcome.result === "authenticated" ? "สำเร็จ" : "ล้มเหลว"}${when}`);
    } catch (caught) {
      const apiError = caught instanceof PspApiError ? caught : new PspApiError(null, null);
      setError(mapSettingsProblem(apiError.status, apiError.code, "candidate-test").message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void run()}
        disabled={status === "testing"}
        className="inline-flex h-9 items-center gap-1.5 rounded-control bg-grey-600/8 px-3 text-sm font-semibold text-grey-800 transition-colors hover:bg-grey-600/16 disabled:pointer-events-none disabled:opacity-50"
      >
        {status === "testing" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <FlaskConical className="size-4" aria-hidden />
        )}
        ทดสอบชุดใหม่
      </button>
      {result ? <p className="text-xs text-grey-700">ผลชุดรออนุมัติ: {result}</p> : null}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
