"use strict";

const { existsSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { getCACertificates, setDefaultCACertificates } = require("node:tls");

const certificatePath = resolve(
  process.env.ADMIN_API_CA_CERTIFICATE ?? "certificates/pol-core-localhost.crt",
);

if (existsSync(certificatePath)) {
  setDefaultCACertificates([
    ...getCACertificates("default"),
    readFileSync(certificatePath),
  ]);
}
