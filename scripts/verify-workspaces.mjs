import { fileURLToPath } from "node:url";
import { relative, resolve } from "node:path";

import {
  assertRequiredRoutes,
  assertRouteParity,
  findBoundaryViolations,
  findTestPolicyViolations,
  readCodeFiles,
  readPageRoutes,
} from "./lib/workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const roots = {
  admin: resolve(repositoryRoot, "apps/admin"),
  merchant: resolve(repositoryRoot, "apps/merchant"),
  packages: resolve(repositoryRoot, "packages"),
};

function displayPath(file) {
  return relative(repositoryRoot, file) || ".";
}

function failOnFindings(label, findings, format) {
  if (findings.length === 0) return;
  throw new Error(`${label}:\n${findings.map((finding) => `- ${format(finding)}`).join("\n")}`);
}

try {
  const adminRoutes = readPageRoutes(
    resolve(roots.admin, ".next/server/app-paths-manifest.json"),
  );
  const merchantRoutes = readPageRoutes(
    resolve(roots.merchant, ".next/server/app-paths-manifest.json"),
  );
  assertRouteParity(adminRoutes, merchantRoutes);
  assertRequiredRoutes(adminRoutes, merchantRoutes);

  const appFiles = [...readCodeFiles(roots.admin), ...readCodeFiles(roots.merchant)];
  const packageFiles = readCodeFiles(roots.packages);
  const boundaryViolations = findBoundaryViolations([...appFiles, ...packageFiles], roots);
  failOnFindings(
    "Dependency boundary failed",
    boundaryViolations,
    ({ file, specifier }) => `${displayPath(file)} imports ${specifier}`,
  );

  const testFiles = [...appFiles, ...packageFiles, ...readCodeFiles(resolve(repositoryRoot, "scripts"))];
  const testPolicyViolations = findTestPolicyViolations(testFiles);
  failOnFindings(
    "Test policy failed",
    testPolicyViolations,
    ({ file, line, token }) => `${displayPath(file)}:${line} uses ${token}`,
  );

  console.log(
    `Workspace verification passed: Admin ${adminRoutes.length} routes, Merchant ${merchantRoutes.length} routes, allowed delta /register`,
  );
  console.log(
    `Dependency/test-policy scan passed: ${appFiles.length + packageFiles.length} workspace code files`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
