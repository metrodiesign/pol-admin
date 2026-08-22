"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { ErrorCard, errorButtonClass } from "@/components/error/error-screen";

export function hasRequiredPermissions(
  permissions: readonly string[],
  required: readonly string[],
): boolean {
  const held = new Set(permissions);
  return required.every((permission) => held.has(permission));
}

function LoadingState(): React.JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
      <p className="text-sm text-grey-600" role="status">
        กำลังตรวจสอบสิทธิ์...
      </p>
    </div>
  );
}

/** ไม่ mount protected child จน auth และ permission gateผ่าน. */
export function PspRouteGate({
  requiredPermissions,
  children,
}: {
  requiredPermissions: readonly string[];
  children: React.ReactNode;
}): React.JSX.Element {
  const { me, status } = useAuth();

  if (status !== "authed" || !me) return <LoadingState />;
  if (!hasRequiredPermissions(me.permissions, requiredPermissions)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorCard
          code="403"
          title="ไม่มีสิทธิ์เข้าถึง"
          message="คุณไม่มีสิทธิ์ใช้งานการเชื่อมต่อ PSP"
        >
          <Link href="/dashboard" className={errorButtonClass}>
            กลับหน้าหลัก
          </Link>
        </ErrorCard>
      </div>
    );
  }
  return <>{children}</>;
}
