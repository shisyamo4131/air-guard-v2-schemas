import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import { runTransaction } from "firebase/firestore";
import ArrangementNotification from "./ArrangementNotification.js";

/**
 * @file SiteOperationSchedule.js
 * @description A class representing a site operation schedule.
 * - Inherits from the Operation class.
 *
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 *
 * @states isEditable Indicates whether the instance is editable.
 * @states isNotificatedAllWorkers Indicates whether all workers have been notified.
 *
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods changeWorker Changes the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *
 * @overrides beforeUpdate Prevents updates if an associated operation result exists.
 * @overrides create Creates a new document with the display order set.
 * @overrides update Updates the document. Delete all notifications if related data have been changed.
 *                   Notifications for removed or updated workers also will be deleted.
 * @overrides delete Deletes the document with all related notifications.
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

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  async beforeUpdate() {
    await super.beforeUpdate();
    if (this._beforeData.operationResultId) {
      throw new Error(
        `Could not update this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`
      );
    }
  }

  beforeDelete() {
    return new Promise((resolve, reject) => {
      if (this._beforeData.operationResultId) {
        const error = new Error(
          `Could not delete this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`
        );
        reject(error);
      }
      resolve();
    });
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
}
