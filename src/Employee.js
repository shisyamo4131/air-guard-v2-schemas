import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";

export default class Employee extends FireModel {
  static className = "従業員";
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

    /** 性別 */
    gender: defField("gender", { required: true }),

    /** 生年月日 */
    dateOfBirth: defField("date", { label: "生年月日", required: true }),

    /** 住所: zipcode が更新されると prefCode, city, address は自動更新される */
    zipcode: defField("zipcode", { required: true }),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location", { hidden: true }), // 非表示でOK

    /** 入社日 */
    dateOfHire: defField("date", { label: "入社日", required: true }),

    /** 雇用状態 */
    employmentStatus: defField("employmentStatus", { required: true }),

    /** 退職日 */
    dateOfTermination: defField("date", {
      label: "退職日",
      component: {
        attrs: {
          required: (item) => item.employmentStatus === "terminated",
        },
      },
    }),

    /** 外国籍情報 */
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
    periodOfStay: defField("date", {
      label: "在留期間満了日",
      component: {
        attrs: {
          required: (item) => item.isForeigner,
        },
      },
    }),
    remarks: defField("multipleLine", { label: "備考" }),
  };
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
    { title: "名前", key: "displayName" },
    { title: "状態", key: "employmentStatus" },
  ];

  afterInitialize() {
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
