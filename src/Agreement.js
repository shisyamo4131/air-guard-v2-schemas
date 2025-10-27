/*****************************************************************************
 * Agreement Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * A class for managing agreement details based on BaseClass.
 * - Combines properties from WorkingResult and UnitPrice.
 * ---------------------------------------------------------------------------
 * [from WorkingResult.js]
 * @props {Date} dateAt - Effective start date
 * - The date when this agreement becomes effective.
 * - This field holds only the date, with the time fixed at midnight.
 * @props {string} dayType - Day type (`WEEKDAY`, `SATURDAY`, `SUNDAY`, `HOLIDAY`)
 * @props {string} shiftType - Shift type (`DAY`, `NIGHT`)
 * @props {string} startTime - Start time (HH:MM format)
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break minutes
 * @props {boolean} isStartNextDay - Next day start flag
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * - The maximum working time defined by `unitPriceBase` (or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * [from UnitPrice.js]
 * @props {number} unitPriceBase - Base unit price (JPY)
 * @props {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @props {number} unitPriceQualified - Qualified unit price (JPY)
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @props {string} billingUnitType - Billing unit type
 * @props {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 * ---------------------------------------------------------------------------
 * [from WorkingResult.js]
 * @computed {string} key - Unique key combining `date` and `shiftType`
 * - A unique identifier for the agreement, combining `date` and `shiftType`.
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @computed {Date} startAt - Start date and time (Date object)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date
 * - `true` if `startTime` is later than `endTime`
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * - Overtime work is not negative; the minimum is 0.
 * ---------------------------------------------------------------------------
 * @accessor {number} startHour - Start hour (0-23)
 * - Extracted from `startTime`.
 * @accessor {number} startMinute - Start minute (0-59)
 * - Extracted from `startTime`.
 * @accessor {number} endHour - End hour (0-23)
 * - Extracted from `endTime`.
 * @accessor {number} endMinute - End minute (0-59)
 * - Extracted from `endTime`.
 *****************************************************************************/
import { BaseClass } from "air-firebase-v2";
import {
  classProps as workingResultClassProps,
  accessors as workingResultAccessors,
} from "./WorkingResult.js";
import UnitPrice from "./UnitPrice.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";

const classProps = {
  ...workingResultClassProps,
  ...UnitPrice.classProps,
};
export default class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = classProps;

  /** HEADERS */
  static headers = [
    {
      title: "適用開始日",
      key: "dateAt",
      value: (item) => item.dateAt.toLocaleDateString(),
    },
    {
      title: "区分",
      key: "type",
      value: (item) =>
        `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType].title}`,
      sortable: false,
    },
    {
      title: "勤務時間",
      key: "time",
      value: (item) => `${item.startTime} ～ ${item.endTime}`,
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

  afterInitialize() {
    super.afterInitialize();

    /** Computed properties */
    workingResultAccessors(this);
  }

  /**
   * 開始時刻の時間部分を取得します。
   * - `startTime` が設定されていない場合は 0 を返します。
   */
  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の分部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
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
