/**
 * @file src/Site.js
 * @author shisyamo4131
 *
 * NOTE: `customerId`, `customer` プロパティについて
 * - 仮登録
 *   - 取引先未定での現場登録のシチュエーションを考慮して現場情報は仮登録を可能とする。
 *   - 仮登録状態の現場は `isTemporary` プロパティが `true` となる。
 *   - 但し、一度取引先を設定した後に未設定に戻すことはできない。
 *   - 取引先未設定の場合に、`Site` インスタンスから取引先名を参照する必要があるケースに備えて
 *     `customerName` プロパティを設ける。
 * - 自身の従属先データを持たせる場合に `XxxxxMinimal` クラスを使用するが、アプリ側でオブジェクト選択を行う場合に
 *   `Xxxxx` クラスにするのか `XxxxxMinimal` クラスにするのかを判断できないため、docId を持たせて
 *   `beforeCreate` フックでオブジェクトを取得するようにする。
 */
import { default as FireModel } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Customer from "./Customer.js";
import Agreement from "./Agreement.js";
import { VALUES } from "./constants/site-status.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";

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
  customerName: defField("customerName", {
    required: ({ item }) => !item.customerId,
  }),
  code: defField("code", { label: "現場コード" }),
  name: defField("name", {
    label: "現場名",
    length: 40,
    required: true,
  }),
  nameKana: defField("nameKana", {
    label: "現場名（カナ）",
    length: 60,
    required: true,
  }),
  zipcode: defField("zipcode"),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  location: defField("location"),
  remarks: defField("multipleLine", { label: "備考" }),
  agreements: defField("array", { label: "取極め", customClass: Agreement }),
  status: defField("siteStatus", { required: true }),
};

/*****************************************************************************
 * @property {string} customerId - 取引先ドキュメントID
 *
 * @property {object} customer - 取引先オブジェクト
 * - `beforeCreate`, `beforeUpdate` で `customerId` に該当する `Customer` オブジェクトと自動的に同期されます。
 * - `Customer` が更新された場合は Cloud Functions で同期される必要があります。
 *
 * @property {string} customerName - 取引先名
 * - `customerId` が未設定の場合に必須（仮登録状態で取引先の名前だけ登録したい場合を想定）
 *
 * @property {string} code - 現場コード
 *
 * @property {string} name - 現場名
 *
 * @property {string} nameKana - 現場名カナ
 *
 * @property {string} zipcode - Postal code.
 * @property {string} prefCode - Prefecture code.
 *
 * @property {string} prefecture - Prefecture name derived from `prefCode` (read-only)
 *
 * @property {string} city - City name.
 * @property {string} address - Address details.
 * @property {string} building - Building name.
 *
 * @property {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 *
 * @property {object} location - Geographical location.
 * @property {string} remarks - Additional remarks.
 * @property {array} agreements - List of agreements (Agreement).
 * - Enhanced with custom methods: `add()`, `change()`, `remove()`
 *
 * @property {string} status - Site status.
 *
 * @property {boolean} isTemporary - 仮登録状態かどうかを表すフラグ
 *
 * @function getAgreement
 * Gets applicable agreement based on date, dayType, and shiftType.
 * @param {Object} args - Arguments object.
 * @param {string} args.date - Date in YYYY-MM-DD format.
 * @param {string} args.dayType - Day type (e.g., "WEEKDAY", "SATURDAY").
 * @param {string} args.shiftType - Shift type (e.g., "DAY", "NIGHT").
 * @returns {Agreement|null} - Matching agreement or null if not found.
 *
 * @memberof agreements
 * @function add
 * Adds Agreement instance to agreements array.
 * @param {Agreement} agreement - Agreement instance to add.
 * @throws {Error} If argument is not an Agreement instance.
 *
 * @memberof agreements
 * @function change
 * Replaces existing agreement by key matching.
 * @param {Agreement} newAgreement - New Agreement instance to replace existing one.
 * @throws {Error} If argument is not an Agreement instance or if agreement not found.
 *
 * @memberof agreements
 * @function remove
 * Removes agreement from array by key matching.
 * @param {Agreement} agreement - Agreement instance to remove.
 * @throws {Error} If agreement not found.
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
   * @param {Object} args - Creation options.
   * @param {string} [args.docId] - Document ID to use (optional).
   * @param {boolean} [args.useAutonumber=true] - Whether to use auto-numbering.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeCreate(args = {}) {
    await super.beforeCreate(args);
    await this._setCustomer();
  }

  /**
   * Override beforeUpdate to prevent changing customer reference.
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
    });

    /**
     * `Agreement` プロパティに対するカスタムメソッドを定義します。
     * - add(agreement): `Agreement` インスタンスを追加します。
     * - change(newAgreement): `key` プロパティを基に既存の `Agreement` を置き換えます。
     * - remove(agreement): `key` プロパティを基に `Agreement` を削除します。
     */
    const self = this;
    Object.defineProperties(this.agreements, {
      add: {
        value: function (agreement) {
          if (!(agreement instanceof Agreement)) {
            throw new Error("Argument must be an instance of Agreement");
          }
          self.agreements.push(agreement);
        },
        writable: false,
        enumerable: false,
      },
      change: {
        value: function (newAgreement) {
          if (!(newAgreement instanceof Agreement)) {
            throw new Error("Argument must be an instance of Agreement");
          }
          const index = self.agreements.findIndex(
            (agr) => agr.key === newAgreement._beforeData.key
          );
          if (index !== -1) {
            self.agreements[index] = newAgreement;
          } else {
            throw new Error("Agreement not found");
          }
        },
        writable: false,
        enumerable: false,
      },
      remove: {
        value: function (agreement) {
          const index = self.agreements.findIndex(
            (agr) => agr.key === agreement._beforeData.key
          );
          if (index !== -1) {
            self.agreements.splice(index, 1);
          } else {
            throw new Error("Agreement not found");
          }
        },
      },
    });
  }

  /**
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
    const { date, dayType, shiftType } = args;
    if (!date || !dayType || !shiftType) return null;
    return (
      this.agreements
        .filter((agr) => agr.dayType === dayType && agr.shiftType === shiftType)
        .sort((a, b) => b.date.localeCompare(a.date))
        .find((agr) => agr.date <= date) || null
    );
  }
}
