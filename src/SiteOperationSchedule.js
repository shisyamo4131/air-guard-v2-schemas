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
 * [INHERIT OPERATION CLASS]
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
 * @props {Array<SiteOperationScheduleDetail>} employees - Assigned employees
 * - Array of `SiteOperationScheduleDetail` instances representing assigned employees
 * @props {Array<SiteOperationScheduleDetail>} outsourcers - Assigned outsourcers
 * - Array of `SiteOperationScheduleDetail` instances representing assigned outsourcers
 *
 * [ADDED]
 * @props {string|null} operationResultId - Associated OperationResult document ID
 * - If an OperationResult has been created based on this schedule, this property
 *   holds the ID of that OperationResult document.
 * - If this property is set, the schedule cannot be updated or deleted.
 *   Conversely, if the associated OperationResult is deleted, this property can be set to null.
 * @props {number} displayOrder - Display order
 * - Property to control the display order of schedules on the same date and shift type.
 * - Automatically assigned during creation based on existing documents.
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
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 *
 * [ADDED]
 * @states isEditable Indicates whether the instance is editable.
 * @states isNotificatedAllWorkers Indicates whether all workers have been notified.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods moveWorker Moves the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import { runTransaction } from "firebase/firestore";
import ArrangementNotification from "./ArrangementNotification.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";

const classProps = {
  ...Operation.classProps,
  /** override employees for change customClass */
  employees: defField("array", { customClass: SiteOperationScheduleDetail }),
  /** override outsourcers for change customClass */
  outsourcers: defField("array", {
    customClass: SiteOperationScheduleDetail,
  }),
  operationResultId: defField("oneLine", { hidden: true }),
  displayOrder: defField("number", { default: 0, hidden: true }),
  /** Override siteId for set hidden to true */
  siteId: defField("siteId", { required: true, hidden: true }),
  /**
   * Override regulationWorkMinutes to set hidden to true
   * - `regulationWorkMinutes` is determined by the `Agreement` of the `Site`,
   *   but the `Agreement` may be unknown when creating a site operation schedule,
   *   so this property is hidden in this class. The property itself is retained
   *   for potential future extension.
   */
  regulationWorkMinutes: defField("regulationWorkMinutes", { hidden: true }),
  /** Override `dayType` defined in WorkingResult.js to be hidden */
  dayType: defField("dayType", { hidden: true }),
};

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
    Object.defineProperties(this, {
      startTime: {
        configurable: true,
        enumerable: true,
        get() {
          return _startTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`startTime must be a string. startTime: ${v}`);
          }
          if (_startTime === v) return;
          _startTime = v;
          this.employees.forEach((emp) => (emp.startTime = v));
          this.outsourcers.forEach((out) => (out.startTime = v));
        },
      },
      endTime: {
        configurable: true,
        enumerable: true,
        get() {
          return _endTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`endTime must be a string. endTime: ${v}`);
          }
          if (_endTime === v) return;
          _endTime = v;
          this.employees.forEach((emp) => (emp.endTime = v));
          this.outsourcers.forEach((out) => (out.endTime = v));
        },
      },
      breakMinutes: {
        configurable: true,
        enumerable: true,
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
          this.employees.forEach((emp) => (emp.breakMinutes = v));
          this.outsourcers.forEach((out) => (out.breakMinutes = v));
        },
      },
      isStartNextDay: {
        configurable: true,
        enumerable: true,
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
          this.employees.forEach((emp) => (emp.isStartNextDay = v));
          this.outsourcers.forEach((out) => (out.isStartNextDay = v));
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
