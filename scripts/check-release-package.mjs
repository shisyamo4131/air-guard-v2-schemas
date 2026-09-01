import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

import { runPackageTests } from "./run-package-tests.mjs";

const REQUIRED_CCB_EXPORTS = Object.freeze([
  "ATTENDANCE_SUMMARY_MODE_VALUES",
  "COMPANY_CONFIGURATION_ERROR_CODES",
  "COMPANY_CONFIGURATION_SCHEMA_VERSION",
  "COMPANY_CONFIGURATION_STATE",
  "COMPANY_SETTING_TYPE_VALUES",
  "COMPANY_STATUS_VALUES",
  "ROUND_SETTING_VALUES",
  "SHIFT_TYPE_VALUES",
  "CompanyConfigurationValidationError",
  "assertCompanyMaintenancePairV1",
  "isTimestampLike",
  "parseCompanyArrangementV1",
  "parseCompanyBillingV1",
  "parseCompanyMaintenanceV1",
  "parseCompanyOperationsV1",
  "parseCompanyPrivateMaintenanceV1",
  "parseCompanyProfileV1",
  "parseCompanyRootProjectionV1",
  "parseCompanyRootV1",
  "parseCompanySettingAuditV1",
  "parseUpdateCompanyArrangementInputV1",
  "parseUpdateCompanyBillingInputV1",
  "parseUpdateCompanyOperationsInputV1",
  "parseUpdateCompanyProfileInputV1",
]);

const FORBIDDEN_CCB_EXPORTS = Object.freeze([
  "mapLegacyCompanyToConfigurationV1",
  "parseCompanyEntitlementV1",
  "parseCompanyPrivateEntitlementV1",
]);

const REQUIRED_PACKAGE_FILES = Object.freeze([
  "README.md",
  "index.js",
  "package.json",
  "src/constants/role-presets.js",
  "src/company-configuration/constants.js",
  "src/company-configuration/documents.js",
  "src/company-configuration/index.js",
  "src/company-configuration/validation.js",
]);

const FORBIDDEN_PACKAGE_FILES = Object.freeze([
  "src/company-configuration/legacy.js",
]);

export class ReleaseGuardError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ReleaseGuardError";
    this.code = code;
  }
}

function guard(condition, code, message) {
  if (!condition) throw new ReleaseGuardError(code, message);
}

export function validateReleaseState({ tag, packageJson, lockJson, rootExports, ccbExports, testStatus, importStatus, packFiles, archiveCount }) {
  const expectedTag = `v${packageJson.version}`;
  guard(tag === expectedTag, "TAG_MISMATCH", `Expected release tag ${expectedTag}`);
  guard(lockJson.version === packageJson.version, "VERSION_MISMATCH", "Lockfile top-level version mismatch");
  guard(lockJson.packages?.[""]?.version === packageJson.version, "VERSION_MISMATCH", "Lockfile package version mismatch");
  guard(packageJson.exports?.["./company-configuration"] === "./src/company-configuration/index.js", "EXPORT_MISMATCH", "Missing company-configuration export");
  guard(!ccbExports.some((name) => rootExports.includes(name)), "ROOT_EXPORT_LEAK", "CCB export leaked from package root");
  guard(REQUIRED_CCB_EXPORTS.every((name) => ccbExports.includes(name)), "EXPORT_MISMATCH", "Required CCB public export missing");
  guard(!FORBIDDEN_CCB_EXPORTS.some((name) => ccbExports.includes(name)), "EXPORT_MISMATCH", "Forbidden legacy CCB public export present");
  guard(testStatus === 0, "TEST_FAILURE", "Formal package tests failed");
  guard(importStatus === 0, "IMPORT_FAILURE", "Public self-import failed");
  guard(REQUIRED_PACKAGE_FILES.every((name) => packFiles.includes(name)), "CONTENT_MISMATCH", "Required package content missing");
  guard(!FORBIDDEN_PACKAGE_FILES.some((name) => packFiles.includes(name)), "CONTENT_MISMATCH", "Forbidden legacy package content present");
  guard(!packFiles.some((name) => /(^|\/)(test[^/]*\.js|governance|docs|scripts|\.github)(\/|$)|\.tgz$/u.test(name)), "CONTENT_MISMATCH", "Forbidden package content present");
  guard(archiveCount === 0, "CONTENT_MISMATCH", "Package archive artifact exists in repository");
  return true;
}

export async function checkReleasePackage({ rootPath, tag } = {}) {
  const packageRoot = rootPath ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const packageJson = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  const lockJson = JSON.parse(readFileSync(path.join(packageRoot, "package-lock.json"), "utf8"));
  const releaseTag = tag ?? process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME ?? "";

  let testStatus = 0;
  try {
    runPackageTests({ rootPath: packageRoot });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    testStatus = 1;
  }
  guard(testStatus === 0, "TEST_FAILURE", "Formal package tests failed");

  let rootExports = [];
  let ccbExports = [];
  let importStatus = 0;
  try {
    rootExports = Object.keys(await import(`${pathToFileURL(path.join(packageRoot, "index.js")).href}?release=${Date.now()}`));
    ccbExports = Object.keys(await import("@shisyamo4131/air-guard-v2-schemas/company-configuration"));
    assert.equal(ccbExports.length > 0, true);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    importStatus = 1;
  }

  const npmCli = process.env.npm_execpath;
  guard(Boolean(npmCli), "PACK_FAILURE", "npm_execpath is required");
  const pack = spawnSync(process.execPath, [npmCli, "pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  guard(pack.status === 0, "PACK_FAILURE", pack.stderr || "npm pack dry-run failed");
  const packJson = JSON.parse(pack.stdout);
  guard(Array.isArray(packJson) && packJson.length === 1, "PACK_FAILURE", "Unexpected npm pack output");
  const packFiles = packJson[0].files.map(({ path: filePath }) => filePath.replaceAll("\\", "/"));
  const archiveCount = readdirSync(packageRoot).filter((name) => name.endsWith(".tgz")).length;

  validateReleaseState({ tag: releaseTag, packageJson, lockJson, rootExports, ccbExports, testStatus, importStatus, packFiles, archiveCount });

  console.log(JSON.stringify({
    tag: releaseTag,
    version: packageJson.version,
    tests: "passed",
    publicImport: "passed",
    package: {
      entryCount: packJson[0].entryCount,
      size: packJson[0].size,
      unpackedSize: packJson[0].unpackedSize,
      shasum: packJson[0].shasum,
      integrity: packJson[0].integrity,
    },
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkReleasePackage().catch((error) => {
    const prefix = error instanceof ReleaseGuardError ? `${error.code}: ` : "";
    console.error(`${prefix}${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
