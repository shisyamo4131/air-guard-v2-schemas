/*****************************************************************************
 * OperationBilling Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends Operation class to represent the billing of an operation.
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Synchronized `regulationWorkMinutes` to all employees and outsourcers.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @props {string} siteId - Site document ID
 * @props {Date} dateAt - Date of operation (placement date)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * - Indicates the maximum working time treated as regular working hours.
 * - A new value will be synchronized to all `employees` and `outsourcers`.
 * @props {number} requiredPersonnel - Required number of personnel
 * @props {boolean} qualificationRequired - Qualification required flag
 * @props {string} workDescription - Work description
 * @props {string} remarks - Remarks
 * @props {Array<OperationDetail>} employees - Assigned employees
 * - Array of `OperationDetail` instances representing assigned employees
 * @props {Array<OperationDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationDetail` instances representing assigned outsourcers
 * @props {number} unitPriceBase - Basic unit price
 * - Unit price for work within regulation work minutes.
 * @props {number} overtimeUnitPriceBase - Overtime unit price
 * - Unit price for overtime work exceeding regulation work minutes.
 * @props {number} unitPriceQualified - Qualified unit price
 * - Unit price for qualified workers within regulation work minutes.
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price
 * - Unit price for qualified workers exceeding regulation work minutes.
 * @props {string} billingUnitType - Billing unit type
 * - Billing unit defined in `BILLING_UNIT_TYPE`.
 * @props {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created based on a SiteOperationSchedule document,
 *   this property holds the ID of that source document.
 * @props {object} statistics - Statistics of workers
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * @props {object} sales - Sales amounts
 * - Contains sales amounts for base and qualified workers, including overtime breakdowns.
 *
 * [NOTE]
 * `statistics` and `sales` are treated as computed properties in OperationResult class.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * @computed {string} dayType - Day type based on `dateAt`
 * @computed {Date} startAt - Start date and time (Date object)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date
 * - `true` if `startTime` is later than `endTime`
 * @computed {Array<string>} employeeIds - Array of employee IDs from `employees`
 * @computed {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers`
 * @computed {number} employeesCount - Count of assigned employees
 * @computed {number} outsourcersCount - Count of assigned outsourcers (sum of amounts)
 * @computed {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 * @computed {Array<OperationDetail>} workers - Combined array of `employees` and `outsourcers`
 * @computed {object} statistics - Statistics of workers
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * @computed {object} sales - Sales amounts
 * - Contains sales amounts for base and qualified workers, including overtime breakdowns.
 * @computed {number} salesAmount - Total sales amount
 * - Sum of sales amounts for base and qualified workers.
 * @computed {number} tax - Calculated tax amount
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @computed {number} billingAmount - Total billing amount including tax
 * - Sum of `salesAmount` and `tax`.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods moveWorker Moves the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import OperationResult from "./OperationResult.js";

export default class OperationBilling extends OperationResult {
  static className = "稼働請求";

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
    { title: "売上金額", key: "salesAmount", value: "salesAmount" },
  ];

  /**
   * Override `afterInitialize`.
   * - Call super method with `statistics` disabled.
   */
  afterInitialize() {
    super.afterInitialize({ statistics: false });
  }
}
