/**
 * fieldDefinitions.jsのリファクタリング検証用テストファイル
 * - 各型のフィールド定義が正しくインポート・マージされているか確認
 * - defField関数が正常に動作するか確認
 */

import {
  fieldDefinitions,
  defField,
  DEFAULT_WORKING_MINUTES,
  DEFAULT_BREAK_MINUTES,
} from "./src/parts/fieldDefinitions.js";

console.log("========================================");
console.log("フィールド定義のリファクタリング検証");
console.log("========================================\n");

// 定数のエクスポート確認
console.log("【定数のエクスポート確認】");
console.log(`DEFAULT_WORKING_MINUTES: ${DEFAULT_WORKING_MINUTES}`);
console.log(`DEFAULT_BREAK_MINUTES: ${DEFAULT_BREAK_MINUTES}\n`);

// 各型のフィールド定義が存在するか確認
const fieldsToTest = {
  array: "array",
  check: "check",
  code: "code",
  dateAt: "dateAt",
  dateTimeAt: "dateTimeAt",
  multipleLine: "multipleLine",
  number: "number",
  object: "object",
  oneLine: "oneLine",
  radio: "radio",
  select: "select",
  time: "time",
  // カスタムフィールド
  customerName: "oneLine型のカスタム",
  emergencyContactName: "oneLine型のカスタム",
  breakMinutes: "number型のカスタム",
  arrangementNotificationStatus: "select型のカスタム",
};

console.log("【フィールド定義の存在確認】");
let allFieldsExist = true;
Object.entries(fieldsToTest).forEach(([key, description]) => {
  const exists = fieldDefinitions.hasOwnProperty(key);
  console.log(
    `${exists ? "✓" : "✗"} ${key} (${description}): ${exists ? "存在" : "なし"}`,
  );
  if (!exists) allFieldsExist = false;
});
console.log(
  allFieldsExist
    ? "\n全てのフィールドが存在します。\n"
    : "\n一部のフィールドが存在しません。\n",
);

// 特定のフィールド定義の内容確認
console.log("【フィールド定義の内容確認】");
console.log("customerName:");
console.log(JSON.stringify(fieldDefinitions.customerName, null, 2));
console.log();

console.log("breakMinutes:");
console.log(JSON.stringify(fieldDefinitions.breakMinutes, null, 2));
console.log();

// defField関数のテスト
console.log("【defField関数のテスト】");

// ケース1: 既存のキーを使用
const field1 = defField("customerName");
console.log("✓ defField('customerName'):");
console.log(`  label: ${field1.label}`);
console.log(`  length: ${field1.length}`);
console.log();

// ケース2: オプションでカスタマイズ
const field2 = defField("oneLine", { label: "カスタムラベル", length: 50 });
console.log("✓ defField('oneLine', { label: 'カスタムラベル', length: 50 }):");
console.log(`  label: ${field2.label}`);
console.log(`  length: ${field2.length}`);
console.log();

// ケース3: 存在しないキーでフォールバック
const field3 = defField("unknownField", { label: "未知のフィールド" });
console.log("✓ defField('unknownField', { label: '未知のフィールド' }):");
console.log(`  label: ${field3.label}`);
console.log(`  type: ${field3.type.name}`);
console.log();

console.log("========================================");
console.log("検証完了");
console.log("========================================");
