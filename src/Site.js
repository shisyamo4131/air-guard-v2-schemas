import { default as FireModel } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";
import { fetchDocsApi } from "./apis/index.js";
import Agreement from "./Agreement.js";
import {
  SITE_STATUS_ACTIVE,
  SITE_STATUS_TERMINATED,
} from "./constants/site-status.js";

export default class Site extends FireModel {
  static className = "現場";
  static collectionPath = "Sites";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
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
    remarks: defField("multipleLine", { label: "備考" }),
    agreements: defField("array", { label: "取極め", customClass: Agreement }),
    status: defField("siteStatus", { required: true }),
  };
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

  static STATUS_ACTIVE = SITE_STATUS_ACTIVE;
  static STATUS_TERMINATED = SITE_STATUS_TERMINATED;

  afterInitialize() {
    Object.defineProperties(this, {
      customerId: defAccessor("customerId"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
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
