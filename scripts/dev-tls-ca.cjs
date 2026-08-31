"use strict";

/* eslint-disable @typescript-eslint/no-require-imports -- preload must remain CommonJS for node --require. */

const { existsSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { getCACertificates, setDefaultCACertificates } = require("node:tls");
const { URL } = require("node:url");

const certificatePath = resolve(
  process.env.ADMIN_API_CA_CERTIFICATE ?? "certificates/pol-core-localhost.crt",
);

function isLocalHttpsOrigin(origin) {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    return url.protocol === "https:" && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

if (existsSync(certificatePath) && isLocalHttpsOrigin(process.env.ADMIN_API_ORIGIN)) {
  setDefaultCACertificates([
    ...getCACertificates("default"),
    readFileSync(certificatePath),
  ]);
}
