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
 *****************************************************************************/
import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  unitPriceBase: defField("price", {
    label: "基本単価",
    required: true,
  }),
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
  billingUnitType: defField("billingUnitType", { required: true }),
};

export default class UnitPrice extends BaseClass {
  static className = "単価クラス";
  static classProps = classProps;
}
