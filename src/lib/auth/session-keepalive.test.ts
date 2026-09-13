import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MIN_REFRESH_DELAY_MS, refreshDelayMs, startSessionKeepalive } from "./session-keepalive";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();
const HOUR = 3_600_000;

describe("refreshDelayMs", () => {
  it("ครึ่งทางของอายุที่เหลือ", () => {
    expect(refreshDelayMs(iso(T0 + 8 * HOUR), T0)).toBe(4 * HOUR);
  });
  it("ไม่ต่ำกว่า MIN_REFRESH_DELAY_MS แม้หมดแล้ว", () => {
    expect(refreshDelayMs(iso(T0 - HOUR), T0)).toBe(MIN_REFRESH_DELAY_MS);
    expect(refreshDelayMs(iso(T0 + 1_000), T0)).toBe(MIN_REFRESH_DELAY_MS);
  });
});

describe("startSessionKeepalive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => vi.useRealTimers());

  function fakeDoc() {
    const listeners = new Set<() => void>();
    return {
      visibilityState: "visible" as DocumentVisibilityState,
      addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
      removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
      fire: () => listeners.forEach((fn) => fn()),
      listeners,
    };
  }

  it("refresh ที่ครึ่งอายุ แล้ว reschedule จาก expiresAt ใหม่", async () => {
    const refresh = vi.fn(async () => iso(Date.now() + 8 * HOUR));
    startSessionKeepalive({ getExpiresAt: async () => iso(T0 + 8 * HOUR), refresh });
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(4 * HOUR - 1);
    expect(refresh).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4 * HOUR);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("ไม่มี session -> ไม่ตั้ง timer", async () => {
    const refresh = vi.fn(async () => null);
    startSessionKeepalive({ getExpiresAt: async () => null, refresh });
    await vi.advanceTimersByTimeAsync(24 * HOUR);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refresh ล้ม -> หยุด ไม่ยิงซ้ำ", async () => {
    const refresh = vi.fn(async () => null);
    startSessionKeepalive({ getExpiresAt: async () => iso(T0 + 2 * HOUR), refresh });
    await vi.advanceTimersByTimeAsync(HOUR);
    expect(refresh).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(24 * HOUR);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("tab กลับมา visible หลังเลยกำหนด -> refresh ทันที (timer พื้นหลังถูก throttle)", async () => {
    const doc = fakeDoc();
    const refresh = vi.fn(async () => iso(Date.now() + 8 * HOUR));
    startSessionKeepalive({ getExpiresAt: async () => iso(T0 + 2 * HOUR), refresh, doc });
    await vi.advanceTimersByTimeAsync(0);
    vi.setSystemTime(T0 + 90 * 60_000); // เลย dueAt (T0+1h) โดย timer ยังไม่ fire
    doc.fire();
    await vi.advanceTimersByTimeAsync(0);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("visible ก่อนกำหนด -> ไม่ refresh", async () => {
    const doc = fakeDoc();
    const refresh = vi.fn(async () => iso(Date.now() + 8 * HOUR));
    startSessionKeepalive({ getExpiresAt: async () => iso(T0 + 8 * HOUR), refresh, doc });
    await vi.advanceTimersByTimeAsync(0);
    doc.fire();
    await vi.advanceTimersByTimeAsync(0);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("stop() ยกเลิก timer และ listener", async () => {
    const doc = fakeDoc();
    const refresh = vi.fn(async () => iso(Date.now() + 8 * HOUR));
    const stop = startSessionKeepalive({ getExpiresAt: async () => iso(T0 + 2 * HOUR), refresh, doc });
    await vi.advanceTimersByTimeAsync(0);
    stop();
    expect(doc.listeners.size).toBe(0);
    await vi.advanceTimersByTimeAsync(24 * HOUR);
    expect(refresh).not.toHaveBeenCalled();
  });
});
