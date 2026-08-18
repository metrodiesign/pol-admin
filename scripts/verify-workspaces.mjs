import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertAdminRouteIdentity,
  assertWorkspaceTopology,
  findActiveReferenceViolations,
  findBoundaryViolations,
  findTestPolicyViolations,
  readActiveReferenceFiles,
  readCodeFiles,
  readPageRoutes,
} from "./lib/workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const roots = {
  appSource: resolve(repositoryRoot, "src"),
  packages: resolve(repositoryRoot, "packages"),
  removedAdminWorkspace: resolve(repositoryRoot, "apps", "admin"),
  removedMerchantWorkspace: resolve(repositoryRoot, "apps", "merchant"),
};

function displayPath(file) {
  return relative(repositoryRoot, file) || ".";
}

function failOnFindings(label, findings, format) {
  if (findings.length === 0) return;
  throw new Error(`${label}:\n${findings.map((finding) => `- ${format(finding)}`).join("\n")}`);
}

try {
  for (const removedPath of [roots.removedAdminWorkspace, roots.removedMerchantWorkspace]) {
    if (existsSync(removedPath)) throw new Error(`Removed workspace path still exists: ${removedPath}`);
  }

  assertWorkspaceTopology(
    JSON.parse(readFileSync(resolve(repositoryRoot, "package.json"), "utf8")),
    JSON.parse(readFileSync(resolve(repositoryRoot, "package-lock.json"), "utf8")),
  );

  const adminRoutes = readPageRoutes(
    resolve(repositoryRoot, ".next/server/app-paths-manifest.json"),
  );
  assertAdminRouteIdentity(adminRoutes);

  const appFiles = readCodeFiles(roots.appSource);
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

  const activeReferenceFiles = readActiveReferenceFiles(repositoryRoot);
  const activeReferenceViolations = findActiveReferenceViolations(activeReferenceFiles);
  failOnFindings(
    "Active reference scan failed",
    activeReferenceViolations,
    ({ file, line, reference }) => `${displayPath(file)}:${line} contains ${reference}`,
  );

  console.log(`Workspace verification passed: root Admin ${adminRoutes.length} routes`);
  console.log(
    `Dependency/test-policy scan passed: ${appFiles.length + packageFiles.length} application/package code files`,
  );
  console.log(`Active reference scan passed: ${activeReferenceFiles.length} files`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
