import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import { runTransaction } from "firebase/firestore";
import ArrangementNotification from "./ArrangementNotification.js";
import OperationResult from "./OperationResult.js";

const isDebug = false;

const logDebugInfo = (message, data) => {
  if (!isDebug) return;
  const text = `[SiteOperationSchedule.js] ${message}`;
  if (data) console.log(text, data);
  if (!data) console.log(text);
};

/**
 * @file SiteOperationSchedule.js
 * @description A class representing a site operation schedule.
 * - Inherits from the Operation class.
 */
export default class SiteOperationSchedule extends Operation {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static classProps = {
    ...Operation.classProps,
    /**
     * 現場ドキュメントID
     * - `Operation` にそもそも含まれるが、`SiteOperationSchedule` クラスでは
     *   `hidden: true` に設定して、管理画面上での編集を不可にする。
     */
    siteId: defField("siteId", { required: true, hidden: true }),
    /** 稼働実績ドキュメントID */
    // 当該現場稼働予定ドキュメントから作成された稼働実績のドキュメントID。
    // このプロパティに値がセットされている場合、当該現場稼働予定ドキュメントから稼働実績ドキュメントを作成することはできないようにする。
    // -> 稼働実績ドキュメントの重複を抑制。
    // 逆に、当該現場稼働予定ドキュメントから、これに対応する稼働実績ドキュメントを削除することは可能で、
    // その場合はこのプロパティを null に設定する。
    operationResultId: defField("oneLine", { hidden: true }),

    /** 表示順序 */
    // 同一勤務区分、同一日における現場稼働予定の表示順序を制御するためのプロパティ。
    displayOrder: defField("number", { default: 0, hidden: true }),
  };

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

  /**
   * Returns whether the notifications should be cleared.
   * - Returns an object describing the changes if any of the following properties have changed:
   *   `siteId`, `date`, `shiftType`, `startTime`, `isStartNextDay`, `endTime`, or `breakMinutes`.
   * - Returns false if there are no changes.
   * @returns {Object|boolean} - If changes exist, returns an object with details; otherwise, returns false.
   */
  get _shouldClearNotifications() {
    const keys1 = ["siteId", "date", "shiftType"];
    const keys2 = ["startTime", "isStartNextDay", "endTime", "breakMinutes"];
    const changes = {};
    for (const key of [...keys1, ...keys2]) {
      if (this._beforeData?.[key] !== this[key]) {
        changes[key] = {
          before: this._beforeData?.[key],
          after: this[key],
        };
      }
    }
    return Object.keys(changes).length > 0 ? changes : false;
  }

  /**
   * Returns a filtered array of workers that have not been notified yet.
   * - Each element is `SiteOperationScheduleDetail` instance.
   * @returns {Array<SiteOperationScheduleDetail>} - Array of workers that should be notified.
   */
  get _workersShouldBeNotified() {
    if (this.workers.length === 0) return [];
    const result = this.workers.filter((worker) => !worker.hasNotification);
    return result;
  }

  /**
   * Returns an array of `ArrangementNotification` instances for each worker
   * that should be notified (i.e., those who have not been notified yet).
   * @returns {Array<ArrangementNotification>} - Array of ArrangementNotification instances.
   */
  get _notificationsShouldBeNotified() {
    return this._workersShouldBeNotified.map((worker) => {
      return new ArrangementNotification({
        ...worker,
        actualStartTime: worker.startTime,
        actualEndTime: worker.endTime,
        actualBreakMinutes: worker.breakMinutes,
      });
    });
  }

  /**
   * Returns the worker IDs that have been removed or updated.
   * @returns {Array<string>} - List of worker IDs that have been removed or updated.
   */
  get _workerIdsRemovedOrUpdated() {
    // Create a list of notification IDs for removed workers.
    const dueToRemoved = () => {
      // early return if there are no removed workers.
      if (this._removedWorkers.length === 0) return [];

      // filter out workers that have been notified
      const notificated = this._removedWorkers.filter(
        (worker) => worker.hasNotification
      );

      // early return if there are no notified workers.
      if (notificated.length === 0) return [];

      // create notification IDs.
      const ids = notificated.map((worker) => {
        return worker.workerId;
      });

      return ids;
    };

    // Create a list of notification IDs for edited employees.
    const dueToEdited = () => {
      const notificatedWorkers = this.workers.filter(
        (worker) => worker.hasNotification
      );
      return notificatedWorkers.reduce((acc, worker) => {
        const before = this._beforeData.workers.find(
          ({ workerId }) => workerId === worker.workerId
        );
        if (
          (before && before.startTime !== worker.startTime) ||
          before.endTime !== worker.endTime ||
          before.breakMinutes !== worker.breakMinutes ||
          before.isStartNextDay !== worker.isStartNextDay
        ) {
          acc.push(worker.workerId);
        }
        return acc;
      }, []);
    };
    const idsDueToRemoved = dueToRemoved();
    const idsDueToEdited = dueToEdited();

    return Array.from(new Set([...idsDueToRemoved, ...idsDueToEdited]));
  }

  /***************************************************************************
   * METHODS
   ***************************************************************************/

  /**
   * Duplicates the current schedule for the specified dates.
   * - Creates a new SiteOperationSchedule instance for each date.
   * - Schedules with the same date as this instance are not duplicated.
   * @param {Array<Date|string>} dates - Array of dates to duplicate for
   * @returns {Promise<Array<SiteOperationSchedule>>} - Array of created schedules
   * @throws {Error} - If dates is not an array, is empty, or exceeds 20 items
   */
  async duplicate(dates) {
    try {
      if (!this.docId) {
        throw new Error(
          "Document must be created or fetched to this instance before duplication."
        );
      }
      if (!Array.isArray(dates) || dates.length === 0) {
        throw new Error("Please specify the dates to duplicate as an array.");
      }
      if (dates.some((d) => !(d instanceof Date) && typeof d !== "string")) {
        throw new TypeError("Invalid date specification.");
      }
      if (dates.length > 20) {
        throw new Error("You can duplicate up to 20 schedules at a time.");
      }

      const targetDates = dates.filter((date) => date !== this.date);
      const newSchedules = targetDates.map((date) => {
        const instance = new SiteOperationSchedule({
          ...this.toObject(),
          docId: "",
          dateAt: new Date(date),
          operationResultId: "",
        });
        return instance;
      });

      const firestore = this.constructor.getAdapter().firestore;
      await runTransaction(firestore, async (transaction) => {
        await Promise.all(
          newSchedules.map((schedule) => schedule.create({ transaction }))
        );
      });

      return newSchedules;
    } catch (error) {
      throw new ContextualError("Failed to duplicate schedules", {
        method: "duplicate",
        className: "SiteOperationSchedule",
        arguments: { dates },
        state: this.toObject(),
        error,
      });
    }
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
      await super.create(updateOptions);
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
    logDebugInfo("'update' is starting.", updateOptions);
    try {
      const performTransaction = async (txn) => {
        // Clear all notifications if related data have been changed.
        // siteId, shiftType, date, isStartNextDay, startTime, endTime
        if (this._shouldClearNotifications) {
          logDebugInfo(
            "Some related data to notifications have been changed.",
            this._shouldClearNotifications
          );
          logDebugInfo(
            "All existing notifications will be cleared.",
            Object.fromEntries(
              this.workers.map((worker) => [
                worker.workerId,
                worker.hasNotification,
              ])
            )
          );
          const fn = ArrangementNotification.bulkDelete;
          await fn({ siteOperationScheduleId: this.docId }, txn);
          this.employees.forEach((emp) => (emp.hasNotification = false));
          this.outsourcers.forEach((out) => (out.hasNotification = false));
        } else {
          logDebugInfo(
            "Any related data to notifications have not been changed."
          );
          // Delete notifications for updated or removed workers that have been notified.
          const targetWorkerIds = this._workerIdsRemovedOrUpdated;
          if (targetWorkerIds.length !== 0) {
            const fn = ArrangementNotification.bulkDelete;
            await fn(
              {
                siteOperationScheduleId: this.docId,
                workerIds: targetWorkerIds,
              },
              txn
            );

            this.workers.forEach((worker) => {
              if (targetWorkerIds.some((id) => id === worker.workerId)) {
                worker.hasNotification = false;
              }
            });
          }
        }
        await super.update({ transaction: txn });
      };

      if (updateOptions.transaction) {
        await performTransaction(updateOptions.transaction);
      } else {
        const firestore = this.constructor.getAdapter().firestore;
        await runTransaction(firestore, performTransaction);
      }
    } catch (error) {
      this.restore();
      throw new ContextualError(error.message, {
        method: "update",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    } finally {
      logDebugInfo("'update' has ended.");
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

  /**
   * Creates `ArrangementNotification` documents for each employee in the schedule.
   * @returns {Promise<void>}
   */
  async notify() {
    // for debugging
    if (isDebug) console.log(`'notify' is called.`);

    try {
      if (this._notificationsShouldBeNotified.length === 0) {
        if (isDebug) console.log("No new notifications to create.");
        return;
      }
      const firestore = this.constructor.getAdapter().firestore;
      await runTransaction(firestore, async (transaction) => {
        await this._createPendingNotifications(transaction);
        this.employees.forEach((emp) => (emp.hasNotification = true));
        this.outsourcers.forEach((out) => (out.hasNotification = true));
        await this.update({ transaction });
      });

      // for debugging
      if (isDebug) {
        console.log("All pending notifications created successfully.");
      }
    } catch (error) {
      this.restore();
      throw new ContextualError(
        `Failed to notify SiteOperationSchedule: ${error.message}`,
        {
          method: "notify",
          className: "SiteOperationSchedule",
          arguments: {},
          state: this.toObject(),
        }
      );
    }
  }

  /**
   * Syncs the current SiteOperationSchedule instance to an OperationResult.
   * @param {Object} agreement - The agreement data to sync.
   */
  async syncToOperationResult(agreement) {
    try {
      if (!this.docId) {
        throw new Error(
          "Document must be created or fetched to this instance before syncing to OperationResult."
        );
      }
      if (!agreement) {
        throw new Error("Agreement is required.");
      }

      await runTransaction(
        this.constructor.getAdapter().firestore,
        async (transaction) => {
          const operationResult = new OperationResult({
            ...agreement,
            ...this.toObject(),
            siteOperationScheduleId: this.docId,
          });
          const docRef = await operationResult.create({
            docId: this.docId,
            transaction,
          });
          this.operationResultId = docRef.id;
          await this.update({ transaction });
        }
      );
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "syncToOperationResult()",
        className: "SiteOperationSchedule",
        arguments: { agreement },
        state: this.toObject(),
      });
    }
  }
  /**
   * Creates notifications for newly added employees who do not yet have notifications.
   * @param {Object} transaction - Firestore transaction object
   */
  async _createPendingNotifications(transaction) {
    // for debugging.
    if (isDebug) console.log(`'_createPendingNotifications' is called.`);
    try {
      // Throw error if Firestore transaction is not provided.
      if (!transaction) throw new Error("Transaction is required.");

      const targets = this._notificationsShouldBeNotified;
      if (isDebug) {
        console.log("Creating pending notifications for employees:", targets);
      }

      if (targets.length === 0) {
        if (isDebug) console.log("No new notifications to create.");
        return;
      }

      const promises = targets.map((notify) => notify.create({ transaction }));
      await Promise.all(promises);

      if (isDebug) {
        console.log(
          `${targets.length} Pending notifications created successfully.`
        );
        console.table(targets);
      }
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "_createPendingNotifications()",
        className: "SiteOperationSchedule",
        arguments: {},
        state: this.toObject(),
      });
    }
  }
}
