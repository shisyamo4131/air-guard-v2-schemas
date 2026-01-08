/**
 * @file src/Site.js
 * @author shisyamo4131
 * @update 2026-01-08 - 取引先の変更禁止ロジックを削除。
 *                    - `customerId` の必須入力を解除 -> 取引先未設定の現場を許容するため。
 * @update 2025-11-20 - Prevent changing customer reference on update.
 *                    - Move `customer` property to the top of classProps for better visibility.
 *
 * NOTE: `customerId`, `customer` プロパティについて
 * - 自身の従属先データを持たせる場合に `XxxxxMinimal` クラスを使用するが、アプリ側でオブジェクト選択を行う場合に
 *   `Xxxxx` クラスにするのか `XxxxxMinimal` クラスにするのかを判断できないため、docId を持たせて
 *   `beforeCreate` フックでオブジェクトを取得するようにする。
 * - 2026-01-08 現場に取引先未設定を許容するため、`customerId` の必須入力を解除し、変更禁止ロジックを削除。
 *   -> 取引先未定のまま現場登録を行うシチュエーションが存在する。
 *   -> 但し、一度取引先を設定した後に未設定に戻すことはできない。
 */
import { default as FireModel } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Customer from "./Customer.js";
import Agreement from "./Agreement.js";
import { VALUES } from "./constants/site-status.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";

const classProps = {
  // customerId: defField("customerId", {
  //   required: true,
  //   component: {
  //     attrs: {
  //       disabled: ({ editMode }) => {
  //         return editMode !== "CREATE";
  //       },
  //     },
  //   },
  // }),
  customerId: defField("customerId"),
  customer: defField("customer", { hidden: true, customClass: Customer }),
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
 * @property {string} code - Site code.
 * @property {string} name - Site name.
 * @property {string} nameKana - Site name in Kana.
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
    // if (!this.customerId) return;
    // const customerInstance = new Customer();
    // const isExist = await customerInstance.fetch({
    //   ...args,
    //   docId: this.customerId,
    // });
    // if (!isExist) {
    //   return Promise.reject(
    //     new Error("Invalid customerId: Customer does not exist.")
    //   );
    // }
    // this.customer = customerInstance;
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

    // if (this.customer.docId !== this._beforeData.customer.docId) {
    //   return Promise.reject(
    //     new Error("Not allowed to change customer reference.")
    //   );
    // }

    // 取引先を未設定に戻すことはできない。
    if (this._beforeData.customerId && !this.customerId) {
      throw new Error("Cannot unset customerId once it is set.");
    }

    // 取引先が変更されていた場合は `customer` プロパティを更新する。
    if (this.customerId !== this._beforeData.customerId) {
      await this._setCustomer();
    }
  }

  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });

    const self = this;

    /**
     * `Agreement` プロパティに対するカスタムメソッドを定義します。
     * - add(agreement): `Agreement` インスタンスを追加します。
     * - change(newAgreement): `key` プロパティを基に既存の `Agreement` を置き換えます。
     * - remove(agreement): `key` プロパティを基に `Agreement` を削除します。
     */
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
