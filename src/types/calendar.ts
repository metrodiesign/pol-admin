export type EventColor =
  | "teal"
  | "red"
  | "purple"
  | "navy"
  | "amber"
  | "green"
  | "rose";

export interface CalendarEvent {
  id: string;
  title: string;
  /** start date string: YYYY-MM-DD */
  start: string;
  /** end date string: YYYY-MM-DD (inclusive, or same as start for single-day) */
  end: string;
  /** optional start time HH:MM (24h) */
  startTime?: string;
  /** optional end time HH:MM (24h) */
  endTime?: string;
  allDay?: boolean;
  color: EventColor;
  description?: string;
}

export type CalendarView = "month" | "week" | "day" | "agenda";
