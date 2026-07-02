/*****************************************************************************
 * @file ./src/Site.js
 * @note `customerId`, `customer` プロパティについて
 * - 仮登録
 *   - 取引先未定での現場登録のシチュエーションを考慮して現場情報は仮登録を可能とする。
 *   - 仮登録状態の現場は `isTemporary` プロパティが `true` となる。
 *   - 但し、一度取引先を設定した後に未設定に戻すことはできない。
 *   - 取引先未設定の場合に、`Site` インスタンスから取引先名を参照する必要があるケースに備えて
 *     `customerName` プロパティを設ける。
 * - 自身の従属先データを持たせる場合に `XxxxxMinimal` クラスを使用するが、アプリ側でオブジェクト選択を行う場合に
 *   `Xxxxx` クラスにするのか `XxxxxMinimal` クラスにするのかを判断できないため、docId を持たせて
 *   `beforeCreate` フックでオブジェクトを取得するようにする。
 *
 * @note `siteNumber` プロパティについて
 * - 現場番号は、受注した現場を取引先が識別するための任意の番号。アプリ内では特に意味を持たない。
 *
 * @note `hasAbbreviation`, `abbreviation`, `displayName` プロパティについて
 * - `hasAbbreviation` が true かつ `abbreviation` が有効な値である場合に `abbreviation` を、そうでない場合は `name` を返す。
 *
 * [更新履歴]
 * 2026-06-22 - `siteNumber` を追加。
 * 2026-06-25 - `hasAbbreviation`, `abbreviation`, `displayName` を追加。
 *****************************************************************************/
import { default as FireModel } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Customer from "./Customer.js";
import SiteOperationSchedule from "./SiteOperationSchedule.js";
import AgreementV2 from "./AgreementV2.js";
import { VALUES } from "./constants/site-status.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";
import { formatJstDate } from "./utils/index.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

const classProps = {
  customerId: defField("customerId", {
    component: {
      attrs: {
        /** `_beforeData.customerId` が存在する場合（本登録後の編集時を表す）には `customerId` を必須とする。 */
        required: ({ item }) => {
          return !!item._beforeData.customerId;
        },
      },
    },
  }),
  customer: defField("customer", { hidden: true, customClass: Customer }),

  /**
   * 取引先名
   * - `customerId` が未設定の場合に必須（仮登録状態で取引先の名前だけ登録したい場合を想定）
   */
  customerName: defField("customerName"),
  code: defField("code", { label: "現場コード" }),
  name: defField("siteName", { required: true }),
  hasAbbreviation: defField("check", {
    label: "略称を使用する",
    default: false,
  }),
  abbreviation: defField("abbreviation", {
    length: 40,
    component: {
      attrs: {
        required: ({ item }) => item.hasAbbreviation || false,
      },
    },
  }),
  nameKana: defField("siteNameKana", { required: true }),
  zipcode: defField("zipcode"),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  securityType: defField("securityType", { required: true }),
  siteNumber: defField("siteNumber"),
  constructionPeriodStartAt: defField("constructionPeriodStartAt", {
    validator: (value, item) => {
      if (!value || !item.constructionPeriodEndAt) return true;
      if (value > item.constructionPeriodEndAt) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "CONSTRUCTION_PERIOD_START_AT_MUST_BE_BEFORE_END_AT",
          "工期開始日は工期終了日以前の日付を指定してください。",
        );
      }
      return true;
    },
    component: {
      attrs: {
        clearable: true,
      },
    },
  }),
  constructionPeriodEndAt: defField("constructionPeriodEndAt", {
    validator: (value, item) => {
      if (!value || !item.constructionPeriodStartAt) return true;
      if (value < item.constructionPeriodStartAt) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "CONSTRUCTION_PERIOD_END_AT_MUST_BE_AFTER_START_AT",
          "工期終了日は工期開始日以降の日付を指定してください。",
        );
      }
      return true;
    },
    component: {
      attrs: {
        clearable: true,
      },
    },
  }),
  location: defField("location"),
  remarks: defField("remarks"),
  agreementsV2: defField("array", {
    label: "取極め",
    customClass: AgreementV2,
  }),
  status: defField("siteStatus", { required: true }),
};

/*****************************************************************************
 * @class Site
 * @author shisyamo4131
 *
 * [更新履歴]
 * 2026-07-02 - `hasConstructionPeriodStartAt`, `hasConstructionPeriodEndAt` を追加。
 *
 * @property {string} customerId - 取引先ドキュメントID
 * @property {object} customer - 取引先オブジェクト
 * @property {string} customerName - 取引先名
 * @property {string} code - 現場コード
 * @property {string} name - 現場名
 * @property {boolean} hasAbbreviation - 略称を使用するかどうかのフラグ
 * @property {string} abbreviation - 略称
 * @property {string} nameKana - 現場名カナ
 * @property {string} zipcode - 郵便番号
 * @property {string} prefCode - 都道府県コード
 * @property {string} prefecture - 都道府県名（`prefCode` から派生）（読み取り専用）
 * @property {string} city - 市区町村名
 * @property {string} address - 町域名・番地
 * @property {string} building - 建物名
 * @property {string} fullAddress - 住所（郵便番号、都道府県、市区町村、番地、建物名を結合したもの）（読み取り専用）
 * @property {object} location - Geographical location.
 * @property {string} securityType - 警備種別
 * @property {string} siteNumber - 現場番号
 * @property {string} constructionPeriodStartAt - 工期開始日
 * @property {string} constructionPeriodEndAt - 工期終了日
 * @property {boolean} hasConstructionPeriod - 工期が設定されているかどうかを表すフラグ（読み取り専用）
 * @property {boolean} hasConstructionPeriodStartAt - 工期開始日が設定されているかどうかを表すフラグ（読み取り専用）
 * @property {boolean} hasConstructionPeriodEndAt - 工期終了日が設定されているかどうかを表すフラグ（読み取り専用）
 * @property {string} remarks - 備考
 * @property {array} agreementsV2 - 取極めの配列（バージョン2）。`AgreementV2` クラスのインスタンスを要素とする。
 *
 * @property {string} status - 現場のステータス（例: "ACTIVE", "TERMINATED"）
 * @property {boolean} isTemporary - 仮登録状態かどうかを表すフラグ
 *
 * @function getAgreement
 * Gets applicable agreement based on date, dayType, and shiftType.
 * @param {Object} args - Arguments object.
 * @param {string} args.date - Date in YYYY-MM-DD format.
 * @param {string} args.dayType - Day type (e.g., "WEEKDAY", "SATURDAY").
 * @param {string} args.shiftType - Shift type (e.g., "DAY", "NIGHT").
 * @returns {Agreement|null} - Matching agreement or null if not found.
 *****************************************************************************/
export default class Site extends GeocodableMixin(FireModel) {
  static className = "現場";
  static collectionPath = "Sites";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;
  static tokenFields = ["name", "nameKana"];
  static hasMany = [
    {
      collectionPath: "SiteOperationSchedules",
      field: "siteId",
      condition: "==",
      type: "collection",
    },
    {
      collectionPath: "OperationResults",
      field: "siteId",
      condition: "==",
      type: "collection",
    },
    {
      collectionPath: "ArrangementNotifications",
      field: "siteId",
      condition: "==",
      type: "collection",
    },
  ];

  static headers = [
    { title: "code", key: "code", value: "code" },
    { title: "現場名", key: "name", value: "name" },
    { title: "取引先名", key: "customer.name", value: "customer.name" },
  ];

  static STATUS = VALUES;
  static STATUS_ACTIVE = VALUES.ACTIVE.value;
  static STATUS_TERMINATED = VALUES.TERMINATED.value;

  /**
   * `customerId` に該当する `Customer` インスタンスを取得して `customer` プロパティにセットします。
   * - `customerId` が未設定の場合は何もしません。
   * @returns {Promise<void>}
   * @throws {Error} `Customer` が存在しない場合にスローされます。
   */
  async _setCustomer() {
    if (!this.customerId) return;
    const customerInstance = new Customer();
    const isExist = await customerInstance.fetch({
      docId: this.customerId,
    });
    if (!isExist) {
      throw new Error("Customer does not exist.");
    }
    this.customer = customerInstance;
  }

  /**
   * ドキュメント作成直前の処理です。
   * - `customerId` に該当する `Customer` インスタンスを取得して `customer` プロパティにセットします。
   * - 取引先が未設定のまま現場を仮登録することを許容しますが、その場合は `customerName` プロパティに取引先名を入力する必要があります。
   * - `customerId` と `customerName` の両方が未設定の場合はエラーをスローします。
   * @param {Object} args - Creation options.
   * @param {string} [args.docId] - Document ID to use (optional).
   * @param {boolean} [args.useAutonumber=true] - Whether to use auto-numbering.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   * @throws {Error} `customerId` と `customerName` の両方が未設定の場合にスローされます。
   */
  async beforeCreate(args = {}) {
    await super.beforeCreate(args);

    /**
     * 取引先IDが指定されておらず、かつ取引先名が指定されていない場合はエラーをスロー
     */
    if (!this.customerId && !this.customerName) {
      throw new Error(
        "Either customerId or customerName must be provided for temporary registration.",
      );
    }

    await this._setCustomer();
  }

  /**
   * ドキュメント更新直前の処理です。
   * - `customerId` に該当する `Customer` インスタンスを取得して `customer` プロパティにセットします。
   * - 一度設定した取引先を未設定に戻すことはできません。
   * - 取引先が変更されていた場合は `customer` プロパティを更新します。
   * - `customerId` と `customerName` の両方が未設定の場合はエラーをスローします。
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeUpdate(args = {}) {
    await super.beforeUpdate(args);

    // 一度設定した取引先を未設定に戻すことはできない。
    if (this._beforeData.customerId && !this.customerId) {
      throw new Error("Cannot unset customerId once it is set.");
    }

    // 取引先が変更されていた場合は `customer` プロパティを更新する。
    if (this.customerId !== this._beforeData.customerId) {
      await this._setCustomer();
    }

    /**
     * 取引先IDが指定されておらず、かつ取引先名が指定されていない場合はエラーをスロー
     */
    if (!this.customerId && !this.customerName) {
      throw new Error(
        "Either customerId or customerName must be provided for temporary registration.",
      );
    }
  }

  /**
   * Override `afterInitialize` to define custom accessors and methods.
   * - Defines `fullAddress`, `prefecture`, and `isTemporary` accessors.
   * - Enhances `agreements` array with `add`, `change`, and `remove` methods.
   * @param {Object} item - Initial data item.
   * @return {void}
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** Define `fullAddress`, `prefecture`, and `isTemporary` accessors. */
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
      isTemporary: {
        configurable: true,
        enumerable: true,
        get() {
          return !this.customerId;
        },
        set() {},
      },

      /**
       * 工期が設定されているかどうかを表すアクセサー
       * - `constructionPeriodStartAt` または `constructionPeriodEndAt` のいずれかが設定されている場合に `true` を返します。
       */
      hasConstructionPeriod: {
        configurable: true,
        enumerable: true,
        get() {
          return (
            !!this.constructionPeriodStartAt || !!this.constructionPeriodEndAt
          );
        },
        set() {},
      },

      hasConstructionPeriodStartAt: {
        configurable: true,
        enumerable: true,
        get() {
          return !!this.constructionPeriodStartAt;
        },
        set() {},
      },

      hasConstructionPeriodEndAt: {
        configurable: true,
        enumerable: true,
        get() {
          return !!this.constructionPeriodEndAt;
        },
        set() {},
      },

      /*****************************************************************************
       * `displayName`
       * - `hasAbbreviation` が true かつ `abbreviation` が有効な値である場合に
       *   `abbreviation` を、そうでない場合は `name` を返します。
       *****************************************************************************/
      displayName: {
        configurable: true,
        enumerable: true,
        get() {
          return this.hasAbbreviation && this.abbreviation
            ? this.abbreviation
            : this.name;
        },
        set(v) {},
      },
    });

    /** 2026-03-31 Deprecated */
    // /**
    //  * `Agreement` プロパティに対するカスタムメソッドを定義します。
    //  * - add(agreement): `Agreement` インスタンスを追加します。
    //  * - change(newAgreement): `key` プロパティを基に既存の `Agreement` を置き換えます。
    //  * - remove(agreement): `key` プロパティを基に `Agreement` を削除します。
    //  */
    // const self = this;
    // Object.defineProperties(this.agreements, {
    //   add: {
    //     value: function (agreement) {
    //       if (!(agreement instanceof Agreement)) {
    //         throw new Error("Argument must be an instance of Agreement");
    //       }
    //       self.agreements.push(agreement);
    //     },
    //     writable: false,
    //     enumerable: false,
    //   },
    //   change: {
    //     value: function (newAgreement) {
    //       if (!(newAgreement instanceof Agreement)) {
    //         throw new Error("Argument must be an instance of Agreement");
    //       }
    //       const index = self.agreements.findIndex(
    //         (agr) => agr.key === newAgreement._beforeData.key,
    //       );
    //       if (index !== -1) {
    //         self.agreements[index] = newAgreement;
    //       } else {
    //         throw new Error("Agreement not found");
    //       }
    //     },
    //     writable: false,
    //     enumerable: false,
    //   },
    //   remove: {
    //     value: function (agreement) {
    //       const index = self.agreements.findIndex(
    //         (agr) => agr.key === agreement._beforeData.key,
    //       );
    //       if (index !== -1) {
    //         self.agreements.splice(index, 1);
    //       } else {
    //         throw new Error("Agreement not found");
    //       }
    //     },
    //   },
    // });
  }

  /**
   * 指定された日付、勤務区分で有効な取極めオブジェクトを返します。
   * - 日付が指定されなかった場合は、登録されている最新の取極めオブジェクトを返します。
   * - 条件に合致する取極めオブジェクトが存在しない場合は `null` を返します。
   * @param {string} date - 日付 (YYYY-MM-DD形式)
   * @param {string} shiftType - 勤務区分
   * @returns {Object|null} - 有効な取極めオブジェクトまたは `null`
   */
  getValidAgreement({ date = null, shiftType = null } = {}) {
    const filtered = this.agreementsV2.filter((agr) => {
      return agr.shiftType === shiftType;
    });
    if (filtered.length === 0) return null;
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    if (!date) return filtered[0];
    return filtered.find((agr) => agr.date <= date) || null;
  }

  /*****************************************************************************
   * METHODS
   *****************************************************************************/
  /**
   * [他クラスへの依存あり → ビジネスロジックとして外部化するべきか検討中]
   * 現場を稼働終了状態に更新します。
   * @returns {Promise<DocumentReference>} 更新されたドキュメントリファレンス
   * @throws {Error} ドキュメントが読み込まれていない場合、既に稼働終了している場合、または稼働予定が存在する場合にスローされます。
   */
  async terminate() {
    // 自身が `docId` を持っていない場合はエラーをスロー（インスタンスにドキュメントが読み込まれていない）
    if (!this.docId) {
      throw new Error(
        "ドキュメントが読み込まれていないため、現場を稼働終了できません。",
      );
    }

    // 既に稼働終了している場合はエラーをスロー
    if (this.status === Site.STATUS_TERMINATED) {
      throw new Error("既に稼働終了している現場です。");
    }

    // 現在日時の JST 日付文字列を取得
    const nowJst = formatJstDate(new Date(), "YYYY-MM-DD");

    // 現在日付以降の SiteOperationSchedule ドキュメントを取得
    const scheduleInstance = new SiteOperationSchedule();
    const futureScheduleDocs = await scheduleInstance.fetchDocs({
      constraints: [
        ["where", "siteId", "==", this.docId],
        ["where", "date", ">=", nowJst],
        ["limit", 1],
      ],
    });

    // SiteOperationSchedule ドキュメントが存在する場合はエラーをスロー
    if (futureScheduleDocs.length > 0) {
      throw new Error(
        "稼働予定が存在するため、現場を終了させることはできません。先に稼働予定を削除する必要があります。",
      );
    }

    // 状態を稼働終了に更新して保存
    this.status = Site.STATUS_TERMINATED;
    return await this.update();
  }

  /***************************************************************************
   * FOR DEPRECATED PROPERTIES
   ***************************************************************************/
  /**
   * @deprecated `agreements` property is deprecated. Use `agreementsV2` instead.
   */
  get agreements() {
    console.warn(
      "Warning: `agreements` is deprecated. Use `agreementsV2` instead.",
    );
    return [];
  }

  /**
   * @deprecated `agreements` property is deprecated. Use `agreementsV2` instead.
   */
  set agreements(newValue) {
    console.warn(
      "Warning: `agreements` is deprecated. Use `agreementsV2` instead.",
    );
  }

  /**
   * @deprecated `getAgreement` method is deprecated. Use `getValidAgreement` instead.
   * Returns the applicable agreement based on the given date, dayType, and shiftType.
   * Filters agreements by dayType and shiftType, sorts them by startDate in descending order,
   * and returns the first agreement where date is less than or equal to the given date.
   * If no such agreement exists, returns null.
   * @param {Object} args - The arguments object.
   * @param {String} args.date - The date (in YYYY-MM-DD format) to check against agreement start dates.
   * @param {String} args.dayType - The type of day (e.g., weekday, weekend) to filter agreements.
   * @param {String} args.shiftType - The type of shift (e.g., morning, evening) to filter agreements.
   * @returns {Object|null} - The matching agreement object or null if not found.
   */
  getAgreement(args = {}) {
    // const { date, dayType, shiftType } = args;
    // if (!date || !dayType || !shiftType) return null;
    // return (
    //   this.agreements
    //     .filter((agr) => agr.dayType === dayType && agr.shiftType === shiftType)
    //     .sort((a, b) => b.date.localeCompare(a.date))
    //     .find((agr) => agr.date <= date) || null
    // );
    console.warn(
      "Warning: `getAgreement` is deprecated. Use `getValidAgreement` instead.",
    );
    return null;
  }
}
