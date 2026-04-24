/*****************************************************************************
 * @file src/Employee.js
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { VALUES as EMPLOYMENT_STATUS_VALUES } from "./constants/employment-status.js";
import { VALUES as BLOOD_TYPE_VALUES } from "./constants/blood-type.js";
import { VALUES as EMERGENCY_CONTACT_RELATION_VALUES } from "./constants/emergency-contact-relation.js";
import Certification from "./Certification.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";
import Insurance from "./Insurance.js";

/*****************************************************************************
 * @class Employee
 * @extends GeocodableMixin(FireModel)
 *
 * @property {string} code - 従業員コード
 * @property {string} lastName - 姓
 * @property {string} firstName - 名
 * @property {string} lastNameKana - 姓（カナ）
 * @property {string} firstNameKana - 名（カナ）
 * @property {string} displayName - 表示名
 * @property {string} gender - 性別
 * @property {Date} dateOfBirth - 生年月日
 * @property {string} zipcode - 郵便番号
 * @property {string} prefCode - 都道府県コード
 * @property {string} city - 市区町村
 * @property {string} address - 住所
 * @property {string} building - 建物名
 * @property {object} location - 地理的な位置情報
 * @property {string} mobile - 携帯電話番号
 * @property {string} email - メールアドレス
 * @property {Date} dateOfHire - 入社日
 * @property {string} employmentStatus - 雇用状況
 * @property {string} title - 肩書
 * @property {Date} dateOfTermination - 退職日
 * @property {string} reasonOfTermination - 退職理由
 * @property {boolean} isForeigner - 外国人かどうか
 * @property {string} foreignName - 外国人氏名
 * @property {string} nationality - 国籍
 * @property {string} residenceStatus - 在留資格
 * @property {boolean} hasPeriodOfStayLimit - 在留期間制限の有無
 * @property {Date} periodOfStay - 在留期間満了日
 * @property {boolean} hasWorkRestrictions - 就労制限の有無
 * @property {boolean} hasSecurityGuardRegistration - 警備員資格登録の有無
 * @property {Date} dateOfSecurityGuardRegistration - 警備員資格登録日
 * @property {string} bloodType - 血液型
 * @property {string} emergencyContactName - 緊急連絡先氏名
 * @property {string} emergencyContactRelation - 緊急連絡先との関係
 * @property {string} emergencyContactRelationDetail - 緊急連絡先との関係詳細
 * @property {string} emergencyContactAddress - 緊急連絡先住所
 * @property {string} emergencyContactPhone - 緊急連絡先電話番号
 * @property {string} domicile - 本籍地
 * @property {Array<Certification>} securityCertifications - 警備員資格情報の配列
 * @property {Insurance} healthInsurance - 健康保険情報
 * @property {Insurance} pensionInsurance - 厚生年金保険情報
 * @property {Insurance} employmentInsurance - 雇用保険情報
 * @property {string} remarks - 備考
 *
 * @property {string} fullName - 姓と名を結合したフルネーム（読み取り専用）
 * @property {string} fullNameKana - 姓と名を結合したフルネーム（カナ、読み取り専用）
 * @property {string} fullAddress - 都道府県、市区町村、住所を結合したフルアドレス（読み取り専用）
 * @property {string} prefecture - `prefCode` から派生した都道府県名（読み取り専用）
 *
 * @getter
 * @property {number} age - `dateOfBirth` から計算された年齢（読み取り専用）
 * @property {number} yearsOfService - `dateOfHire` から計算された勤続年数（読み取り専用）
 *
 * @static
 * @property {Object} EMPLOYMENT_STATUS - 雇用状況の定数オブジェクト
 * @property {string} STATUS_ACTIVE - 在職中の雇用状況を表す定数
 * @property {string} STATUS_TERMINATED - 退職済みの雇用状況を表す定数
 *
 * @function toTerminated - 現在の従業員インスタンスを退職済みに変更する関数
 *****************************************************************************/
export default class Employee extends GeocodableMixin(FireModel) {
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
        if (
          item.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value
        ) {
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
      validator: (value, item) => {
        if (
          item.employmentStatus === EMPLOYMENT_STATUS_VALUES.TERMINATED.value
        ) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "INVALID_REASON_OF_TERMINATION",
              "reasonOfTermination is required when employmentStatus is 'terminated'.",
              { ja: "在職区分が '退職' の場合、退職理由は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "INVALID_REASON_OF_TERMINATION",
              "reasonOfTermination must be a string.",
              { ja: "退職理由は文字列である必要があります。" },
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

    // Foreign related fields
    isForeigner: defField("isForeigner"),
    foreignName: defField("foreignName", {
      validator: (value, item) => {
        if (item.isForeigner) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "FOREIGN_NAME_REQUIRED",
              "foreignName is required when isForeigner is true.",
              { ja: "外国籍の場合、外国名は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "FOREIGN_NAME_INVALID",
              "foreignName must be a string.",
              { ja: "外国名は文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.isForeigner,
          disabled: ({ item }) => !item.isForeigner,
        },
      },
    }),
    nationality: defField("nationality", {
      validator: (value, item) => {
        if (item.isForeigner) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "NATIONALITY_REQUIRED",
              "nationality is required when isForeigner is true.",
              { ja: "外国籍の場合、国籍は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "NATIONALITY_INVALID",
              "nationality must be a string.",
              { ja: "国籍は文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.isForeigner,
          disabled: ({ item }) => !item.isForeigner,
        },
      },
    }),
    residenceStatus: defField("residenceStatus", {
      validator: (value, item) => {
        if (item.isForeigner) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "RESIDENCE_STATUS_REQUIRED",
              "residenceStatus is required when isForeigner is true.",
              { ja: "外国籍の場合、在留資格は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "RESIDENCE_STATUS_INVALID",
              "residenceStatus must be a string.",
              { ja: "在留資格は文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.isForeigner,
          disabled: ({ item }) => !item.isForeigner,
        },
      },
    }),
    hasPeriodOfStayLimit: defField("hasPeriodOfStayLimit", {
      component: {
        attrs: {
          disabled: ({ item }) => !item.isForeigner,
        },
      },
    }),
    periodOfStay: defField("periodOfStay", {
      validator: (value, item) => {
        if (item.isForeigner && item.hasPeriodOfStayLimit) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "PERIOD_OF_STAY_REQUIRED",
              "periodOfStay is required when isForeigner is true and hasPeriodOfStayLimit is true.",
              {
                ja: "外国籍で在留期間制限がある場合、在留期間満了日は必須です。",
              },
            );
          }
          if (!(value instanceof Date)) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "PERIOD_OF_STAY_INVALID",
              "periodOfStay must be a Date.",
              { ja: "在留期間満了日は日付である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.isForeigner && item.hasPeriodOfStayLimit,
          disabled: ({ item }) =>
            !item.isForeigner || !item.hasPeriodOfStayLimit,
        },
      },
    }),
    hasWorkRestrictions: defField("hasWorkRestrictions", {
      component: {
        attrs: {
          disabled: ({ item }) => !item.isForeigner,
        },
      },
    }),
    // Security guard related fields
    hasSecurityGuardRegistration: defField("check", { label: "警備員登録" }),
    dateOfSecurityGuardRegistration: defField(
      "dateOfSecurityGuardRegistration",
      {
        validator: (value, item) => {
          if (item.hasSecurityGuardRegistration) {
            if (!value) {
              return VALIDATION_ERRORS.CUSTOM_ERROR(
                "SECURITY_GUARD_REGISTRATION_DATE_REQUIRED",
                "dateOfSecurityGuardRegistration is required when hasSecurityGuardRegistration is true.",
                { ja: "警備員登録がある場合、警備員登録日は必須です。" },
              );
            }
            if (!(value instanceof Date)) {
              return VALIDATION_ERRORS.CUSTOM_ERROR(
                "SECURITY_GUARD_REGISTRATION_DATE_INVALID",
                "dateOfSecurityGuardRegistration must be a Date.",
                { ja: "警備員登録日は日付である必要があります。" },
              );
            }
          }
          return true;
        },
        component: {
          attrs: {
            required: ({ item }) => item.hasSecurityGuardRegistration,
            disabled: ({ item }) => !item.hasSecurityGuardRegistration,
          },
        },
      },
    ),
    bloodType: defField("bloodType", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "BLOOD_TYPE_REQUIRED",
              "bloodType is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、血液型は必須です。" },
            );
          }
          if (
            !Object.values(BLOOD_TYPE_VALUES).some((v) => v.value === value)
          ) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "BLOOD_TYPE_INVALID",
              "bloodType must be a valid value.",
              { ja: "血液型は有効な値である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    emergencyContactName: defField("emergencyContactName", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_NAME_REQUIRED",
              "emergencyContactName is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、緊急連絡先の名前は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_NAME_INVALID",
              "emergencyContactName must be a valid string.",
              { ja: "緊急連絡先の名前は有効な文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    emergencyContactRelation: defField("emergencyContactRelation", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_RELATION_REQUIRED",
              "emergencyContactRelation is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、緊急連絡先の関係は必須です。" },
            );
          }
          if (
            !Object.values(EMERGENCY_CONTACT_RELATION_VALUES).some(
              (v) => v.value === value,
            )
          ) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_RELATION_INVALID",
              "emergencyContactRelation must be a valid value.",
              { ja: "緊急連絡先の関係は有効な値である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    emergencyContactRelationDetail: defField("emergencyContactRelationDetail", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_RELATION_DETAIL_REQUIRED",
              "emergencyContactRelationDetail is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、緊急連絡先の詳細は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_RELATION_DETAIL_INVALID",
              "emergencyContactRelationDetail must be a valid string.",
              { ja: "緊急連絡先の詳細は有効な文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    emergencyContactAddress: defField("emergencyContactAddress", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_ADDRESS_REQUIRED",
              "emergencyContactAddress is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、緊急連絡先の住所は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_ADDRESS_INVALID",
              "emergencyContactAddress must be a valid string.",
              { ja: "緊急連絡先の住所は有効な文字列である必要があります。" },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    emergencyContactPhone: defField("emergencyContactPhone", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_PHONE_REQUIRED",
              "emergencyContactPhone is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、緊急連絡先の電話番号は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "EMERGENCY_CONTACT_PHONE_INVALID",
              "emergencyContactPhone must be a valid string.",
              {
                ja: "緊急連絡先の電話番号は有効な文字列である必要があります。",
              },
            );
          }
        }
        return true;
      },
      component: {
        attrs: {
          required: ({ item }) => item.hasSecurityGuardRegistration,
          disabled: ({ item }) => !item.hasSecurityGuardRegistration,
        },
      },
    }),
    domicile: defField("domicile", {
      validator: (value, item) => {
        if (item.hasSecurityGuardRegistration) {
          if (!value) {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "DOMICILE_REQUIRED",
              "domicile is required when hasSecurityGuardRegistration is true.",
              { ja: "警備員登録がある場合、本籍地は必須です。" },
            );
          }
          if (typeof value !== "string") {
            return VALIDATION_ERRORS.CUSTOM_ERROR(
              "DOMICILE_INVALID",
              "domicile must be a valid string.",
              { ja: "本籍地は有効な文字列である必要があります。" },
            );
          }
        }
        return true;
      },
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

    // 加入保険
    healthInsurance: defField("healthInsurance", {
      default: () => new Insurance(),
      customClass: Insurance,
    }),
    pensionInsurance: defField("pensionInsurance", {
      default: () => new Insurance(),
      customClass: Insurance,
    }),
    employmentInsurance: defField("employmentInsurance", {
      default: () => new Insurance(),
      customClass: Insurance,
    }),
    remarks: defField("remarks"),
  };

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

  /**
   * 外国籍に関連するフィールドを初期化します。
   * - `isForeigner` が false の場合、以下のプロパティを初期化します。
   *  - `foreignName`
   * - `nationality`
   * - `residenceStatus`
   * - `hasPeriodOfStayLimit`
   * - `periodOfStay`
   * - `hasWorkRestrictions`
   * - `isForeigner` が true で `hasPeriodOfStayLimit` が false の場合、`periodOfStay` を初期化します。
   * @returns {void}
   */
  _initForeignerFields() {
    if (!this.isForeigner) {
      this.foreignName = null;
      this.nationality = null;
      this.residenceStatus = null;
      this.hasPeriodOfStayLimit = false;
      this.periodOfStay = null;
      this.hasWorkRestrictions = false;
    } else {
      if (!this.hasPeriodOfStayLimit) {
        this.periodOfStay = null;
      }
    }
  }

  /**
   * 警備員登録に関連するフィールドを初期化します。
   * - `hasSecurityGuardRegistration` が false の場合、以下のプロパティを初期化します。
   *  - `dateOfSecurityGuardRegistration`
   *  - `bloodType`
   *  - `emergencyContactName`
   *  - `emergencyContactRelation`
   *  - `emergencyContactRelationDetail`
   *  - `emergencyContactAddress`
   *  - `emergencyContactPhone`
   *  - `domicile`
   * @returns {void}
   */
  _initSecurityGuardFields() {
    if (!this.hasSecurityGuardRegistration) {
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
    // this._validateForeignerRequiredFields();
    this._initForeignerFields();
    this._initTerminatedFields();
    // this._validateSecurityGuardFields();
    this._initSecurityGuardFields();
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

    // this._validateForeignerRequiredFields();
    this._initForeignerFields();
    this._initTerminatedFields();
    // this._validateSecurityGuardFields();
    this._initSecurityGuardFields();
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
