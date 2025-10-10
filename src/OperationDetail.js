/*****************************************************************************
 * OperationDetail Model ver 1.0.0
 * - Base class for SiteOperationScheduleDetail and OperationResultDetail
 * - Because of this class is used as a base class for ArrangementNotification,
 *   it extends FireModel (Not BaseModel).
 * - Employee or Outsourcer document ID is stored in the id property.
 *   This is useful for specifying as a key for tables.
 * - `amount` property is always fixed at 1 (reserved for future extension).
 * - `startTime` and `endTime` are managed as strings in HH:MM format.
 * - `isEmployee` property distinguishes between Employee and Outsourcer.
 * - `employeeId` and `outsourcerId` properties can be used to get each ID (null if not applicable).
 * @props {string} id - Employee or Outsourcer document ID
 * @props {number} index - Identifier index for Outsourcer (always 0 for Employee)
 * @props {boolean} isEmployee - Employee flag (true: Employee, false: Outsourcer)
 * @props {number} amount - Number of placements (always fixed at 1)
 * @props {Date} dateAt - Placement date
 * @props {string} siteId - Site ID
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {boolean} isQualificated - Qualified flag
 * @props {boolean} isOjt - OJT flag
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * @computed {Date} startAt - Start date and time (Date object)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date
 * - `true` if `startTime` is later than `endTime`
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @computed {string} workerId - Worker ID
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @computed {string|null} employeeId - Employee ID (null if not applicable)
 * @computed {string|null} outsourcerId - Outsourcer ID (null if not applicable)
 * @accessor {number} breakHours - Break time in hours
 * @accessor {number} overTimeHours - Overtime work in hours
 * @author shisyamo4131
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import { getDateAt } from "./utils/index.js";
import { defField, MINUTES_PER_HOUR } from "./parts/fieldDefinitions.js";

const classProps = {
  id: defField("oneLine", { default: "" }),
  index: defField("number", { default: 0 }),
  isEmployee: defField("check", { default: true, required: true }),
  amount: defField("number", { default: 1, required: true, hidden: true }),
  dateAt: defField("dateAt", { label: "配置日", required: true }),
  siteId: defField("oneLine", { required: true }),
  shiftType: defField("shiftType", { required: true }),
  startTime: defField("time", { label: "開始時刻", required: true }),
  isStartNextDay: defField("check", { label: "翌日開始" }),
  endTime: defField("time", { label: "終了時刻", required: true }),
  breakMinutes: defField("breakMinutes", {
    default: 60,
    required: true,
  }),
  isQualificated: defField("check", { label: "資格者" }),
  isOjt: defField("check", { label: "OJT" }),
};
export default class OperationDetail extends FireModel {
  static className = "稼働明細ベース";
  static collectionPath = "OperationDetails";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  afterInitialize() {
    Object.defineProperties(this, {
      /** dateAt をもとに YYYY-MM-DD 形式の日付文字列を返す。 */
      date: {
        configurable: true,
        enumerable: true,
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
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.startTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       * - `isSpansNextDay` が true の場合は1日加算。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.endTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 開始日から終了日にかけて日付をまたぐかどうかのフラグ
       * - `startTime` が `endTime` よりも遅い場合 true
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const breakMinutes = this.breakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },
      workerId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : `${this.id}:${this.index}`;
        },
        set() {
          // do nothing
        },
      },
      employeeId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : null;
        },
        set() {
          // do nothing
        },
      },
      outsourcerId: {
        configurable: true,
        enumerable: true,
        get() {
          return !this.isEmployee ? this.id : null;
        },
        set() {
          // do nothing
        },
      },
    });
  }

  /**
   * Accessor for break time in hours.
   */
  get breakHours() {
    return this.breakMinutes / MINUTES_PER_HOUR;
  }
  set breakHours(v) {
    if (typeof v !== "number") {
      console.warn(
        `[${this.constructor.collectionName}.js breakHours] Expected a number, got: ${v}`
      );
      return;
    }
    this.breakMinutes = Math.round(v * MINUTES_PER_HOUR);
  }

  /**
   * Accessor for overtime work in hours.
   */
  get overTimeHours() {
    return this.overTimeWorkMinutes / MINUTES_PER_HOUR;
  }
  set overTimeHours(v) {
    if (typeof v !== "number") {
      console.warn(
        `[${this.constructor.collectionName}.js overTimeHours] Expected a number, got: ${v}`
      );
      return;
    }
    this.overTimeWorkMinutes = Math.round(v * MINUTES_PER_HOUR);
  }
}
