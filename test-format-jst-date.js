/**
 * formatJstDate() 関数のテスト
 * - UTC形式で保存されたJST時刻を正しく文字列変換できるか確認します。
 */

import { formatJstDate } from "./src/utils/index.js";

console.log("=== formatJstDate() Function Test ===\n");

// テストケース1: YYYY-MM-DD形式（デフォルト）
console.log("【テスト1: YYYY-MM-DD形式（デフォルト）】");
const date1 = new Date("2024-03-04T15:00:00Z"); // JST 2024-03-05 00:00
const result1 = formatJstDate(date1);
console.log(`入力: ${date1.toISOString()}`);
console.log(`期待値: 2024-03-05`);
console.log(`結果: ${result1}`);
console.log(`✓ ${result1 === "2024-03-05" ? "PASS" : "FAIL"}\n`);

// テストケース2: YYYY-MM形式
console.log("【テスト2: YYYY-MM形式】");
const date2 = new Date("2024-03-04T15:00:00Z"); // JST 2024-03-05 00:00
const result2 = formatJstDate(date2, "YYYY-MM");
console.log(`入力: ${date2.toISOString()}`);
console.log(`期待値: 2024-03`);
console.log(`結果: ${result2}`);
console.log(`✓ ${result2 === "2024-03" ? "PASS" : "FAIL"}\n`);

// テストケース3: null/undefinedの場合
console.log("【テスト3: null/undefinedの場合】");
const result3a = formatJstDate(null);
const result3b = formatJstDate(undefined);
console.log(`入力: null`);
console.log(`期待値: null`);
console.log(`結果: ${result3a}`);
console.log(`✓ ${result3a === null ? "PASS" : "FAIL"}`);
console.log(`入力: undefined`);
console.log(`期待値: null`);
console.log(`結果: ${result3b}`);
console.log(`✓ ${result3b === null ? "PASS" : "FAIL"}\n`);

// テストケース4: 日中の時刻
console.log("【テスト4: 日中の時刻】");
const date4 = new Date("2024-12-15T06:30:00Z"); // JST 2024-12-15 15:30
const result4 = formatJstDate(date4);
console.log(`入力: ${date4.toISOString()}`);
console.log(`期待値: 2024-12-15`);
console.log(`結果: ${result4}`);
console.log(`✓ ${result4 === "2024-12-15" ? "PASS" : "FAIL"}\n`);

// テストケース5: 月末（閏年）
console.log("【テスト5: 月末（閏年）】");
const date5 = new Date("2024-02-28T15:00:00Z"); // JST 2024-02-29 00:00（閏年）
const result5 = formatJstDate(date5);
console.log(`入力: ${date5.toISOString()}`);
console.log(`期待値: 2024-02-29`);
console.log(`結果: ${result5}`);
console.log(`✓ ${result5 === "2024-02-29" ? "PASS" : "FAIL"}\n`);

// テストケース6: 年末年始の境界
console.log("【テスト6: 年末年始の境界】");
const date6 = new Date("2023-12-31T15:00:00Z"); // JST 2024-01-01 00:00
const result6 = formatJstDate(date6);
const result6m = formatJstDate(date6, "YYYY-MM");
console.log(`入力: ${date6.toISOString()}`);
console.log(`YYYY-MM-DD 期待値: 2024-01-01`);
console.log(`YYYY-MM-DD 結果: ${result6}`);
console.log(`✓ ${result6 === "2024-01-01" ? "PASS" : "FAIL"}`);
console.log(`YYYY-MM 期待値: 2024-01`);
console.log(`YYYY-MM 結果: ${result6m}`);
console.log(`✓ ${result6m === "2024-01" ? "PASS" : "FAIL"}\n`);

// テストケース7: 1桁の月・日のゼロパディング
console.log("【テスト7: 1桁の月・日のゼロパディング】");
const date7 = new Date("2024-01-04T15:00:00Z"); // JST 2024-01-05 00:00
const result7 = formatJstDate(date7);
console.log(`入力: ${date7.toISOString()}`);
console.log(`期待値: 2024-01-05`);
console.log(`結果: ${result7}`);
console.log(`✓ ${result7 === "2024-01-05" ? "PASS" : "FAIL"}\n`);

console.log("=== All Tests Completed ===");
