import { describe, expect, it, vi } from "vitest";

import { getGisApi, renderAudienceButton, type GisIdApi } from "./gis";

function makeApi() {
  const calls: { clientId: string; cb: (r: { credential?: string }) => void }[] = [];
  const api: GisIdApi = {
    initialize: ({ client_id, callback }) => calls.push({ clientId: client_id, cb: callback }),
    renderButton: vi.fn(),
  };
  return { api, calls };
}

const slot = {} as HTMLElement;

describe("renderAudienceButton", () => {
  it("init ด้วย client_id ที่ส่ง + วาดปุ่มลง slot; callback ส่ง response ต่อ (REQ-2.3/2.4)", () => {
    const { api, calls } = makeApi();
    const received: unknown[] = [];
    renderAudienceButton({ api, clientId: "ADMIN", slot, onCredential: (r) => received.push(r) });
    expect(calls[0]!.clientId).toBe("ADMIN");
    expect(api.renderButton).toHaveBeenCalledWith(slot, expect.any(Object));
    calls[0]!.cb({ credential: "tok-a" });
    expect(received).toEqual([{ credential: "tok-a" }]);
  });

  it("วาด 2 audience: แต่ละครั้ง init client_id ของตัวเอง (iframe bake คนละ client) + callback ร่วมตัวเดียว", () => {
    const { api, calls } = makeApi();
    const shared = vi.fn();
    renderAudienceButton({ api, clientId: "ADMIN", slot, onCredential: shared });
    renderAudienceButton({ api, clientId: "PRODUCER", slot, onCredential: shared });
    expect(calls.map((c) => c.clientId)).toEqual(["ADMIN", "PRODUCER"]);
    // callback ที่ส่งให้ GIS เป็นฟังก์ชันเดียวกันทั้งคู่ -> ไม่มี clobber ของ closure
    expect(calls[0]!.cb).toBe(shared);
    expect(calls[1]!.cb).toBe(shared);
  });
});

describe("getGisApi", () => {
  it("คืน null เมื่อไม่มี window (node)", () => {
    expect(getGisApi()).toBeNull();
  });
});
