import { cn } from "@/lib/utils";

interface PublishChipProps {
  status: "Published" | "Draft";
}

export function PublishChip({ status }: PublishChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
        status === "Published"
          ? "bg-info/16 text-info-dark"
          : "bg-grey-500/16 text-grey-800",
      )}
    >
      {status}
    </span>
  );
}
