import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRole,
  deleteRole,
  getPermissionCatalog,
  getRole,
  getRoles,
  updateRole,
} from "./role";
import type { RoleFormInput } from "@/types/admin/role";

// --- integration: role CRUD + catalog (mock global fetch/document) ---

interface FetchCall {
  path: string;
  init: RequestInit;
}

/** stub global fetch ให้คืน response ที่กำหนด + บันทึก call ล่าสุด. */
function stubFetch(status: number, body: unknown): { calls: FetchCall[] } {
  const calls: FetchCall[] = [];
  vi.stubGlobal("fetch", (path: string, init: RequestInit = {}) => {
    calls.push({ path, init });
    const payload = body === undefined ? null : JSON.stringify(body);
    return Promise.resolve(new Response(payload, { status }));
  });
  // mutations อ่าน document.cookie หา CSRF
  vi.stubGlobal("document", { cookie: "adm_csrf=tok" });
  return { calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAMPLE_INPUT: RoleFormInput = {
  code: "finance_admin",
  name: "ผู้ดูแลการเงิน",
  description: "desc",
  color: "blue",
  status: "active",
  permissions: ["txn.view"],
};

describe("getRoles", () => {
  it("map RoleResponse -> Role และ coerce ค่า nullable/loose", async () => {
    stubFetch(200, [
      {
        code: "c1",
        name: "n1",
        description: null,
        color: null,
        status: "active",
        permissions: null,
        userCount: "3",
      },
    ]);
    const roles = await getRoles();
    expect(roles).toEqual([
      {
        code: "c1",
        name: "n1",
        description: "",
        color: "gray",
        status: "active",
        permissions: [],
        userCount: 3,
      },
    ]);
  });

  it("status อื่น (ไม่ใช่ 401) -> throw", async () => {
    stubFetch(500, undefined);
    await expect(getRoles()).rejects.toThrow("/admin/roles 500");
  });
});

describe("getRole", () => {
  it("404 -> null", async () => {
    stubFetch(404, undefined);
    expect(await getRole("nope")).toBeNull();
  });
  it("200 -> Role ที่ map แล้ว", async () => {
    stubFetch(200, {
      code: "c1",
      name: "n1",
      description: "d",
      color: "blue",
      status: "inactive",
      permissions: ["a"],
      userCount: 2,
    });
    const role = await getRole("c1");
    expect(role?.status).toBe("inactive");
    expect(role?.userCount).toBe(2);
  });
  it("encode code ใน path", async () => {
    const { calls } = stubFetch(404, undefined);
    await getRole("a/b");
    expect(calls[0]!.path).toBe("/admin/roles/a%2Fb");
  });
});

describe("getPermissionCatalog", () => {
  it("map groups + permissions", async () => {
    stubFetch(200, {
      groups: [{ key: "txn", label: "ธุรกรรม" }],
      permissions: [{ key: "txn.view", label: "ดู", resource: "txn" }],
    });
    const cat = await getPermissionCatalog();
    expect(cat.groups).toEqual([{ key: "txn", label: "ธุรกรรม" }]);
    expect(cat.permissions).toEqual([
      { key: "txn.view", label: "ดู", resource: "txn" },
    ]);
  });
});

describe("createRole", () => {
  it("POST /admin/roles พร้อม body เต็ม (มี code) + CSRF header", async () => {
    const { calls } = stubFetch(201, undefined);
    await createRole(SAMPLE_INPUT);
    expect(calls[0]!.path).toBe("/admin/roles");
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual(SAMPLE_INPUT);
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("tok");
  });
  it("คืน Response ดิบ (409 ตรวจได้)", async () => {
    stubFetch(409, undefined);
    const res = await createRole(SAMPLE_INPUT);
    expect(res.status).toBe(409);
  });
});

describe("updateRole", () => {
  it("PUT /admin/roles/{code} และ body ไม่มี code", async () => {
    const { calls } = stubFetch(200, undefined);
    await updateRole("finance_admin", SAMPLE_INPUT);
    expect(calls[0]!.path).toBe("/admin/roles/finance_admin");
    expect(calls[0]!.init.method).toBe("PUT");
    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body.code).toBeUndefined();
    expect(body.name).toBe("ผู้ดูแลการเงิน");
    expect(body.permissions).toEqual(["txn.view"]);
  });
});

describe("deleteRole", () => {
  it("DELETE ไป path ที่ encode แล้ว", async () => {
    const { calls } = stubFetch(204, undefined);
    const res = await deleteRole("a b");
    expect(calls[0]!.path).toBe("/admin/roles/a%20b");
    expect(calls[0]!.init.method).toBe("DELETE");
    expect(res.status).toBe(204);
  });
});
