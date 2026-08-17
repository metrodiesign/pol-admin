import Link from "next/link";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

/** สถานะโหลด/ผิดพลาด/ไม่พบ ของหน้า form org unit (create/edit/read). render ใต้ EditPageHeader. */
export function OrgUnitFormStatus({
  state,
  backHref,
  label,
}: {
  state: "loading" | "error" | "notfound";
  /** ลิงก์กลับหน้า list ของ module (จาก config.basePath) */
  backHref: string;
  /** label ไทยของ entity (เช่น "สำนักงาน") */
  label: string;
}) {
  const msg =
    state === "loading"
      ? "กำลังโหลด…"
      : state === "notfound"
        ? `ไม่พบ${label}ที่ระบุ`
        : "โหลดข้อมูลไม่สำเร็จ";
  return (
    <div
      className="rounded-card bg-card p-10 text-center text-sm text-grey-500"
      style={cardStyle}
    >
      <p>{msg}</p>
      {state !== "loading" && (
        <Link
          href={backHref}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          กลับไปหน้ารายการ
        </Link>
      )}
    </div>
  );
}
