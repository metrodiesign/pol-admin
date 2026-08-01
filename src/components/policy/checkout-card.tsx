"use client";

import { cn } from "@/lib/utils";

interface CheckoutCardProps {
  title: string;
  description?: string;
  /** ปุ่ม/องค์ประกอบมุมขวาบนของหัวการ์ด (เช่น "เพิ่มรายการ") */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** เปลือกการ์ดมาตรฐานของหน้า checkout — หัวเรื่อง + คำอธิบาย + เนื้อหา. */
export function CheckoutCard({
  title,
  description,
  action,
  className,
  children,
}: CheckoutCardProps) {
  return (
    <section
      className={cn("rounded-2xl bg-card", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[var(--divider)] px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-primary">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-grey-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="px-6 pt-5 pb-6">{children}</div>
    </section>
  );
}

/** label + ดอกจันบังคับ (required). */
export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-foreground select-none"
    >
      {children}
      {required ? <span className="ml-0.5 text-error">*</span> : null}
    </label>
  );
}
