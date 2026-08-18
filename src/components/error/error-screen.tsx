import Image from "next/image";

// shell-free error screen — โครงเดียวกับ login-error (header วิริยะ + การ์ดกลางจอ) แต่ไม่มี banner
// ไม่มี directive: เรียกได้ทั้งจาก server component (not-found/403/maintenance) และ client (error.tsx)

export const errorButtonClass =
  "mt-8 inline-flex h-11 w-full items-center justify-center rounded-control bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

export const errorButtonOutlineClass =
  "mt-3 inline-flex h-11 w-full items-center justify-center rounded-control border border-grey-300 bg-background px-5 text-sm font-bold text-foreground transition-colors hover:bg-grey-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

interface ErrorScreenProps {
  code?: string; // เช่น "404" — ตัวเลขใหญ่เหนือ title
  title: string;
  message: string;
  illustration?: React.ReactNode; // รูปประกอบเหนือ code/title
  children?: React.ReactNode; // ปุ่ม action ต่อหน้า
}

// Header bar — เหมือนหน้า /login-error (โลโก้วิริยะในกล่องขาว + tagline บนพื้นน้ำเงิน)
function ErrorHeader() {
  return (
    <header className="flex min-h-[60px] shrink-0 items-stretch gap-3 bg-crop-blue pr-4 sm:min-h-[70px] sm:gap-4 sm:pr-6">
      <span className="flex shrink-0 items-center bg-white px-3 sm:px-5">
        <Image
          src="/viriyah-logo.png"
          alt="วิริยะประกันภัย"
          width={667}
          height={250}
          priority
          className="h-12 w-auto sm:h-16"
        />
      </span>
      <span className="flex items-center">
        <Image
          src="/fairness-tagline-white.png"
          alt="ความเป็นธรรม คือ พื้นฐาน"
          width={1147}
          height={176}
          className="h-6 w-auto sm:h-8"
        />
      </span>
    </header>
  );
}

// การ์ดอย่างเดียว — ใช้ตรงในหน้า in-shell (เช่น /error/403 ที่อยู่ใต้ MinimalsLayout)
export function ErrorCard({ code, title, message, illustration, children }: ErrorScreenProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-background px-6 py-10 text-center shadow-card">
      {illustration && <div className="mb-6 flex justify-center">{illustration}</div>}
      {code && <p className="mb-4 text-6xl font-bold text-crop-blue">{code}</p>}
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}

export function ErrorScreen(props: ErrorScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-grey-100">
      <ErrorHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <ErrorCard {...props} />
      </div>
    </main>
  );
}
