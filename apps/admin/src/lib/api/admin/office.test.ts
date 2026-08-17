import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOffice,
  deactivateOffice,
  getOffice,
  getOffices,
  updateOffice,
} from "./office";
import type { Office } from "@/types/organization/office";

// --- integration: office CRUD (mock global fetch/document) ---
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

function office(id: string): Office {
  return { id, code: `c_${id}`, name: `n${id}`, isActive: true };
}

function paged(items: Office[], page: number, totalPages: number) {
  return { items, page, limit: 25, total: totalPages * items.length, totalPages };
}

describe("getOffices", () => {
  it("หน้าเดียว -> คืน items ตรง ๆ และ path ประกอบจาก segment", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: paged([office("1")], 1, 1) }]);
    const offices = await getOffices();
    expect(offices).toEqual([office("1")]);
    expect(calls[0]!.path).toBe("/api/v1/offices?page=1&limit=25");
  });

  it("หลายหน้า -> fetch ครบทุกหน้าแล้ว concat ตามลำดับ", async () => {
    const { calls } = stubFetchSeq([
      { status: 200, body: paged([office("1")], 1, 3) },
      { status: 200, body: paged([office("2")], 2, 3) },
      { status: 200, body: paged([office("3")], 3, 3) },
    ]);
    const offices = await getOffices();
    expect(offices.map((u) => u.id)).toEqual(["1", "2", "3"]);
    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/offices?page=1&limit=25",
      "/api/v1/offices?page=2&limit=25",
      "/api/v1/offices?page=3&limit=25",
    ]);
  });

  it("page ใดไม่ ok -> throw ทั้งก้อน (ไม่คืนข้อมูลครึ่งเดียว)", async () => {
    stubFetchSeq([{ status: 200, body: paged([office("1")], 1, 2) }, { status: 500 }]);
    await expect(getOffices()).rejects.toThrow("/api/v1/offices 500");
  });
});

describe("getOffice", () => {
  it("404 -> null", async () => {
    stubFetchSeq([{ status: 404 }]);
    expect(await getOffice("x")).toBeNull();
  });

  it("200 -> Office และ id ผ่าน encodeURIComponent", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: office("a/b") }]);
    const u = await getOffice("a/b");
    expect(u?.id).toBe("a/b");
    expect(calls[0]!.path).toBe("/api/v1/offices/a%2Fb");
  });

  it("status อื่น -> throw", async () => {
    stubFetchSeq([{ status: 500 }]);
    await expect(getOffice("x")).rejects.toThrow("500");
  });
});

describe("createOffice", () => {
  it("POST body {code, name} + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 201 }]);
    await createOffice({ code: "hq", name: "สำนักงานใหญ่" });
    expect(calls[0]!.path).toBe("/api/v1/offices");
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      code: "hq",
      name: "สำนักงานใหญ่",
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });

  it("คืน Response ดิบ (409 ตรวจได้)", async () => {
    stubFetchSeq([{ status: 409 }]);
    const res = await createOffice({ code: "hq", name: "n" });
    expect(res.status).toBe(409);
  });
});

describe("updateOffice", () => {
  it("PUT body ครบทั้ง name และ isActive เสมอ (กัน regression ปิดใช้งานเงียบ)", async () => {
    const { calls } = stubFetchSeq([{ status: 200 }]);
    await updateOffice("id-1", { name: "ใหม่", isActive: true });
    expect(calls[0]!.path).toBe("/api/v1/offices/id-1");
    expect(calls[0]!.init.method).toBe("PUT");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      name: "ใหม่",
      isActive: true,
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });
});

describe("deactivateOffice", () => {
  it("DELETE ไป path ที่ encode แล้ว + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 204 }]);
    const res = await deactivateOffice("a b");
    expect(calls[0]!.path).toBe("/api/v1/offices/a%20b");
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
    expect(res.status).toBe(204);
  });
});
