import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createDivision,
  deactivateDivision,
  getDivision,
  getDivisions,
  updateDivision,
} from "./division";
import type { Division } from "@/types/organization/division";

// --- integration: division CRUD (mock global fetch/document) ---
// REQ-2.1, 3.3, 4.4, 5.4, 6.2, 7.4

interface FetchCall {
  path: string;
  init: RequestInit;
}

/** stub fetch ตอบตามลำดับ call (คืน response ตัวสุดท้ายซ้ำถ้า call เกิน) + บันทึกทุก call. */
function stubFetchSeq(responses: { status: number; body?: unknown }[]): { calls: FetchCall[] } {
  const calls: FetchCall[] = [];
  vi.stubGlobal("fetch", (path: string, init: RequestInit = {}) => {
    calls.push({ path, init });
    const r = responses[Math.min(calls.length - 1, responses.length - 1)]!;
    const payload = r.body === undefined ? null : JSON.stringify(r.body);
    return Promise.resolve(new Response(payload, { status: r.status }));
  });
  // mutations อ่าน document.cookie หา CSRF
  vi.stubGlobal("document", { cookie: "adm_csrf=tok" });
  return { calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function division(id: string): Division {
  return { id, code: `c_${id}`, name: `n${id}`, isActive: true };
}

function paged(items: Division[], page: number, totalPages: number) {
  return { items, page, limit: 25, total: totalPages * items.length, totalPages };
}

describe("getDivisions", () => {
  it("หน้าเดียว -> คืน items ตรง ๆ และ path ประกอบจาก segment", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: paged([division("1")], 1, 1) }]);
    const divisions = await getDivisions();
    expect(divisions).toEqual([division("1")]);
    expect(calls[0]!.path).toBe("/api/v1/divisions?page=1&limit=25");
  });

  it("หลายหน้า -> fetch ครบทุกหน้าแล้ว concat ตามลำดับ", async () => {
    const { calls } = stubFetchSeq([
      { status: 200, body: paged([division("1")], 1, 3) },
      { status: 200, body: paged([division("2")], 2, 3) },
      { status: 200, body: paged([division("3")], 3, 3) },
    ]);
    const divisions = await getDivisions();
    expect(divisions.map((u) => u.id)).toEqual(["1", "2", "3"]);
    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/divisions?page=1&limit=25",
      "/api/v1/divisions?page=2&limit=25",
      "/api/v1/divisions?page=3&limit=25",
    ]);
  });

  it("page ใดไม่ ok -> throw ทั้งก้อน (ไม่คืนข้อมูลครึ่งเดียว)", async () => {
    stubFetchSeq([{ status: 200, body: paged([division("1")], 1, 2) }, { status: 500 }]);
    await expect(getDivisions()).rejects.toThrow("/api/v1/divisions 500");
  });
});

describe("getDivision", () => {
  it("404 -> null", async () => {
    stubFetchSeq([{ status: 404 }]);
    expect(await getDivision("x")).toBeNull();
  });

  it("200 -> Division และ id ผ่าน encodeURIComponent", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: division("a/b") }]);
    const u = await getDivision("a/b");
    expect(u?.id).toBe("a/b");
    expect(calls[0]!.path).toBe("/api/v1/divisions/a%2Fb");
  });

  it("status อื่น -> throw", async () => {
    stubFetchSeq([{ status: 500 }]);
    await expect(getDivision("x")).rejects.toThrow("500");
  });
});

describe("createDivision", () => {
  it("POST body {code, name} + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 201 }]);
    await createDivision({ code: "dv1", name: "แผนกทดสอบ" });
    expect(calls[0]!.path).toBe("/api/v1/divisions");
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      code: "dv1",
      name: "แผนกทดสอบ",
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });

  it("คืน Response ดิบ (409 ตรวจได้)", async () => {
    stubFetchSeq([{ status: 409 }]);
    const res = await createDivision({ code: "dv1", name: "n" });
    expect(res.status).toBe(409);
  });
});

describe("updateDivision", () => {
  it("PUT body ครบทั้ง name และ isActive เสมอ (กัน regression ปิดใช้งานเงียบ)", async () => {
    const { calls } = stubFetchSeq([{ status: 200 }]);
    await updateDivision("id-1", { name: "ใหม่", isActive: true });
    expect(calls[0]!.path).toBe("/api/v1/divisions/id-1");
    expect(calls[0]!.init.method).toBe("PUT");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      name: "ใหม่",
      isActive: true,
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });
});

describe("deactivateDivision", () => {
  it("DELETE ไป path ที่ encode แล้ว + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 204 }]);
    const res = await deactivateDivision("a b");
    expect(calls[0]!.path).toBe("/api/v1/divisions/a%20b");
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
    expect(res.status).toBe(204);
  });
});
