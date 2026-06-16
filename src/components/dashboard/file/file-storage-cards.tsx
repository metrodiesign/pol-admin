import { MoreVertical } from "lucide-react";
import { storageCards } from "@/lib/mock/file";

interface FileStorageCardsProps {
  /** When true, each card renders as a full-width block (mobile single-col stack) */
  stacked?: boolean;
}

export function FileStorageCards({ stacked = false }: FileStorageCardsProps) {
  return (
    <>
      {storageCards.map((card) => (
        <div
          key={card.name}
          className={stacked ? "w-full" : "col-span-12 sm:col-span-6 mmd:col-span-4"}
        >
          <div
            className="dashboard-card flex flex-col p-6"
            style={{ minHeight: 208 }}
          >
            <div className="flex items-start justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.icon} alt={card.name} className="size-10" />
              <button
                type="button"
                className="rounded-full p-1 text-grey-500 hover:bg-grey-200/60 hover:text-grey-700"
              >
                <MoreVertical className="size-5" />
              </button>
            </div>
            <h6 className="mt-4 text-lg font-semibold text-grey-800">{card.name}</h6>
            {/* Push progress + label to bottom of card */}
            <div className="mt-auto pt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-grey-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${card.progress}%`, backgroundColor: card.barColor }}
                />
              </div>
              <p className="mt-2 text-right text-sm text-grey-500">
                <span className="font-semibold text-grey-800">{card.used}</span>{" "}
                / {card.total}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
