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
 * @prop {Array<Object>} taxBreakdown - tax breakdown grouped by rate (computed-readonly)
 * @prop {number} legacyTaxAmount - tax calculated per operation result (computed-readonly)
 * @prop {number} calculatedTaxAmount - tax calculated per rate (computed-readonly)
 * @prop {number} taxCalculationDifference - difference between new and legacy tax (computed-readonly)
 * @prop {number} taxAmount - tax amount (computed-readonly)
 * @prop {number} totalAmount - total amount (including tax) (computed-readonly)
 * @prop {Array<Object>} summary - summary for display (computed-readonly)
 *****************************************************************************/

import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { formatJstDate } from "./utils/index.js";
import OperationResult from "./OperationResult.js";
import Tax from "./Tax.js";

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

  // 請求額の調整を行うケースが発生した場合に使用。現在未使用。
  adjustment: defField("object", {
    default: {
      amount: 0,
      description: "",
    },
  }),
  remarks: defField("remarks"),
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
          return formatJstDate(this.billingDateAt);
        },
        set(v) {},
      },
      billingMonth: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.billingDateAt, "YYYY-MM");
        },
        set(v) {},
      },
    });

    Object.defineProperties(this, {
      paymentDueDate: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.paymentDueDateAt);
        },
        set(v) {},
      },
      paymentDueMonth: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.paymentDueDateAt, "YYYY-MM");
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

    // 税率ごとの消費税額内訳を計算
    Object.defineProperty(this, "taxBreakdown", {
      get() {
        return Tax.calculateBreakdown(
          this.operationResults.map((item) => ({
            amount: item.salesAmount || 0,
            taxRate: item.taxRate,
          })),
        );
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 稼働実績ごとに端数処理していた旧方式の消費税額を計算
    Object.defineProperty(this, "legacyTaxAmount", {
      get() {
        return this.operationResults.reduce((sum, item) => {
          return sum + (item.tax || 0);
        }, 0);
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 現場内の課税対象額を税率ごとに合計して算出した消費税額を計算
    Object.defineProperty(this, "calculatedTaxAmount", {
      get() {
        return this.taxBreakdown.reduce((sum, item) => {
          return sum + item.taxAmount;
        }, 0);
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 新旧の税額差を計算
    Object.defineProperty(this, "taxCalculationDifference", {
      get() {
        return this.calculatedTaxAmount - this.legacyTaxAmount;
      },
      set() {},
      enumerable: true,
      configurable: true,
    });

    // 消費税額を計算（現場・税率単位で端数処理）
    Object.defineProperty(this, "taxAmount", {
      get() {
        return this.calculatedTaxAmount;
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
        return this.operationResults.map((item) => {
          // useAdjusted に応じて参照する sales を切り替える
          const salesData = item.useAdjusted
            ? item.sales?.adjusted
            : item.sales?.original;

          return {
            operationResultId: item.docId,
            workDate: item.dateAt,
            shiftType: item.shiftType,
            dayType: item.dayType,
            useAdjusted: item.useAdjusted,
            base: {
              quantity: salesData?.base?.quantity || 0,
              unitPrice: salesData?.base?.unitPrice || 0,
              regularAmount: salesData?.base?.regularAmount || 0,
              overtimeMinutes: salesData?.base?.overtimeMinutes || 0,
              overtimeUnitPrice: salesData?.base?.overtimeUnitPrice || 0,
              overtimeAmount: salesData?.base?.overtimeAmount || 0,
              total: salesData?.base?.total || 0,
            },
            qualified: {
              quantity: salesData?.qualified?.quantity || 0,
              unitPrice: salesData?.qualified?.unitPrice || 0,
              regularAmount: salesData?.qualified?.regularAmount || 0,
              overtimeMinutes: salesData?.qualified?.overtimeMinutes || 0,
              overtimeUnitPrice: salesData?.qualified?.overtimeUnitPrice || 0,
              overtimeAmount: salesData?.qualified?.overtimeAmount || 0,
              total: salesData?.qualified?.total || 0,
            },
            subtotal: item.salesAmount || 0,
            remarks: item.remarks || "",
          };
        });
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
