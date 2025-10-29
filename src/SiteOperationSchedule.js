/*****************************************************************************
 * SiteOperationSchedule Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends Operation class to represent a site operation schedule.
 * - Prevents updates or deletions if an associated OperationResult exists.
 * - Automatically assigns a display order based on existing documents during creation.
 * - Clears all notifications if related data have been changed during updates.
 * - Deletes all related notifications before deleting the schedule.
 * - Synchronizes properties specified below to assigned employees and outsourcers:
 *  `startTime`, `endTime`, `breakMinutes`, `isStartNextDay`
 *   [NOTE]
 *   `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes` are synchronized
 *   in the parent `Operation` class.
 * ---------------------------------------------------------------------------
 * @props {string|null} operationResultId - Associated OperationResult document ID
 * - If an OperationResult has been created based on this schedule, this property
 *   holds the ID of that OperationResult document.
 * - If this property is set, the schedule cannot be updated or deleted.
 *   Conversely, if the associated OperationResult is deleted, this property can be set to null.
 * @props {number} displayOrder - Display order
 * - Property to control the display order of schedules on the same date and shift type.
 * - Automatically assigned during creation based on existing documents.
 * ---------------------------------------------------------------------------
 * @getter {boolean} isEditable - Indicates whether the instance is editable (read-only)
 * - Returns `false` if `operationResultId` is set, `true` otherwise
 * @getter {boolean} isNotificatedAllWorkers - Indicates whether all workers have been notified (read-only)
 * - Returns `true` if all workers in the `workers` array have `hasNotification` set to `true`
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from Operation:
 * @props {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {number} requiredPersonnel - Required number of personnel
 * @props {boolean} qualificationRequired - Qualification required flag
 * @props {string} workDescription - Work description
 * @props {string} remarks - Remarks
 * @props {Array<SiteOperationScheduleDetail>} employees - Assigned employees
 * - Array of `SiteOperationScheduleDetail` instances representing assigned employees
 * @props {Array<SiteOperationScheduleDetail>} outsourcers - Assigned outsourcers
 * - Array of `SiteOperationScheduleDetail` instances representing assigned outsourcers
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via Operation):
 * @props {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {string} startTime - Start time (HH:MM format) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {boolean} isStartNextDay - Next day start flag (trigger property)
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {string} endTime - End time (HH:MM format) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {number} breakMinutes - Break time (minutes) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from Operation:
 * @computed {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @computed {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @computed {number} employeesCount - Count of assigned employees (read-only)
 * @computed {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @computed {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 * @computed {Array<SiteOperationScheduleDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via Operation):
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
 * @inherited - The following getter properties are inherited from Operation:
 * @getter {string} groupKey - Combines `siteId`, `shiftType`, and `date` to indicate operation grouping (read-only)
 * @getter {boolean} isEmployeesChanged - Indicates whether the employees have changed (read-only)
 * - Returns true if the employee IDs have changed compared to `_beforeData`
 * @getter {boolean} isOutsourcersChanged - Indicates whether the outsourcers have changed (read-only)
 * - Returns true if the outsourcer IDs have changed compared to `_beforeData`
 * @getter {Array<SiteOperationScheduleDetail>} addedWorkers - An array of workers that have been added (read-only)
 * - Workers that exist in current data but not in `_beforeData`
 * @getter {Array<SiteOperationScheduleDetail>} removedWorkers - An array of workers that have been removed (read-only)
 * - Workers that exist in `_beforeData` but not in current data
 * @getter {Array<SiteOperationScheduleDetail>} updatedWorkers - An array of workers that have been updated (read-only)
 * - Workers whose `startTime`, `isStartNextDay`, `endTime`, `breakMinutes`, `isQualified`, or `isOjt` have changed
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult (via Operation):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @method {function} create - Creates a new SiteOperationSchedule with automatic display order assignment
 * - Automatically assigns a display order based on existing documents.
 * - @param {Object} updateOptions - Options for creating the document
 * @method {function} update - Updates the SiteOperationSchedule and manages related notifications
 * - Clears all notifications if related data have been changed during updates.
 * - Updates and deletes notifications for removed or updated employees if employee assignments have changed.
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} delete - Deletes the SiteOperationSchedule and all related notifications
 * - Deletes all notifications associated with the schedule before deleting the schedule itself.
 * - @param {Object} updateOptions - Options for deleting the document
 * @method {function} addWorker - Adds a new worker with automatic siteOperationScheduleId assignment
 * - Overrides parent method to automatically set `siteOperationScheduleId`
 * - @param {Object} options - Options for adding a worker
 * - @param {number} index - Insertion position
 * ---------------------------------------------------------------------------
 * @inherited - The following methods are inherited from Operation:
 * @method {function} moveWorker - Moves the position of a worker (employee or outsourcer)
 * - @param {Object} options - Options for changing worker position
 * @method {function} changeWorker - Changes the details of a worker
 * - @param {Object} newWorker - New worker object
 * @method {function} removeWorker - Removes a worker (employee or outsourcer)
 * - @param {Object} options - Options for removing a worker
 * @method {function} setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 * - @param {string} v - The new `siteId` value
 * @method {function} setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 * - @param {string} v - The new `shiftType` value
 * @method {function} setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 * - @param {number} v - The new `regulationWorkMinutes` value
 * @method {function} groupKeyDivider - Returns an array dividing the key into siteId, shiftType, and date.
 * - @param {string} key - The combined key string
 * - @returns {Array<string>} - Array containing [siteId, shiftType, date]
 * - @throws {Error} - If the key is invalid.
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult (via Operation):
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value and synchronizes to workers.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import { runTransaction } from "firebase/firestore";
import ArrangementNotification from "./ArrangementNotification.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";

const classProps = {
  ...Operation.classProps,
  operationResultId: defField("oneLine", { hidden: true }),
  displayOrder: defField("number", { default: 0, hidden: true }),
  employees: defField("array", { customClass: SiteOperationScheduleDetail }),
  outsourcers: defField("array", {
    customClass: SiteOperationScheduleDetail,
  }),
  dayType: defField("dayType", { hidden: true }),
  regulationWorkMinutes: defField("regulationWorkMinutes", { hidden: true }),
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

export default class SiteOperationSchedule extends Operation {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static classProps = classProps;

  /***************************************************************************
   * Override `afterInitialize`
   ***************************************************************************/
  afterInitialize() {
    super.afterInitialize();

    /***********************************************************
     * TRIGGERS FOR SYNCRONIZATION TO EMPLOYEES AND OUTSOURCERS
     * ---------------------------------------------------------
     * When `startTime`, `endTime`, `breakMinutes`, and `isStartNextDay`
     * are changed on the Operation instance,
     * the corresponding properties on all employees and outsourcers
     * are automatically updated to keep them in sync.
     * [NOTE]
     * `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes` are
     * synchronized in the parent `Operation` class.
     ***********************************************************/
    let _startTime = this.startTime;
    let _endTime = this.endTime;
    let _breakMinutes = this.breakMinutes;
    let _isStartNextDay = this.isStartNextDay;
    const synchronizeToWorkers = (key, value) => {
      this.employees.forEach((emp) => {
        emp[key] = value;
      });
      this.outsourcers.forEach((out) => {
        out[key] = value;
      });
    };
    defineComputedProperties(this, {
      startTime: {
        get() {
          return _startTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`startTime must be a string. startTime: ${v}`);
          }
          if (_startTime === v) return;
          _startTime = v;
          synchronizeToWorkers("startTime", v);
        },
      },
      endTime: {
        get() {
          return _endTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`endTime must be a string. endTime: ${v}`);
          }
          if (_endTime === v) return;
          _endTime = v;
          synchronizeToWorkers("endTime", v);
        },
      },
      breakMinutes: {
        get() {
          return _breakMinutes;
        },
        set(v) {
          if (typeof v !== "number" || isNaN(v) || v < 0) {
            throw new Error(
              `breakMinutes must be a non-negative number. breakMinutes: ${v}`
            );
          }
          if (_breakMinutes === v) return;
          _breakMinutes = v;
          synchronizeToWorkers("breakMinutes", v);
        },
      },
      isStartNextDay: {
        get() {
          return _isStartNextDay;
        },
        set(v) {
          if (typeof v !== "boolean") {
            throw new Error(
              `isStartNextDay must be a boolean. isStartNextDay: ${v}`
            );
          }
          if (_isStartNextDay === v) return;
          _isStartNextDay = v;
          synchronizeToWorkers("isStartNextDay", v);
        },
      },
    });
  }
  /***************************************************************************
   * STATES
   ***************************************************************************/
  /**
   * Returns whether the schedule is editable.
   * @returns {boolean} - Whether the schedule is editable.
   */
  get isEditable() {
    return !this.operationResultId;
  }

  /**
   * Returns whether all workers have been notified.
   * @returns {boolean} - Whether all workers have been notified.
   */
  get isNotificatedAllWorkers() {
    return this.workers.every((worker) => worker.hasNotification);
  }

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  /**
   * Override `beforeUpdate`.
   * - Prevents updates if an associated OperationResult exists.
   */
  async beforeUpdate() {
    if (this._beforeData.operationResultId) {
      throw new Error(
        `Could not update this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`
      );
    }
    await super.beforeUpdate();
  }

  /**
   * Override `beforeDelete`.
   * - Prevents deletions if an associated OperationResult exists.
   */
  async beforeDelete() {
    if (this._beforeData.operationResultId) {
      throw new Error(
        `Could not delete this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`
      );
    }
    await super.beforeDelete();
  }

  /**
   * Override create method.
   * - Automatically assigns a display order based on existing documents.
   * @param {Object} updateOptions - Options for creating the notification.
   * @param {boolean} updateOptions.useAutonumber - Whether to use autonumbering.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async create(updateOptions = {}) {
    try {
      const existingDocs = await this.fetchDocs({
        constraints: [
          ["where", "siteId", "==", this.siteId],
          ["where", "shiftType", "==", this.shiftType],
          ["where", "date", "==", this.date],
          ["orderBy", "displayOrder", "desc"],
          ["limit", 1],
        ],
      });
      if (existingDocs.length > 0) {
        this.displayOrder = existingDocs[0].displayOrder + 1;
      }
      return await super.create(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "create",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /**
   * Override update method.
   * - Updates and clears notifications if related data have been changed.
   * - Updates and deletes notifications for removed or updated employees if employee assignments have changed.
   * - Just updates if no changes detected.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async update(updateOptions = {}) {
    try {
      // Returns whether the notifications should be cleared.
      // - All notifications should be cleared if any of the following properties have changed:
      //   `siteId`, `date`, `shiftType`, `startTime`, `isStartNextDay`, `endTime`, or `breakMinutes`.
      // - Returns false if there are no changes.
      const shouldClearNotifications = () => {
        const keys1 = ["siteId", "date", "shiftType"];
        const keys2 = ["startTime", "isStartNextDay", "endTime"];
        const keys3 = ["breakMinutes"];
        const changes = {};
        for (const key of [...keys1, ...keys2, ...keys3]) {
          if (this._beforeData?.[key] !== this[key]) {
            changes[key] = {
              before: this._beforeData?.[key],
              after: this[key],
            };
          }
        }
        return Object.keys(changes).length > 0 ? changes : false;
      };

      // Perform the update within a transaction.
      // - All notifications will be deleted if `shouldClearNotifications` returns not false.
      // - Notifications for removed or updated workers will be deleted.
      const performTransaction = async (txn) => {
        // Prepare arguments for bulk deletion of notifications.
        const args = { siteOperationScheduleId: this.docId };

        // Delete all notifications if related data have been changed.
        if (shouldClearNotifications()) {
          this.employees.forEach((emp) => (emp.hasNotification = false));
          this.outsourcers.forEach((out) => (out.hasNotification = false));
          await ArrangementNotification.bulkDelete(args, txn);
        }
        // Delete notifications for removed or updated workers that have been notified
        else {
          const updatedWorkers = this.updatedWorkers;
          const removedWorkers = this.removedWorkers;
          const workerIds = updatedWorkers
            .map((w) => w.workerId)
            .concat(removedWorkers.map((w) => w.workerId));
          args.workerIds = Array.from(new Set(workerIds));
          updatedWorkers.forEach((w) => (w.hasNotification = false));
          if (args.workerIds.length !== 0) {
            await ArrangementNotification.bulkDelete(args, txn);
          }
        }
        await super.update({ ...updateOptions, transaction: txn });
      };

      if (updateOptions.transaction) {
        await performTransaction(updateOptions.transaction);
      } else {
        const firestore = this.constructor.getAdapter().firestore;
        await runTransaction(firestore, performTransaction);
      }
    } catch (error) {
      this.undo();
      throw new ContextualError(error.message, {
        method: "update",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /**
   * Override delete method.
   * - Deletes all notifications associated with the schedule before deleting the schedule itself.
   * @param {Object} updateOptions - Options for deleting the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async delete(updateOptions = {}) {
    try {
      const performTransaction = async (txn) => {
        const siteOperationScheduleId = this.docId;
        await Promise.all([
          ArrangementNotification.bulkDelete({ siteOperationScheduleId }, txn),
          super.delete({ ...updateOptions, transaction: txn }),
        ]);
      };
      if (updateOptions.transaction) {
        await performTransaction(updateOptions.transaction);
      } else {
        const firestore = this.constructor.getAdapter().firestore;
        await runTransaction(firestore, performTransaction);
      }
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "delete",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /** Override addWorker for specify siteOperationScheduleId */
  addWorker(options = {}, index = 0) {
    super.addWorker({ ...options, siteOperationScheduleId: this.docId }, index);
  }
}
