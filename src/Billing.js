/*****************************************************************************
 * Billing
 * @version 1.0.0
 * @description A model for billing data.
 * @author shisyamo4131
 *
 * @prop {string} customerId - customer document id
 * @prop {string} siteId - site document id
 * @prop {Date} billingDateAt - billing date
 * @prop {Date} paymentDueDateAt - payment due date
 *
 * @prop {Array} paymentRecords - payment records (not implemented yet)
 *
 * @prop {string} status - status (DRAFT/CONFIRMED/PAID/CANCELLED)
 * @prop {Array<OperationResult>} operationResults - operation result documents.
 * @prop {Object} adjustment - adjustment
 * @prop {string} remarks - remarks
 *
 * @prop {string} billingMonth - billing month (YYYY-MM format) (read-only)
 * @prop {Date} billingDate - billing date (YYYY-MM-DD format) (read-only)
 * @prop {string} paymentDueMonth - payment due month (YYYY-MM format) (read-only)
 * @prop {Date} paymentDueDate - payment due date (YYYY-MM-DD format) (read-only)
 * @prop {number} subtotal - subtotal (excluding tax) (computed-readonly)
 * @prop {number} taxAmount - tax amount (computed-readonly)
 * @prop {number} totalAmount - total amount (including tax) (computed-readonly)
 * @prop {Array<Object>} summary - summary for display (computed-readonly)
 *****************************************************************************/

import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import OperationResult from "./OperationResult.js";

const STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const classProps = {
  customerId: defField("customerId", { required: true }),
  siteId: defField("siteId", { required: true }),
  billingDateAt: defField("dateAt", { required: true }),
  paymentDueDateAt: defField("dateAt"),

  // 入金管理用配列（現時点では未使用 将来の拡張用）
  paymentRecords: defField("array", { default: [] }), // Not implemented yet

  status: defField("oneLine", { default: STATUS.DRAFT }),
  operationResults: defField("array", { customClass: OperationResult }),
  adjustment: defField("object", {
    default: {
      amount: 0,
      description: "",
    },
  }),
  remarks: defField("multipleLine"),
};

export default class Billing extends FireModel {
  static className = "請求";
  static collectionPath = "Billings";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;
  static STATUS = STATUS;

  afterInitialize(item = {}) {
    super.afterInitialize(item);

    // billingDate (YYYY-MM-DD) と billingMonth (YYYY-MM) の計算用プロパティを定義
    Object.defineProperties(this, {
      billingDate: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.billingDateAt) return null;
          const jstDate = new Date(
            this.billingDateAt.getTime() + 9 * 60 * 60 * 1000
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          const day = jstDate.getUTCDate();
          return `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
        },
        set(v) {},
      },
      billingMonth: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.billingDateAt) return null;
          const jstDate = new Date(
            this.billingDateAt.getTime() + 9 * 60 * 60 * 1000
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          return `${year}-${String(month).padStart(2, "0")}`;
        },
        set(v) {},
      },
    });

    Object.defineProperties(this, {
      paymentDueDate: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.paymentDueDateAt) return null;
          const jstDate = new Date(
            this.paymentDueDateAt.getTime() + 9 * 60 * 60 * 1000
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          const day = jstDate.getUTCDate();
          return `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
        },
        set(v) {},
      },
      paymentDueMonth: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.paymentDueDateAt) return null;
          const jstDate = new Date(
            this.paymentDueDateAt.getTime() + 9 * 60 * 60 * 1000
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          return `${year}-${String(month).padStart(2, "0")}`;
        },
        set(v) {},
      },
    });

    // 小計（税抜）を計算
    Object.defineProperty(this, "subtotal", {
      get() {
        const itemsTotal = this.operationResults.reduce((sum, item) => {
          return sum + (item.salesAmount || 0);
        }, 0);
        return itemsTotal + (this.adjustment?.amount || 0);
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 消費税額を計算
    Object.defineProperty(this, "taxAmount", {
      get() {
        return Math.floor(this.subtotal * 0.1); // 10% 切り捨て
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 合計金額（税込）を計算
    Object.defineProperty(this, "totalAmount", {
      get() {
        return this.subtotal + this.taxAmount;
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 表示用の明細サマリーを生成
    Object.defineProperty(this, "summary", {
      get() {
        return this.operationResults.map((item) => ({
          operationResultId: item.docId,
          workDate: item.dateAt,
          shiftType: item.shiftType,
          dayType: item.dayType,
          base: {
            quantity: item.statistics?.base?.quantity || 0,
            unitPrice: item.unitPriceBase || 0,
            regularAmount: item.sales?.base?.regularAmount || 0,
            overtimeMinutes: item.statistics?.base?.overtimeMinutes || 0,
            overtimeUnitPrice: item.overtimeUnitPriceBase || 0,
            overtimeAmount: item.sales?.base?.overtimeAmount || 0,
            total: item.sales?.base?.total || 0,
          },
          qualified: {
            quantity: item.statistics?.qualified?.quantity || 0,
            unitPrice: item.unitPriceQualified || 0,
            regularAmount: item.sales?.qualified?.regularAmount || 0,
            overtimeMinutes: item.statistics?.qualified?.overtimeMinutes || 0,
            overtimeUnitPrice: item.overtimeUnitPriceQualified || 0,
            overtimeAmount: item.sales?.qualified?.overtimeAmount || 0,
            total: item.sales?.qualified?.total || 0,
          },
          subtotal: item.salesAmount || 0,
          remarks: item.remarks || "",
        }));
      },
      set() {},
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * Confirm the billing
   */
  confirm() {
    if (this.status !== STATUS.DRAFT) {
      throw new Error("Only draft billings can be confirmed");
    }
    this.status = STATUS.CONFIRMED;
  }

  /**
   * Mark as paid
   */
  markAsPaid() {
    if (this.status !== STATUS.CONFIRMED) {
      throw new Error("Only confirmed billings can be marked as paid");
    }
    this.status = STATUS.PAID;
  }
}
