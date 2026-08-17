import { readFileSync, readdirSync } from "node:fs";
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

export async function assertPortAvailable(port) {
  const probe = createServer();

  try {
    await new Promise((resolveListen, rejectListen) => {
      probe.once("error", rejectListen);
      probe.listen(port, "127.0.0.1", resolveListen);
    });
  } catch (error) {
    throw new Error(`Port ${port} is already in use; smoke test will not touch its process`, {
      cause: error,
    });
  } finally {
    if (probe.listening) await new Promise((resolveClose) => probe.close(resolveClose));
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

export function compareRouteParity(adminRoutes, merchantRoutes) {
  const admin = new Set(adminRoutes);
  const merchant = new Set(merchantRoutes);
  const expectedMerchant = new Set([...admin, "/register"]);

  return {
    adminHasRegister: admin.has("/register"),
    missingFromMerchant: sortStrings(
      [...expectedMerchant].filter((route) => !merchant.has(route)),
    ),
    extraInMerchant: sortStrings(
      [...merchant].filter((route) => !expectedMerchant.has(route)),
    ),
  };
}

export function assertRouteParity(adminRoutes, merchantRoutes) {
  const result = compareRouteParity(adminRoutes, merchantRoutes);
  if (
    result.adminHasRegister ||
    result.missingFromMerchant.length > 0 ||
    result.extraInMerchant.length > 0
  ) {
    throw new Error(
      [
        "Route parity failed",
        `Admin contains /register: ${result.adminHasRegister}`,
        `Missing from Merchant: ${result.missingFromMerchant.join(", ") || "-"}`,
        `Extra in Merchant: ${result.extraInMerchant.join(", ") || "-"}`,
      ].join("\n"),
    );
  }
}

export function assertRequiredRoutes(adminRoutes, merchantRoutes) {
  const requiredCommonRoutes = [
    "/",
    "/admin/user/list",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ];
  const missing = [];

  for (const route of requiredCommonRoutes) {
    if (!adminRoutes.includes(route)) missing.push(`Admin ${route}`);
    if (!merchantRoutes.includes(route)) missing.push(`Merchant ${route}`);
  }
  if (adminRoutes.includes("/register")) missing.push("Admin must not expose /register");
  if (!merchantRoutes.includes("/register")) missing.push("Merchant /register");

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
  return normalized.includes(`apps/${appName}/src`);
}

function resolvedImportTarget(file, specifier) {
  if (specifier.startsWith(".")) return resolve(dirname(file), specifier);
  if (isAbsolute(specifier)) return resolve(specifier);
  return null;
}

export function findBoundaryViolations(files, roots) {
  const appRoots = {
    admin: resolve(roots.admin),
    merchant: resolve(roots.merchant),
  };
  const packageRoot = resolve(roots.packages);
  const violations = [];

  for (const entry of files) {
    const file = resolve(entry.file);
    const owner = isWithin(appRoots.admin, file)
      ? "admin"
      : isWithin(appRoots.merchant, file)
        ? "merchant"
        : isWithin(packageRoot, file)
          ? "package"
          : null;
    if (!owner) continue;

    for (const specifier of extractModuleSpecifiers(entry.content)) {
      const target = resolvedImportTarget(file, specifier);
      const targetsAdmin =
        packageImportTargetsApp(specifier, "admin") ||
        textImportTargetsApp(specifier, "admin") ||
        (target !== null && isWithin(appRoots.admin, target));
      const targetsMerchant =
        packageImportTargetsApp(specifier, "merchant") ||
        textImportTargetsApp(specifier, "merchant") ||
        (target !== null && isWithin(appRoots.merchant, target));

      if (
        (owner === "admin" && targetsMerchant) ||
        (owner === "merchant" && targetsAdmin) ||
        (owner === "package" && (targetsAdmin || targetsMerchant))
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
