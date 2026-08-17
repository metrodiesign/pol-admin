import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderInfoCardProps {
  title: string;
  children: ReactNode;
  showEdit?: boolean;
}

export function OrderInfoCard({
  title,
  children,
  showEdit = true,
}: OrderInfoCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <h3 className="text-lg font-semibold leading-7 text-foreground">
          {title}
        </h3>
        {showEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-grey-600 hover:text-foreground"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      {/* Card body */}
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}
