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
  title: defField("oneLine", { label: "肩書", required: true }),
  gender: defField("gender", { required: true }),
  dateOfBirth: defField("dateAt", { label: "生年月日", required: true }),
  zipcode: defField("zipcode", { required: true }),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  location: defField("location", { hidden: true }), // 非表示でOK
  dateOfHire: defField("dateAt", { label: "入社日", required: true }),
  employmentStatus: defField("employmentStatus", { required: true }),
  dateOfTermination: defField("dateAt", {
    label: "退職日",
    component: {
      attrs: {
        required: (item) => item.employmentStatus === "terminated",
      },
    },
  }),
  isForeigner: defField("isForeigner"),
  foreignName: defField("foreignName", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
      },
    },
  }),
  nationality: defField("nationality", {
    component: {
      attrs: {
        required: (item) => item.isForeigner,
      },
    },
  }),
  residenceStatus: {
    type: String,
    default: null,
    label: "在留資格",
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        required: (item) => item.isForeigner,
      },
    },
  },
  periodOfStay: defField("dateAt", {
    label: "在留期間満了日",
    component: {
      attrs: {
        required: (item) => item.isForeigner,
      },
    },
  }),
  remarks: defField("multipleLine", { label: "備考" }),
};

/*****************************************************************************
 * Employee Model
 * @props {string} code - Employee code.
 * @props {string} lastName - Last name.
 * @props {string} firstName - First name.
 * @props {string} lastNameKana - Last name in Kana.
 * @props {string} firstNameKana - First name in Kana.
 * @props {string} displayName - Display name.
 * @props {string} title - Job title.
 * @props {string} gender - Gender.
 * @props {Date} dateOfBirth - Date of birth.
 * @props {string} zipcode - Postal code.
 * @props {string} prefCode - Prefecture code.
 * @props {string} city - City name.
 * @props {string} address - Address details.
 * @props {string} building - Building name.
 * @props {object} location - Geographical location.
 * @props {Date} dateOfHire - Date of hire.
 * @props {string} employmentStatus - Employment status.
 * @props {Date} dateOfTermination - Date of termination.
 * @props {boolean} isForeigner - Is the employee a foreigner.
 * @props {string} foreignName - Foreign name.
 * @props {string} nationality - Nationality.
 * @props {string} residenceStatus - Residence status.
 * @props {Date} periodOfStay - Period of stay expiration date.
 * @props {string} remarks - Additional remarks.
 * @computed {string} fullName - Full name combining last and first names (read-only)
 * @computed {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 * @computed {string} prefecture - Prefecture name derived from `prefCode` (read-only)
 *****************************************************************************/
export default class Employee extends FireModel {
  static className = "従業員";
  static collectionPath = "Employees";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;
  static tokenFields = [
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
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }

  /**
   * 外国籍の場合の必須フィールドを検証します。
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
    }
  }

  /**
   * 退職済である場合の必須フィールドを検証します。
   * エラーがある場合は例外をスローします。
   */
  _validateTerminatedRequiredFields() {
    if (this.employmentStatus === "terminated") {
      if (!this.dateOfTermination) {
        throw new Error(
          "[Employee.js] dateOfTermination is required when employmentStatus is 'terminated'."
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
