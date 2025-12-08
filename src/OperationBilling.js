/*****************************************************************************
 * OperationBilling Model
 * @version 1.0.0
 * @author shisyamo4131
 *
 * - Extends OperationResult class to represent the billing of an operation.
 * - This class provides the same functionality as OperationResult but with a different semantic meaning
 *   focused on billing operations rather than general operation results.
 * - All properties, computed values, and methods are inherited from OperationResult.
 * - The `className` is set to "稼働請求" (Operation Billing) to distinguish it from OperationResult.
 * - The `create` method is overridden to indicate that creation of OperationBilling instances
 *   is not implemented, as billing records are typically generated through the OperationResult class.
 *
 * @prop {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * - Used to determine `dayType`.
 * - When `dateAt` changes, `billingDateAt` is also updated based on `agreement.cutoffDate`.
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
 * @prop {number} requiredPersonnel - Required number of personnel
 * @prop {boolean} qualificationRequired - Qualification required flag
 * @prop {string} workDescription - Work description
 * @prop {string} remarks - Remarks
 * @prop {Array<OperationResultDetail>} employees - Assigned employees
 * - Array of `OperationResultDetail` instances representing assigned employees
 * @prop {Array<OperationResultDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationResultDetail` instances representing assigned outsourcers
 * @prop {Array<OperationResultDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * @prop {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created from a SiteOperationSchedule, this property holds that ID.
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
 * - When set to true, the OperationResult is locked from edits exept for editing as OperationBilling.
 * @prop {Agreement|null} agreement - Associated Agreement object
 * - The Agreement instance associated with this OperationResult for pricing and billing information.
 * - When set, it influences billing calculations such as unit prices and billing dates.
 * @prop {boolean} allowEmptyAgreement - Flag to ignore missing Agreement
 * - When set to true, allows the OperationResult to be valid even if no Agreement is associated.
 *
 * @readonly
 * @prop {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @prop {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @prop {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @prop {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @prop {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @prop {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @prop {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * @prop {boolean} hasAgreement - Indicates if an Agreement is associated (read-only)
 * - `true` if `agreement` is set, otherwise `false`.
 * @prop {string|false} isInvalid - Validation status (read-only)
 * - Returns false if valid.
 * - Returns reason code string if invalid:
 *   - `EMPTY_BILLING_DATE`: Billing date is missing.
 *   - `EMPTY_AGREEMENT`: Agreement is missing and `allowEmptyAgreement` is false.
 * @prop {Object} statistics - Statistics of workers (read-only)
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * - Structure: { base: {...}, qualified: {...}, total: {...} }
 * - Each category contains: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - Each category also has an 'ojt' subcategory with the same structure.
 * @prop {Object} sales - Sales amounts (read-only)
 * - Contains sales calculations for base and qualified workers, including overtime breakdowns.
 * - Structure: { base: {...}, qualified: {...} }
 * - Each category contains: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * - Calculations respect `useAdjustedQuantity`, `billingUnitType`, and `includeBreakInBilling` settings.
 * @prop {number} salesAmount - Total sales amount (read-only)
 * - Sum of sales amounts for base and qualified workers with rounding applied.
 * @prop {number} tax - Calculated tax amount (read-only)
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @prop {number} billingAmount - Total billing amount including tax (read-only)
 * - Sum of `salesAmount` and `tax`.
 * @prop {string|null} billingDate - Billing date in YYYY-MM-DD format (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `billingDateAt`.
 * @prop {string} billingMonth - Billing month in YYYY-MM format (read-only)
 * @prop {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @prop {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @prop {number} employeesCount - Count of assigned employees (read-only)
 * @prop {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @prop {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 *
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
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 *
 * @method refreshBillingDateAt - Refresh billingDateAt based on dateAt and cutoffDate
 * - Updates `billingDateAt` based on the current `dateAt` and `cutoffDate` values.
 * @method addWorker - Adds a new worker (employee or outsourcer)
 * - @param {Object} options - Options for adding a worker
 * - @param {string} options.id - The worker ID (employeeId or outsourcerId)
 * - @param {boolean} [options.isEmployee=true] - Whether the worker is an employee
 * - @param {number} [index=0] - Insertion position. If -1, adds to the end
 * @method moveWorker - Moves the position of a worker (employee or outsourcer)
 * - @param {Object} options - Options for changing worker position
 * - @param {number} options.oldIndex - The original index
 * - @param {number} options.newIndex - The new index
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method changeWorker - Changes the details of a worker
 * - @param {Object} newWorker - New worker object
 * @method removeWorker - Removes a worker (employee or outsourcer)
 * - @param {Object} options - Options for removing a worker
 * - @param {string} options.workerId - The ID of the employee or outsourcer
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `siteId` value
 * @method setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `shiftType` value
 * @method setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 * - By default, does nothing.
 * - @param {number} v - The new `regulationWorkMinutes` value
 *
 * @static
 * @method groupKeyDivider
 * - Returns an array dividing the key into siteId, shiftType, and date.
 * - @param {Object|string} key - The combined key string or object
 * - @returns {Array<string>} - Array containing [siteId, shiftType, date]
 * - @throws {Error} - If the key is invalid.
 * @method toggleLock - Toggle the lock status of an OperationResult document
 * - @param {string} docId - Document ID
 * - @param {boolean} value - Lock status value
 * - @returns {Promise<void>}
 *
 * @override
 * @method create - Override create method to indicate not implemented
 * - Creation of OperationBilling instances is not implemented, as billing records are typically
 *   generated through the OperationResult class.
 * @method update - Override update method to allow editing even when isLocked is true
 * @method delete - Override delete method to allow deletion even when isLocked is true
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
   * Override beforeUpdate to skip `isLocked` check and sync customerId and apply agreement if key changed
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeUpdate(args = {}) {
    await super.beforeUpdate(args);
    // Sync customerId and apply agreement if key changed
    if (this.key === this._beforeData.key) return;
    await this._syncCustomerIdAndApplyAgreement(args);
  }

  /**
   * Override create method to disallow creation of OperationBilling instances
   * @returns
   */
  async create() {
    return Promise.reject(
      new Error(
        "[OperationBilling.js] Creation of OperationBilling is not implemented."
      )
    );
  }

  /**
   * Override delete method to disallow deletion of OperationBilling instances
   * @returns {Promise<void>}
   */
  async delete() {
    return Promise.reject(
      new Error(
        "[OperationBilling.js] Deletion of OperationBilling is not implemented."
      )
    );
  }

  /**
   * Toggle the lock status of an OperationResult document
   * @param {string} docId - Document ID
   * @param {boolean} value - Lock status value
   */
  static async toggleLock(docId, value) {
    if (!docId || typeof docId !== "string") {
      throw new Error("Invalid docId provided to toggleLock method");
    }
    if (typeof value !== "boolean") {
      throw new Error("Invalid value provided to toggleLock method");
    }
    const instance = new OperationBilling();
    const doc = await instance.fetchDoc({ docId });
    if (!doc) {
      throw new Error(`OperationResult document with ID ${docId} not found`);
    }
    doc.isLocked = value;
    await doc.update();
  }
}
