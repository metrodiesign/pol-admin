import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "vitest";

import { pspColumns } from "@/components/control/psp/table-columns";
import type { PspConnectionListRow } from "@/types/control/psp-connection";

const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CONNECTION = "11111111-1111-4111-8111-111111111111";

const row = {
  original: {
    pspConnectionId: CONNECTION,
    merchantId: MERCHANT,
    merchantName: "ร้านทดสอบ",
  } as PspConnectionListRow,
};

test("actions column links to merchant settings (AC-10 row action)", () => {
  const actions = pspColumns.find((column) => column.id === "actions");
  assert.ok(actions?.cell);
  const cell = (actions.cell as (ctx: { row: typeof row }) => ReactElement)({ row });
  const markup = renderToStaticMarkup(cell);
  assert.match(markup, new RegExp(`href="/control/psp/settings\\?merchantId=${MERCHANT}"`));
});
