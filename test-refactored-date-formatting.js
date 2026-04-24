/**
 * formatJstDate() 関数を使用するようにリファクタリングした箇所のテスト
 * - 修正前と同じ結果が得られることを確認します。
 */

import Billing from "./src/Billing.js";
import OperationResult from "./src/OperationResult.js";
import CutoffDate from "./src/utils/CutoffDate.js";

console.log("=== Refactored Date Formatting Test ===\n");

let passCount = 0;
let failCount = 0;

function test(description, actual, expected) {
  const passed = actual === expected;
  console.log(`${passed ? "✓" : "✗"} ${description}`);
  if (!passed) {
    console.log(`  期待値: ${expected}`);
    console.log(`  結果: ${actual}`);
  }
  if (passed) {
    passCount++;
  } else {
    failCount++;
  }
  console.log();
}

// テスト1: OperationResult - date プロパティ (WorkTimeBase から継承)
console.log("【テスト1: OperationResult - date プロパティ】");
const op1 = new OperationResult({
  siteId: "test-site",
  dateAt: new Date("2024-03-04T15:00:00Z"), // JST 2024-03-05
});
test("date プロパティ", op1.date, "2024-03-05");

// テスト2: Billing - billingDate, billingMonth, paymentDueDate, paymentDueMonth
console.log("【テスト2: Billing プロパティ】");
const billing = new Billing({
  customerId: "test-customer",
  siteId: "test-site",
  billingDateAt: new Date("2024-03-04T15:00:00Z"), // JST 2024-03-05
  paymentDueDateAt: new Date("2024-03-31T15:00:00Z"), // JST 2024-04-01
});
test("billingDate", billing.billingDate, "2024-03-05");
test("billingMonth", billing.billingMonth, "2024-03");
test("paymentDueDate", billing.paymentDueDate, "2024-04-01");
test("paymentDueMonth", billing.paymentDueMonth, "2024-04");

// テスト3: OperationResult - billingDate, billingMonth
console.log("【テスト3: OperationResult - billingDate, billingMonth】");
const op2 = new OperationResult({
  siteId: "test-site",
  dateAt: new Date("2024-03-04T15:00:00Z"),
  billingDateAt: new Date("2024-03-14T15:00:00Z"), // JST 2024-03-15
});
test("billingDate", op2.billingDate, "2024-03-15");
test("billingMonth", op2.billingMonth, "2024-03");

// テスト4: CutoffDate.calculateBillingDateAtString()
console.log("【テスト4: CutoffDate.calculateBillingDateAtString()】");
const salesDate1 = new Date("2024-03-04T15:00:00Z"); // JST 2024-03-05
test("10日締め", CutoffDate.calculateBillingDateAtString(salesDate1, 10), "2024-03-10");
test("15日締め", CutoffDate.calculateBillingDateAtString(salesDate1, 15), "2024-03-15");
test("月末締め", CutoffDate.calculateBillingDateAtString(salesDate1, 0), "2024-03-31");

const salesDate2 = new Date("2024-03-28T15:00:00Z"); // JST 2024-03-29
test("翌月10日締め", CutoffDate.calculateBillingDateAtString(salesDate2, 10), "2024-04-10");

// テスト5: エッジケース
console.log("【テスト5: エッジケース】");
const yearEnd = new OperationResult({
  siteId: "test-site",
  dateAt: new Date("2023-12-31T15:00:00Z"), // JST 2024-01-01
});
test("年末年始の境界", yearEnd.date, "2024-01-01");

const leapYear = new OperationResult({
  siteId: "test-site",
  dateAt: new Date("2024-02-28T15:00:00Z"), // JST 2024-02-29
});
test("閏年2月末", leapYear.date, "2024-02-29");

// 結果サマリー
console.log("=== Test Summary ===");
console.log(`✓ PASS: ${passCount}`);
console.log(`✗ FAIL: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);

if (failCount === 0) {
  console.log("\n🎉 All tests passed!");
} else {
  console.log(`\n⚠️ ${failCount} test(s) failed.`);
  process.exit(1);
}
