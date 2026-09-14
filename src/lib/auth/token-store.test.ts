import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearTokens, getTokens, resetTokenStoreForTest, setTokens } from "./token-store";

const PAIR = { accessToken: "a", refreshToken: "r", expiresAt: 123 };

describe("token-store", () => {
  const map = new Map<string, string>();
  beforeEach(() => {
    map.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    });
    resetTokenStoreForTest();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("ว่างตอนแรก", () => {
    expect(getTokens()).toBeNull();
  });

  it("set -> เขียน sessionStorage ทันที; hydrate กลับหลัง reset (full reload)", () => {
    setTokens(PAIR);
    expect(JSON.parse(map.get("pol_tokens")!)).toEqual(PAIR);
    resetTokenStoreForTest();
    expect(getTokens()).toEqual(PAIR);
  });

  it("clear -> ลบทั้ง memory และ storage", () => {
    setTokens(PAIR);
    clearTokens();
    expect(getTokens()).toBeNull();
    expect(map.has("pol_tokens")).toBe(false);
  });

  it("ไม่มี sessionStorage (node/SSR) -> ทำงานใน memory ไม่ throw", () => {
    vi.stubGlobal("sessionStorage", undefined);
    resetTokenStoreForTest();
    expect(getTokens()).toBeNull();
    setTokens(PAIR);
    expect(getTokens()).toEqual(PAIR);
  });
});
