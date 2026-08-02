import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOrgUnit,
  deactivateOrgUnit,
  getOrgUnit,
  getOrgUnits,
  updateOrgUnit,
} from "./org-unit";
import type { OrgUnit } from "@/types/organization/org-unit";

// --- integration: org-unit CRUD (mock global fetch/document) ---
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

function unit(id: string): OrgUnit {
  return { id, code: `c_${id}`, name: `n${id}`, isActive: true };
}

function paged(items: OrgUnit[], page: number, totalPages: number) {
  return { items, page, limit: 25, total: totalPages * items.length, totalPages };
}

describe("getOrgUnits", () => {
  it("หน้าเดียว -> คืน items ตรง ๆ และ path ประกอบจาก segment", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: paged([unit("1")], 1, 1) }]);
    const units = await getOrgUnits("offices");
    expect(units).toEqual([unit("1")]);
    expect(calls[0]!.path).toBe("/api/v1/offices?page=1&limit=25");
  });

  it("หลายหน้า -> fetch ครบทุกหน้าแล้ว concat ตามลำดับ", async () => {
    const { calls } = stubFetchSeq([
      { status: 200, body: paged([unit("1")], 1, 3) },
      { status: 200, body: paged([unit("2")], 2, 3) },
      { status: 200, body: paged([unit("3")], 3, 3) },
    ]);
    const units = await getOrgUnits("divisions");
    expect(units.map((u) => u.id)).toEqual(["1", "2", "3"]);
    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/divisions?page=1&limit=25",
      "/api/v1/divisions?page=2&limit=25",
      "/api/v1/divisions?page=3&limit=25",
    ]);
  });

  it("page ใดไม่ ok -> throw ทั้งก้อน (ไม่คืนข้อมูลครึ่งเดียว)", async () => {
    stubFetchSeq([{ status: 200, body: paged([unit("1")], 1, 2) }, { status: 500 }]);
    await expect(getOrgUnits("levels")).rejects.toThrow("/api/v1/levels 500");
  });

  it("segment ทั้ง 4 ประกอบ path ถูก", async () => {
    for (const segment of ["offices", "divisions", "positions", "levels"] as const) {
      const { calls } = stubFetchSeq([{ status: 200, body: paged([], 1, 1) }]);
      await getOrgUnits(segment);
      expect(calls[0]!.path).toBe(`/api/v1/${segment}?page=1&limit=25`);
      vi.unstubAllGlobals();
    }
  });
});

describe("getOrgUnit", () => {
  it("404 -> null", async () => {
    stubFetchSeq([{ status: 404 }]);
    expect(await getOrgUnit("offices", "x")).toBeNull();
  });

  it("200 -> OrgUnit และ id ผ่าน encodeURIComponent", async () => {
    const { calls } = stubFetchSeq([{ status: 200, body: unit("a/b") }]);
    const u = await getOrgUnit("positions", "a/b");
    expect(u?.id).toBe("a/b");
    expect(calls[0]!.path).toBe("/api/v1/positions/a%2Fb");
  });

  it("status อื่น -> throw", async () => {
    stubFetchSeq([{ status: 500 }]);
    await expect(getOrgUnit("offices", "x")).rejects.toThrow("500");
  });
});

describe("createOrgUnit", () => {
  it("POST body {code, name} + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 201 }]);
    await createOrgUnit("offices", { code: "hq", name: "สำนักงานใหญ่" });
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
    const res = await createOrgUnit("offices", { code: "hq", name: "n" });
    expect(res.status).toBe(409);
  });
});

describe("updateOrgUnit", () => {
  it("PUT body ครบทั้ง name และ isActive เสมอ (กัน regression ปิดใช้งานเงียบ)", async () => {
    const { calls } = stubFetchSeq([{ status: 200 }]);
    await updateOrgUnit("divisions", "id-1", { name: "ใหม่", isActive: true });
    expect(calls[0]!.path).toBe("/api/v1/divisions/id-1");
    expect(calls[0]!.init.method).toBe("PUT");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      name: "ใหม่",
      isActive: true,
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });
});

describe("deactivateOrgUnit", () => {
  it("DELETE ไป path ที่ encode แล้ว + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 204 }]);
    const res = await deactivateOrgUnit("levels", "a b");
    expect(calls[0]!.path).toBe("/api/v1/levels/a%20b");
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
    expect(res.status).toBe(204);
  });
});
