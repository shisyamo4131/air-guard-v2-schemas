/*****************************************************************************
 * OperationDetail Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Base class for SiteOperationScheduleDetail and OperationResultDetail.
 * - Extends WorkingResult class, inheriting all working time calculation functionality
 * - This class is intended to be inherited by other classes so, it cannot be instantiated directly.
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
 * @props {string} siteId - Site ID
 * @props {boolean} isQualified - Qualified flag
 * @props {boolean} isOjt - OJT flag
 * --------------------------------------------------------------------------
 * @computed {string} workerId - Worker ID (read-only)
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @computed {string|null} employeeId - Employee ID (null if not applicable) (read-only)
 * @computed {string|null} outsourcerId - Outsourcer ID (null if not applicable) (read-only)
 * --------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult:
 * @props {Date} dateAt - Placement date (trigger property)
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * --------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult:
 * @computed {string} key - Unique key combining `date`, `dayType`, and `shiftType` (read-only)
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * @computed {Date} startAt - Start date and time (Date object) (read-only)
 * @computed {Date} endAt - End date and time (Date object) (read-only)
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * - Overtime work is not negative; the minimum is 0.
 * --------------------------------------------------------------------------
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
import { defField } from "./parts/fieldDefinitions.js";
import WorkingResult from "./WorkingResult.js";

const classProps = {
  id: defField("oneLine", { default: "" }),
  index: defField("number", { default: 0 }),
  isEmployee: defField("check", { default: true, required: true }),
  amount: defField("number", { default: 1, required: true, hidden: true }),
  siteId: defField("oneLine", { required: true }),
  ...WorkingResult.classProps, // Inherited from WorkingResult.js
  isQualified: defField("check", { label: "資格者" }),
  isOjt: defField("check", { label: "OJT" }),
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

export default class OperationDetail extends WorkingResult {
  static className = "稼働明細ベース";
  static collectionPath = "OperationDetails";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  /**
   * Constructor
   * - Prevent direct instantiation of OperationDetail class.
   * @param {*} item
   */
  constructor(item = {}) {
    if (new.target === OperationDetail) {
      throw new Error(
        `OperationDetail is an abstract class and cannot be instantiated directly.`
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

    /** Define computed properties */
    defineComputedProperties(this, {
      workerId: {
        get() {
          return this.isEmployee ? this.id : `${this.id}:${this.index}`;
        },
        set() {},
      },
      employeeId: {
        get() {
          return this.isEmployee ? this.id : null;
        },
        set() {},
      },
      outsourcerId: {
        get() {
          return !this.isEmployee ? this.id : null;
        },
        set() {},
      },
    });
  }
}
