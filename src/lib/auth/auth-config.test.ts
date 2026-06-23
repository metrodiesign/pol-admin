import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { audienceForClientId, getClientId } from "./auth-config";

const ADMIN = "admin-xyz.apps.googleusercontent.com";
const PRODUCER = "producer-xyz.apps.googleusercontent.com";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN", ADMIN);
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID_PRODUCER", PRODUCER);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getClientId", () => {
  it("อ่าน client_id ต่อ audience จาก env", () => {
    expect(getClientId("admin")).toBe(ADMIN);
    expect(getClientId("producer")).toBe(PRODUCER);
  });

  it("ไม่ตั้ง/ว่าง -> null (REQ-2.5)", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN", "");
    expect(getClientId("admin")).toBeNull();
  });
});

describe("audienceForClientId", () => {
  it("map client_id -> audience ที่ตรง (REQ-3.4)", () => {
    expect(audienceForClientId(ADMIN)).toBe("admin");
    expect(audienceForClientId(PRODUCER)).toBe("producer");
  });

  it("ไม่ตรง client ที่ตั้งไว้ / ว่าง -> null", () => {
    expect(audienceForClientId("stranger.apps.googleusercontent.com")).toBeNull();
    expect(audienceForClientId("")).toBeNull();
  });
});
