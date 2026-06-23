import { LoginView } from "@/components/auth/login-view";

// shell-free: หน้านี้อยู่ใต้ root layout เท่านั้น (ไม่มี dashboard sidebar/topbar) — REQ-1.1, 1.2
export default function LoginPage() {
  return <LoginView />;
}
