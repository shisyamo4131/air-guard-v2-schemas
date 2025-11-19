/*****************************************************************************
 * Agreement Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * A class to manage agreement details based on WorkingResult.
 * ---------------------------------------------------------------------------
 * @prop {number} unitPriceBase - Base unit price (JPY)
 * @prop {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @prop {number} unitPriceQualified - Qualified unit price (JPY)
 * @prop {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @prop {string} billingUnitType - Billing unit type
 * @prop {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 * @prop {number} cutoffDate - Cutoff date value from CutoffDate.VALUES
 * - The cutoff date for billing, using values defined in the CutoffDate utility class.
 * ---------------------------------------------------------------------------
 * @getter {Object} prices - Object containing price-related properties (read-only)
 * - Returns an object with all price-related properties for synchronizing details.
 * - Useful for creating `OperationResult` instances from `SiteOperationSchedule`.
 * - Includes: regulationWorkMinutes, unitPriceBase, overtimeUnitPriceBase,
 *   unitPriceQualified, overtimeUnitPriceQualified, billingUnitType, includeBreakInBilling
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult:
 * @prop {Date} dateAt - Applicable start date (trigger property)
 * @prop {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @prop {string} shiftType - Shift type (`DAY`, `NIGHT`)
 * @prop {string} startTime - Start time (HH:MM format)
 * @prop {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @prop {string} endTime - End time (HH:MM format)
 * @prop {number} breakMinutes - Break time (minutes)
 * @prop {number} regulationWorkMinutes - Regulation work minutes
 * - The maximum working time defined by `unitPriceBase` (or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult:
 * @computed {string} key - Unique key combining `date`, `dayType`, and `shiftType` (read-only)
 * - A unique identifier for the working result, combining `date`, `dayType`, and `shiftType`.
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
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import {
  BILLING_UNIT_TYPE,
  BILLING_UNIT_TYPE_ARRAY,
  BILLING_UNIT_TYPE_DEFAULT,
} from "./constants/billing-unit-type.js";
import { defField } from "./parts/fieldDefinitions.js";
import CutoffDate from "./utils/CutoffDate.js";

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
  cutoffDate: defField("select", {
    label: "締日区分",
    default: CutoffDate.VALUES.END_OF_MONTH,
    required: true,
    component: {
      attrs: {
        items: CutoffDate.OPTIONS,
      },
    },
  }),
};

/**
 * Table headers for displaying agreement details
 */
const headers = [
  {
    title: "適用開始日",
    key: "dateAt",
    value: (item) => item.dateAt.toLocaleDateString(),
  },
  {
    title: "締日",
    key: "cutoffDate",
    value: (item) => {
      return CutoffDate.getDisplayText(item.cutoffDate);
    },
    align: "center",
    sortable: false,
  },
  {
    title: "区分",
    key: "type",
    value: (item) =>
      `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType].title}`,
    align: "center",
    sortable: false,
  },
  {
    title: "勤務時間",
    key: "time",
    value: (item) => `${item.startTime} ～ ${item.endTime}`,
    align: "center",
    sortable: false,
  },
  {
    title: "規定実働時間",
    key: "regulationWorkMinutes",
    value: (item) => `${item.regulationWorkMinutes}分`,
    align: "center",
    sortable: false,
  },
  {
    title: "休憩時間",
    key: "breakMinutes",
    value: (item) => `${item.breakMinutes}分`,
    align: "center",
    sortable: false,
  },
  {
    title: "残業時間",
    key: "overtimeWorkMinutes",
    value: (item) => `${item.overtimeWorkMinutes}分`,
    align: "center",
    sortable: false,
  },
  {
    title: "通常",
    align: "center",
    children: [
      {
        title: "単価",
        key: "unitPriceBase",
        value: (item) => item.unitPriceBase.toLocaleString(),
        align: "center",
        sortable: false,
      },
      {
        title: "時間外",
        key: "overtimeUnitPriceBase",
        value: (item) => item.overtimeUnitPriceBase.toLocaleString(),
        align: "center",
        sortable: false,
      },
    ],
  },
  {
    title: "資格者",
    align: "center",
    children: [
      {
        title: "単価",
        key: "unitPriceQualified",
        value: (item) => item.unitPriceQualified.toLocaleString(),
        align: "center",
        sortable: false,
      },
      {
        title: "時間外",
        key: "overtimeUnitPriceQualified",
        value: (item) => item.overtimeUnitPriceQualified.toLocaleString(),
        align: "center",
        sortable: false,
      },
    ],
  },
  {
    title: "請求単位",
    key: "billingUnitType",
    value: (item) => BILLING_UNIT_TYPE[item.billingUnitType],
    align: "center",
    sortable: false,
  },
];

export default class Agreement extends WorkingResult {
  static className = "取極め";
  static classProps = classProps;
  static headers = headers;

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
