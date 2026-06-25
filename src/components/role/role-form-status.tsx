import Link from "next/link";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

/** สถานะโหลด/ผิดพลาด/ไม่พบ ของหน้า form บทบาท (create/edit/read). render ใต้ EditPageHeader. */
export function RoleFormStatus({
  state,
}: {
  state: "loading" | "error" | "notfound";
}) {
  const msg =
    state === "loading"
      ? "กำลังโหลด…"
      : state === "notfound"
        ? "ไม่พบบทบาทที่ระบุ"
        : "โหลดข้อมูลไม่สำเร็จ";
  return (
    <div
      className="rounded-card bg-card p-10 text-center text-sm text-grey-500"
      style={cardStyle}
    >
      <p>{msg}</p>
      {state !== "loading" && (
        <Link
          href="/user/role/list"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
        >
          กลับไปหน้ารายการ
        </Link>
      )}
    </div>
  );
}
