"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { ALL_SERVICES } from "@/types/tour";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface TourFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TourFiltersDrawer({ open, onClose }: TourFiltersDrawerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [services, setServices] = useState<Set<string>>(new Set());
  const startDateId = useId();
  const endDateId = useId();

  function toggleService(s: string) {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function handleReset() {
    setStartDate("");
    setEndDate("");
    setServices(new Set());
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} className="w-[320px] max-w-full p-0 sm:max-w-[320px] flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h6 className="text-lg font-bold text-grey-800">Filters</h6>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-grey-600 hover:text-grey-800 transition-colors"
            >
              Reset
            </button>
            <SheetClose
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="size-4" />
            </SheetClose>
          </div>
        </div>

        <Separator />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Durations section */}
          <div>
            <h6 className="mb-3 text-sm font-bold text-grey-800">Durations</h6>
            <div className="space-y-3">
              <div>
                <label id={startDateId} className="mb-1 block text-xs text-grey-600">Start date</label>
                <div className="relative">
                  <input
                    aria-labelledby={startDateId}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-control border border-grey-300 px-3 py-2 text-sm text-grey-800 outline-none focus:border-grey-500"
                  />
                </div>
              </div>
              <div>
                <label id={endDateId} className="mb-1 block text-xs text-grey-600">End date</label>
                <input
                  aria-labelledby={endDateId}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-control border border-grey-300 px-3 py-2 text-sm text-grey-800 outline-none focus:border-grey-500"
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <h6 className="mb-3 text-sm font-bold text-grey-800">Destination</h6>
            <input
              type="text"
              placeholder="Select destination"
              aria-label="Destination"
              className="w-full rounded-control border border-grey-300 px-3 py-2 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-500"
            />
          </div>

          {/* Tour guide */}
          <div>
            <h6 className="mb-3 text-sm font-bold text-grey-800">Tour guide</h6>
            <input
              type="text"
              placeholder="Select tour guides"
              aria-label="Tour guide"
              className="w-full rounded-control border border-grey-300 px-3 py-2 text-sm text-grey-800 outline-none placeholder:text-grey-400 focus:border-grey-500"
            />
          </div>

          {/* Services */}
          <div>
            <h6 className="mb-3 text-sm font-bold text-grey-800">Services</h6>
            <div className="space-y-2">
              {ALL_SERVICES.map((service) => (
                <label
                  key={service}
                  className="flex cursor-pointer items-center gap-2 text-sm text-grey-700"
                >
                  <input
                    type="checkbox"
                    checked={services.has(service)}
                    onChange={() => toggleService(service)}
                    className="size-4 rounded border-grey-400 accent-primary"
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
