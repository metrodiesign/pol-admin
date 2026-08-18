import type { Metadata } from "next";

import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = { title: "เข้าสู่ระบบ POL Pay" };

// shell-free: หน้านี้อยู่ใต้ root layout เท่านั้น (ไม่มี dashboard sidebar/topbar) — REQ-1.1, 1.2
export default function LoginPage() {
  return <LoginView />;
}
