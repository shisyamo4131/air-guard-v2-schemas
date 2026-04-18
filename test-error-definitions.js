/**
 * errorDefinitions.js とfieldDefinitions.js の統合テスト
 * - 多言語対応のバリデーションエラーが正しく動作するか確認します。
 */

import { OperationResult } from "./index.js";

console.log("=== errorDefinitions.js Integration Test ===\n");

// テストケース1: 負の値でバリデーションエラー
console.log("【テスト1: 負の値でエラー】");
const result1 = new OperationResult({
  overtimeWorkMinutes: -10, // 負の値
  breakMinutes: -5, // 負の値
  regulationWorkMinutes: -1, // 負の値
});

console.log("\ndetailedInvalidReasons:");
result1.detailedInvalidReasons.forEach((error, index) => {
  console.log(`\nエラー ${index + 1}:`);
  console.log(`  field: ${error.field}`);
  console.log(`  code: ${error.code}`);
  console.log(`  message: ${error.message}`);
  console.log(`  messages: ${JSON.stringify(error.messages)}`);
});

console.log("\n\ngetInvalidReasons (英語メッセージ):");
result1.getInvalidReasons().forEach((msg, index) => {
  console.log(`${index + 1}. ${msg}`);
});

// テストケース2: UI層での多言語表示
console.log("\n\n【テスト2: UI層での多言語表示】");
const locale = "ja"; // ユーザーの言語設定
console.log(`言語設定: ${locale}\n`);

result1.detailedInvalidReasons.forEach((error, index) => {
  const displayMessage = error.messages?.[locale] || error.message;
  console.log(`${index + 1}. [${error.field}] ${displayMessage}`);
});

// テストケース3: 英語ロケールでの表示
console.log("\n\n【テスト3: 英語ロケールでの表示】");
const localeEn = "en";
console.log(`言語設定: ${localeEn}\n`);

result1.detailedInvalidReasons.forEach((error, index) => {
  const displayMessage = error.messages?.[localeEn] || error.message;
  console.log(`${index + 1}. [${error.field}] ${displayMessage}`);
});

// テストケース4: 正常値
console.log("\n\n【テスト4: 正常値（エラーなし）】");
const result2 = new OperationResult({
  overtimeWorkMinutes: 60,
  breakMinutes: 60,
  regulationWorkMinutes: 480,
});

console.log(`エラー数: ${result2.detailedInvalidReasons.length}`);
console.log(`isInvalid: ${result2.isInvalid}`);

// テストケース5: validate() の動作確認
console.log("\n\n【テスト5: validate() のテスト】");
try {
  result1.validate();
} catch (error) {
  console.log("✅ ValidationError が正しくスローされました:");
  console.log(`  name: ${error.name}`);
  console.log(`  message:\n${error.message}`);
  console.log(`\n  validationErrors: ${error.validationErrors.length}件`);
  console.log("\n  詳細:");
  error.validationErrors.forEach((err, index) => {
    console.log(`    ${index + 1}. [${err.code}] ${err.message}`);
  });
}

console.log("\n=== Test Complete ===");
