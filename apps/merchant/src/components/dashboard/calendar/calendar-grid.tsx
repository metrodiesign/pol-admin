"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  teal:   { bg: "bg-[#cafdf5]",  text: "text-[#006c9c]",  border: "border-l-[#00b8d9]" },
  red:    { bg: "bg-[#ffe9d5]",  text: "text-[#b71d18]",  border: "border-l-[#ff5630]" },
  purple: { bg: "bg-[#efd6ff]",  text: "text-[#5119b7]",  border: "border-l-[#8e33ff]" },
  navy:   { bg: "bg-[#cafdf5]",  text: "text-[#003768]",  border: "border-l-[#003768]" },
  amber:  { bg: "bg-[#fff5cc]",  text: "text-[#b76e00]",  border: "border-l-[#ffab00]" },
  green:  { bg: "bg-[#c8fad6]",  text: "text-[#007867]",  border: "border-l-[#00a76f]" },
  rose:   { bg: "bg-[#ffe9d5]",  text: "text-[#7a0916]",  border: "border-l-[#7a0916]" },
};

const DEFAULT_COLORS = { bg: "bg-[#cafdf5]", text: "text-[#006c9c]", border: "border-l-[#00b8d9]" };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Pixel height reserved for each event slot (chip + gap). */
const SLOT_H = 22;
/** Top offset from the cell top edge (below the day number row). */
const SLOT_TOP = 30;
/** Minimum cell height in px. */
const CELL_MIN_H = 110;
/** Max slots shown before "+N more". */
const MAX_SLOTS = 3;

function formatTime(time: string): string {
  const parts = time.split(":");
  const h = Number(parts[0] ?? "0");
  const m = Number(parts[1] ?? "0");
  const suffix = h >= 12 ? "p" : "a";
  const hour = h % 12 || 12;
  if (m === 0) return `${hour}${suffix}`;
  return `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
}

/** Format a local Date as YYYY-MM-DD without UTC conversion issues. */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toLocalDateStr(d);
}

function clampToRange(dateStr: string, start: string, end: string): string {
  if (dateStr < start) return start;
  if (dateStr > end) return end;
  return dateStr;
}

interface GridCell {
  date: Date;
  dateStr: string;
  inMonth: boolean;
  col: number; // 0=Mon … 6=Sun
  row: number;
}

/** A positioned event entry for one week row. */
interface RowEventEntry {
  event: CalendarEvent;
  /** start col within this row (0-6) */
  startCol: number;
  /** end col within this row (0-6) */
  endCol: number;
  /** vertical slot index (0-based) */
  slot: number;
  /** is this the very first day of the event? */
  isStart: boolean;
  /** is this the very last day of the event? */
  isEnd: boolean;
}

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  today: Date;
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarGrid({
  year,
  month,
  events,
  today,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const cells = useMemo<GridCell[]>(() => {
    const firstDay = new Date(year, month, 1);
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: GridCell[] = [];
    let row = 0;
    let col = 0;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      result.push({ date: d, dateStr: toLocalDateStr(d), inMonth: false, col, row });
      col++;
      if (col === 7) { col = 0; row++; }
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      result.push({ date, dateStr: toLocalDateStr(date), inMonth: true, col, row });
      col++;
      if (col === 7) { col = 0; row++; }
    }
    let next = 1;
    // Fill to complete last week row
    while (result.length % 7 !== 0) {
      const d = new Date(year, month + 1, next++);
      result.push({ date: d, dateStr: toLocalDateStr(d), inMonth: false, col, row });
      col++;
      if (col === 7) { col = 0; row++; }
    }
    // Always show 6 rows (42 cells) — pad with next-month days if needed
    while (result.length < 42) {
      const d = new Date(year, month + 1, next++);
      result.push({ date: d, dateStr: toLocalDateStr(d), inMonth: false, col, row });
      col++;
      if (col === 7) { col = 0; row++; }
    }
    return result;
  }, [year, month]);

  const totalRows = cells.length / 7;
  const todayStr = toLocalDateStr(today);

  const cellByDate = useMemo(() => {
    const m = new Map<string, GridCell>();
    for (const c of cells) m.set(c.dateStr, c);
    return m;
  }, [cells]);

  /**
   * Build per-row event entries with stable slot assignments.
   * Multi-day events are split at week boundaries.
   * Single-day events occupy their own slot.
   */
  const rowEventMap = useMemo<Map<number, RowEventEntry[]>>(() => {
    // Sort events stably: multi-day first (longer span first), then by start date, then by id
    const sorted = [...events].sort((a, b) => {
      const aSpan = a.start === a.end ? 0 : 1;
      const bSpan = b.start === b.end ? 0 : 1;
      if (bSpan !== aSpan) return bSpan - aSpan; // spanning first
      return a.start.localeCompare(b.start) || a.id.localeCompare(b.id);
    });

    const map = new Map<number, RowEventEntry[]>();
    // slot usage: Map<`${row}-${col}`, Set<slot>>
    const slotUsed = new Map<string, Set<number>>();

    function isSlotFree(row: number, col: number, slot: number): boolean {
      return !(slotUsed.get(`${row}-${col}`)?.has(slot) ?? false);
    }
    function markSlot(row: number, col: number, slot: number) {
      const key = `${row}-${col}`;
      const existing = slotUsed.get(key) ?? new Set<number>();
      existing.add(slot);
      slotUsed.set(key, existing);
    }
    function findSlot(row: number, startCol: number, endCol: number): number {
      for (let s = 0; ; s++) {
        let free = true;
        for (let c = startCol; c <= endCol; c++) {
          if (!isSlotFree(row, c, s)) { free = false; break; }
        }
        if (free) return s;
      }
    }

    for (const ev of sorted) {
      // Find all rows this event touches within our grid
      const evStart = ev.start;
      const evEnd = ev.end;

      const rowsHandled = new Set<number>();
      // Iterate each date of the event
      let cur = evStart;
      while (cur <= evEnd) {
        const cell = cellByDate.get(cur);
        if (cell && !rowsHandled.has(cell.row)) {
          rowsHandled.add(cell.row);
          const r = cell.row;

          // Row starts at Monday (col 0), ends at Sunday (col 6)
          const rowStartCell = cells[r * 7];
          const rowEndCell = cells[r * 7 + 6];
          if (!rowStartCell || !rowEndCell) { cur = addDays(cur, 1); continue; }
          const rowStartDate = rowStartCell.dateStr;
          const rowEndDate = rowEndCell.dateStr;

          // Clamp event range to this row
          const segStart = clampToRange(evStart, rowStartDate, rowEndDate);
          const segEnd = clampToRange(evEnd, rowStartDate, rowEndDate);

          const startCell = cellByDate.get(segStart);
          const endCell = cellByDate.get(segEnd);
          if (!startCell || !endCell) { cur = addDays(cur, 1); continue; }

          const startCol = startCell.col;
          const endCol = endCell.col;
          const slot = findSlot(r, startCol, endCol);

          for (let c = startCol; c <= endCol; c++) markSlot(r, c, slot);

          const rowList = map.get(r) ?? [];
          rowList.push({
            event: ev,
            startCol,
            endCol,
            slot,
            isStart: segStart === evStart,
            isEnd: segEnd === evEnd,
          });
          map.set(r, rowList);
        }
        cur = addDays(cur, 1);
      }
    }

    return map;
  }, [events, cells, cellByDate]);

  const isSatOrSun = (date: Date) => [0, 6].includes(date.getDay());

  const rows = useMemo(() => {
    const r: GridCell[][] = [];
    for (let i = 0; i < totalRows; i++) r.push(cells.slice(i * 7, i * 7 + 7));
    return r;
  }, [cells, totalRows]);

  return (
    <div className="overflow-hidden">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "flex h-12 items-center justify-center text-sm font-semibold text-grey-800",
              i >= 5 && "bg-grey-200"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {rows.map((rowCells, rowIdx) => {
        const rowEntries = rowEventMap.get(rowIdx) ?? [];

        return (
          <div key={rowIdx} className="relative grid grid-cols-7">
            {/* Cell backgrounds + day numbers + "+N more" */}
            {rowCells.map((cell, colIdx) => {
              const isToday = cell.dateStr === todayStr;
              const isExpanded = expanded[cell.dateStr] ?? false;

              // Total event slots used in this cell
              const cellEntries = rowEntries.filter(
                (e) => e.startCol <= colIdx && e.endCol >= colIdx
              );
              const maxSlot = cellEntries.length > 0
                ? Math.max(...cellEntries.map((e) => e.slot))
                : -1;
              const totalSlotsInCell = maxSlot + 1;
              const hiddenCount = Math.max(0, totalSlotsInCell - MAX_SLOTS);

              return (
                <div
                  key={cell.dateStr + colIdx}
                  style={{ minHeight: `${CELL_MIN_H}px` }}
                  className={cn(
                    "relative border-b border-r border-border p-1.5",
                    !cell.inMonth && "opacity-50",
                    isSatOrSun(cell.date) && "bg-grey-200",
                    "cursor-pointer transition-colors hover:bg-grey-50",
                    colIdx === 6 && "border-r-0"
                  )}
                  onClick={() => onDayClick(cell.date)}
                >
                  {/* Day number */}
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday
                          ? "font-bold text-white"
                          : !cell.inMonth
                          ? "text-grey-400"
                          : "text-grey-700"
                      )}
                      style={isToday ? { backgroundColor: "rgb(255, 86, 48)" } : undefined}
                    >
                      {cell.date.getDate()}
                    </span>
                  </div>

                  {/* "+N more" button — positioned after MAX_SLOTS */}
                  {!isExpanded && hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => ({ ...prev, [cell.dateStr]: true }));
                      }}
                      style={{ top: `${SLOT_TOP + MAX_SLOTS * SLOT_H}px` }}
                      className="absolute left-1.5 right-1.5 text-left text-xs font-medium text-grey-600 hover:text-grey-800"
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              );
            })}

            {/* Spanning event chips — absolutely positioned in the row */}
            {rowEntries.map((entry) => {
              const { event, startCol, endCol, slot, isStart, isEnd } = entry;
              const colors = EVENT_COLORS[event.color] ?? DEFAULT_COLORS;
              const timePrefix =
                isStart && event.startTime ? formatTime(event.startTime) : null;

              // Check if this slot is hidden in any of its cells (use start cell for the decision)
              const isExpanded = expanded[rowCells[startCol]?.dateStr ?? ""] ?? false;
              if (!isExpanded && slot >= MAX_SLOTS) {
                // Hidden behind "+N more" — don't render
                return null;
              }

              const topPx = SLOT_TOP + slot * SLOT_H;
              const colSpan = endCol - startCol + 1;
              const leftPct = (startCol / 7) * 100;
              const widthPct = (colSpan / 7) * 100;

              return (
                <button
                  key={`${event.id}-r${rowIdx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                  style={{
                    top: `${topPx}px`,
                    left: `calc(${leftPct}% + 4px)`,
                    width: `calc(${widthPct}% - 8px)`,
                    height: "20px",
                  }}
                  className={cn(
                    "absolute z-10 flex items-center gap-1 overflow-hidden border-l-2 px-1.5 text-xs font-medium leading-5 transition-opacity hover:opacity-80",
                    colors.bg,
                    colors.text,
                    colors.border,
                    isStart && isEnd && "rounded-md",
                    isStart && !isEnd && "rounded-l-md rounded-r-none",
                    !isStart && isEnd && "rounded-r-md rounded-l-none border-l-0 pl-2",
                    !isStart && !isEnd && "rounded-none border-l-0 pl-2",
                  )}
                >
                  {timePrefix && (
                    <span className="shrink-0 font-bold">{timePrefix}</span>
                  )}
                  <span className="truncate">{event.title}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
