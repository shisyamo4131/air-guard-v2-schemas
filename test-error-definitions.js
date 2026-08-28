import assert from "node:assert/strict";
import test from "node:test";

import { OperationResult } from "./index.js";

test("OperationResult exposes maintained structured validation errors", () => {
  const result = new OperationResult({
    overtimeWorkMinutes: -10,
    breakMinutes: -5,
    regulationWorkMinutes: -1,
  });

  assert.equal(result.isInvalid, true);
  assert.ok(Array.isArray(result.invalidReasons));

  for (const field of ["breakMinutes", "regulationWorkMinutes"]) {
    const reason = result.invalidReasons.find((candidate) => candidate.field === field);
    assert.deepEqual(
      { code: reason?.code, field: reason?.field },
      { code: "MIN_VALUE_ERROR", field },
    );
  }

  const serialized = JSON.stringify(result.invalidReasons);
  assert.equal(serialized.includes("-10"), false);
  assert.equal(serialized.includes("-5"), false);
  assert.equal(serialized.includes("-1"), false);

  assert.throws(
    () => result.validate(),
    (error) => {
      assert.equal(error.name, "ValidationError");
      assert.deepEqual(error.validationErrors, result.invalidReasons);
      return true;
    },
  );
});
