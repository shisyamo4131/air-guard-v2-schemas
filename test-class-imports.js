/**
 * クラスファイルのインポートテスト
 * - リファクタリング後のfieldDefinitions.jsが各クラスで正しく機能するか確認
 */

console.log("========================================");
console.log("クラスファイルのインポート検証");
console.log("========================================\n");

const testImports = async () => {
  const tests = [
    { name: "Customer", path: "./src/Customer.js" },
    { name: "Employee", path: "./src/Employee.js" },
    { name: "Site", path: "./src/Site.js" },
    { name: "Operation", path: "./src/Operation.js" },
    { name: "OperationResult", path: "./src/OperationResult.js" },
  ];

  let allSuccess = true;

  for (const test of tests) {
    try {
      const module = await import(test.path);
      const hasDefault = module.default !== undefined;
      const status = hasDefault ? "✓" : "✗";
      console.log(
        `${status} ${test.name}: ${hasDefault ? "正常にインポート" : "デフォルトエクスポートなし"}`,
      );
      if (!hasDefault) allSuccess = false;
    } catch (error) {
      console.log(`✗ ${test.name}: エラー - ${error.message}`);
      allSuccess = false;
    }
  }

  console.log();
  console.log("========================================");
  if (allSuccess) {
    console.log("✓ 全てのクラスが正常にインポートされました");
  } else {
    console.log("✗ 一部のクラスでエラーが発生しました");
  }
  console.log("========================================");
};

testImports();
