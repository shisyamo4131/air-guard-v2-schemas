import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ReleaseGuardError, validateReleaseState } from "./scripts/check-release-package.mjs";
import { EXPECTED_TEST_FILES, validateTestInventory } from "./scripts/run-package-tests.mjs";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const lockJson = JSON.parse(readFileSync(new URL("./package-lock.json", import.meta.url), "utf8"));
const rootExports = Object.keys(await import("@shisyamo4131/air-guard-v2-schemas"));
const ccbExports = Object.keys(await import("@shisyamo4131/air-guard-v2-schemas/company-configuration"));
const preservedCcbExports = [
  "ATTENDANCE_SUMMARY_MODE_VALUES",
  "COMPANY_CONFIGURATION_ERROR_CODES",
  "COMPANY_CONFIGURATION_SCHEMA_VERSION",
  "COMPANY_CONFIGURATION_STATE",
  "COMPANY_SETTING_TYPE_VALUES",
  "COMPANY_STATUS_VALUES",
  "CompanyConfigurationValidationError",
  "ROUND_SETTING_VALUES",
  "SHIFT_TYPE_VALUES",
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
];
const packFiles = [
  "README.md", "index.js", "package.json", "src/Company.js", "src/constants/role-presets.js",
  "src/company-configuration/constants.js", "src/company-configuration/documents.js",
  "src/company-configuration/index.js",
  "src/company-configuration/validation.js",
];

function validState(overrides = {}) {
  return { tag: `v${packageJson.version}`, packageJson, lockJson, rootExports, ccbExports, testStatus: 0, importStatus: 0, packFiles, archiveCount: 0, ...overrides };
}

function assertGuardCode(code, overrides) {
  assert.throws(() => validateReleaseState(validState(overrides)), (error) => error instanceof ReleaseGuardError && error.code === code);
}

test("release guard accepts an exact release state", () => {
  assert.equal(validateReleaseState(validState()), true);
});

test("release guard rejects a tag mismatch", () => {
  assertGuardCode("TAG_MISMATCH", { tag: "v0.0.0-dev.0" });
});

test("release guard rejects a package-lock version mismatch", () => {
  assertGuardCode("VERSION_MISMATCH", { lockJson: { ...lockJson, version: "0.0.0" } });
});

test("release guard rejects a required export mismatch", () => {
  assert.deepEqual([...ccbExports].sort(), [...preservedCcbExports].sort());
  for (const preservedName of preservedCcbExports) {
    assertGuardCode("EXPORT_MISMATCH", {
      ccbExports: ccbExports.filter((name) => name !== preservedName),
    });
  }
});

test("release guard rejects removed company-configuration exports", () => {
  for (const removedName of [
    "mapLegacyCompanyToConfigurationV1",
    "parseCompanyEntitlementV1",
    "parseCompanyPrivateEntitlementV1",
  ]) {
    assertGuardCode("EXPORT_MISMATCH", { ccbExports: [...ccbExports, removedName] });
  }
});

test("release guard rejects removed exports reintroduced at the package root", () => {
  for (const removedName of [
    "mapLegacyCompanyToConfigurationV1",
    "parseCompanyEntitlementV1",
    "parseCompanyPrivateEntitlementV1",
  ]) {
    assertGuardCode("EXPORT_MISMATCH", { rootExports: [...rootExports, removedName] });
  }
});

test("release guard rejects a package-root export leak", () => {
  assertGuardCode("ROOT_EXPORT_LEAK", { rootExports: [...rootExports, "parseCompanyRootV1"] });
});

test("release guard rejects missing or forbidden package content", () => {
  for (const requiredFile of packFiles) {
    assertGuardCode("CONTENT_MISMATCH", {
      packFiles: packFiles.filter((name) => name !== requiredFile),
    });
  }
  assertGuardCode("CONTENT_MISMATCH", { packFiles: [...packFiles, "src/company-configuration/legacy.js"] });
  assertGuardCode("CONTENT_MISMATCH", { packFiles: [...packFiles, "test-company-configuration.js"] });
});

test("release guard rejects a package missing the public Company model", () => {
  assertGuardCode("CONTENT_MISMATCH", {
    packFiles: packFiles.filter((name) => name !== "src/Company.js"),
  });
});

test("release guard rejects a public import failure", () => {
  assertGuardCode("IMPORT_FAILURE", { importStatus: 1 });
});

test("release guard rejects a formal test failure", () => {
  assertGuardCode("TEST_FAILURE", { testStatus: 1 });
});

test("formal test inventory fails closed on additions and omissions", () => {
  assert.deepEqual(validateTestInventory(EXPECTED_TEST_FILES), [...EXPECTED_TEST_FILES].sort());
  assert.throws(() => validateTestInventory(EXPECTED_TEST_FILES.slice(1)), /inventory mismatch/u);
  assert.throws(() => validateTestInventory([...EXPECTED_TEST_FILES, "test-unreviewed.js"]), /inventory mismatch/u);
});

test("publish workflow requires Node 22 and 24 tests before Node 24 publish", () => {
  const workflow = readFileSync(new URL("./.github/workflows/publish.yml", import.meta.url), "utf8");
  assert.match(workflow, /tags:\s*\r?\n\s*- ["']v\*-dev\.\*["']/u);
  assert.doesNotMatch(workflow, /workflow_dispatch/u);
  assert.match(workflow, /matrix:\s*\r?\n\s*node-version: \["22", "24"\]/u);
  assert.match(workflow, /publish:\s*\r?\n\s*needs: test/u);
  assert.match(workflow, /node-version: "24"/u);
  assert.match(workflow, /npm run check:release/u);
  assert.equal(packageJson.scripts.prepublishOnly, "npm run check:release");
});
