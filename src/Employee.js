/**
 * @file src/Employee.js
 * @author shisyamo4131
 * @version 1.0.0
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { VALUES as EMPLOYMENT_STATUS_VALUES } from "./constants/employment-status.js";
import { VALUES as BLOOD_TYPE_VALUES } from "./constants/blood-type.js";
import Certification from "./Certification.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

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
  mobile: defField("mobile"),
  email: defField("email", { required: false }),
  dateOfHire: defField("dateOfHire", { required: true }),
  employmentStatus: defField("employmentStatus", { required: true }),
  title: defField("title"),

  /**
   * 退職年月日
   * - `employmentStatus` が `TERMINATED` の場合、必須フィールド。
   * - `employmentStatus` が `ACTIVE` の場合、入力不可（disabled）。
   * - バリデーションルール:
   * - `employmentStatus` が `TERMINATED` の場合、必須。
   * - `employmentStatus` が `TERMINATED` の場合、`dateOfHire` より前の日付は不可。
   * - `employmentStatus` が `ACTIVE` の場合、常に null でなければならない。
   * - フロントエンドのフォームでは、`employmentStatus` の値に応じて入力フィールドの表示/非表示や必須/任意を切り替えることが推奨される。
   */
  dateOfTermination: defField("dateOfTermination", {
    validator: (value, item) => {
      if (item.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value) {
        if (!value) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "INVALID_DATE_OF_TERMINATION",
            "dateOfTermination is required when employmentStatus is 'terminated'.",
            { ja: "在職区分が '退職' の場合、退職年月日は必須です。" },
          );
        }
        if (!(value instanceof Date)) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "INVALID_DATE_OF_TERMINATION",
            "dateOfTermination must be a Date object.",
            { ja: "退職年月日はDateオブジェクトである必要があります。" },
          );
        }
        if (value < item.dateOfHire) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "INVALID_DATE_OF_TERMINATION",
            "dateOfTermination cannot be earlier than dateOfHire.",
            { ja: "退職年月日は入社日より前に設定できません。" },
          );
        }
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) =>
          item.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value,
        disabled: ({ item }) =>
          item.employmentStatus !== EMPLOYMENT_STATUS_VALUES.TERMINATED.value,
      },
    },
  }),
  reasonOfTermination: defField("reasonOfTermination", {
    component: {
      attrs: {
        required: ({ item }) =>
          item.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value,
        disabled: ({ item }) =>
          item.employmentStatus !== EMPLOYMENT_STATUS_VALUES.TERMINATED.value,
      },
    },
  }),

  // Foreign related fields
  isForeigner: defField("isForeigner"),
  foreignName: defField("foreignName", {
    component: {
      attrs: {
        required: ({ item }) => item.isForeigner,
        disabled: ({ item }) => !item.isForeigner,
      },
    },
  }),
  nationality: defField("nationality", {
    component: {
      attrs: {
        required: ({ item }) => item.isForeigner,
        disabled: ({ item }) => !item.isForeigner,
      },
    },
  }),
  residenceStatus: defField("residenceStatus", {
    component: {
      attrs: {
        required: ({ item }) => item.isForeigner,
        disabled: ({ item }) => !item.isForeigner,
      },
    },
  }),
  hasPeriodOfStayLimit: defField("hasPeriodOfStayLimit"),
  periodOfStay: defField("periodOfStay", {
    component: {
      attrs: {
        required: ({ item }) => item.isForeigner && item.hasPeriodOfStayLimit,
        disabled: ({ item }) => !item.isForeigner || !item.hasPeriodOfStayLimit,
      },
    },
  }),

  // Security guard related fields
  hasSecurityGuardRegistration: defField("check", { label: "警備員登録" }),
  dateOfSecurityGuardRegistration: defField("dateOfSecurityGuardRegistration", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  bloodType: defField("bloodType", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactName: defField("emergencyContactName", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactRelation: defField("emergencyContactRelation", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactRelationDetail: defField("emergencyContactRelationDetail", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactAddress: defField("emergencyContactAddress", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  emergencyContactPhone: defField("emergencyContactPhone", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  domicile: defField("domicile", {
    component: {
      attrs: {
        required: ({ item }) => item.hasSecurityGuardRegistration,
        disabled: ({ item }) => !item.hasSecurityGuardRegistration,
      },
    },
  }),
  securityCertifications: defField("array", {
    label: "保有資格",
    customClass: Certification,
  }),
  remarks: defField("remarks"),
};

/*****************************************************************************
 * @property {string} code - Employee code.
 * @property {string} lastName - Last name.
 * @property {string} firstName - First name.
 * @property {string} lastNameKana - Last name in Kana.
 * @property {string} firstNameKana - First name in Kana.
 * @property {string} displayName - Display name.
 * @property {string} gender - Gender.
 * @property {Date} dateOfBirth - Date of birth.
 * @property {string} zipcode - Postal code.
 * @property {string} prefCode - Prefecture code.
 * @property {string} city - City name.
 * @property {string} address - Address details.
 * @property {string} building - Building name.
 * @property {object} location - Geographical location.
 * @property {string} mobile - Mobile phone number.
 * @property {string} email - Email address.
 * @property {Date} dateOfHire - Date of hire.
 * @property {string} employmentStatus - Employment status.
 * @property {string} title - Job title.
 * @property {Date} dateOfTermination - Date of termination.
 * @property {string} reasonOfTermination - Reason for termination.
 * @property {boolean} isForeigner - Is the employee a foreigner.
 * @property {string} foreignName - Foreign name.
 * @property {string} nationality - Nationality.
 * @property {string} residenceStatus - Residence status.
 * @property {boolean} hasPeriodOfStayLimit - 在留期間制限の有無
 * @property {Date} periodOfStay - 在留期間満了日
 * @property {boolean} hasSecurityGuardRegistration - Has security guard registration.
 * @property {Date} dateOfSecurityGuardRegistration - Date of security guard registration.
 * @property {string} bloodType - Blood type.
 * @property {string} emergencyContactName - Emergency contact name.
 * @property {string} emergencyContactRelation - Emergency contact relation.
 * @property {string} emergencyContactRelationDetail - Emergency contact relation detail.
 * @property {string} emergencyContactAddress - Emergency contact address.
 * @property {string} emergencyContactPhone - Emergency contact phone number.
 * @property {string} domicile - Domicile.
 * @property {Array<Certification>} securityCertifications - Array of security certifications.
 * @property {string} remarks - Additional remarks.
 *
 * @property {string} fullName - Full name combining last and first names (read-only)
 * @property {string} fullNameKana - Full name in Kana combining last and first names (read-only)
 * @property {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 * @property {string} prefecture - Prefecture name derived from `prefCode` (read-only)
 *
 * @getter
 * @property {number} age - Age calculated from `dateOfBirth` (read-only)
 * @property {number} yearsOfService - Years of service calculated from `dateOfHire` (read-only)
 *
 * @static
 * @property {string} STATUS_ACTIVE - constant for active employment status
 * @property {string} STATUS_TERMINATED - constant for terminated employment status
 *
 * @function toTerminated - Change the current employee instance to terminated status.
 *****************************************************************************/
export default class Employee extends GeocodableMixin(FireModel) {
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

  static STATUS_ACTIVE = EMPLOYMENT_STATUS_VALUES.ACTIVE.value;
  static STATUS_TERMINATED = EMPLOYMENT_STATUS_VALUES.TERMINATED.value;

  /** 2026-03-18 追加 */
  static EMPLOYMENT_STATUS = EMPLOYMENT_STATUS_VALUES;

  constructor(item = {}) {
    super(item);

    // Internal flag to skip terminated status check during toTerminated method
    Object.defineProperty(this, "_skipToTerminatedCheck", {
      writable: true,
      enumerable: false,
      configurable: true,
      value: false,
    });
  }

  afterInitialize(item = {}) {
    super.afterInitialize(item);

    // Define computed properties
    Object.defineProperties(this, {
      fullName: defAccessor("fullName"),
      fullNameKana: defAccessor("fullNameKana"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });

    // Define trigger fields
    let _lastName = this.lastName;
    let _firstName = this.firstName;
    Object.defineProperties(this, {
      lastName: {
        configurable: true,
        enumerable: true,
        get() {
          return _lastName;
        },
        set(v) {
          if (v !== _lastName) {
            _lastName = v;
            this.displayName = `${_lastName}${this.firstName || ""}`.trim();
          }
        },
      },
      firstName: {
        configurable: true,
        enumerable: true,
        get() {
          return _firstName;
        },
        set(v) {
          if (v !== _firstName) {
            _firstName = v;
            this.displayName = `${this.lastName || ""}${_firstName}`.trim();
          }
        },
      },
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
   * - 退職日が設定されている場合は、退職日までの勤続年数を計算します。
   * @returns {{years: number, months: number}|null} 勤続年数（年数と月数）。dateOfHireが設定されていない場合はnull。
   */
  get yearsOfService() {
    if (!this.dateOfHire) return null;
    const today = this.dateOfTermination || new Date();

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
          "[Employee.js] foreignName is required when isForeigner is true.",
        );
      }
      if (!this.nationality) {
        throw new Error(
          "[Employee.js] nationality is required when isForeigner is true.",
        );
      }
      if (!this.residenceStatus) {
        throw new Error(
          "[Employee.js] residenceStatus is required when isForeigner is true.",
        );
      }
      if (!this.periodOfStay) {
        throw new Error(
          "[Employee.js] periodOfStay is required when isForeigner is true.",
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

  // /**
  //  * 退職済である場合の必須フィールドを検証します。
  //  * - エラーがある場合は例外をスローします。
  //  * - `employmentStatus` が `terminated` の場合、以下のプロパティを必須とします。
  //  *  - `dateOfTermination`
  //  *  - `reasonOfTermination`
  //  * - `employmentStatus` が `active` の場合、`dateOfTermination`, `reasonOfTermination` を初期化します。
  //  * @returns {void}
  //  * @throws {Error} 退職済の場合に必須フィールドが未入力の場合。
  //  */
  // _validateTerminatedRequiredFields() {
  //   if (this.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value) {
  //     if (!this.dateOfTermination) {
  //       throw new Error(
  //         "[Employee.js] dateOfTermination is required when employmentStatus is 'terminated'.",
  //       );
  //     }
  //     if (!this.reasonOfTermination) {
  //       throw new Error(
  //         "[Employee.js] reasonOfTermination is required when employmentStatus is 'terminated'.",
  //       );
  //     }
  //   } else {
  //     this.dateOfTermination = null;
  //     this.reasonOfTermination = null;
  //   }
  // }

  /**
   * 退職状態に関連するフィールドを初期化します。
   * - `employmentStatus` が `TERMINATED` でない場合、以下のプロパティを初期化します。
   *  - `dateOfTermination`
   *  - `reasonOfTermination`
   * @returns {void}
   */
  _initTerminatedFields() {
    if (this.employmentStatus !== EMPLOYMENT_STATUS_VALUES.TERMINATED.value) {
      this.dateOfTermination = null;
      this.reasonOfTermination = null;
    }
  }

  _validateSecurityGuardFields() {
    if (this.hasSecurityGuardRegistration) {
      if (!this.dateOfSecurityGuardRegistration) {
        throw new Error(
          "[Employee.js] dateOfSecurityGuardRegistration is required when hasSecurityGuardRegistration is true.",
        );
      }
      if (!this.emergencyContactName) {
        throw new Error(
          "[Employee.js] emergencyContactName is required when hasSecurityGuardRegistration is true.",
        );
      }
      if (!this.emergencyContactRelationDetail) {
        throw new Error(
          "[Employee.js] emergencyContactRelationDetail is required when hasSecurityGuardRegistration is true.",
        );
      }
      if (!this.emergencyContactAddress) {
        throw new Error(
          "[Employee.js] emergencyContactAddress is required when hasSecurityGuardRegistration is true.",
        );
      }
      if (!this.emergencyContactPhone) {
        throw new Error(
          "[Employee.js] emergencyContactPhone is required when hasSecurityGuardRegistration is true.",
        );
      }
      if (!this.domicile) {
        throw new Error(
          "[Employee.js] domicile is required when hasSecurityGuardRegistration is true.",
        );
      }
    } else {
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
   * @param {Object} args - Creation options.
   * @param {string} [args.docId] - Document ID to use (optional).
   * @param {boolean} [args.useAutonumber=true] - Whether to use auto-numbering.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   */
  async beforeCreate(args = {}) {
    await super.beforeCreate(args);
    this._validateForeignerRequiredFields();
    // this._validateTerminatedRequiredFields();
    this._initTerminatedFields();
    this._validateSecurityGuardFields();
  }

  /**
   * 従業員ドキュメントが更新される前に実行されるフック。
   * - 親クラスの `beforeUpdate` を呼び出します。
   * - 従業員が外国人の場合、外国人名と国籍が未入力であればエラーをスローします。
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   */
  async beforeUpdate(args = {}) {
    await super.beforeUpdate(args);

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
        "[Employee.js] Direct changes to employmentStatus to 'terminated' are not allowed. Use toTerminated() method instead.",
      );
    }

    this._validateForeignerRequiredFields();
    // this._validateTerminatedRequiredFields();
    this._initTerminatedFields();
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
        "[Employee.js] docId is required to terminate an employee.",
      );
    }
    if (!dateOfTermination || !(dateOfTermination instanceof Date)) {
      throw new Error(
        "[Employee.js] A valid dateOfTermination is required to terminate an employee.",
      );
    }
    if (dateOfTermination < this.dateOfHire) {
      throw new Error(
        "[Employee.js] dateOfTermination cannot be earlier than dateOfHire.",
      );
    }

    if (!reasonOfTermination || typeof reasonOfTermination !== "string") {
      throw new Error(
        "[Employee.js] A valid reasonOfTermination is required to terminate an employee.",
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
