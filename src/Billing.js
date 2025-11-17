/*****************************************************************************
 * Billing
 * @version 1.0.0
 * @description A model for billing data.
 * @author shisyamo4131
 *
 * @prop {string} customerId - customer document id
 * @prop {string} siteId - site document id
 * @prop {string} billingMonth - billing month (YYYY-MM format)
 * @prop {Date} billingDate - billing date
 * @prop {Date} paymentDueDate - payment due date
 * @prop {string} status - status (DRAFT/CONFIRMED/PAID/CANCELLED)
 * @prop {Array<OperationResult>} items - operation result items (raw data)
 * @prop {Object} adjustment - adjustment
 * @prop {string} remarks - remarks
 * @prop {Object} pdfInfo - PDF information
 *
 * @computed {number} subtotal - subtotal (excluding tax)
 * @computed {number} taxAmount - tax amount
 * @computed {number} totalAmount - total amount (including tax)
 * @computed {Array<Object>} itemsSummary - billing items summary for display
 *****************************************************************************/

import FireModel from "air-firebase-v2";
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
  billingMonth: defField("oneLine", { required: true }),
  billingDate: defField("date"),
  paymentDueDate: defField("date"),
  status: defField("oneLine", { default: STATUS.DRAFT }),

  // OperationResult の生データを配列で保持
  items: defField("array", { customClass: OperationResult }),

  adjustment: defField("object", {
    default: {
      amount: 0,
      description: "",
    },
  }),

  remarks: defField("multipleLine"),

  pdfInfo: defField("object", {
    default: {
      url: null,
      generatedAt: null,
      version: 1,
    },
  }),
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

    // 小計（税抜）を計算
    Object.defineProperty(this, "subtotal", {
      get() {
        const itemsTotal = this.items.reduce((sum, item) => {
          return sum + (item.salesAmount || 0);
        }, 0);
        return itemsTotal + (this.adjustment?.amount || 0);
      },
      set() {},
      enumerable: true,
    });

    // 消費税額を計算
    Object.defineProperty(this, "taxAmount", {
      get() {
        return Math.floor(this.subtotal * 0.1); // 10% 切り捨て
      },
      set() {},
      enumerable: true,
    });

    // 合計金額（税込）を計算
    Object.defineProperty(this, "totalAmount", {
      get() {
        return this.subtotal + this.taxAmount;
      },
      set() {},
      enumerable: true,
    });

    // 表示用の明細サマリーを生成
    Object.defineProperty(this, "itemsSummary", {
      get() {
        return this.items.map((item) => ({
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
