import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

// ยืนยันพฤติกรรม persistence ของ psp-contract-server ที่ browser pass ใช้เป็นตัวตัดสิน:
// AC-8 (simple-routing PUT ต้อง round-trip) และ AC-11 (seed approval ให้ Omise candidate test)
const PORT = 5177;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const C2P = "11111111-1111-4111-8111-111111111111";
const OMISE = "44444444-4444-4444-8444-444444444444";
const CSRF = "contract-csrf";
const serverPath = fileURLToPath(new URL("./psp-contract-server.mjs", import.meta.url));

let child;

function mutationHeaders(etag) {
  return {
    "content-type": "application/json",
    "x-csrf-token": CSRF,
    "idempotency-key": crypto.randomUUID(),
    "if-match": etag,
  };
}

async function waitForReady() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const res = await fetch(`${ORIGIN}/api/v1/admins/me`);
      if (res.ok) return;
    } catch {
      // server ยังไม่ขึ้น รอรอบถัดไป
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("contract server did not become ready");
}

before(async () => {
  child = spawn("node", [serverPath], {
    env: { ...process.env, PSP_CONTRACT_SCENARIO: "settings-happy", PSP_CONTRACT_PORT: String(PORT) },
    stdio: "ignore",
  });
  await waitForReady();
});

after(() => {
  child?.kill("SIGTERM");
});

test("AC-5: simple-routing PUT persists rules so the next GET returns them", async () => {
  const routingUrl = `${ORIGIN}/api/v1/payments/merchant-settings/${MERCHANT}/simple-routing`;

  const before = await fetch(routingUrl);
  const beforeBody = await before.json();
  const etag = before.headers.get("etag");
  assert.equal(before.status, 200);
  assert.ok(etag, "GET must return an ETag");
  assert.equal(beforeBody.advancedReadOnly, false, "D3 field advancedReadOnly");
  assert.equal(beforeBody.merchantId, MERCHANT, "D3 field merchantId");

  // ตั้ง promptpay ให้ชี้ primary=OMISE (เดิมเป็น null) เพื่อพิสูจน์ว่าค่าถูกบันทึกจริง
  const nextRules = beforeBody.rules.map((row) =>
    row.method === "promptpay" ? { ...row, primaryConnectionId: OMISE } : row,
  );
  const put = await fetch(routingUrl, {
    method: "PUT",
    headers: mutationHeaders(etag),
    body: JSON.stringify({ merchantId: MERCHANT, rules: nextRules }),
  });
  assert.equal(put.status, 200);

  const after = await fetch(routingUrl);
  const afterBody = await after.json();
  const promptpay = afterBody.rules.find((row) => row.method === "promptpay");
  assert.equal(promptpay.primaryConnectionId, OMISE, "saved primaryConnectionId must survive GET");
  // card เดิม (primary=C2P) ต้องยังอยู่หลังบันทึก
  const card = afterBody.rules.find((row) => row.method === "card");
  assert.equal(card.primaryConnectionId, C2P);
});

test("AC-3: simple-routing PUT without merchantId is rejected 400 validation_failed", async () => {
  const routingUrl = `${ORIGIN}/api/v1/payments/merchant-settings/${MERCHANT}/simple-routing`;
  const etag = (await fetch(routingUrl)).headers.get("etag");
  const put = await fetch(routingUrl, {
    method: "PUT",
    headers: mutationHeaders(etag),
    body: JSON.stringify({ rules: [] }),
  });
  assert.equal(put.status, 400);
  const body = await put.json();
  assert.equal(body.extensions.code, "validation_failed");
});

test("AC-5: activation without merchantId -> 404 no code (backend has no EnsureMerchant here)", async () => {
  const url = `${ORIGIN}/api/v1/payments/routing-rulesets/88888888-8888-4888-8888-888888888888/activation-requests`;
  const res = await fetch(url, { method: "POST", headers: mutationHeaders('"v3"'), body: JSON.stringify({}) });
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.deepEqual(body.extensions, {}, "404 must carry no code extension");
});

test("AC-5: candidate test with mismatched merchantId -> 404 no code", async () => {
  const url = `${ORIGIN}/api/v1/payments/psp-connections/${OMISE}/credential-change-requests/ffffffff-ffff-4fff-8fff-ffffffffffff/test`;
  const res = await fetch(url, {
    method: "POST",
    headers: mutationHeaders('"v3"'),
    body: JSON.stringify({ merchantId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }),
  });
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.deepEqual(body.extensions, {}, "404 must carry no code extension");
});

test("AC-11: approvals seed a pending psp.credential.change for the Omise connection", async () => {
  const res = await fetch(
    `${ORIGIN}/api/v1/approvals?action=psp.credential.change&status=pending&limit=100`,
  );
  const body = await res.json();
  assert.equal(res.status, 200);
  const match = body.items.find(
    (item) =>
      item.action === "psp.credential.change" &&
      item.status === "pending" &&
      item.targetId.toLowerCase() === OMISE &&
      item.merchantId === MERCHANT,
  );
  assert.ok(match, "expected a pending credential-change approval targeting the Omise connection");
});

test("AC-9: settings-no-draft serves version 0 and accepts If-Match \"v0\"", async () => {
  const noDraftPort = 5178;
  const noDraftOrigin = `http://127.0.0.1:${noDraftPort}`;
  const child2 = spawn("node", [serverPath], {
    env: { ...process.env, PSP_CONTRACT_SCENARIO: "settings-no-draft", PSP_CONTRACT_PORT: String(noDraftPort) },
    stdio: "ignore",
  });
  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        if ((await fetch(`${noDraftOrigin}/api/v1/admins/me`)).ok) break;
      } catch {
        // ยังไม่ขึ้น
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const routingUrl = `${noDraftOrigin}/api/v1/payments/merchant-settings/${MERCHANT}/simple-routing`;
    const read = await fetch(routingUrl);
    const body = await read.json();
    assert.equal(read.status, 200);
    assert.equal(body.rulesetId, null, "no draft -> rulesetId null");
    assert.equal(body.version, 0, "no draft -> version 0");
    assert.equal(read.headers.get("etag"), '"v0"', "no draft -> ETag v0");

    const put = await fetch(routingUrl, {
      method: "PUT",
      headers: mutationHeaders('"v0"'),
      body: JSON.stringify({ merchantId: MERCHANT, rules: [] }),
    });
    assert.equal(put.status, 200, "If-Match v0 must be accepted");
  } finally {
    child2.kill("SIGTERM");
  }
});
