/*****************************************************************************
 * Agreement Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * A class to manage agreement details based on WorkingResult.
 * ---------------------------------------------------------------------------
 * @property {number} unitPriceBase - Base unit price (JPY)
 * @property {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @property {number} unitPriceQualified - Qualified unit price (JPY)
 * @property {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @property {string} billingUnitType - Billing unit type
 * @property {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 * @property {number} cutoffDate - Cutoff date value from CutoffDate.VALUES
 * - The cutoff date for billing, using values defined in the CutoffDate utility class.
 * ---------------------------------------------------------------------------
 * @getter {Object} prices - Object containing price-related properties (read-only)
 * - Returns an object with all price-related properties for synchronizing details.
 * - Useful for creating `OperationResult` instances from `SiteOperationSchedule`.
 * - Includes: regulationWorkMinutes, unitPriceBase, overtimeUnitPriceBase,
 *   unitPriceQualified, overtimeUnitPriceQualified, billingUnitType, includeBreakInBilling
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult:
 * @property {Date} dateAt - Applicable start date (trigger property)
 * @property {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @property {string} shiftType - Shift type (`DAY`, `NIGHT`)
 * @property {string} startTime - Start time (HH:MM format)
 * @property {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @property {string} endTime - End time (HH:MM format)
 * @property {number} breakMinutes - Break time (minutes)
 * @property {number} regulationWorkMinutes - Regulation work minutes
 * - The maximum working time defined by `unitPriceBase` (or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult:
 *
 * @property {string} key - {@link WorkingResult#key}
 *
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @computed {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * - If the difference between `endAt` and `startAt` is negative, returns 0.
 * - If `startAt` or `endAt` is not set, returns 0.
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * - If actual working time is less than regulation time (e.g., early leave), it equals `totalWorkMinutes`.
 * - If actual working time exceeds regulation time (overtime), it equals `regulationWorkMinutes`.
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * - Overtime work is not negative; the minimum is 0.
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult:
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult:
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import WorkingResult from "./WorkingResult.js";
import {
  BILLING_UNIT_TYPE_VALUES,
  BILLING_UNIT_TYPE_OPTIONS,
} from "./constants/index.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  ...WorkingResult.classProps,
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
    default: BILLING_UNIT_TYPE_VALUES.PER_DAY.value,
    label: "請求単位",
    required: true,
    component: {
      attrs: {
        items: BILLING_UNIT_TYPE_OPTIONS,
      },
    },
  }),
  includeBreakInBilling: defField("check", {
    label: "請求に休憩時間を含める",
    default: false,
  }),
  cutoffDate: defField("cutoffDate", { required: true }),
};

export default class Agreement extends WorkingResult {
  static className = "取極め";
  static classProps = classProps;

  static BILLING_UNIT_TYPE = BILLING_UNIT_TYPE_VALUES;

  /**
   * Returns an object containing price-related properties.
   * This accessor is useful for synchronizing price details when creating `OperationResult` instance
   * from a `SiteOperationSchedule`.
   * - Includes `regulationWorkMinutes`.
   * @returns {Object} An object with price-related properties.
   * @property {number} cutoffDate - Cutoff date
   * @property {number} regulationWorkMinutes - Regulation work minutes
   * @property {number} unitPriceBase - Base unit price
   * @property {number} overtimeUnitPriceBase - Overtime base unit price
   * @property {number} unitPriceQualified - Qualified unit price
   * @property {number} overtimeUnitPriceQualified - Overtime qualified unit price
   * @property {string} billingUnitType - Billing unit type
   * @property {boolean} includeBreakInBilling - Whether to include break time in billing
   */
  get billingInfo() {
    return {
      cutoffDate: this.cutoffDate,
      regulationWorkMinutes: this.regulationWorkMinutes,
      unitPriceBase: this.unitPriceBase,
      overtimeUnitPriceBase: this.overtimeUnitPriceBase,
      unitPriceQualified: this.unitPriceQualified,
      overtimeUnitPriceQualified: this.overtimeUnitPriceQualified,
      billingUnitType: this.billingUnitType,
      includeBreakInBilling: this.includeBreakInBilling,
    };
  }

  /**
   * Returns an object containing price-related properties.
   * This accessor is useful for synchronizing price details when creating `OperationResult` instance
   * from a `SiteOperationSchedule`.
   * - Includes `regulationWorkMinutes`.
   * @returns {Object} An object with price-related properties.
   * @property {number} regulationWorkMinutes - Regulation work minutes
   * @property {number} unitPriceBase - Base unit price
   * @property {number} overtimeUnitPriceBase - Overtime base unit price
   * @property {number} unitPriceQualified - Qualified unit price
   * @property {number} overtimeUnitPriceQualified - Overtime qualified unit price
   * @property {string} billingUnitType - Billing unit type
   * @property {boolean} includeBreakInBilling - Whether to include break time in billing
   */
  get prices() {
    console.warn(
      "`Agreement.prices` is deprecated. Use `Agreement.billingInfo` instead."
    );
    return {
      regulationWorkMinutes: this.regulationWorkMinutes,
      unitPriceBase: this.unitPriceBase,
      overtimeUnitPriceBase: this.overtimeUnitPriceBase,
      unitPriceQualified: this.unitPriceQualified,
      overtimeUnitPriceQualified: this.overtimeUnitPriceQualified,
      billingUnitType: this.billingUnitType,
      includeBreakInBilling: this.includeBreakInBilling,
    };
  }
}
