import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearTokens, getTokens, setTokens, withCrossTabLock } from "./token-store";

const PAIR = { accessToken: "a", refreshToken: "r", expiresAt: 123 };

describe("token-store", () => {
  const map = new Map<string, string>();
  beforeEach(() => {
    map.clear();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    });
  });
  afterEach(() => {
    clearTokens();
    vi.unstubAllGlobals();
  });

  it("ว่างตอนแรก", () => {
    expect(getTokens()).toBeNull();
  });

  it("set -> เขียน localStorage ทันที และอ่านสดทุกครั้ง (แท็บอื่นเขียนทับ -> เห็นค่าใหม่)", () => {
    setTokens(PAIR);
    expect(JSON.parse(map.get("pol_tokens")!)).toEqual(PAIR);
    const other = { ...PAIR, refreshToken: "r2" };
    map.set("pol_tokens", JSON.stringify(other)); // แท็บอื่น refresh
    expect(getTokens()).toEqual(other);
  });

  it("clear -> ลบทั้ง memory และ storage", () => {
    setTokens(PAIR);
    clearTokens();
    expect(getTokens()).toBeNull();
    expect(map.has("pol_tokens")).toBe(false);
  });

  it("ไม่มี localStorage (node/SSR) -> ทำงานใน memory ไม่ throw", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(getTokens()).toBeNull();
    setTokens(PAIR);
    expect(getTokens()).toEqual(PAIR);
  });

  it("withCrossTabLock: ใช้ navigator.locks เมื่อมี ไม่มีก็รันตรง", async () => {
    vi.stubGlobal("navigator", {});
    await expect(withCrossTabLock("x", async () => 1)).resolves.toBe(1);
    const request = vi.fn((_n: string, work: () => Promise<number>) => work());
    vi.stubGlobal("navigator", { locks: { request } });
    await expect(withCrossTabLock("x", async () => 2)).resolves.toBe(2);
    expect(request).toHaveBeenCalledWith("x", expect.any(Function));
  });
});
