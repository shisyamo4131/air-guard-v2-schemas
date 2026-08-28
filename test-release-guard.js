import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ReleaseGuardError, validateReleaseState } from "./scripts/check-release-package.mjs";
import { EXPECTED_TEST_FILES, validateTestInventory } from "./scripts/run-package-tests.mjs";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const lockJson = JSON.parse(readFileSync(new URL("./package-lock.json", import.meta.url), "utf8"));
const rootExports = Object.keys(await import("@shisyamo4131/air-guard-v2-schemas"));
const ccbExports = Object.keys(await import("@shisyamo4131/air-guard-v2-schemas/company-configuration"));
const packFiles = [
  "README.md", "index.js", "package.json", "src/constants/role-presets.js",
  "src/company-configuration/constants.js", "src/company-configuration/documents.js",
  "src/company-configuration/index.js", "src/company-configuration/legacy.js",
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
  assertGuardCode("EXPORT_MISMATCH", { ccbExports: [] });
});

test("release guard rejects a package-root export leak", () => {
  assertGuardCode("ROOT_EXPORT_LEAK", { rootExports: [...rootExports, "parseCompanyRootV1"] });
});

test("release guard rejects missing or forbidden package content", () => {
  assertGuardCode("CONTENT_MISMATCH", { packFiles: packFiles.filter((name) => name !== "src/company-configuration/index.js") });
  assertGuardCode("CONTENT_MISMATCH", { packFiles: [...packFiles, "test-company-configuration.js"] });
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
