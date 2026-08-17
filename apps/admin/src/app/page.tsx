import { redirect } from "next/navigation";

// "/" ไม่มี surface ของตัวเอง -> ส่งไป admin landing (/dashboard, guarded).
// ครอบทั้งการเข้า / ตรง ๆ และกรณี backend fall back มา / หลัง login callback.
export default function RootPage() {
  redirect("/dashboard");
}
