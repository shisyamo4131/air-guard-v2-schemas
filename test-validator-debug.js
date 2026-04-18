/**
 * validator の返却値を確認するデバッグテスト
 */

import { fieldDefinitions } from "./src/parts/fieldDefinitions.js";
import { VALIDATION_ERRORS } from "./src/errorDefinitions.js";

console.log("=== Validator Debug Test ===\n");

console.log("【VALIDATION_ERRORS.MIN_VALUE_ERROR(0) の確認】");
const errorObj = VALIDATION_ERRORS.MIN_VALUE_ERROR(0);
console.log("返却値:", JSON.stringify(errorObj, null, 2));

console.log("\n【breakMinutes validator の確認】");
const breakMinutesValidator = fieldDefinitions.breakMinutes.validator;
console.log("validator 存在:", typeof breakMinutesValidator);

if (breakMinutesValidator) {
  console.log("\nvalidator(-5) の返却値:");
  const result = breakMinutesValidator(-5);
  console.log("type:", typeof result);
  console.log("value:", JSON.stringify(result, null, 2));

  console.log("\nvalidator(60) の返却値:");
  const result2 = breakMinutesValidator(60);
  console.log("type:", typeof result2);
  console.log("value:", result2);
}

console.log("\n=== Test Complete ===");
