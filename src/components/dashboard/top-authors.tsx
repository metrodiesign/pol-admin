import Image from "next/image";
import { Trophy, Heart } from "lucide-react";
import { WidgetCard } from "./widget-card";
import { topAuthors } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const rankTone = ["text-warning", "text-grey-400", "text-error-light"];

export function TopAuthors() {
  return (
    <WidgetCard title="Top authors">
      <ul className="space-y-5">
        {topAuthors.map((a, i) => (
          <li key={a.name} className="flex items-center gap-3">
            <Image
              src={a.avatar}
              alt={a.name}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-grey-800">{a.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-grey-600">
                <Heart className="size-3.5 text-error" />
                {a.total}
              </p>
            </div>
            <Trophy className={cn("size-7", rankTone[i] ?? "text-grey-400")} />
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
