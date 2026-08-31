import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";

const CODE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "build",
  "certificates",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);
const TEST_FILE_RE = /\.(?:test|spec)\.(?:[cm]?[jt]sx?)$/;
const TEST_POLICY_RE = /\b(?:describe|it|suite|test)\s*\.\s*(?:only|skip)\s*\(/g;
const EXPECTED_WORKSPACES = ["packages/ui", "packages/shared"];
const EXPECTED_LOCAL_PACKAGES = new Map([
  ["node_modules/@pol/shared", "packages/shared"],
  ["node_modules/@pol/ui", "packages/ui"],
]);
const REMOVED_APPLICATION_NAMES = ["admin", "merchant"];
const EXPECTED_ROUTE_COUNT = 114;
const EXPECTED_ROUTE_SHA256 = "e791698b5a04bfe26e5f8f31b4a435f541858f963070410e48c9716503124bf5";
const FIXTURE_START = "active-reference-fixture:start";
const FIXTURE_END = "active-reference-fixture:end";
const NEGATIVE_FIXTURE_SUFFIX = ["scripts", "lib", "workspace-verification.test.mjs"].join("/");
const ROOT_REFERENCE_FILES = [
  "package.json",
  "package-lock.json",
  ".dockerignore",
  ".gitignore",
  ".env.example",
  "components.json",
  "eslint.config.mjs",
  "next.config.ts",
  "opencode.json",
  "postcss.config.mjs",
  "tsconfig.base.json",
  "tsconfig.json",
  "vitest.config.ts",
  "AGENTS.md",
  "CLAUDE.md",
  "claude-code-spec-driven-workflow.md",
  "Dockerfile",
];
const ACTIVE_REFERENCE_TREES = [".github", "scripts", "docs", ".ai/shared", "src", "packages"];

function applicationPackageName(name) {
  return ["@pol", name].join("/");
}

function applicationWorkspacePath(name) {
  return ["apps", name].join("/");
}

function adminScriptAlias(command) {
  return [command, "admin"].join(":");
}

export function forbiddenActiveReferences() {
  return [
    ...REMOVED_APPLICATION_NAMES.flatMap((name) => [
      applicationPackageName(name),
      applicationWorkspacePath(name),
    ]),
    ...["dev", "build", "start", "test"].map(adminScriptAlias),
  ];
}

function sortStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function isWithin(root, target) {
  const pathFromRoot = relative(root, target);
  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== ".." && !isAbsolute(pathFromRoot))
  );
}

export async function assertPortAvailable(port, createProbe = createServer) {
  for (const host of ["127.0.0.1", "::1", "::"]) {
    const probe = createProbe();

    try {
      await new Promise((resolveListen, rejectListen) => {
        probe.once("error", rejectListen);
        probe.listen(port, host, resolveListen);
      });
    } catch (error) {
      if (
        host !== "127.0.0.1" &&
        ["EAFNOSUPPORT", "EADDRNOTAVAIL", "ENOTSUP"].includes(error?.code)
      ) {
        continue;
      }
      throw new Error(`Port ${port} is already in use; smoke test will not touch its process`, {
        cause: error,
      });
    } finally {
      if (probe.listening) await new Promise((resolveClose) => probe.close(resolveClose));
    }
  }
}

export function assertWorkspaceTopology(rootManifest, lockfile) {
  const actualWorkspaces = rootManifest?.workspaces;
  if (JSON.stringify(actualWorkspaces) !== JSON.stringify(EXPECTED_WORKSPACES)) {
    throw new Error(
      `Root workspaces must equal ${EXPECTED_WORKSPACES.join(", ")}; got ${JSON.stringify(actualWorkspaces)}`,
    );
  }

  const packages = lockfile?.packages;
  if (!packages || typeof packages !== "object" || Array.isArray(packages)) {
    throw new TypeError("Lockfile packages must be an object");
  }

  const lockedWorkspaces = packages[""]?.workspaces;
  if (JSON.stringify(lockedWorkspaces) !== JSON.stringify(EXPECTED_WORKSPACES)) {
    throw new Error(
      `Lockfile workspaces must equal ${EXPECTED_WORKSPACES.join(", ")}; got ${JSON.stringify(lockedWorkspaces)}`,
    );
  }

  const removedApplicationReferences = Object.entries(packages)
    .filter(([key, value]) =>
      REMOVED_APPLICATION_NAMES.some((name) => {
        const packageName = applicationPackageName(name);
        const workspacePath = applicationWorkspacePath(name);
        return (
          key === workspacePath ||
          key === `node_modules/${packageName}` ||
          value?.name === packageName ||
          value?.resolved === workspacePath
        );
      }),
    )
    .map(([key]) => key);
  if (removedApplicationReferences.length > 0) {
    throw new Error(
      `Lockfile still resolves removed application workspace: ${removedApplicationReferences.join(", ")}`,
    );
  }

  const actualLocalLinks = Object.entries(packages)
    .filter(([key, value]) => key.startsWith("node_modules/@pol/") && value?.link === true)
    .map(([key]) => key)
    .sort();
  const expectedLocalLinks = [...EXPECTED_LOCAL_PACKAGES.keys()].sort();
  if (JSON.stringify(actualLocalLinks) !== JSON.stringify(expectedLocalLinks)) {
    throw new Error(
      `Local workspace links must equal ${expectedLocalLinks.join(", ")}; got ${actualLocalLinks.join(", ")}`,
    );
  }

  for (const [linkKey, workspacePath] of EXPECTED_LOCAL_PACKAGES) {
    if (packages[linkKey]?.resolved !== workspacePath) {
      throw new Error(`${linkKey} must resolve to ${workspacePath}`);
    }
  }
}

export function normalizePageRoutes(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new TypeError("Route manifest must be a JSON object");
  }

  const routes = Object.keys(manifest)
    .filter((key) => key.endsWith("/page"))
    .map((key) => (key === "/page" ? "/" : key.slice(0, -"/page".length)))
    .filter((route) => !route.startsWith("/_"));

  return sortStrings(new Set(routes));
}

export function readPageRoutes(manifestPath) {
  const absolutePath = resolve(manifestPath);
  let manifest;

  try {
    manifest = JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read route manifest ${absolutePath}: ${error.message}`, {
      cause: error,
    });
  }

  return normalizePageRoutes(manifest);
}

export function pageRouteFingerprint(routes) {
  return createHash("sha256").update(JSON.stringify(routes), "utf8").digest("hex");
}

export function assertAdminRouteIdentity(adminRoutes) {
  assertRequiredAdminRoutes(adminRoutes);
  const fingerprint = pageRouteFingerprint(adminRoutes);
  if (adminRoutes.length !== EXPECTED_ROUTE_COUNT || fingerprint !== EXPECTED_ROUTE_SHA256) {
    throw new Error(
      `Admin route identity must equal ${EXPECTED_ROUTE_COUNT} routes / ${EXPECTED_ROUTE_SHA256}; got ${adminRoutes.length} / ${fingerprint}`,
    );
  }
}

export function assertRequiredAdminRoutes(adminRoutes) {
  const requiredAdminRoutes = [
    "/",
    "/admin/user/list",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ];
  const missing = [];

  for (const route of requiredAdminRoutes) {
    if (!adminRoutes.includes(route)) missing.push(`Admin ${route}`);
  }
  if (adminRoutes.includes("/register")) missing.push("Admin must not expose /register");

  if (missing.length > 0) {
    throw new Error(`Required routes failed:\n${missing.map((item) => `- ${item}`).join("\n")}`);
  }
}

export function extractModuleSpecifiers(source) {
  const patterns = [
    /\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const specifiers = new Set();

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }

  return sortStrings(specifiers);
}

function packageImportTargetsApp(specifier, appName) {
  return specifier === `@pol/${appName}` || specifier.startsWith(`@pol/${appName}/`);
}

function textImportTargetsApp(specifier, appName) {
  const normalized = specifier.replaceAll("\\", "/");
  const appPath = `apps/${appName}`;
  return (
    normalized === appPath ||
    normalized.startsWith(`${appPath}/`) ||
    normalized.includes(`/${appPath}/`)
  );
}

function resolvedImportTarget(file, specifier) {
  if (specifier.startsWith(".")) return resolve(dirname(file), specifier);
  if (isAbsolute(specifier)) return resolve(specifier);
  return null;
}

export function findBoundaryViolations(files, roots) {
  const appSourceRoot = resolve(roots.appSource);
  const removedAdminRoot = resolve(roots.removedAdminWorkspace);
  const removedMerchantRoot = resolve(roots.removedMerchantWorkspace);
  const packageRoot = resolve(roots.packages);
  const violations = [];

  for (const entry of files) {
    const file = resolve(entry.file);
    const owner = isWithin(appSourceRoot, file)
      ? "application"
      : isWithin(packageRoot, file)
        ? "package"
        : null;
    if (!owner) continue;

    for (const specifier of extractModuleSpecifiers(entry.content)) {
      const target = resolvedImportTarget(file, specifier);
      const targetsApplicationSource = target !== null && isWithin(appSourceRoot, target);
      const targetsRemovedAdmin =
        packageImportTargetsApp(specifier, "admin") ||
        textImportTargetsApp(specifier, "admin") ||
        (target !== null && isWithin(removedAdminRoot, target));
      const targetsRemovedMerchant =
        packageImportTargetsApp(specifier, "merchant") ||
        textImportTargetsApp(specifier, "merchant") ||
        (target !== null && isWithin(removedMerchantRoot, target));

      if (
        (owner === "application" && (targetsRemovedAdmin || targetsRemovedMerchant)) ||
        (owner === "package" &&
          (targetsApplicationSource || targetsRemovedAdmin || targetsRemovedMerchant))
      ) {
        violations.push({ file, specifier });
      }
    }
  }

  return violations.sort(
    (left, right) =>
      left.file.localeCompare(right.file) || left.specifier.localeCompare(right.specifier),
  );
}

export function findTestPolicyViolations(files) {
  const violations = [];

  for (const entry of files) {
    if (!TEST_FILE_RE.test(entry.file)) continue;
    for (const match of entry.content.matchAll(TEST_POLICY_RE)) {
      const line = entry.content.slice(0, match.index).split("\n").length;
      violations.push({ file: entry.file, line, token: match[0] });
    }
  }

  return violations.sort(
    (left, right) => left.file.localeCompare(right.file) || left.line - right.line,
  );
}

export function readCodeFiles(root) {
  const absoluteRoot = resolve(root);
  const files = [];

  function visit(directory) {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    for (const entry of entries) {
      const target = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) visit(target);
      } else if (entry.isFile() && CODE_EXTENSIONS.has(extname(entry.name))) {
        files.push({ file: target, content: readFileSync(target, "utf8") });
      }
    }
  }

  visit(absoluteRoot);
  return files;
}

function readTextTree(root) {
  const files = [];

  function visit(target) {
    const entries = readdirSync(target, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const entryPath = resolve(target, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) visit(entryPath);
      } else if (entry.isFile()) {
        const content = readFileSync(entryPath, "utf8");
        if (!content.includes("\0")) files.push({ file: entryPath, content });
      }
    }
  }

  visit(resolve(root));
  return files;
}

export function readActiveReferenceFiles(repositoryRoot) {
  const root = resolve(repositoryRoot);
  const files = [];
  const seen = new Set();

  function addFile(file) {
    const absoluteFile = resolve(file);
    if (seen.has(absoluteFile) || !existsSync(absoluteFile)) return;
    const content = readFileSync(absoluteFile, "utf8");
    if (content.includes("\0")) return;
    seen.add(absoluteFile);
    files.push({ file: absoluteFile, content });
  }

  for (const file of ROOT_REFERENCE_FILES) addFile(resolve(root, file));
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.startsWith("README")) addFile(resolve(root, entry.name));
  }
  for (const tree of ACTIVE_REFERENCE_TREES) {
    const treeRoot = resolve(root, tree);
    if (!existsSync(treeRoot)) continue;
    for (const entry of readTextTree(treeRoot)) addFile(entry.file);
  }

  return files.sort((left, right) => left.file.localeCompare(right.file));
}

function isVerifiedFixtureLine(file, lines, lineIndex) {
  if (!file.replaceAll("\\", "/").endsWith(NEGATIVE_FIXTURE_SUFFIX)) return false;
  let insideFixture = false;
  for (let index = 0; index <= lineIndex; index += 1) {
    if (lines[index].includes(FIXTURE_START)) insideFixture = true;
    if (lines[index].includes(FIXTURE_END)) insideFixture = false;
  }
  return insideFixture;
}

export function findActiveReferenceViolations(files) {
  const violations = [];
  const forbidden = forbiddenActiveReferences();

  for (const entry of files) {
    const lines = entry.content.split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      for (const reference of forbidden) {
        if (!lines[lineIndex].includes(reference)) continue;
        if (isVerifiedFixtureLine(entry.file, lines, lineIndex)) continue;
        violations.push({ file: entry.file, line: lineIndex + 1, reference });
      }
    }
  }

  return violations.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.reference.localeCompare(right.reference),
  );
}
