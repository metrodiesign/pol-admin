"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ErrorScreen,
  errorButtonClass,
  errorButtonOutlineClass,
} from "@/components/error/error-screen";

// root error boundary — จับ runtime error จากทุก segment ใต้ root layout
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen title="เกิดข้อผิดพลาด" message="ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง">
      <button type="button" onClick={reset} className={errorButtonClass}>
        ลองอีกครั้ง
      </button>
      <Link href="/dashboard" className={errorButtonOutlineClass}>
        กลับหน้าหลัก
      </Link>
    </ErrorScreen>
  );
}
