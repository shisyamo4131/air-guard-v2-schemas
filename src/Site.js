/**
 * @file src/Site.js
 * @author shisyamo4131
 * @version 1.1.0
 * @update 2025-11-20 version 0.2.0-bata
 *                    - Prevent changing customer reference on update.
 *                    - Move `customer` property to the top of classProps for better visibility.
 */
import { default as FireModel } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";
import { fetchDocsApi } from "./apis/index.js";
import Agreement from "./Agreement.js";
import { VALUES } from "./constants/site-status.js";

const classProps = {
  customer: defField("customer", {
    required: true,
    customClass: CustomerMinimal,
    component: {
      attrs: {
        api: () => fetchDocsApi(CustomerMinimal),
        noFilter: true,
      },
    },
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
 * @props {string} code - Site code.
 * @props {string} name - Site name.
 * @props {string} nameKana - Site name in Kana.
 * @props {string} zipcode - Postal code.
 * @props {string} prefCode - Prefecture code.
 * @props {string} city - City name.
 * @props {string} address - Address details.
 * @props {string} building - Building name.
 * @props {object} location - Geographical location.
 * @props {object} customer - Associated customer (CustomerMinimal).
 * @props {string} remarks - Additional remarks.
 * @props {array} agreements - List of agreements (Agreement).
 * - Enhanced with custom methods: `add()`, `change()`, `remove()`
 * @props {string} status - Site status.
 *
 * @computed {string} customerId - ID of the associated customer (read-only)
 * @computed {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 * @computed {string} prefecture - Prefecture name derived from `prefCode` (read-only)
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
export default class Site extends FireModel {
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

  static STATUS_ACTIVE = VALUES.ACTIVE.value;
  static STATUS_TERMINATED = VALUES.TERMINATED.value;

  /**
   * Override beforeUpdate to prevent changing customer reference.
   * @returns {Promise<void>}
   */
  async beforeUpdate() {
    await super.beforeUpdate();
    if (this.customer.docId !== this._beforeData.customer.docId) {
      return Promise.reject(
        new Error("Not allowed to change customer reference.")
      );
    }
  }

  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      customerId: defAccessor("customerId"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });

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
