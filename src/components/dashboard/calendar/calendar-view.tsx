"use client";

import { useState, useMemo } from "react";
import { CALENDAR_EVENTS } from "@/lib/mock/calendar";
import type { CalendarEvent, CalendarView } from "@/types/calendar";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarGrid } from "./calendar-grid";
import { CalendarAgenda } from "./calendar-agenda";
import { EventDialog } from "./event-dialog";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getWeekLabel(date: Date): string {
  // Return e.g. "Jun 1 – 7, 2026"
  const start = new Date(date);
  const dow = (start.getDay() + 6) % 7; // Mon=0
  start.setDate(start.getDate() - dow); // go to Monday

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

export function CalendarView() {
  const todayDate = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date(todayDate));
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [clickedDate, setClickedDate] = useState<string | undefined>(undefined);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute toolbar period label
  const periodLabel =
    view === "month"
      ? `${MONTH_NAMES[month]} ${year}`
      : view === "week" || view === "agenda"
      ? getWeekLabel(currentDate)
      : currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Desktop vs mobile: detect via CSS media, we rely on responsive classes
  // We render both and hide with CSS

  function handlePrev() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") {
        next.setMonth(next.getMonth() - 1);
      } else if (view === "week" || view === "agenda") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") {
        next.setMonth(next.getMonth() + 1);
      } else if (view === "week" || view === "agenda") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    setClickedDate(`${y}-${m}-${d}`);
    setEditingEvent(null);
    setDialogOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event);
    setClickedDate(event.start);
    setDialogOpen(true);
  }

  function handleSave(ev: Omit<CalendarEvent, "id"> & { id?: string }) {
    if (ev.id) {
      setEvents((prev) =>
        prev.map((e) => (e.id === ev.id ? ({ ...ev, id: ev.id } as CalendarEvent) : e))
      );
    } else {
      const newEvent: CalendarEvent = {
        ...ev,
        id: String(Date.now()),
        color: ev.color,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <>
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
            periodLabel={periodLabel}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            isMobile={true}
          />
        </div>

        {/* Calendar body */}
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

        {/* Mobile: agenda list */}
        <div className="sm:hidden">
          <CalendarAgenda
            events={events}
            weekDate={currentDate}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event add/edit dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={editingEvent}
        initialDate={clickedDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}

