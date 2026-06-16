"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

const DOT_COLORS: Record<string, string> = {
  teal:   "bg-[#00b8d9]",
  red:    "bg-[#ff5630]",
  purple: "bg-[#8e33ff]",
  navy:   "bg-[#003768]",
  amber:  "bg-[#ffab00]",
  green:  "bg-[#00a76f]",
  rose:   "bg-[#7a0916]",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatTime12(time: string): string {
  const parts = time.split(":");
  const h = Number(parts[0] ?? "0");
  const m = Number(parts[1] ?? "0");
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${period}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[d.getDay()] ?? "";
}

function getTimeLabel(event: CalendarEvent): string {
  if (event.allDay) return "all-day";
  const start = event.startTime ? formatTime12(event.startTime) : "";
  const end = event.endTime ? formatTime12(event.endTime) : "";
  if (start && end) return `${start} - ${end}`;
  return start;
}

/** Format a local Date as YYYY-MM-DD without UTC conversion issues. */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns the Monday of the ISO week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface DayGroup {
  dateStr: string;
  events: CalendarEvent[];
}

interface CalendarAgendaProps {
  events: CalendarEvent[];
  /** The reference date used to determine which week to show. */
  weekDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarAgenda({ events, weekDate, onEventClick }: CalendarAgendaProps) {
  // Compute the current week window (Mon–Sun)
  const weekStart = getWeekStart(weekDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartStr = toLocalDateStr(weekStart);
  const weekEndStr = toLocalDateStr(weekEnd);

  // Filter events whose start falls within the current week
  const weekEvents = events.filter(
    (ev) => ev.start >= weekStartStr && ev.start <= weekEndStr
  );

  // Group events by start date
  const groups: DayGroup[] = [];
  const seen = new Set<string>();

  // Sort events by start date then time
  const sorted = [...weekEvents].sort((a, b) => {
    const dateCmp = a.start.localeCompare(b.start);
    if (dateCmp !== 0) return dateCmp;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });

  for (const ev of sorted) {
    if (!seen.has(ev.start)) {
      seen.add(ev.start);
      groups.push({ dateStr: ev.start, events: [] });
    }
    const g = groups.find((g) => g.dateStr === ev.start);
    if (g) g.events.push(ev);
  }

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-grey-500">
        No events to display
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => (
        <div key={group.dateStr}>
          {/* Day header */}
          <div className="flex items-center justify-between bg-grey-100 px-4 py-2">
            <span className="text-[13px] font-semibold text-grey-800">
              {getDayName(group.dateStr)}
            </span>
            <span className="text-[13px] font-semibold text-grey-800">
              {formatDateLabel(group.dateStr)}
            </span>
          </div>

          {/* Event rows */}
          {group.events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => onEventClick(ev)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-grey-50"
            >
              <span className="w-28 shrink-0 text-[12px] text-grey-500">
                {getTimeLabel(ev)}
              </span>
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  DOT_COLORS[ev.color] ?? "bg-grey-400"
                )}
              />
              <span className="text-[13px] font-medium text-grey-800">{ev.title}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
