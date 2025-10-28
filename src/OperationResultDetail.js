/*****************************************************************************
 * OperationResultDetail Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Model representing the details of an operation result.
 * - Extends OperationDetail.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from OperationDetail:
 * @props {string} id - Employee or Outsourcer document ID
 * @props {number} index - Identifier index for Outsourcer (always 0 for Employee)
 * @props {boolean} isEmployee - Employee flag (true: Employee, false: Outsourcer)
 * @props {number} amount - Number of placements (always fixed at 1)
 * @props {string} siteId - Site ID
 * @props {boolean} isQualified - Qualified flag
 * @props {boolean} isOjt - OJT flag
 * @props {Date} dateAt - Placement date
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * --------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from OperationDetail:
 * @computed {string} workerId - Worker ID
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @computed {string|null} employeeId - Employee ID (null if not applicable)
 * @computed {string|null} outsourcerId - Outsourcer ID (null if not applicable)
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * - Overtime work is not negative; the minimum is 0.
 * @computed {string} key - Unique key combining `date`, `dayType`, and `shiftType`
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date
 * @computed {Date} startAt - Start date and time (Date object)
 * @computed {Date} endAt - End date and time (Date object)
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time)
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes
 * --------------------------------------------------------------------------
 * @inherited - The following accessor properties are inherited from OperationDetail:
 * @accessor {number} startHour - Start hour (0-23)
 * - Extracted from `startTime`.
 * @accessor {number} startMinute - Start minute (0-59)
 * - Extracted from `startTime`.
 * @accessor {number} endHour - End hour (0-23)
 * - Extracted from `endTime`.
 * @accessor {number} endMinute - End minute (0-59)
 * - Extracted from `endTime`.
 * @accessor {number} breakHours - Break time in hours (converts to/from breakMinutes)
 * - Accessor for break time in hours.
 * @accessor {number} overtimeWorkHours - Overtime work in hours (converts to/from overtimeWorkMinutes)
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult:
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import OperationDetail from "./OperationDetail.js";

const headers = [
  { title: "名前", key: "displayName" },
  { title: "開始", key: "startTime" },
  { title: "終了", key: "endTime" },
  { title: "休憩", key: "breakMinutes" },
  { title: "残業", key: "overtimeWorkMinutes" },
];
export default class OperationResultDetail extends OperationDetail {
  static className = "稼働実績明細";
  static headers = headers;
}
