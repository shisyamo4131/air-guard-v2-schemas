/*****************************************************************************
 * OperationResultDetail Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Model representing the details of an operation result.
 * - Extends OperationDetail.
 * ---------------------------------------------------------------------------
 * [INHERIT]
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
 * [INHERIT]
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
 * [INHERIT]
 * @accessor {number} breakHours - Break time in hours
 * @accessor {number} overtimeHours - Overtime work in hours
 *****************************************************************************/
import OperationDetail from "./OperationDetail.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  ...OperationDetail.classProps,
  regulationWorkMinutes: defField("regulationWorkMinutes", {
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
};
const headers = [
  { title: "名前", key: "displayName" },
  { title: "開始", key: "startTime" },
  { title: "終了", key: "endTime" },
  { title: "休憩", key: "breakMinutes" },
  { title: "残業", key: "overtimeWorkMinutes" },
];
export default class OperationResultDetail extends OperationDetail {
  static className = "稼働実績明細";
  static classProps = classProps;
  static headers = headers;
}
