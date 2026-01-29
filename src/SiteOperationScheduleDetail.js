/*****************************************************************************
 * SiteOperationScheduleDetail ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Model representing the details of a site operation schedule.
 * - Inherits from OperationDetail.
 * ---------------------------------------------------------------------------
 * @property {string} siteOperationScheduleId - Site Operation Schedule ID
 * @property {boolean} hasNotification - 配置通知が作成されているかどうかのフラグ。SiteOperationSchedule クラスから設定される。
 * @property {string} notificationKey - Notification key (read-only)
 * - `siteOperationScheduleId` と `workerId` を `-` で連結したキー。`ArrangemntNotification` ドキュメントIDと一致する。
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from OperationDetail:
 * @property {string} id - Employee or Outsourcer document ID
 * @property {number} index - Identifier index for Outsourcer (always 0 for Employee)
 * @property {boolean} isEmployee - Employee flag (true: Employee, false: Outsourcer)
 * @property {number} amount - Number of placements (always fixed at 1)
 * @property {string} siteId - Site ID
 * @property {boolean} isQualified - Qualified flag
 * @property {boolean} isOjt - OJT flag
 * @property {string} workerId - Worker ID (read-only)
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @property {string|null} employeeId - Employee ID (null if not applicable) (read-only)
 * @property {string|null} outsourcerId - Outsourcer ID (null if not applicable) (read-only)
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via OperationDetail):
 * @property {Date} dateAt - Placement date (trigger property)
 * @property {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @property {string} shiftType - `DAY` or `NIGHT`
 * @property {string} startTime - Start time (HH:MM format)
 * @property {boolean} isStartNextDay - Next day start flag
 * @property {string} endTime - End time (HH:MM format)
 * @property {number} breakMinutes - Break time (minutes)
 * @property {number} regulationWorkMinutes - Regulation work minutes
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via OperationDetail):
 * @property {string} key - Unique key combining `date`, `dayType`, and `shiftType` (read-only)
 * @property {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * @property {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * @property {Date} startAt - Start date and time (Date object) (read-only)
 * @property {Date} endAt - End date and time (Date object) (read-only)
 * @property {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * @property {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * @property {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
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
