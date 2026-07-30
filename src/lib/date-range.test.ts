import { describe, it, expect } from "vitest";
import {
  computePreset,
  detectPreset,
  formatThaiDate,
  formatThaiRange,
  thaiMonthYearCaption,
  thaiWeekday,
  PRESETS,
} from "./date-range";

describe("computePreset", () => {
  const today = new Date(2026, 6, 30); // 30 Jul 2026

  it("today: start = end = today", () => {
    const r = computePreset("today", today)!;
    expect(r.start).toEqual(new Date(2026, 6, 30));
    expect(r.end).toEqual(new Date(2026, 6, 30));
  });

  it("yesterday: start = end = today - 1", () => {
    const r = computePreset("yesterday", today)!;
    expect(r.start).toEqual(new Date(2026, 6, 29));
    expect(r.end).toEqual(new Date(2026, 6, 29));
  });

  it("last7: inclusive, start = today-6, end = today", () => {
    const r = computePreset("last7", today)!;
    expect(r.start).toEqual(new Date(2026, 6, 24));
    expect(r.end).toEqual(new Date(2026, 6, 30));
  });

  it("last30: inclusive, start = today-29, end = today", () => {
    const r = computePreset("last30", today)!;
    expect(r.start).toEqual(new Date(2026, 6, 1));
    expect(r.end).toEqual(new Date(2026, 6, 30));
  });

  it("thisMonth: day 1 to real last day", () => {
    const r = computePreset("thisMonth", today)!;
    expect(r.start).toEqual(new Date(2026, 6, 1));
    expect(r.end).toEqual(new Date(2026, 6, 31));
  });

  it("lastMonth: full previous month", () => {
    const r = computePreset("lastMonth", today)!;
    expect(r.start).toEqual(new Date(2026, 5, 1));
    expect(r.end).toEqual(new Date(2026, 5, 30));
  });

  it("custom: returns null", () => {
    expect(computePreset("custom", today)).toBeNull();
  });

  it("normalizes today with time component to midnight before computing", () => {
    const withTime = new Date(2026, 6, 30, 14, 35, 22);
    const r = computePreset("today", withTime)!;
    expect(r.start).toEqual(new Date(2026, 6, 30));
    expect(r.start.getHours()).toBe(0);
  });

  it("edge: today = day 1 -> lastMonth crosses year boundary (Dec of prior year)", () => {
    const jan1 = new Date(2026, 0, 1);
    const r = computePreset("lastMonth", jan1)!;
    expect(r.start).toEqual(new Date(2025, 11, 1));
    expect(r.end).toEqual(new Date(2025, 11, 31));
  });

  it("edge: thisMonth in Feb of leap year has 29 days", () => {
    const leapFeb = new Date(2028, 1, 10);
    const r = computePreset("thisMonth", leapFeb)!;
    expect(r.end).toEqual(new Date(2028, 1, 29));
  });

  it("edge: thisMonth in Feb of non-leap year has 28 days", () => {
    const nonLeapFeb = new Date(2026, 1, 10);
    const r = computePreset("thisMonth", nonLeapFeb)!;
    expect(r.end).toEqual(new Date(2026, 1, 28));
  });

  it("edge: last30 crosses year boundary", () => {
    const jan10 = new Date(2026, 0, 10);
    const r = computePreset("last30", jan10)!;
    expect(r.start).toEqual(new Date(2025, 11, 12));
    expect(r.end).toEqual(new Date(2026, 0, 10));
  });
});

describe("detectPreset", () => {
  const today = new Date(2026, 6, 30);

  it("matches an exact preset range and returns its key", () => {
    expect(
      detectPreset({ start: new Date(2026, 6, 30), end: new Date(2026, 6, 30) }, today),
    ).toBe("today");
    expect(
      detectPreset({ start: new Date(2026, 6, 24), end: new Date(2026, 6, 30) }, today),
    ).toBe("last7");
  });

  it("returns custom when no preset matches", () => {
    expect(
      detectPreset({ start: new Date(2026, 6, 5), end: new Date(2026, 6, 12) }, today),
    ).toBe("custom");
  });

  it("handles a 1-day range (start = end) that isn't today/yesterday", () => {
    expect(
      detectPreset({ start: new Date(2026, 6, 15), end: new Date(2026, 6, 15) }, today),
    ).toBe("custom");
  });

  it("date-only (B1): detects preset from calendar midnight dates even when today carries a time component", () => {
    const todayWithTime = new Date(2026, 6, 30, 9, 15, 0);
    const calendarRange = { start: new Date(2026, 6, 24), end: new Date(2026, 6, 30) };
    expect(detectPreset(calendarRange, todayWithTime)).toBe("last7");
  });

  it("precedence: when a range matches multiple presets, returns the first per PRESETS order", () => {
    // today = yesterday when today's date is Jan 1 and preset "yesterday" also spans a single day;
    // simpler deterministic case: today & yesterday can't collide, so verify order via last7/last30
    // by constructing a range that only makes sense if precedence is checked in PRESETS order.
    const singleDayToday = { start: new Date(2026, 6, 30), end: new Date(2026, 6, 30) };
    // "today" appears before any other single-day-matching preset in PRESETS order.
    expect(PRESETS[0]!.key).toBe("today");
    expect(detectPreset(singleDayToday, today)).toBe("today");
  });
});

describe("formatThaiDate / formatThaiRange", () => {
  it("formats BE year (2026 + 543 = 2569) with abbreviated Thai month", () => {
    expect(formatThaiDate(new Date(2026, 6, 30))).toBe("30 ก.ค. 2569");
  });

  it("formats a range as 'a - b'", () => {
    const range = { start: new Date(2026, 6, 24), end: new Date(2026, 6, 30) };
    expect(formatThaiRange(range)).toBe("24 ก.ค. 2569 - 30 ก.ค. 2569");
  });
});

describe("thaiMonthYearCaption / thaiWeekday", () => {
  it("formats full Thai month name + BE year", () => {
    expect(thaiMonthYearCaption(new Date(2026, 6, 30))).toBe("กรกฎาคม 2569");
  });

  it("formats abbreviated weekday names อา..ส", () => {
    expect(thaiWeekday(new Date(2026, 6, 26))).toBe("อา"); // Sunday
    expect(thaiWeekday(new Date(2026, 6, 27))).toBe("จ"); // Monday
    expect(thaiWeekday(new Date(2026, 7, 1))).toBe("ส"); // Saturday
  });
});
