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
  it("init ด้วย client_id ที่ส่ง + วาดปุ่มลง slot; callback ผูก (audience, clientId) + ส่ง response ต่อ (REQ-2.3/2.4)", () => {
    const { api, calls } = makeApi();
    const received: unknown[] = [];
    renderAudienceButton({
      api,
      audience: "admin",
      clientId: "ADMIN",
      slot,
      onCredential: (a, c, r) => received.push([a, c, r]),
    });
    expect(calls[0]!.clientId).toBe("ADMIN");
    expect(api.renderButton).toHaveBeenCalledWith(slot, expect.any(Object));
    calls[0]!.cb({ credential: "tok-a" });
    expect(received).toEqual([["admin", "ADMIN", { credential: "tok-a" }]]);
  });

  it("สลับ audience -> credential route ไป client_id ใหม่ ไม่ stale (B3, no singleton clobber)", () => {
    const { api, calls } = makeApi();
    const received: unknown[] = [];
    const onCredential = (a: string, c: string) => received.push([a, c]);
    renderAudienceButton({ api, audience: "admin", clientId: "ADMIN", slot, onCredential });
    renderAudienceButton({ api, audience: "producer", clientId: "PRODUCER", slot, onCredential });
    calls[0]!.cb({ credential: "x" });
    calls[1]!.cb({ credential: "y" });
    expect(received).toEqual([
      ["admin", "ADMIN"],
      ["producer", "PRODUCER"],
    ]);
  });
});

describe("getGisApi", () => {
  it("คืน null เมื่อไม่มี window (node)", () => {
    expect(getGisApi()).toBeNull();
  });
});
