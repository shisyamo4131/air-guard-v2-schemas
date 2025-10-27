/*****************************************************************************
 * UnitPrice ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - For providing properties of unit prices and some utilities.
 * ---------------------------------------------------------------------------
 * @props {number} unitPriceBase - Base unit price (JPY)
 * @props {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @props {number} unitPriceQualified - Qualified unit price (JPY)
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @props {string} billingUnitType - Billing unit type
 * @props {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 *****************************************************************************/
import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import {
  BILLING_UNIT_TYPE_ARRAY,
  BILLING_UNIT_TYPE_DEFAULT,
} from "./constants/billing-unit-type.js";

const classProps = {
  unitPriceBase: defField("price", { label: "基本単価", required: true }),
  overtimeUnitPriceBase: defField("price", {
    label: "時間外単価",
    required: true,
  }),
  unitPriceQualified: defField("price", {
    label: "資格者単価",
    required: true,
  }),
  overtimeUnitPriceQualified: defField("price", {
    label: "資格者時間外単価",
    required: true,
  }),
  billingUnitType: defField("select", {
    default: BILLING_UNIT_TYPE_DEFAULT,
    label: "請求単位",
    required: true,
    component: {
      attrs: {
        items: BILLING_UNIT_TYPE_ARRAY,
      },
    },
  }),
  includeBreakInBilling: defField("check", {
    label: "請求に休憩時間を含める",
    default: false,
  }),
};

export default class UnitPrice extends BaseClass {
  static className = "単価クラス";
  static classProps = classProps;
}
