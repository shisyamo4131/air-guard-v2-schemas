/*****************************************************************************
 * OperationDetail Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Base class for SiteOperationScheduleDetail and OperationResultDetail
 * - Because of this class is used as a base class for ArrangementNotification,
 *   it extends FireModel (Not BaseModel).
 * - Employee or Outsourcer document ID is stored in the id property.
 *   This is useful for specifying as a key for tables.
 * - `amount` property is always fixed at 1 (reserved for future extension).
 * - `startTime` and `endTime` are managed as strings in HH:MM format.
 * - `isEmployee` property distinguishes between Employee and Outsourcer.
 * - `employeeId` and `outsourcerId` properties can be used to get each ID (null if not applicable).
 * --------------------------------------------------------------------------
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
 * --------------------------------------------------------------------------
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
 * --------------------------------------------------------------------------
 * @accessor {number} breakHours - Break time in hours
 * @accessor {number} overtimeWorkHours - Overtime work in hours
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import { defField, MINUTES_PER_HOUR } from "./parts/fieldDefinitions.js";
import {
  classProps as workingResultClassProps,
  accessors as workingResultAccessors,
} from "./WorkingResult.js";

const classProps = {
  id: defField("oneLine", { default: "" }),
  index: defField("number", { default: 0 }),
  isEmployee: defField("check", { default: true, required: true }),
  amount: defField("number", { default: 1, required: true, hidden: true }),
  siteId: defField("oneLine", { required: true }),
  ...workingResultClassProps, // Inherited from WorkingResult.js
  isQualificated: defField("check", { label: "資格者" }),
  isOjt: defField("check", { label: "OJT" }),
};
export default class OperationDetail extends FireModel {
  static className = "稼働明細ベース";
  static collectionPath = "OperationDetails";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  /**
   * Override `afterInitialize`
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** Define computed properties from WorkingResult.js */
    workingResultAccessors(this);

    Object.defineProperties(this, {
      workerId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : `${this.id}:${this.index}`;
        },
        set() {},
      },
      employeeId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : null;
        },
        set() {},
      },
      outsourcerId: {
        configurable: true,
        enumerable: true,
        get() {
          return !this.isEmployee ? this.id : null;
        },
        set() {},
      },
      overtimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          const totalWork =
            this.totalWorkMinutes > this.regulationWorkMinutes
              ? this.totalWorkMinutes - this.regulationWorkMinutes
              : 0;
          return totalWork;
        },
        set() {},
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
  get overtimeWorkHours() {
    return this.overtimeWorkMinutes / MINUTES_PER_HOUR;
  }
  set overtimeWorkHours(v) {
    if (typeof v !== "number") {
      console.warn(
        `[${this.constructor.collectionName}.js overtimeWorkHours] Expected a number, got: ${v}`
      );
      return;
    }
    this.overtimeWorkMinutes = Math.round(v * MINUTES_PER_HOUR);
  }
}
