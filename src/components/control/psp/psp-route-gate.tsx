"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import type { AdminMe, AuthStatus } from "@/types/auth";

export function hasRequiredPermissions(
  permissions: readonly string[],
  required: readonly string[],
): boolean {
  const held = new Set(permissions);
  return required.every((permission) => held.has(permission));
}

export function shouldRedirectToForbidden(
  status: AuthStatus,
  me: AdminMe | null,
  required: readonly string[],
): boolean {
  return status === "authed" && me !== null && !hasRequiredPermissions(me.permissions, required);
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
  const router = useRouter();
  const { me, status } = useAuth();
  const redirectToForbidden = shouldRedirectToForbidden(status, me, requiredPermissions);

  useEffect(() => {
    if (redirectToForbidden) router.replace("/error/403");
  }, [redirectToForbidden, router]);

  if (status !== "authed" || !me || redirectToForbidden) return <LoadingState />;
  return <>{children}</>;
}
