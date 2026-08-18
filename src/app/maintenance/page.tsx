import type { Metadata } from "next";
import { ErrorScreen } from "@/components/error/error-screen";

export const metadata: Metadata = { title: "ปิดปรับปรุงระบบ | POL Admin" };

// เฟือง 8 ซี่ — teeth เป็น rect หมุนรอบศูนย์กลาง วาดที่ origin (0,0) แล้ว translate จากข้างนอก
function Gear({ body, teeth, hole, color }: { body: number; teeth: number; hole: number; color: string }) {
  return (
    <g fill={color}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x={-teeth / 2}
          y={-body - teeth * 0.9}
          width={teeth}
          height={teeth * 1.4}
          rx={teeth / 4}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={body} />
      <circle r={hole} fill="white" />
    </g>
  );
}

const spinClass = "motion-reduce:animate-none animate-spin [animation-duration:14s]";

function MaintenanceIllustration() {
  return (
    <svg width="180" height="140" viewBox="0 0 200 160" aria-hidden="true">
      <circle cx="100" cy="80" r="72" fill="var(--color-crop-blue)" opacity="0.06" />
      {/* เฟืองใหญ่ crop-blue */}
      <g transform="translate(88 88)">
        <g
          className={spinClass}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <Gear body={30} teeth={9} hole={12} color="var(--color-crop-blue)" />
        </g>
      </g>
      {/* เฟืองเล็ก crop-gold หมุนสวนทาง */}
      <g transform="translate(146 52)">
        <g
          className={`${spinClass} [animation-direction:reverse]`}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <Gear body={17} teeth={6} hole={7} color="var(--color-crop-gold)" />
        </g>
      </g>
    </svg>
  );
}

export default function MaintenancePage() {
  return (
    <ErrorScreen
      illustration={<MaintenanceIllustration />}
      title="ปิดปรับปรุงระบบชั่วคราว"
      message="ขออภัยในความไม่สะดวก กรุณากลับมาใหม่ภายหลัง"
    />
  );
}
