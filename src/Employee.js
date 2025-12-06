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
  reasonOfTermination: defField("reasonOfTermination", {
    component: {
      attrs: {
        required: (item) => item.employmentStatus === VALUES.TERMINATED.value,
        disabled: (item) => item.employmentStatus !== VALUES.TERMINATED.value,
      },
    },
  }),

  // Foreign related fields
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

  // Security guard related fields
  hasSecurityGuardRegistration: defField("check", { label: "警備員登録" }),
  priorSecurityExperienceYears: defField("number", {
    label: "入社前経験(年)",
    default: 0,
    required: true,
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
        suffix: "年",
      },
    },
  }),
  priorSecurityExperienceMonths: defField("number", {
    label: "入社前経験(月)",
    default: 0,
    required: true,
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
        suffix: "ヶ月",
        min: 0,
        max: 11,
      },
    },
  }),
  dateOfSecurityGuardRegistration: defField("dateAt", {
    label: "警備員登録日",
    default: null,
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  bloodType: defField("bloodType", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactName: defField("emergencyContactName", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactRelation: defField("emergencyContactRelation", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactRelationDetail: defField("emergencyContactRelationDetail", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactAddress: defField("emergencyContactAddress", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactPhone: defField("emergencyContactPhone", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  domicile: defField("domicile", {
    component: {
      attrs: {
        required: (item) => item.hasSecurityGuardRegistration,
        disabled: (item) => !item.hasSecurityGuardRegistration,
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
 * @prop {string} reasonOfTermination - Reason for termination.
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
 *
 * @getter
 * @prop {number} age - Age calculated from `dateOfBirth` (read-only)
 * @prop {number} yearsOfService - Years of service calculated from `dateOfHire` (read-only)
 *
 * @static
 * @prop {string} STATUS_ACTIVE - constant for active employment status
 * @prop {string} STATUS_TERMINATED - constant for terminated employment status
 *
 * @function toTerminated - Change the current employee instance to terminated status.
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

  _skipToTerminatedCheck = false;

  afterInitialize(item = {}) {
    super.afterInitialize(item);
    Object.defineProperties(this, {
      fullName: defAccessor("fullName"),
      fullNameKana: defAccessor("fullNameKana"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }

  /**
   * 生年月日から年齢を計算します。
   * @returns {{years: number, months: number}|null} 年齢（年数と月数）。dateOfBirthが設定されていない場合はnull。
   */
  get age() {
    if (!this.dateOfBirth) return null;
    const today = new Date();

    let years = today.getUTCFullYear() - this.dateOfBirth.getUTCFullYear();
    let months = today.getUTCMonth() - this.dateOfBirth.getUTCMonth();
    const days = today.getUTCDate() - this.dateOfBirth.getUTCDate();

    if (days < 0) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  }

  /**
   * 入社日からの勤続年数を計算します。
   * @returns {{years: number, months: number}|null} 勤続年数（年数と月数）。dateOfHireが設定されていない場合はnull。
   */
  get yearsOfService() {
    if (!this.dateOfHire) return null;
    const today = new Date();

    let years = today.getUTCFullYear() - this.dateOfHire.getUTCFullYear();
    let months = today.getUTCMonth() - this.dateOfHire.getUTCMonth();
    const days = today.getUTCDate() - this.dateOfHire.getUTCDate();

    if (days < 0) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
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
   * - `employmentStatus` が `terminated` の場合、以下のプロパティを必須とします。
   *  - `dateOfTermination`
   *  - `reasonOfTermination`
   * - `employmentStatus` が `active` の場合、`dateOfTermination`, `reasonOfTermination` を初期化します。
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
      if (!this.reasonOfTermination) {
        throw new Error(
          "[Employee.js] reasonOfTermination is required when employmentStatus is 'terminated'."
        );
      }
    } else {
      this.dateOfTermination = null;
      this.reasonOfTermination = null;
    }
  }

  _validateSecurityGuardFields() {
    if (this.hasSecurityGuardRegistration) {
      if (!this.dateOfSecurityGuardRegistration) {
        throw new Error(
          "[Employee.js] dateOfSecurityGuardRegistration is required when hasSecurityGuardRegistration is true."
        );
      }
      if (!this.emergencyContactName) {
        throw new Error(
          "[Employee.js] emergencyContactName is required when hasSecurityGuardRegistration is true."
        );
      }
      if (!this.emergencyContactRelationDetail) {
        throw new Error(
          "[Employee.js] emergencyContactRelationDetail is required when hasSecurityGuardRegistration is true."
        );
      }
      if (!this.emergencyContactAddress) {
        throw new Error(
          "[Employee.js] emergencyContactAddress is required when hasSecurityGuardRegistration is true."
        );
      }
      if (!this.emergencyContactPhone) {
        throw new Error(
          "[Employee.js] emergencyContactPhone is required when hasSecurityGuardRegistration is true."
        );
      }
      if (!this.domicile) {
        throw new Error(
          "[Employee.js] domicile is required when hasSecurityGuardRegistration is true."
        );
      }
    } else {
      this.priorSecurityExperienceYears = 0;
      this.priorSecurityExperienceMonths = 0;
      this.dateOfSecurityGuardRegistration = null;
      this.bloodType = BLOOD_TYPE_VALUES.A.value;
      this.emergencyContactName = null;
      this.emergencyContactRelation = null;
      this.emergencyContactRelationDetail = null;
      this.emergencyContactAddress = null;
      this.emergencyContactPhone = null;
      this.domicile = null;
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
    this._validateSecurityGuardFields();
  }

  /**
   * 従業員ドキュメントが更新される前に実行されるフック。
   * - 親クラスの `beforeUpdate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   */
  async beforeUpdate() {
    await super.beforeUpdate();

    // `employmentStatus` の `terminated` への直接変更の禁止
    // - 従業員を退職させる場合、様々なチェックが必要になることが想定されるため、専用メソッドとして `toTerminated` を使用する。
    // - `employmentStatus` を `terminated` に変更する場合は、必ず `toTerminated` メソッドを使用すること。
    // - 一度退職処理した従業員の復帰処理は現状想定していないが、将来的に必要になった場合は `toActive` メソッド等を追加実装すること。
    if (
      !this._skipToTerminatedCheck &&
      this.employmentStatus === Employee.STATUS_TERMINATED &&
      this._beforeData.employmentStatus === Employee.STATUS_ACTIVE
    ) {
      throw new Error(
        "[Employee.js] Direct changes to employmentStatus to 'terminated' are not allowed. Use toTerminated() method instead."
      );
    }

    this._validateForeignerRequiredFields();
    this._validateTerminatedRequiredFields();
    this._validateSecurityGuardFields();
  }

  /**
   * 現在インスタンスに読み込まれている従業員を退職状態に変更します。
   * @param {Date} dateOfTermination - 退職日（Dateオブジェクト）
   * @param {string} reasonOfTermination - 退職理由
   * @param {Object} options - パラメータオブジェクト
   * @param {Function|null} [options.transaction=null] - Firestore トランザクション関数
   * @param {Function|null} [options.callBack=null] - カスタム処理用コールバック
   * @param {string|null} [options.prefix=null] - パスのプレフィックス
   * @returns {Promise<DocumentReference>} 更新されたドキュメントの参照
   * @throws {Error} docIdが存在しない場合、または有効なdateOfTerminationが提供されていない場合。
   */
  async toTerminated(dateOfTermination, reasonOfTermination, options = {}) {
    if (!this.docId) {
      throw new Error(
        "[Employee.js] docId is required to terminate an employee."
      );
    }
    if (!dateOfTermination || !(dateOfTermination instanceof Date)) {
      throw new Error(
        "[Employee.js] A valid dateOfTermination is required to terminate an employee."
      );
    }
    if (dateOfTermination < this.dateOfHire) {
      throw new Error(
        "[Employee.js] dateOfTermination cannot be earlier than dateOfHire."
      );
    }

    if (!reasonOfTermination || typeof reasonOfTermination !== "string") {
      throw new Error(
        "[Employee.js] A valid reasonOfTermination is required to terminate an employee."
      );
    }

    this.employmentStatus = Employee.STATUS_TERMINATED;
    this.dateOfTermination = dateOfTermination;
    this.reasonOfTermination = reasonOfTermination;

    this._skipToTerminatedCheck = true;

    try {
      return await this.update(options);
    } catch (error) {
      this.rollback();
      throw error;
    } finally {
      this._skipToTerminatedCheck = false;
    }
  }
}
