import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const EXPECTED_TEST_FILES = Object.freeze([
  "test-class-imports.js",
  "test-company-configuration.js",
  "test-employee-insurance.js",
  "test-error-definitions.js",
  "test-field-definitions.js",
  "test-format-jst-date.js",
  "test-refactored-date-formatting.js",
  "test-release-guard.js",
  "test-role-presets.js",
  "test-validator-debug.js",
]);

export function discoverPackageTests(rootPath) {
  return readdirSync(rootPath)
    .filter((name) => /^test.*\.js$/u.test(name))
    .sort();
}

export function validateTestInventory(actualFiles) {
  const actual = [...actualFiles].sort();
  const expected = [...EXPECTED_TEST_FILES].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Package test inventory mismatch. Expected ${expected.join(", ")}; found ${actual.join(", ")}`,
    );
  }
  return actual;
}

export function runPackageTests({ rootPath, spawn = spawnSync } = {}) {
  const packageRoot = rootPath ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const files = validateTestInventory(discoverPackageTests(packageRoot));

  for (const file of files) {
    console.log(`\n=== ${file} ===`);
    const result = spawn(process.execPath, [file], {
      cwd: packageRoot,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`${file} failed with exit status ${result.status}`);
    }
  }

  console.log(`\nAll ${files.length} maintained package test files passed.`);
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runPackageTests();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
