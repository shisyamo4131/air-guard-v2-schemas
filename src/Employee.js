/**
 * @file src/Employee.js
 * @author shisyamo4131
 * @version 1.0.0
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { VALUES } from "./constants/employment-status.js";

const classProps = {
  code: defField("code", { label: "従業員コード" }),
  lastName: defField("lastName", { required: true }),
  firstName: defField("firstName", { required: true }),
  lastNameKana: defField("lastNameKana", { required: true }),
  firstNameKana: defField("firstNameKana", { required: true }),
  displayName: defField("displayName", { required: true }),
  gender: defField("gender", { required: true }),
  dateOfBirth: defField("dateOfBirth", { required: true }),
  zipcode: defField("zipcode", { required: true }),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  location: defField("location", { hidden: true }),
  mobile: defField("mobile", { required: true }),
  email: defField("email", { required: false }),
  dateOfHire: defField("dateOfHire", { required: true }),
  employmentStatus: defField("employmentStatus", { required: true }),
  title: defField("title"),
  dateOfTermination: defField("dateOfTermination", {
    default: null,
    component: {
      attrs: {
        required: (item) => item.employmentStatus === VALUES.TERMINATED.value,
        disabled: (item) => item.employmentStatus !== VALUES.TERMINATED.value,
      },
    },
  }),
  isForeigner: defField("isForeigner"),
  foreignName: defField("foreignName", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
        disabled: (item) => !item.isForeigner,
      },
    },
  }),
  nationality: defField("nationality", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
        disabled: (item) => !item.isForeigner,
      },
    },
  }),
  residenceStatus: defField("residenceStatus", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
        disabled: (item) => !item.isForeigner,
      },
    },
  }),
  periodOfStay: defField("periodOfStay", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
        disabled: (item) => !item.isForeigner,
      },
    },
  }),
  remarks: defField("remarks"),
};

/*****************************************************************************
 * @prop {string} code - Employee code.
 * @prop {string} lastName - Last name.
 * @prop {string} firstName - First name.
 * @prop {string} lastNameKana - Last name in Kana.
 * @prop {string} firstNameKana - First name in Kana.
 * @prop {string} displayName - Display name.
 * @prop {string} gender - Gender.
 * @prop {Date} dateOfBirth - Date of birth.
 * @prop {string} zipcode - Postal code.
 * @prop {string} prefCode - Prefecture code.
 * @prop {string} city - City name.
 * @prop {string} address - Address details.
 * @prop {string} building - Building name.
 * @prop {object} location - Geographical location.
 * @prop {string} mobile - Mobile phone number.
 * @prop {string} email - Email address.
 * @prop {Date} dateOfHire - Date of hire.
 * @prop {string} employmentStatus - Employment status.
 * @prop {string} title - Job title.
 * @prop {Date} dateOfTermination - Date of termination.
 * @prop {boolean} isForeigner - Is the employee a foreigner.
 * @prop {string} foreignName - Foreign name.
 * @prop {string} nationality - Nationality.
 * @prop {string} residenceStatus - Residence status.
 * @prop {Date} periodOfStay - Period of stay expiration date.
 * @prop {string} remarks - Additional remarks.
 *
 * @prop {string} fullName - Full name combining last and first names (read-only)
 * @prop {string} fullNameKana - Full name in Kana combining last and first names (read-only)
 * @prop {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 * @prop {string} prefecture - Prefecture name derived from `prefCode` (read-only)
 * @prop {number} age - Age calculated from `dateOfBirth` (read-only)
 * @prop {number} yearsOfService - Years of service calculated from `dateOfHire` (read-only)
 *
 * @static
 * @prop {string} STATUS_ACTIVE - constant for active employment status
 * @prop {string} STATUS_TERMINATED - constant for terminated employment status
 *****************************************************************************/
export default class Employee extends FireModel {
  static className = "従業員";
  static collectionPath = "Employees";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;
  static tokenFields = [
    "code",
    "lastName",
    "firstName",
    "lastNameKana",
    "firstNameKana",
    "foreignName",
    "displayName",
  ];

  static headers = [
    { title: "code", key: "code" },
    { title: "名前", key: "fullName" },
  ];

  static STATUS_ACTIVE = VALUES.ACTIVE.value;
  static STATUS_TERMINATED = VALUES.TERMINATED.value;

  afterInitialize(item = {}) {
    super.afterInitialize(item);
    Object.defineProperties(this, {
      fullName: defAccessor("fullName"),
      fullNameKana: defAccessor("fullNameKana"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
      age: {
        enumerable: true,
        configurable: true,
        get() {
          if (!this.dateOfBirth) return null;
          const today = new Date();
          let age = today.getUTCFullYear() - this.dateOfBirth.getUTCFullYear();
          const m = today.getUTCMonth() - this.dateOfBirth.getUTCMonth();
          const d = today.getUTCDate() - this.dateOfBirth.getUTCDate();
          if (m < 0 || (m === 0 && d < 0)) age--;
          return age;
        },
        set() {},
      },
      yearsOfService: {
        enumerable: true,
        configurable: true,
        get() {
          if (!this.dateOfHire) return null;
          const today = new Date();
          let years = today.getUTCFullYear() - this.dateOfHire.getUTCFullYear();
          const m = today.getUTCMonth() - this.dateOfHire.getUTCMonth();
          const d = today.getUTCDate() - this.dateOfHire.getUTCDate();
          if (m < 0 || (m === 0 && d < 0)) years--;
          return years;
        },
        set() {},
      },
    });
  }

  /**
   * 外国籍の場合の必須フィールドを検証します。
   * - エラーがある場合は例外をスローします。
   * - `isForeigner` が false の場合、以下のプロパティを初期化します。
   *  - `foreignName`
   *  - `nationality`
   *  - `residenceStatus`
   *  - `periodOfStay`
   * @returns {void}
   * @throws {Error} 外国籍の場合に必須フィールドが未入力の場合。
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
      if (!this.residenceStatus) {
        throw new Error(
          "[Employee.js] residenceStatus is required when isForeigner is true."
        );
      }
      if (!this.periodOfStay) {
        throw new Error(
          "[Employee.js] periodOfStay is required when isForeigner is true."
        );
      }
    } else {
      // 外国籍でない場合、関連フィールドを初期化
      this.foreignName = null;
      this.nationality = null;
      this.residenceStatus = null;
      this.periodOfStay = null;
    }
  }

  /**
   * 退職済である場合の必須フィールドを検証します。
   * - エラーがある場合は例外をスローします。
   * - `employmentStatus` が `active` の場合、`dateOfTermination` を初期化します。
   * @returns {void}
   * @throws {Error} 退職済の場合に必須フィールドが未入力の場合。
   */
  _validateTerminatedRequiredFields() {
    if (this.employmentStatus === VALUES.TERMINATED.value) {
      if (!this.dateOfTermination) {
        throw new Error(
          "[Employee.js] dateOfTermination is required when employmentStatus is 'terminated'."
        );
      }
    } else {
      this.dateOfTermination = null;
    }
  }

  /**
   * 新しい従業員ドキュメントが作成される前に実行されるフック。
   * - 親クラスの `beforeCreate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   */
  async beforeCreate() {
    await super.beforeCreate();
    this._validateForeignerRequiredFields();
    this._validateTerminatedRequiredFields();
  }

  /**
   * 従業員ドキュメントが更新される前に実行されるフック。
   * - 親クラスの `beforeUpdate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   */
  async beforeUpdate() {
    await super.beforeUpdate();
    this._validateForeignerRequiredFields();
    this._validateTerminatedRequiredFields();
  }
}
