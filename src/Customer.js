/**
 * Customer
 * @version 1.1.1
 * @description This module defines the Customer model for managing customer data.
 * @hasMany Sites - related sites associated with the customer
 * @author shisyamo4131
 * @update 2025-12-08 - Changed `paymentMonth` type from direct number to select field.
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import CutoffDate from "./utils/CutoffDate.js";
import {
  CONTRACT_STATUS_VALUES,
  PAYMENT_MONTH_OPTIONS,
} from "./constants/index.js";

const classProps = {
  code: defField("code", { label: "取引先コード" }),
  name: defField("name", { label: "取引先名", required: true }),
  nameKana: defField("nameKana", { label: "取引先名（カナ）", required: true }),
  zipcode: defField("zipcode", { required: true }),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  location: defField("location", { hidden: true }),
  tel: defField("tel", { colsDefinition: { cols: 12, sm: 6 } }),
  fax: defField("fax", { colsDefinition: { cols: 12, sm: 6 } }),
  contractStatus: defField("contractStatus", { required: true }),
  cutoffDate: defField("cutoffDate", { required: true }),
  paymentMonth: defField("select", {
    default: 1,
    label: "入金サイト（月数）",
    required: true,
    component: {
      attrs: {
        items: PAYMENT_MONTH_OPTIONS,
      },
    },
  }),
  paymentDate: defField("select", {
    label: "入金サイト（日付）",
    default: CutoffDate.VALUES.END_OF_MONTH,
    required: true,
    component: {
      attrs: {
        items: CutoffDate.OPTIONS,
      },
    },
  }),
  remarks: defField("multipleLine", { label: "備考" }),
};

/*****************************************************************************
 * @prop {string} code - customer code
 * @prop {string} name - customer name
 * @prop {string} nameKana - customer name in kana
 * @prop {string} zipcode - postal code
 * @prop {string} prefCode - prefecture code
 * @prop {string} city - city name
 * @prop {string} address - address details
 * @prop {string} building - building name
 * @prop {object} location - geographical location
 * @prop {string} tel - telephone number
 * @prop {string} fax - fax number
 * @prop {string} contractStatus - contract status
 * @prop {number} paymentMonth - payment site in months
 * @prop {string} paymentDate - payment site date
 * @prop {string} remarks - additional remarks
 *
 * @readonly
 * @prop {string} fullAddress - full address combining prefecture, city, and address (read-only)
 * @prop {string} prefecture - prefecture name derived from `prefCode` (read-only)
 *
 * @static
 * @prop {object} STATUS - constant mapping for contract statuses
 * @prop {string} STATUS_ACTIVE - constant for active contract status
 * @prop {string} STATUS_TERMINATED - constant for terminated contract status
 *
 * @method getPaymentDueDateAt
 * @param {Date} baseDate - base date in UTC (JST - 9 hours)
 * @returns {Date} payment due date in UTC (JST - 9 hours)
 *****************************************************************************/
export default class Customer extends FireModel {
  static className = "取引先";
  static collectionPath = "Customers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;
  static tokenFields = ["name", "nameKana"];
  static hasMany = [
    {
      collectionPath: "Sites",
      field: "customerId",
      condition: "==",
      type: "collection",
    },
  ];

  static headers = [
    { key: "code", title: "取引先コード" },
    { key: "name", title: "取引先名" },
    { key: "fullAddress", title: "所在地" },
  ];

  static STATUS = CONTRACT_STATUS_VALUES;
  static STATUS_ACTIVE = CONTRACT_STATUS_VALUES.ACTIVE.value;
  static STATUS_TERMINATED = CONTRACT_STATUS_VALUES.TERMINATED.value;

  afterInitialize(item = {}) {
    super.afterInitialize(item);
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }

  /**
   * 支払期日を計算する
   * @param {Date} baseDate - 基準日（JSTから9時間引いたUTC表現）
   * @returns {Date} 支払期日（JSTから9時間引いたUTC表現）
   */
  getPaymentDueDateAt(baseDate) {
    // UTC → JST に変換（+9時間）
    const jstDate = new Date(baseDate.getTime() + 9 * 60 * 60 * 1000);

    // UTCメソッドでJST相当の年月を取得
    const year = jstDate.getUTCFullYear();
    const month = jstDate.getUTCMonth();

    // paymentMonth分加算した年月を計算
    const targetMonth = month + this.paymentMonth;
    const targetYear = year + Math.floor(targetMonth / 12);
    const finalMonth = targetMonth % 12;

    let dueDate;
    if (this.paymentDate === CutoffDate.VALUES.END_OF_MONTH) {
      // 月末の場合
      dueDate = new Date(Date.UTC(targetYear, finalMonth + 1, 0));
    } else {
      // 指定日の場合
      dueDate = new Date(Date.UTC(targetYear, finalMonth, this.paymentDate));

      // 指定日が存在しない場合は月末にする
      if (dueDate.getUTCMonth() !== finalMonth) {
        dueDate = new Date(Date.UTC(targetYear, finalMonth + 1, 0));
      }
    }

    // JST → UTC に変換（-9時間）
    return new Date(dueDate.getTime() - 9 * 60 * 60 * 1000);
  }
}

/*****************************************************************************
 * A minimal version of the Customer model with non-essential fields removed for
 * lightweight data handling.
 *****************************************************************************/
export class CustomerMinimal extends Customer {
  afterInitialize() {
    super.afterInitialize();
    delete this.remarks;
    delete this.tokenMap;
    delete this.uid;
    delete this.createdAt;
    delete this.updatedAt;
  }
}
