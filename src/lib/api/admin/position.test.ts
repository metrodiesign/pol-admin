import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPosition,
  deactivatePosition,
  getPosition,
  getPositions,
  updatePosition,
} from "./position";

// --- integration: position CRUD (mock global fetch/document) ---
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

describe("getPositions", () => {
  it("bind list export กับ position path", async () => {
    const body = {
      items: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          code: "position_1",
          name: "Position One",
          status: 1,
          version: 0,
        },
      ],
      page: 1,
      limit: 25,
      total: 1,
      totalPages: 1,
    };
    const { calls } = stubFetchSeq([{ status: 200, body }]);
    await expect(getPositions()).resolves.toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        code: "position_1",
        name: "Position One",
        isActive: true,
      },
    ]);
    expect(calls[0]!.path).toBe("/api/v1/positions?page=1&limit=25");
  });
});

describe("getPosition", () => {
  it("bind detail export กับ encoded position path", async () => {
    const { calls } = stubFetchSeq([
      {
        status: 200,
        body: {
          id: "11111111-1111-4111-8111-111111111111",
          code: "position_1",
          name: "Position One",
          status: 2,
          version: 1,
        },
      },
    ]);
    await expect(getPosition("a/b")).resolves.toMatchObject({ isActive: false });
    expect(calls[0]!.path).toBe("/api/v1/positions/a%2Fb");
  });
});

describe("createPosition", () => {
  it("POST body {code, name} + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 201 }]);
    await createPosition({ code: "ps", name: "ตำแหน่งทดสอบ" });
    expect(calls[0]!.path).toBe("/api/v1/positions");
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      code: "ps",
      name: "ตำแหน่งทดสอบ",
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });

  it("คืน Response ดิบ (409 ตรวจได้)", async () => {
    stubFetchSeq([{ status: 409 }]);
    const res = await createPosition({ code: "ps", name: "n" });
    expect(res.status).toBe(409);
  });
});

describe("updatePosition", () => {
  it("PUT body ครบทั้ง name และ isActive เสมอ (กัน regression ปิดใช้งานเงียบ)", async () => {
    const { calls } = stubFetchSeq([{ status: 200 }]);
    await updatePosition("id-1", { name: "ใหม่", isActive: true });
    expect(calls[0]!.path).toBe("/api/v1/positions/id-1");
    expect(calls[0]!.init.method).toBe("PUT");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({
      name: "ใหม่",
      isActive: true,
    });
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });
});

describe("deactivatePosition", () => {
  it("DELETE ไป path ที่ encode แล้ว + CSRF header", async () => {
    const { calls } = stubFetchSeq([{ status: 204 }]);
    const res = await deactivatePosition("a b");
    expect(calls[0]!.path).toBe("/api/v1/positions/a%20b");
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
    expect(res.status).toBe(204);
  });
});
