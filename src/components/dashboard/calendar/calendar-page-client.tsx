"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { CALENDAR_EVENTS } from "@/lib/mock/calendar";
import type { CalendarEvent, CalendarView } from "@/types/calendar";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarGrid } from "./calendar-grid";
import { CalendarAgenda } from "./calendar-agenda";
import { EventDialog } from "./event-dialog";

/** Format a local Date as YYYY-MM-DD without UTC conversion issues. */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  const dow = (start.getDay() + 6) % 7; // Mon=0
  start.setDate(start.getDate() - dow);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
}

export function CalendarPageClient() {
  const todayDate = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(todayDate));
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [clickedDate, setClickedDate] = useState<string | undefined>(undefined);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const periodLabel =
    view === "month"
      ? `${MONTH_NAMES[month]} ${year}`
      : view === "week" || view === "agenda"
      ? getWeekLabel(currentDate)
      : currentDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

  // Mobile always shows the current week range regardless of the selected view
  const mobilePeriodLabel = getWeekLabel(currentDate);

  function handlePrev() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") next.setMonth(next.getMonth() - 1);
      else if (view === "week" || view === "agenda") next.setDate(next.getDate() - 7);
      else next.setDate(next.getDate() - 1);
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") next.setMonth(next.getMonth() + 1);
      else if (view === "week" || view === "agenda") next.setDate(next.getDate() + 7);
      else next.setDate(next.getDate() + 1);
      return next;
    });
  }

  // Mobile always navigates by week (agenda shows current week range)
  function handleMobilePrev() {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }

  function handleMobileNext() {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(date: Date) {
    setClickedDate(toLocalDateStr(date));
    setEditingEvent(null);
    setDialogOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event);
    setClickedDate(event.start);
    setDialogOpen(true);
  }

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setClickedDate(toLocalDateStr(new Date()));
    setDialogOpen(true);
  }, []);

  function handleSave(ev: Omit<CalendarEvent, "id"> & { id?: string }) {
    if (ev.id) {
      setEvents((prev) =>
        prev.map((e) => (e.id === ev.id ? ({ ...ev, id: ev.id } as CalendarEvent) : e))
      );
    } else {
      const newEvent: CalendarEvent = { ...ev, id: String(Date.now()) };
      setEvents((prev) => [...prev, newEvent]);
    }
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="py-4">
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-2xl font-bold leading-9 text-grey-800">Calendar</h4>
        <button
          type="button"
          onClick={handleAddEvent}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-bold leading-6 text-card transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add event
        </button>
      </div>

      {/* Calendar surface */}
      <div className="dashboard-card overflow-hidden">
        {/* Desktop toolbar */}
        <div className="hidden sm:block">
          <CalendarToolbar
            view={view}
            onViewChange={setView}
            periodLabel={periodLabel}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            isMobile={false}
          />
        </div>

        {/* Mobile toolbar */}
        <div className="sm:hidden">
          <CalendarToolbar
            view={view}
            onViewChange={setView}
            periodLabel={mobilePeriodLabel}
            onPrev={handleMobilePrev}
            onNext={handleMobileNext}
            onToday={handleToday}
            isMobile={true}
          />
        </div>

        {/* Desktop: month grid */}
        <div className="hidden sm:block">
          <CalendarGrid
            year={year}
            month={month}
            events={events}
            today={todayDate}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Mobile: agenda list (shows current week's events) */}
        <div className="sm:hidden">
          <CalendarAgenda
            events={events}
            weekDate={currentDate}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={editingEvent}
        initialDate={clickedDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
