import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectTsxFiles(path) : path.endsWith(".tsx") ? [path] : [];
  });
}

const COMPONENTS = [join(process.cwd(), "src"), join(process.cwd(), "packages")];
const INLINE_TYPOGRAPHY_FILES = [
  "src/app/minimals/blank/page.tsx",
  "src/app/minimals/params/page.tsx",
  "src/app/minimals/subpaths/[...segments]/page.tsx",
  "src/app/minimals/permission/page.tsx",
  "src/components/dashboard/booking/booking-tours-available.tsx",
  "src/components/dashboard/booking/booking-total-incomes.tsx",
  "src/components/dashboard/booking/booking-stat-cards.tsx",
  "src/components/dashboard/ecommerce/ecommerce-summary.tsx",
];
const SCALE: Record<string, { size: string; lineHeight: string }> = {
  xs: { size: "0.9375rem", lineHeight: "1.5rem" },
  sm: { size: "1.0625rem", lineHeight: "1.625rem" },
  base: { size: "1.25rem", lineHeight: "1.875rem" },
  lg: { size: "1.4375rem", lineHeight: "2.125rem" },
  xl: { size: "1.6875rem", lineHeight: "2.375rem" },
  "2xl": { size: "1.9375rem", lineHeight: "2.625rem" },
  "3xl": { size: "2.3125rem", lineHeight: "3rem" },
  "4xl": { size: "2.8125rem", lineHeight: "3.5rem" },
  "5xl": { size: "3.375rem", lineHeight: "4rem" },
};

describe("global typography scale", () => {
  test("defines the 1.25rem base scale with Thai-friendly line heights", () => {
    for (const [token, values] of Object.entries(SCALE)) {
      assert.match(globalsCss, new RegExp(`--text-${token}:\\s*${values.size}\\s*;`));
      assert.match(
        globalsCss,
        new RegExp(`--text-${token}--line-height:\\s*${values.lineHeight}\\s*;`),
      );
    }
  });

  test("keeps semantic utilities on the shared scale", () => {
    for (const [utility, token] of [
      ["text-subtitle1", "base"],
      ["text-subtitle2", "sm"],
      ["text-body1", "base"],
      ["text-body2", "sm"],
      ["text-caption", "xs"],
      ["text-overline", "xs"],
    ]) {
      const utilityBody = globalsCss.match(
        new RegExp(`@utility ${utility} \\{([^}]*)\\}`),
      )?.[1];
      assert.ok(utilityBody, `missing ${utility} utility`);
      assert.match(utilityBody, new RegExp(`font-size: var\\(--text-${token}\\)`));
    }
  });

  test("uses the shared scale for date-range calendar text", () => {
    assert.match(
      globalsCss,
      /\.date-range-calendar \.rdp-root \{[\s\S]*?font-size: var\(--text-sm\);/,
    );
    assert.match(
      globalsCss,
      /\.date-range-calendar \.rdp-weekday \{\s*font-size: var\(--text-base\);/,
    );
    assert.match(
      globalsCss,
      /\.date-range-calendar \.rdp-day_button \{\s*font-size: var\(--text-base\);/,
    );
    assert.match(
      globalsCss,
      /\.date-range-calendar \.rdp-selected \{\s*font-weight: 600;\s*font-size: var\(--text-base\);/,
    );
  });

  test("shifts component utilities at text-xl and above by exactly one step", () => {
    const counts = Object.fromEntries(
      ["base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"].map((token) => [token, 0]),
    ) as Record<string, number>;
    const utilityPattern = /(?<![\w-])(?:[a-z0-9_-]+:)*text-(base|lg|xl|2xl|3xl|4xl|5xl)(?![\w-])/g;

    for (const directory of COMPONENTS) {
      for (const path of collectTsxFiles(directory)) {
        for (const match of readFileSync(path, "utf8").matchAll(utilityPattern)) {
          const token = match[1];
          assert.ok(token);
          counts[token] = (counts[token] ?? 0) + 1;
        }
      }
    }

    assert.deepEqual(counts, {
      base: 1358,
      lg: 73,
      xl: 63,
      "2xl": 14,
      "3xl": 25,
      "4xl": 15,
      "5xl": 0,
    });
  });

  test("keeps user-facing HTML typography on tokens instead of inline sizes", () => {
    for (const relativePath of INLINE_TYPOGRAPHY_FILES) {
      const source = readFileSync(join(process.cwd(), relativePath), "utf8");
      assert.doesNotMatch(source, /\bfontSize\s*:/, `${relativePath} has inline fontSize`);
      assert.doesNotMatch(source, /\blineHeight\s*:/, `${relativePath} has inline lineHeight`);
    }
  });
});
