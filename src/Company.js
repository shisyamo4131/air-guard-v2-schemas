/*****************************************************************************
 * Company Model
 * @author shisyamo4131
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Agreement from "./Agreement.js";
import SiteOrder from "./SiteOrder.js";
import RoundSetting from "./RoundSetting.js";
import { GeocodableMixin } from "./mixins/GeocodableMixin.js";
import { DAY_OF_WEEK_OPTIONS, DAY_OF_WEEK_VALUES } from "./constants/index.js";

const classProps = {
  companyName: defField("name", { label: "会社名", required: true }),
  companyNameKana: defField("nameKana", {
    label: "会社名（カナ）",
    required: true,
  }),

  /**
   * これ以降のフィールドは管理者アカウント作成時に未入力状態で作成されるため required は未定義（false）とする
   */

  /** 基本情報 */
  zipcode: defField("zipcode"),
  prefCode: defField("prefCode"),
  city: defField("city"),
  address: defField("address"),
  building: defField("building"),
  tel: defField("tel"),
  fax: defField("fax"),

  /** 振込先情報 */
  bankName: defField("oneLine", { label: "銀行名", length: 20 }),
  branchName: defField("oneLine", { label: "支店名", length: 20 }),
  accountType: defField("select", {
    label: "口座種別",
    default: "普通",
    component: { name: "air-select", attrs: { items: ["普通", "当座"] } },
  }),
  accountNumber: defField("oneLine", { label: "口座番号", length: 7 }),
  accountHolder: defField("oneLine", { label: "口座名義", length: 50 }),

  /** 会社の既定取極め */
  agreements: defField("array", {
    label: "既定の取極め",
    customClass: Agreement,
  }),

  /**
   * Property to manage the display order of site-shift type pairs for arrangement management.
   * Format: { siteId, shiftType }
   * NOTE: `key` is a unique identifier combined from siteId and shiftType.
   */
  siteOrder: defField("array", { customClass: SiteOrder, hidden: true }),

  /**
   * Property to manage the display order of site-shift type pairs for site-operation-schedule.
   * Format: { siteId, shiftType, key }
   * NOTE: `key` is a unique identifier combined from siteId and shiftType.
   */
  scheduleOrder: defField("array", { customClass: SiteOrder, hidden: true }),

  /** Geolocation */
  location: defField("location", { hidden: true }),

  /** Interval in minutes used for VTimePicker's allowed-minutes. */
  minuteInterval: defField("number", {
    label: "時刻選択間隔（分）",
    default: 15,
    component: {
      name: "air-number-input",
      attrs: {
        controlVariant: "split",
        min: 1,
        max: 30,
        hint: "1〜30分の範囲で指定してください",
        persistentHint: true,
      },
    },
  }),

  /** Round setting */
  roundSetting: defField("select", {
    label: "端数処理",
    default: RoundSetting.ROUND,
    component: {
      name: "air-select",
      attrs: {
        items: RoundSetting.ITEMS,
        hint: "売上金額や消費税の端数処理をどのように行うかを設定します。",
        persistentHint: true,
      },
    },
  }),

  firstDayOfWeek: defField("select", {
    label: "週の始まり",
    default: DAY_OF_WEEK_VALUES[0].value,
    component: {
      name: "air-select",
      attrs: {
        items: DAY_OF_WEEK_OPTIONS,
        hint: "勤怠管理などで週の始まりとする曜日を設定します。",
        persistentHint: true,
      },
    },
  }),

  /** Stripe連携フィールド */
  stripeCustomerId: defField("oneLine", {
    label: "Stripe顧客ID",
    hidden: true,
    length: 100,
  }),

  subscription: defField("object", {
    label: "サブスクリプション情報",
    hidden: true,
    default: () => ({
      id: null,
      status: null,
      currentPeriodEnd: null,
      employeeLimit: 10,
    }),
  }),

  /** メンテナンス情報 */
  maintenanceMode: defField("check", { default: false, hidden: true }),
  maintenanceReason: defField("oneLine", { default: null, hidden: true }),
  maintenanceStartAt: defField("dateAt", { default: null, hidden: true }),
  maintenanceStartedBy: defField("oneLine", { default: null, hidden: true }),
};

export default class Company extends GeocodableMixin(FireModel) {
  static className = "会社";
  static collectionPath = "Companies";
  static usePrefix = false;
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  // Override `afterInitialize` to define computed properties.
  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });

    Object.defineProperties(this, {
      hasBankInfo: {
        enumerable: true,
        configurable: true,
        get() {
          return !!(
            this.bankName &&
            this.branchName &&
            this.accountNumber &&
            this.accountHolder
          );
        },
        set() {},
      },

      // Check if all `required` fields are filled.
      // Used for validating whether the Company info is complete.
      isCompleteRequiredFields: {
        enumerable: true,
        configurable: true,
        get() {
          return !!(
            this.companyName &&
            this.companyNameKana &&
            this.zipcode &&
            this.prefCode &&
            this.city &&
            this.address &&
            this.tel
          );
        },
        set() {},
      },
    });

    /*************************************************************************
     * CUSTOM METHODS FOR siteOrder ARRAY
     * Note: These methods modify the siteOrder array directly.
     * The Company instance itself is not updated by these methods.
     * Use the provided public methods to interact with siteOrder.
     *************************************************************************/
    Object.defineProperties(this.siteOrder, {
      /**
       * Inserts a new SiteOrder into the `siteOrder` array.
       * @param {Object} params - The parameters for the SiteOrder.
       * @param {string} params.siteId - The ID of the site.
       * @param {string} params.shiftType - The shift type associated with the site.
       * @param {number} [index=-1] - The position to insert the new SiteOrder. Defaults to the end.
       * @returns {SiteOrder} The newly created SiteOrder instance.
       * @throws {Error} If a SiteOrder with the same key already exists.
       */
      add: {
        value: function ({ siteId, shiftType }, index = -1) {
          const newOrder = new SiteOrder({ siteId, shiftType });
          if (this.some((order) => order.key === newOrder.key)) {
            throw new Error(
              `SiteOrder with key ${newOrder.key} already exists.`,
            );
          }
          index === -1 ? this.push(newOrder) : this.splice(index, 0, newOrder);
          return newOrder;
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
      /**
       * Changes the order of a SiteOrder in the siteOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {number} oldIndex - The current index of the SiteOrder.
       * @param {number} newIndex - The new index to move the SiteOrder to.
       * @returns {void}
       * @throws {Error} If oldIndex or newIndex are out of bounds.
       */
      change: {
        value: function (oldIndex, newIndex) {
          const length = this.length;
          if (oldIndex < 0 || oldIndex >= length) {
            throw new Error("Invalid oldIndex for site order change.");
          }
          if (newIndex < 0 || newIndex >= length) {
            throw new Error("Invalid newIndex for site order change.");
          }
          const [movedOrder] = this.splice(oldIndex, 1);
          this.splice(newIndex, 0, movedOrder);
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
      /**
       * Removes a SiteOrder from the siteOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {string|Object} arg - The key or {siteId, shiftType} of the SiteOrder to remove.
       * @returns {void}
       * @throws {Error} If the SiteOrder does not exist or if the argument is invalid.
       */
      remove: {
        value: function (arg) {
          let key = "";
          if (typeof arg === "string") {
            key = arg;
          } else if (typeof arg === "object" && arg.siteId && arg.shiftType) {
            key = `${arg.siteId}-${arg.shiftType}`;
          } else {
            throw new Error(
              "Invalid argument for remove. Must be a string key or an object with siteId and shiftType.",
            );
          }

          const index = this.findIndex((order) => order.key === key);
          if (index === -1) {
            throw new Error(`ScheduleOrder with key ${key} does not exist.`);
          }

          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
    });

    /*************************************************************************
     * CUSTOM METHODS FOR scheduleOrder ARRAY
     * Note: These methods modify the scheduleOrder array directly.
     * The Company instance itself is not updated by these methods.
     * Use the provided public methods to interact with scheduleOrder.
     *************************************************************************/
    Object.defineProperties(this.scheduleOrder, {
      /**
       * Inserts a new ScheduleOrder into the `scheduleOrder` array.
       * @param {Object} params - The parameters for the ScheduleOrder.
       * @param {string} params.siteId - The ID of the site.
       * @param {string} params.shiftType - The shift type associated with the site.
       * @param {number} [index=-1] - The position to insert the new ScheduleOrder. Defaults to the end.
       * @returns {ScheduleOrder} The newly created ScheduleOrder instance.
       * @throws {Error} If a ScheduleOrder with the same key already exists.
       */
      add: {
        value: function ({ siteId, shiftType }, index = -1) {
          const newOrder = new ScheduleOrder({ siteId, shiftType });
          if (this.some((order) => order.key === newOrder.key)) {
            throw new Error(
              `ScheduleOrder with key ${newOrder.key} already exists.`,
            );
          }
          index === -1 ? this.push(newOrder) : this.splice(index, 0, newOrder);
          return newOrder;
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
      /**
       * Changes the order of a ScheduleOrder in the scheduleOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {number} oldIndex - The current index of the ScheduleOrder.
       * @param {number} newIndex - The new index to move the ScheduleOrder to.
       * @returns {void}
       * @throws {Error} If oldIndex or newIndex are out of bounds.
       */
      change: {
        value: function (oldIndex, newIndex) {
          const length = this.length;
          if (oldIndex < 0 || oldIndex >= length) {
            throw new Error("Invalid oldIndex for site order change.");
          }
          if (newIndex < 0 || newIndex >= length) {
            throw new Error("Invalid newIndex for site order change.");
          }
          const [movedOrder] = this.splice(oldIndex, 1);
          this.splice(newIndex, 0, movedOrder);
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
      /**
       * Removes a ScheduleOrder from the scheduleOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {string|Object} arg - The key or {siteId, shiftType} of the ScheduleOrder to remove.
       * @returns {void}
       * @throws {Error} If the ScheduleOrder does not exist or if the argument is invalid.
       */
      remove: {
        value: function (arg) {
          let key = "";
          if (typeof arg === "string") {
            key = arg;
          } else if (typeof arg === "object" && arg.siteId && arg.shiftType) {
            key = `${arg.siteId}-${arg.shiftType}`;
          } else {
            throw new Error(
              "Invalid argument for remove. Must be a string key or an object with siteId and shiftType.",
            );
          }

          const index = this.findIndex((order) => order.key === key);
          if (index === -1) {
            throw new Error(`ScheduleOrder with key ${key} does not exist.`);
          }

          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
        configurable: true,
      },
    });
  }

  /***************************************************************************
   * PUBLIC METHODS
   ***************************************************************************/
}
