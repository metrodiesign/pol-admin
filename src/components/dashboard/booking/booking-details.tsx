import Image from "next/image";
import { MoreVertical, ArrowRight } from "lucide-react";
import { bookingDetails } from "@/lib/mock/booking";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-success/16 text-success-dark",
  pending: "bg-warning/16 text-warning-dark",
  cancelled: "bg-error/16 text-error-dark",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function BookingDetails() {
  return (
    <div className="dashboard-card">
      {/* Card header */}
      <div className="px-6 py-5">
        <h6 className="text-lg font-semibold text-grey-800">Booking details</h6>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-grey-200">
              <th className="p-4 text-left text-sm font-semibold text-grey-600">
                Destination
              </th>
              <th className="p-4 text-left text-sm font-semibold text-grey-600">
                Customer
              </th>
              <th className="p-4 text-left text-sm font-semibold text-grey-600">
                Check in
              </th>
              <th className="p-4 text-left text-sm font-semibold text-grey-600">
                Check out
              </th>
              <th className="p-4 text-left text-sm font-semibold text-grey-600">
                Status
              </th>
              <th className="p-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {bookingDetails.map((b, i) => (
              <tr
                key={i}
                className="border-b border-dashed border-[var(--divider)] last:border-0 hover:bg-[var(--action-hover)] transition-colors"
              >
                {/* Destination: thumbnail + name */}
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={b.destinationImage}
                        alt={b.destination}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-grey-800 line-clamp-2 max-w-[180px]">
                      {b.destination}
                    </span>
                  </div>
                </td>

                {/* Customer: name + phone (two lines) */}
                <td className="px-6 py-3">
                  <p className="text-sm font-semibold text-grey-800">{b.customer}</p>
                  <p className="text-xs text-grey-500">{b.phone}</p>
                </td>

                {/* Check in */}
                <td className="px-6 py-3">
                  <p className="text-sm text-grey-800">{b.checkIn}</p>
                  <p className="text-xs text-grey-500">{b.checkInTime}</p>
                </td>

                {/* Check out */}
                <td className="px-6 py-3">
                  <p className="text-sm text-grey-800">{b.checkOut}</p>
                  <p className="text-xs text-grey-500">{b.checkOutTime}</p>
                </td>

                {/* Status chip */}
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-1 text-xs font-bold capitalize",
                      STATUS_STYLES[b.status]
                    )}
                  >
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>

                {/* Kebab */}
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
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
    </div>
  );
}
