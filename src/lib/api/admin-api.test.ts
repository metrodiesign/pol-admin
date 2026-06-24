import { describe, expect, it } from "vitest";

import { buildLoginUrl, buildRequestInit, isMutation, readCookieFrom } from "./admin-api";

describe("readCookieFrom", () => {
  it("อ่านค่า cookie ตามชื่อ", () => {
    expect(readCookieFrom("adm_csrf=abc123", "adm_csrf")).toBe("abc123");
  });
  it("เลือก cookie ถูกตัวจากหลายตัว", () => {
    expect(readCookieFrom("a=1; adm_csrf=xyz; b=2", "adm_csrf")).toBe("xyz");
  });
  it("decode ค่า url-encoded", () => {
    expect(readCookieFrom("t=a%2Fb%3Dc", "t")).toBe("a/b=c");
  });
  it("ไม่มี cookie -> null", () => {
    expect(readCookieFrom("a=1; b=2", "adm_csrf")).toBeNull();
  });
  it("string ว่าง -> null", () => {
    expect(readCookieFrom("", "adm_csrf")).toBeNull();
  });
});

describe("isMutation", () => {
  it("safe method -> false", () => {
    expect(isMutation("GET")).toBe(false);
    expect(isMutation("HEAD")).toBe(false);
    expect(isMutation("OPTIONS")).toBe(false);
  });
  it("mutation method -> true", () => {
    for (const m of ["POST", "PUT", "PATCH", "DELETE"]) expect(isMutation(m)).toBe(true);
  });
  it("case-insensitive", () => {
    expect(isMutation("post")).toBe(true);
    expect(isMutation("get")).toBe(false);
  });
});

describe("buildLoginUrl", () => {
  it("encode returnTo ที่อยู่ใน allowlist", () => {
    expect(buildLoginUrl("/dashboard")).toBe("/admin/auth/login?returnTo=%2Fdashboard");
  });
  it("allow '/'", () => {
    expect(buildLoginUrl("/")).toBe("/admin/auth/login?returnTo=%2F");
  });
  it("allow /main", () => {
    expect(buildLoginUrl("/main")).toBe("/admin/auth/login?returnTo=%2Fmain");
  });
  it("clamp path นอก allowlist -> /main (default)", () => {
    expect(buildLoginUrl("/transaction")).toBe("/admin/auth/login?returnTo=%2Fmain");
  });
});

describe("buildRequestInit", () => {
  it("credentials:'include' เสมอ", () => {
    expect(buildRequestInit({}, null).credentials).toBe("include");
  });
  it("ไม่ใส่ CSRF บน GET แม้มี token", () => {
    const init = buildRequestInit({ method: "GET" }, "tok");
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBeNull();
  });
  it("ใส่ CSRF บน mutation เมื่อมี token", () => {
    const init = buildRequestInit({ method: "POST" }, "tok");
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBe("tok");
  });
  it("ไม่ใส่ CSRF บน mutation เมื่อไม่มี token", () => {
    const init = buildRequestInit({ method: "POST" }, null);
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBeNull();
  });
});
