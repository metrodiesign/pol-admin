import { describe, expect, it } from "vitest";

import { filterNavGroups, navConfig, type NavGroup } from "./nav-config";
import { minimalsNavConfig } from "./minimals-nav-config";

function paths(groups: readonly NavGroup[]): string[] {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => [item.path, ...(item.children?.map((child) => child.path) ?? [])]),
  );
}

describe("filterNavGroups", () => {
  it("ซ่อน PSP จาก nav configทั้งสองแหล่งเมื่อไม่มี settings.manage", () => {
    expect(paths(filterNavGroups(navConfig, []))).not.toContain("/control/psp/list");
    expect(paths(filterNavGroups(minimalsNavConfig, []))).not.toContain("/control/psp/list");
    expect(paths(filterNavGroups(navConfig, ["settings.manage"]))).toContain("/control/psp/list");
    expect(paths(filterNavGroups(minimalsNavConfig, ["settings.manage"]))).toContain(
      "/control/psp/list",
    );
  });

  it("filter descendantsและตัด parent/groupว่างโดยไม่แก้ input", () => {
    const input: NavGroup[] = [
      {
        subheader: "Protected",
        items: [
          {
            title: "Parent",
            path: "#",
            children: [
              { title: "Allowed", path: "/allowed", requiredPermission: "allowed" },
              { title: "Denied", path: "/denied", requiredPermission: "denied" },
            ],
          },
        ],
      },
      {
        subheader: "Empty",
        items: [{ title: "Denied", path: "/empty", requiredPermission: "denied" }],
      },
    ];
    const snapshot = structuredClone(input);

    expect(filterNavGroups(input, ["allowed"])).toEqual([
      {
        subheader: "Protected",
        items: [
          {
            title: "Parent",
            path: "#",
            children: [{ title: "Allowed", path: "/allowed", requiredPermission: "allowed" }],
          },
        ],
      },
    ]);
    expect(input).toEqual(snapshot);
  });
});
