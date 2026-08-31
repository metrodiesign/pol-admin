import { afterEach, describe, expect, it, vi } from "vitest";

import { adminFetch } from "./auth";
import { getDivision, getDivisions } from "./division";
import { getLevel, getLevels } from "./level";
import { getOffice, getOffices } from "./office";
import { getPosition, getPositions } from "./position";

interface OrgView {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface ResourceDescriptor {
  name: string;
  basePath: string;
  list: () => Promise<OrgView[]>;
  detail: (id: string) => Promise<OrgView | null>;
}

interface FetchCall {
  path: string;
  init: RequestInit;
}

type FetchHandler = (path: string, init: RequestInit) => Response | Promise<Response>;

const RESOURCES: ResourceDescriptor[] = [
  { name: "divisions", basePath: "/api/v1/divisions", list: getDivisions, detail: getDivision },
  { name: "levels", basePath: "/api/v1/levels", list: getLevels, detail: getLevel },
  { name: "offices", basePath: "/api/v1/offices", list: getOffices, detail: getOffice },
  { name: "positions", basePath: "/api/v1/positions", list: getPositions, detail: getPosition },
];

const ID = "11111111-1111-4111-8111-111111111111";

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function malformedResponse(): Response {
  return new Response("{", { status: 200 });
}

function wire(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: ID,
    code: "unit_1",
    name: "Unit One",
    status: 1,
    version: 0,
    ...overrides,
  };
}

function page(
  pageNumber: number,
  totalPages: number,
  items: unknown[] = [wire()],
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    items,
    page: pageNumber,
    limit: 25,
    total: totalPages === 0 ? 0 : (totalPages - 1) * 25 + items.length,
    totalPages,
    ...overrides,
  };
}

function view(overrides: Partial<OrgView> = {}): OrgView {
  return { id: ID, code: "unit_1", name: "Unit One", isActive: true, ...overrides };
}

function stubFetch(handler: FetchHandler): FetchCall[] {
  const calls: FetchCall[] = [];
  vi.stubGlobal("fetch", (path: string, init: RequestInit = {}) => {
    calls.push({ path, init });
    return handler(path, init);
  });
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.each(RESOURCES)("$name shared read contract", (resource) => {
  it("maps valid list statuses and ignores extra fields", async () => {
    const calls = stubFetch(() =>
      response(
        200,
        page(1, 1, [
          wire({ extra: "ignored" }),
          wire({
            id: "22222222-2222-4222-8222-222222222222",
            code: "unit_2",
            name: "Unit Two",
            status: 2,
            version: 1,
          }),
        ]),
      ),
    );

    await expect(resource.list()).resolves.toEqual([
      view(),
      view({
        id: "22222222-2222-4222-8222-222222222222",
        code: "unit_2",
        name: "Unit Two",
        isActive: false,
      }),
    ]);
    expect(calls[0]!.path).toBe(`${resource.basePath}?page=1&limit=25`);
  });

  it("maps valid detail, ignores extra fields, and encodes requested id", async () => {
    const calls = stubFetch(() => response(200, wire({ extra: true })));
    await expect(resource.detail("a/b ?")).resolves.toEqual(view());
    expect(calls[0]!.path).toBe(`${resource.basePath}/a%2Fb%20%3F`);
  });

  it("returns null only for detail 404", async () => {
    stubFetch(() => response(404));
    await expect(resource.detail(ID)).resolves.toBeNull();
  });

  it("preserves same-origin transport credentials and sends no Bearer header", async () => {
    const calls = stubFetch(() => response(200, page(1, 1)));
    await resource.list();
    expect(calls[0]!.path.startsWith("/api/v1/")).toBe(true);
    expect(calls[0]!.init.credentials).toBe("include");
    expect(new Headers(calls[0]!.init.headers).has("Authorization")).toBe(false);
  });

  it.each([403, 503])("rejects list and detail HTTP %s", async (status) => {
    stubFetch(() => response(status));
    await expect(resource.list()).rejects.toThrow(String(status));
    await expect(resource.detail(ID)).rejects.toThrow(String(status));
  });

  it("rejects list and detail network failures", async () => {
    stubFetch(() => Promise.reject(new TypeError("network down")));
    await expect(resource.list()).rejects.toThrow("network down");
    await expect(resource.detail(ID)).rejects.toThrow("network down");
  });

  it("rejects malformed JSON for list and detail", async () => {
    stubFetch(() => malformedResponse());
    await expect(resource.list()).rejects.toThrow();
    await expect(resource.detail(ID)).rejects.toThrow();
  });

  it("preserves real adminFetch 401 response and redirects before adapter rejection", async () => {
    const location = { href: "/before" };
    vi.stubGlobal("window", { location });
    const directResponse = response(401);
    const listResponse = response(401, page(1, 1));
    const detailResponse = response(401, wire());
    let call = 0;
    stubFetch(() => [directResponse, listResponse, detailResponse][call++]!);

    await expect(adminFetch(resource.basePath)).resolves.toBe(directResponse);
    expect(location.href).toBe("/login");
    location.href = "/before-adapter";
    await expect(resource.list()).rejects.toThrow("401");
    expect(location.href).toBe("/login");
    location.href = "/before-detail";
    await expect(resource.detail(ID)).rejects.toThrow("401");
    expect(location.href).toBe("/login");
  });

  it("rejects every invalid page-1 envelope field class", async () => {
    const invalidPages: unknown[] = [
      null,
      page(1, 1, [wire()], { items: "invalid" }),
      page(1, 1, [wire()], { page: 2 }),
      page(1, 1, [wire()], { page: 1.5 }),
      page(1, 1, [wire()], { limit: 24 }),
      page(1, 1, [wire()], { limit: 26 }),
      page(1, 1, [wire()], { total: -1 }),
      page(1, 1, [wire()], { total: Number.MAX_SAFE_INTEGER + 1 }),
      page(1, 1, [wire()], { totalPages: -1 }),
      page(1, 1, [wire()], { totalPages: 2 }),
    ];

    for (const invalidPage of invalidPages) {
      stubFetch(() => response(200, invalidPage));
      await expect(resource.list()).rejects.toThrow();
      vi.unstubAllGlobals();
    }
  });

  it("rejects totalPages above 100 before any remaining-page request", async () => {
    const calls = stubFetch(() =>
      response(200, page(1, 101, [wire()], { total: 2_501, totalPages: 101 })),
    );
    await expect(resource.list()).rejects.toThrow();
    expect(calls).toHaveLength(1);
  });

  it("rejects every invalid master field class in list and detail", async () => {
    const invalidMasters: unknown[] = [
      null,
      wire({ id: "not-a-uuid" }),
      wire({ code: "" }),
      wire({ code: "UPPER" }),
      wire({ code: "a".repeat(65) }),
      wire({ name: "" }),
      wire({ name: " ".repeat(3) }),
      wire({ name: "a".repeat(201) }),
      wire({ status: 0 }),
      wire({ status: true }),
      wire({ version: -1 }),
      wire({ version: Number.MAX_SAFE_INTEGER + 1 }),
    ];

    for (const invalidMaster of invalidMasters) {
      stubFetch(() => response(200, page(1, 1, [invalidMaster])));
      await expect(resource.list()).rejects.toThrow();
      vi.unstubAllGlobals();
      stubFetch(() => response(200, invalidMaster));
      await expect(resource.detail(ID)).rejects.toThrow();
      vi.unstubAllGlobals();
    }
  });

  it("bounds remaining requests to four, runs batches sequentially, and preserves order", async () => {
    let active = 0;
    let maximumActive = 0;
    let firstBatchActive = 0;
    let laterBatchStartedEarly = false;
    const completionOrder: number[] = [];
    const calls = stubFetch((path) => {
      const requestedPage = Number(new URL(path, "http://test").searchParams.get("page"));
      if (requestedPage === 1) return response(200, page(1, 10, [wire()], { total: 226 }));

      active += 1;
      maximumActive = Math.max(maximumActive, active);
      if (requestedPage <= 5) firstBatchActive += 1;
      if (requestedPage >= 6 && firstBatchActive > 0) laterBatchStartedEarly = true;

      return new Promise((resolve) => {
        setTimeout(() => {
          active -= 1;
          if (requestedPage <= 5) firstBatchActive -= 1;
          completionOrder.push(requestedPage);
          resolve(
            response(
              200,
              page(requestedPage, 10, [
                wire({
                  id: `00000000-0000-4000-8000-${String(requestedPage).padStart(12, "0")}`,
                  code: `page_${requestedPage}`,
                  name: `Page ${requestedPage}`,
                }),
              ], { total: 226 }),
            ),
          );
        }, (6 - (requestedPage % 5)) * 2);
      });
    });

    const result = await resource.list();
    expect(maximumActive).toBe(4);
    expect(laterBatchStartedEarly).toBe(false);
    expect(completionOrder.slice(0, 4)).not.toEqual([2, 3, 4, 5]);
    expect(calls.map((call) => call.path)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `${resource.basePath}?page=${index + 1}&limit=25`,
      ),
    );
    expect(result.map((item) => item.code)).toEqual([
      "unit_1",
      ...Array.from({ length: 9 }, (_, index) => `page_${index + 2}`),
    ]);
  });

  it("accepts the supported 100-page boundary with complete ordered results", async () => {
    let active = 0;
    let maximumActive = 0;
    const calls = stubFetch((path) => {
      const requestedPage = Number(new URL(path, "http://test").searchParams.get("page"));
      const items = Array.from({ length: 25 }, (_, index) => {
        const recordNumber = (requestedPage - 1) * 25 + index + 1;
        return wire({
          id: `00000000-0000-4000-8000-${String(recordNumber).padStart(12, "0")}`,
          code: `unit_${recordNumber}`,
          name: `Unit ${recordNumber}`,
          status: recordNumber % 2 === 0 ? 2 : 1,
          version: recordNumber,
        });
      });
      const body = page(requestedPage, 100, items, { total: 2_500 });

      if (requestedPage === 1) return response(200, body);

      active += 1;
      maximumActive = Math.max(maximumActive, active);
      return new Promise((resolve) => {
        setTimeout(() => {
          active -= 1;
          resolve(response(200, body));
        }, 0);
      });
    });

    const result = await resource.list();
    expect(calls.map((call) => call.path)).toEqual(
      Array.from(
        { length: 100 },
        (_, index) => `${resource.basePath}?page=${index + 1}&limit=25`,
      ),
    );
    expect(maximumActive).toBe(4);
    expect(result.map((item) => item.code)).toEqual(
      Array.from({ length: 2_500 }, (_, index) => `unit_${index + 1}`),
    );
  });

  it("rejects atomically and does not start a later batch after current-batch failure", async () => {
    const calls = stubFetch((path) => {
      const requestedPage = Number(new URL(path, "http://test").searchParams.get("page"));
      if (requestedPage === 1) return response(200, page(1, 6, [wire()], { total: 126 }));
      if (requestedPage === 3) return response(500);
      return response(
        200,
        page(requestedPage, 6, [wire({ code: `page_${requestedPage}` })], { total: 126 }),
      );
    });

    await expect(resource.list()).rejects.toThrow("500");
    expect(calls.map((call) => call.path)).not.toContain(`${resource.basePath}?page=6&limit=25`);
  });

  it("rejects atomically when a later batch fails instead of returning accumulated pages", async () => {
    stubFetch((path) => {
      const requestedPage = Number(new URL(path, "http://test").searchParams.get("page"));
      if (requestedPage === 1) return response(200, page(1, 6, [wire()], { total: 126 }));
      if (requestedPage === 6) return response(500);
      return response(
        200,
        page(requestedPage, 6, [wire({ code: `page_${requestedPage}` })], { total: 126 }),
      );
    });

    await expect(resource.list()).rejects.toThrow("500");
  });

  it("rejects each remaining-page contract failure without partial data", async () => {
    const failures: Array<(requestedPage: number) => Response> = [
      () => malformedResponse(),
      (requestedPage) => response(200, page(requestedPage + 1, 2, [], { total: 26 })),
      (requestedPage) =>
        response(200, page(requestedPage, 2, [], { limit: 24, total: 26 })),
      (requestedPage) =>
        response(200, page(requestedPage, 3, [], { total: 51, totalPages: 3 })),
      (requestedPage) =>
        response(200, page(requestedPage, 2, [wire({ status: 9 })], { total: 26 })),
    ];

    for (const failure of failures) {
      stubFetch((path) => {
        const requestedPage = Number(new URL(path, "http://test").searchParams.get("page"));
        return requestedPage === 1
          ? response(200, page(1, 2, [wire()], { total: 26 }))
          : failure(requestedPage);
      });
      await expect(resource.list()).rejects.toThrow();
      vi.unstubAllGlobals();
    }
  });
});
