import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function WidgetCard({
  title,
  subtitle,
  action,
  className,
  headerClassName,
  bodyClassName,
  children,
}: WidgetCardProps) {
  return (
    <section className={cn("dashboard-card flex flex-col", className)}>
      {(title || action) && (
        <header
          className={cn(
            "flex items-start justify-between gap-3 p-6 pb-0",
            headerClassName,
          )}
        >
          <div>
            {title && <h6 className="text-lg font-semibold text-grey-800">{title}</h6>}
            {subtitle && <p className="mt-1 text-sm text-grey-600">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
