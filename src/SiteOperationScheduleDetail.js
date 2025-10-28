/*****************************************************************************
 * SiteOperationScheduleDetail ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Model representing the details of a site operation schedule.
 * - Inherits from OperationDetail.
 * ---------------------------------------------------------------------------
 * @props {string} siteOperationScheduleId - Site Operation Schedule ID
 * @props {boolean} hasNotification - Notification flag
 * ---------------------------------------------------------------------------
 * @computed {string} notificationKey - Notification key (read-only)
 * - Concatenation of `siteOperationScheduleId` and `workerId` with '-'
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from OperationDetail:
 * @props {string} id - Employee or Outsourcer document ID
 * @props {number} index - Identifier index for Outsourcer (always 0 for Employee)
 * @props {boolean} isEmployee - Employee flag (true: Employee, false: Outsourcer)
 * @props {number} amount - Number of placements (always fixed at 1)
 * @props {string} siteId - Site ID
 * @props {boolean} isQualified - Qualified flag
 * @props {boolean} isOjt - OJT flag
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from OperationDetail:
 * @computed {string} workerId - Worker ID (read-only)
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @computed {string|null} employeeId - Employee ID (null if not applicable) (read-only)
 * @computed {string|null} outsourcerId - Outsourcer ID (null if not applicable) (read-only)
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via OperationDetail):
 * @props {Date} dateAt - Placement date (trigger property)
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via OperationDetail):
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
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult (via OperationDetail):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult (via OperationDetail):
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import OperationDetail from "./OperationDetail.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  ...OperationDetail.classProps,
  siteOperationScheduleId: defField("oneLine", { required: true }),
  hasNotification: defField("check"),
};
export default class SiteOperationScheduleDetail extends OperationDetail {
  static className = "現場稼働予定明細";
  static collectionPath = "SiteOperationScheduleDetails";
  static classProps = classProps;

  /**
   * afterInitialize
   * @param {*} item
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** NOTIFICATION KEY */
    Object.defineProperties(this, {
      notificationKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.siteOperationScheduleId}-${this.workerId}`;
        },
        set() {},
      },
    });
  }
}
