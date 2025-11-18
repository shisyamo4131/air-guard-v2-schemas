/*****************************************************************************
 * OperationBilling Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends OperationResult class to represent the billing of an operation.
 * - This class provides the same functionality as OperationResult but with a different semantic meaning
 *   focused on billing operations rather than general operation results.
 * - All properties, computed values, and methods are inherited from OperationResult.
 * - The `className` is set to "稼働請求" (Operation Billing) to distinguish it from OperationResult.
 * - The `create` method is overridden to indicate that creation of OperationBilling instances
 *   is not implemented, as billing records are typically generated through the OperationResult class.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from OperationResult:
 * @prop {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationBilling was created from a SiteOperationSchedule, this property holds that ID.
 * - If this property is set, the instance cannot be deleted.
 * @prop {boolean} useAdjustedQuantity - Flag to indicate if adjusted quantities are used for billing
 * @prop {number} adjustedQuantityBase - Adjusted quantity for base workers
 * - Quantity used for billing base workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedOvertimeBase - Adjusted overtime for base workers
 * - Overtime used for billing base workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedQuantityQualified - Adjusted quantity for qualified workers
 * - Quantity used for billing qualified workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedOvertimeQualified - Adjusted overtime for qualified workers
 * - Overtime used for billing qualified workers when `useAdjustedQuantity` is true.
 * @prop {Date} billingDateAt - Billing date
 * - The date used for billing purposes.
 * @prop {boolean} isLocked - Lock flag
 * - When set to true, the OperationBilling is locked from edits exept for editing as OperationBilling.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from Operation (via OperationResult):
 * @prop {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {number} requiredPersonnel - Required number of personnel
 * @prop {boolean} qualificationRequired - Qualification required flag
 * @prop {string} workDescription - Work description
 * @prop {string} remarks - Remarks
 * @prop {Array<OperationResultDetail>} employees - Assigned employees
 * - Array of `OperationResultDetail` instances representing assigned employees
 * @prop {Array<OperationResultDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationResultDetail` instances representing assigned outsourcers
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from Agreement (via OperationResult):
 * @prop {number} unitPriceBase - Base unit price (JPY)
 * @prop {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @prop {number} unitPriceQualified - Qualified unit price (JPY)
 * @prop {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @prop {string} billingUnitType - Billing unit type
 * @prop {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 * @prop {number} cutoffDate - Cutoff date value from CutoffDate.VALUES
 * - The cutoff date for billing, using values defined in the CutoffDate utility class.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via OperationResult):
 * @prop {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @prop {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {string} startTime - Start time (HH:MM format)
 * @prop {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @prop {string} endTime - End time (HH:MM format)
 * @prop {number} breakMinutes - Break time (minutes)
 * @prop {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from OperationResult:
 * @computed {Object} statistics - Statistics of workers (read-only)
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * - Structure: { base: {...}, qualified: {...}, total: {...} }
 * @computed {Object} sales - Sales amounts (read-only)
 * - Contains sales calculations for base and qualified workers, including overtime breakdowns.
 * - Structure: { base: {...}, qualified: {...} }
 * @computed {number} salesAmount - Total sales amount (read-only)
 * - Sum of sales amounts for base and qualified workers with rounding applied.
 * @computed {number} tax - Calculated tax amount (read-only)
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @computed {number} billingAmount - Total billing amount including tax (read-only)
 * - Sum of `salesAmount` and `tax`.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from Operation (via OperationResult):
 * @computed {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @computed {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @computed {number} employeesCount - Count of assigned employees (read-only)
 * @computed {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @computed {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 * @computed {Array<OperationResultDetail>} workers - Combined array of `employees` and `outsourcers` (read-only)
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via OperationResult):
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @computed {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from Operation (via OperationResult):
 * @getter {string} groupKey - Combines `siteId`, `shiftType`, and `date` to indicate operation grouping (read-only)
 * @getter {boolean} isEmployeesChanged - Indicates whether the employees have changed (read-only)
 * - Returns true if the employee IDs have changed compared to `_beforeData`
 * @getter {boolean} isOutsourcersChanged - Indicates whether the outsourcers have changed (read-only)
 * - Returns true if the outsourcer IDs have changed compared to `_beforeData`
 * @getter {Array<OperationResultDetail>} addedWorkers - An array of workers that have been added (read-only)
 * - Workers that exist in current data but not in `_beforeData`
 * @getter {Array<OperationResultDetail>} removedWorkers - An array of workers that have been removed (read-only)
 * - Workers that exist in `_beforeData` but not in current data
 * @getter {Array<OperationResultDetail>} updatedWorkers - An array of workers that have been updated (read-only)
 * - Workers whose `startTime`, `isStartNextDay`, `endTime`, `breakMinutes`, `isQualified`, or `isOjt` have changed
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult (via OperationResult):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @inherited - The following methods are inherited from OperationResult:
 * @method {function} beforeDelete - Override method to prevent deletion with siteOperationScheduleId
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Throws an error if deletion is attempted on an instance created from SiteOperationSchedule.
 * ---------------------------------------------------------------------------
 * @inherited - The following methods are inherited from Operation (via OperationResult):
 * @method {function} addWorker - Adds a new worker (employee or outsourcer)
 * - @param {Object} options - Options for adding a worker
 * - @param {string} options.id - The worker ID (employeeId or outsourcerId)
 * - @param {boolean} [options.isEmployee=true] - Whether the worker is an employee
 * - @param {number} [index=0] - Insertion position. If -1, adds to the end
 * @method {function} moveWorker - Moves the position of a worker (employee or outsourcer)
 * - @param {Object} options - Options for changing worker position
 * - @param {number} options.oldIndex - The original index
 * - @param {number} options.newIndex - The new index
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method {function} changeWorker - Changes the details of a worker
 * - @param {Object} newWorker - New worker object
 * @method {function} removeWorker - Removes a worker (employee or outsourcer)
 * - @param {Object} options - Options for removing a worker
 * - @param {string} options.workerId - The ID of the employee or outsourcer
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method {function} setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `siteId` value
 * @method {function} setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `shiftType` value
 * @method {function} setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 * - By default, does nothing.
 * - @param {number} v - The new `regulationWorkMinutes` value
 * @static
 * @method groupKeyDivider
 * Returns an array dividing the key into siteId, shiftType, and date.
 * @param {Object|string} key - The combined key string or object
 * @returns {Array<string>} - Array containing [siteId, shiftType, date]
 * @throws {Error} - If the key is invalid.
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult (via OperationResult):
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value and synchronizes to workers.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import OperationResult from "./OperationResult.js";

export default class OperationBilling extends OperationResult {
  static className = "稼働請求";

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
    { title: "売上金額", key: "salesAmount", value: "salesAmount" },
  ];

  async create() {
    return Promise.reject(new Error("[OperationBilling.js] Not implemented."));
  }
}
