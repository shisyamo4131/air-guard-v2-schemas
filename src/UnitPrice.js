/*****************************************************************************
 * UnitPrice ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * Provides classProps for UnitPrice details.
 * - Used in other classes to define common properties values.
 * @props {number} unitPriceBase - Base unit price (JPY)
 * @props {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @props {number} unitPriceQualified - Qualified unit price (JPY)
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @props {string} billingUnitType - Billing unit type
 *****************************************************************************/
import { defField } from "./parts/fieldDefinitions.js";

export const classProps = {
  unitPriceBase: defField("price", {
    label: "基本単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  overtimeUnitPriceBase: defField("price", {
    label: "時間外単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  unitPriceQualified: defField("price", {
    label: "資格者単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  overtimeUnitPriceQualified: defField("price", {
    label: "資格者時間外単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  billingUnitType: defField("billingUnitType", { required: true }),
};
