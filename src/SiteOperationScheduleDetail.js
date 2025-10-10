/*****************************************************************************
 * SiteOperationScheduleDetail ver 1.0.0
 * - Extends OperationDetail
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
 * @props {string} siteOperationScheduleId - Site Operation Schedule ID
 * @props {boolean} hasNotification - Notification flag
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
 * @computed {string} notificationKey - Notification key
 * @accessor {number} breakHours - Break time in hours
 * @accessor {number} overTimeHours - Overtime work in hours
 * @author shisyamo4131
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

  afterInitialize() {
    super.afterInitialize();
    Object.defineProperties(this, {
      notificationKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.siteOperationScheduleId}-${this.workerId}`;
        },
        set() {
          // do nothing
        },
      },
    });
  }
}
