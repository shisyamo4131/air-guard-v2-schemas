/**
 * Employeeクラスの保険プロパティテスト
 * - healthInsurance, pensionInsurance, employmentInsuranceの動作確認
 */

import Employee from "./src/Employee.js";
import Insurance from "./src/Insurance.js";

console.log("========================================");
console.log("Employeeクラス保険プロパティテスト");
console.log("========================================\n");

// テスト1: Employeeインスタンスの作成
console.log("【テスト1】Employeeインスタンスの作成");
const employee = new Employee({
  code: "TEST001",
  lastName: "山田",
  firstName: "太郎",
  lastNameKana: "ヤマダ",
  firstNameKana: "タロウ",
  displayName: "山田太",
  gender: "male",
  dateOfBirth: new Date("1990-01-01"),
  zipcode: "1000001",
  prefCode: "13",
  city: "千代田区",
  address: "千代田1-1-1",
  dateOfHire: new Date("2020-04-01"),
  employmentStatus: "active",
});

console.log(`✓ Employeeインスタンス作成成功`);
console.log(`  従業員コード: ${employee.code}`);
console.log(`  氏名: ${employee.fullName}\n`);

// テスト2: 保険プロパティの存在確認
console.log("【テスト2】保険プロパティの存在確認");
const insuranceProps = [
  "healthInsurance",
  "pensionInsurance",
  "employmentInsurance",
];

let allPropsExist = true;
insuranceProps.forEach((prop) => {
  const exists = employee.hasOwnProperty(prop);
  console.log(`${exists ? "✓" : "✗"} ${prop}: ${exists ? "存在" : "なし"}`);
  if (!exists) allPropsExist = false;
});
console.log(allPropsExist ? "\n全ての保険プロパティが存在します。\n" : "\n一部のプロパティが存在しません。\n");

// テスト3: デフォルト値の確認
console.log("【テスト3】デフォルト値の確認");
insuranceProps.forEach((prop) => {
  const insurance = employee[prop];
  const isInsuranceInstance = insurance instanceof Insurance;
  console.log(`✓ ${prop}:`);
  console.log(`  Insuranceインスタンス: ${isInsuranceInstance ? "はい" : "いいえ"}`);
  console.log(`  status: ${insurance.status}`);
  console.log(`  enrollmentDateAt: ${insurance.enrollmentDateAt}`);
  console.log(`  number: ${insurance.number}`);
});
console.log();

// テスト4: 保険情報の更新
console.log("【テスト4】保険情報の更新");
const enrollmentDate = new Date("2020-04-01");
enrollmentDate.setHours(0, 0, 0, 0);

// 健康保険の加入処理
const healthInsuranceCopy = employee.healthInsurance.clone();
healthInsuranceCopy.enrollmentDateAt = enrollmentDate;
healthInsuranceCopy.number = "12345678";
employee.healthInsurance.enroll(healthInsuranceCopy);

console.log(`✓ 健康保険加入処理:`);
console.log(`  status: ${employee.healthInsurance.status}`);
console.log(`  enrollmentDateAt: ${employee.healthInsurance.enrollmentDateAt}`);
console.log(`  number: ${employee.healthInsurance.number}`);
console.log(`  isProcessing: ${employee.healthInsurance.isProcessing}`);
console.log();

// 厚生年金保険の加入処理
const pensionInsuranceCopy = employee.pensionInsurance.clone();
pensionInsuranceCopy.enrollmentDateAt = enrollmentDate;
pensionInsuranceCopy.number = "87654321";
employee.pensionInsurance.enroll(pensionInsuranceCopy);

console.log(`✓ 厚生年金保険加入処理:`);
console.log(`  status: ${employee.pensionInsurance.status}`);
console.log(`  enrollmentDateAt: ${employee.pensionInsurance.enrollmentDateAt}`);
console.log(`  number: ${employee.pensionInsurance.number}`);
console.log(`  isProcessing: ${employee.pensionInsurance.isProcessing}`);
console.log();

// 雇用保険の加入処理
const employmentInsuranceCopy = employee.employmentInsurance.clone();
employmentInsuranceCopy.enrollmentDateAt = enrollmentDate;
employmentInsuranceCopy.number = "11111111";
employee.employmentInsurance.enroll(employmentInsuranceCopy);

console.log(`✓ 雇用保険加入処理:`);
console.log(`  status: ${employee.employmentInsurance.status}`);
console.log(`  enrollmentDateAt: ${employee.employmentInsurance.enrollmentDateAt}`);
console.log(`  number: ${employee.employmentInsurance.number}`);
console.log(`  isProcessing: ${employee.employmentInsurance.isProcessing}`);
console.log();

// テスト5: クローンテスト
console.log("【テスト5】クローンテスト");
const clonedEmployee = employee.clone();

console.log(`✓ クローン作成成功`);
console.log(`  元の従業員: ${employee.fullName}`);
console.log(`  クローン: ${clonedEmployee.fullName}`);
console.log();

insuranceProps.forEach((prop) => {
  const originalInsurance = employee[prop];
  const clonedInsurance = clonedEmployee[prop];
  const isSameInstance = originalInsurance === clonedInsurance;
  const hasSameValues =
    originalInsurance.status === clonedInsurance.status &&
    originalInsurance.number === clonedInsurance.number;

  console.log(`  ${prop}:`);
  console.log(`    同じインスタンス: ${isSameInstance ? "はい" : "いいえ"}`);
  console.log(`    同じ値: ${hasSameValues ? "はい" : "いいえ"}`);
  console.log(`    元のstatus: ${originalInsurance.status}`);
  console.log(`    クローンのstatus: ${clonedInsurance.status}`);
});
console.log();

// テスト6: JSON変換テスト
console.log("【テスト6】JSON変換テスト");
const jsonData = employee.toObject();

console.log(`✓ toObject()実行成功`);
insuranceProps.forEach((prop) => {
  const hasProperty = jsonData.hasOwnProperty(prop);
  console.log(`  ${prop}: ${hasProperty ? "含まれる" : "含まれない"}`);
  if (hasProperty) {
    console.log(`    status: ${jsonData[prop].status}`);
    console.log(`    number: ${jsonData[prop].number}`);
  }
});
console.log();

console.log("========================================");
console.log("テスト完了");
console.log("========================================");
