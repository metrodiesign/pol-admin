import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

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
});
