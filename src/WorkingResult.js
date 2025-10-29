/*****************************************************************************
 * WorkingResult ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * A class representing the working result for a specific date and shift extending FireModel.
 * - This class is intended to be inherited by other classes so, it cannot be instantiated directly.
 * - `dateAt` is defined as a trigger property. When it is set, `dayType` is automatically updated.
 * - Subclasses can override `setDateAtCallback` to add custom behavior when `dateAt` changes.
 * ---------------------------------------------------------------------------
 * @props {Date} dateAt - Applicable start date (trigger property)
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - Shift type (`DAY`, `NIGHT`)
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * - The maximum working time defined by `unitPriceBase` (or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * ---------------------------------------------------------------------------
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
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils/index.js";
import { getDayType } from "./constants/day-type.js";

const classProps = {
  dateAt: defField("dateAt", { required: true }),
  dayType: defField("dayType", { required: true }),
  shiftType: defField("shiftType", { required: true }),
  startTime: defField("time", {
    label: "開始時刻",
    required: true,
    default: "08:00",
  }),
  isStartNextDay: defField("check", { label: "翌日開始" }),
  endTime: defField("time", {
    label: "終了時刻",
    required: true,
    default: "17:00",
  }),
  breakMinutes: defField("breakMinutes", { required: true }),
  regulationWorkMinutes: defField("regulationWorkMinutes", { required: true }),
};

/**
 * Wrapper to define computed properties.
 * @param {*} obj
 * @param {*} properties
 */
function defineComputedProperties(obj, properties) {
  const descriptors = {};
  for (const [key, descriptor] of Object.entries(properties)) {
    descriptors[key] = {
      configurable: true,
      enumerable: true,
      ...descriptor,
    };
  }
  Object.defineProperties(obj, descriptors);
}

export default class WorkingResult extends FireModel {
  static className = "WorkingResult";
  static collectionPath = "WorkingResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  /**
   * Constructor
   * - Prevent direct instantiation of WorkingResult class.
   * @param {*} item
   */
  constructor(item = {}) {
    if (new.target === WorkingResult) {
      throw new Error(
        "WorkingResult is an abstract class and cannot be instantiated directly."
      );
    }
    super(item);
  }

  /**
   * afterInitialize
   * @param {*} item
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** Define triggers */
    let _dateAt = this.dateAt;
    defineComputedProperties(this, {
      /**
       * dateAt - Convert `dateAt` property to use getter/setter
       * - When `dateAt` is set, call `setDateAtCallback` to update dependent properties.
       */
      dateAt: {
        get() {
          return _dateAt;
        },
        set(v) {
          if (_dateAt && v.getTime() === _dateAt.getTime()) {
            return;
          }
          const newDate = new Date(v);
          newDate.setHours(0, 0, 0, 0); // 時刻部分をクリア
          _dateAt = newDate;
          this.setDateAtCallback(newDate);
        },
      },
    });

    /** Define computed properties */
    defineComputedProperties(this, {
      /**
       * key - Unique key combining date, dayType, and shiftType
       * - A unique identifier for the working result, combining `date`, `dayType`, and `shiftType`.
       */
      key: {
        get: () => {
          return `${this.date}-${this.dayType}-${this.shiftType}`;
        },
        set: () => {},
      },
      /**
       * date - Date string in YYYY-MM-DD format based on `dateAt`
       * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
       * - If `dateAt` is not set, returns an empty string.
       */
      date: {
        get: () => {
          if (!this.dateAt) return "";
          const year = this.dateAt.getFullYear();
          const month = String(this.dateAt.getMonth() + 1).padStart(2, "0"); // 月は0始まり
          const day = String(this.dateAt.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        },
        set: (v) => {},
      },
      /**
       * isSpansNextDay - Flag indicating whether the date spans from start date to end date
       * - `true` if `startTime` is later than `endTime`
       */
      isSpansNextDay: {
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      /**
       * startAt - Start date and time (Date object)
       * - Returns a Date object with `startTime` set based on `dateAt`.
       * - If `isStartNextDay` is true, add 1 day.
       */
      startAt: {
        get() {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.startTime, dateOffset);
        },
        set(v) {},
      },
      /**
       * endAt - End date and time (Date object)
       * - Returns a Date object with `endTime` set based on `dateAt`.
       * - If `isStartNextDay` is true, add 1 day.
       * - If `isSpansNextDay` is true, add 1 day.
       */
      endAt: {
        get() {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.endTime, dateOffset);
        },
        set(v) {},
      },
      /**
       * totalWorkMinutes - Total working time in minutes (excluding break time)
       * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
       * - If the difference between `endAt` and `startAt` is negative, returns 0.
       * - If `startAt` or `endAt` is not set, returns 0.
       */
      totalWorkMinutes: {
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const breakMinutes = this.breakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },
      /**
       * regularTimeWorkMinutes - Regular working time in minutes
       * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
       * - If actual working time is less than regulation time (e.g., early leave), it equals `totalWorkMinutes`.
       * - If actual working time exceeds regulation time (overtime), it equals `regulationWorkMinutes`.
       */
      regularTimeWorkMinutes: {
        get: () => {
          return Math.min(this.totalWorkMinutes, this.regulationWorkMinutes);
        },
        set: (v) => {},
      },
      /**
       * overtimeWorkMinutes - Overtime working time in minutes
       * - The value obtained by subtracting `regulationWorkMinutes` from `totalWorkMinutes`.
       * - Overtime working time is capped at 0 to prevent negative values.
       */
      overtimeWorkMinutes: {
        get: () => {
          const diff = this.totalWorkMinutes - this.regulationWorkMinutes;
          return Math.max(0, diff);
        },
        set: (v) => {},
      },
    });
  }

  /**
   * A function called when `dateAt` is set.
   * - Override this method in subclasses to add custom behavior when `dateAt` changes.
   * @param {*} v
   */
  setDateAtCallback(v) {
    this.dayType = getDayType(v);
  }

  /**
   * Returns the start hour extracted from `startTime`.
   * - Returns 0 if `startTime` is not set.
   */
  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  /**
   * Returns the start minute extracted from `startTime`.
   * - Returns 0 if `startTime` is not set.
   */
  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  /**
   * Returns the end hour extracted from `endTime`.
   * - Returns 0 if `endTime` is not set.
   */
  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  /**
   * Returns the end minute extracted from `endTime`.
   * - Returns 0 if `endTime` is not set.
   */
  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
  }
}
