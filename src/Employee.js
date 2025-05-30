import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { fullName } from "./parts/definitions/name.js";
import { prefecture, fullAddress } from "./parts/definitions/address.js";

export default class Employee extends FireModel {
  static collectionPath = "Employees";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "従業員コード" }),
    lastName: defField("lastName", { required: true }),
    firstName: defField("firstName", { required: true }),
    lastNameKana: defField("lastNameKana", { required: true }),
    firstNameKana: defField("firstNameKana", { required: true }),
    displayName: defField("displayName", { required: true }),
    zipcode: defField("zipcode", { required: true }),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    isForeigner: defField("isForeigner"),
    foreignName: defField("foreignName"),
    nationality: defField("nationality"),
  };
  static tokenFields = [
    "lastName",
    "firstName",
    "lastNameKana",
    "firstNameKana",
    "foreignName",
    "displayName",
  ];

  afterInitialize() {
    Object.defineProperties(this, {
      fullName: fullName(),
      fullAddress: fullAddress(),
      prefecture: prefecture(),
    });
  }

  /**
   * 外国籍の場合の必須フィールド（外国人名、国籍）を検証します。
   * エラーがある場合は例外をスローします。
   */
  _validateForeignerRequiredFields() {
    if (this.isForeigner) {
      if (!this.foreignName) {
        throw new Error(
          "[Employee.js] foreignName is required when isForeigner is true."
        );
      }
      if (!this.nationality) {
        throw new Error(
          "[Employee.js] nationality is required when isForeigner is true."
        );
      }
    }
  }

  /**
   * 新しい従業員ドキュメントが作成される前に実行されるフック。
   * - 親クラスの `beforeCreate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   */
  async beforeCreate() {
    // 親クラスの beforeCreate フックを実行
    await super.beforeCreate();
    this._validateForeignerRequiredFields();
  }

  /**
   * 従業員ドキュメントが更新される前に実行されるフック。
   * - 親クラスの `beforeUpdate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   */
  async beforeUpdate() {
    await super.beforeUpdate();
    this._validateForeignerRequiredFields();
  }
}
