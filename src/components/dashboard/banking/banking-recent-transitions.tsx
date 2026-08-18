import Image from "next/image";
import { MoreVertical, ArrowRight } from "lucide-react";
import { WidgetCard } from "../widget-card";
import { recentTransitions } from "@/lib/mock/banking";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/16 text-success-dark",
  progress: "bg-warning/16 text-warning-dark",
  failed: "bg-error/16 text-error-dark",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  progress: "Progress",
  failed: "Failed",
};

export function BankingRecentTransitions() {
  return (
    <WidgetCard title="Recent transitions" headerClassName="pb-6" bodyClassName="p-0 pb-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-grey-200">
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Description
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Date
              </th>
              <th className="px-4 py-4 text-right text-sm font-semibold leading-6 text-grey-600">
                Amount
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Status
              </th>
              <th className="w-10 px-2 py-4" />
            </tr>
          </thead>
          <tbody>
            {recentTransitions.map((t, i) => (
              <tr
                key={i}
                className="border-b border-dashed border-[var(--divider)] last:border-0 hover:bg-[var(--action-hover)] transition-colors"
              >
                {/* Description */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={t.avatar}
                      alt={t.description}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover bg-grey-200"
                      unoptimized
                    />
                    <div>
                      <p className="text-sm font-semibold text-grey-800">
                        {t.type === "receive" ? "Receive money from" : "Payment for"}
                      </p>
                      <p className="text-xs text-grey-500">{t.description}</p>
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-4">
                  <p className="text-sm text-grey-800">{t.date}</p>
                  <p className="text-xs text-grey-500">{t.time}</p>
                </td>

                {/* Amount */}
                <td className="px-4 py-4 text-right text-sm font-semibold text-grey-800">
                  {t.amount}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold leading-[18px]",
                      STATUS_STYLES[t.status],
                    )}
                  >
                    {STATUS_LABELS[t.status]}
                  </span>
                </td>

                {/* Kebab */}
                <td className="px-2 py-4">
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-200"
                    aria-label="More options"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-dashed border-[var(--divider)] p-3 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </button>
      </div>
    </WidgetCard>
  );
}
