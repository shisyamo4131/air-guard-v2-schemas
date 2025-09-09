import FireModel from "air-firebase-v2";
import { getDateAt, ContextualError } from "./utils/index.js";
import { defField } from "./parts/fieldDefinitions.js";
import {
  ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED,
  ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED,
  ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED,
  ARRANGEMENT_NOTIFICATION_STATUS_LEAVED,
  ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY,
} from "./constants/arrangement-notification-status.js";
import { runTransaction } from "firebase/firestore";

/**
 * @file ArrangementNotification.js
 * @description ArrangementNotification class
 * - Notifies employees about their work arrangements.
 * - The `docId` is the unique identifier for each notification document.
 *  - The document must be overwritten if it already exists.
 */
export default class ArrangementNotification extends FireModel {
  static className = "配置通知";
  static collectionPath = "ArrangementNotifications";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場稼働予定ID */
    siteOperationScheduleId: defField("oneLine", { required: true }),
    /** 作業員ID */
    workerId: defField("oneLine", { required: true }),
    /** 配置日 */
    dateAt: defField("dateAt", { label: "配置日", required: true }),
    /** 現場ID */
    siteId: defField("oneLine", { required: true }),
    /** 勤務区分 */
    shiftType: defField("shiftType", { required: true }),
    /** 開始時刻（HH:MM 形式） */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /**
     * 翌日開始フラグ
     * - 配置日である `dateAt` の翌日に実際の勤務が開始される場合に true
     */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 配置確認日時 */
    confirmedAt: defField("dateAt", { label: "配置確認日時" }),
    /** 上番日時 */
    arrivedAt: defField("time", { label: "上番日時" }),
    /** 下番日時 */
    leavedAt: defField("time", { label: "下番日時" }),
    /** 実際の開始時刻 */
    actualStartTime: defField("time", {
      label: "実際の開始時刻",
      required: true,
    }),
    /** 実際の終了時刻 */
    actualEndTime: defField("time", {
      label: "実際の終了時刻",
      required: true,
    }),
    /** 実際の休憩時間（分） */
    actualBreakMinutes: defField("breakMinutes", {
      default: 60,
      required: true,
    }),
    status: defField("arrangementNotificationStatus", { required: true }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      /** dateAt をもとに YYYY-MM-DD 形式の日付文字列を返す。 */
      date: {
        configurable: true,
        enumerable: true,
        get: () => {
          if (!this.dateAt) return "";
          const year = this.dateAt.getFullYear();
          const month = String(this.dateAt.getMonth() + 1).padStart(2, "0"); // 月は0始まり
          const day = String(this.dateAt.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        },
        set: (v) => {},
      },
      /**
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.startTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       * - `isSpansNextDay` が true の場合は1日加算。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.endTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 実際の開始日時（Date オブジェクト）
       * - `dateAt` を基に、`actualStartTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       */
      actualStartAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.actualStartTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 実際の終了日時（Date オブジェクト）
       * - `dateAt` を基に、`actualEndTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       * - `isSpansNextDay` が true の場合は1日加算。
       */
      actualEndAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.actualEndTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 開始日から終了日にかけて日付をまたぐかどうかのフラグ
       * - `startTime` が `endTime` よりも遅い場合 true
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
    });
  }

  get isTemporary() {
    return this.status === ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY;
  }

  get isArranged() {
    return this.status === ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED;
  }

  get isConfirmed() {
    return this.status === ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED;
  }

  get isArrived() {
    return this.status === ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED;
  }

  get isLeaved() {
    return this.status === ARRANGEMENT_NOTIFICATION_STATUS_LEAVED;
  }

  /**
   * Override `create`.
   * - Ensures `docId` is fixed to allow recreation of ArrangementNotification documents.
   * @param {Object} updateOptions - Options for creating the notification.
   * @param {boolean} updateOptions.useAutonumber - Whether to use autonumbering.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async create(updateOptions = {}) {
    try {
      if (!this.siteOperationScheduleId || !this.workerId) {
        throw new Error("siteOperationScheduleId and workerId are required");
      }
      const docId = `${this.siteOperationScheduleId}-${this.workerId}`;
      await super.create({ ...updateOptions, docId });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Could not update the arrangement notification directly.
   * @returns {Promise<void>}
   */
  update() {
    return Promise.reject(new Error("Update method is not implemented"));
  }

  /**
   * Change status to `TEMPORARY`.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toTemporary(updateOptions = {}) {
    const context = {
      method: "toTemporary",
      className: "ArrangementNotification",
      arguments: updateOptions,
      state: this.toObject(),
    };
    try {
      this.actualStartTime = this.startTime;
      this.actualEndTime = this.endTime;
      this.actualBreakMinutes = 60;
      this.confirmedAt = null;
      this.arrivedAt = null;
      this.leavedAt = null;
      this.status = ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY;
      await super.update(updateOptions);
    } catch (error) {
      throw new ContextualError("Failed to set status to TEMPORARY", context);
    }
  }

  /**
   * Change status to `ARRANGED`.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toArranged(updateOptions = {}) {
    const context = {
      method: "toArranged",
      className: "ArrangementNotification",
      arguments: updateOptions,
      state: this.toObject(),
    };
    try {
      this.actualStartTime = this.startTime;
      this.actualEndTime = this.endTime;
      this.actualBreakMinutes = 60;
      this.confirmedAt = null;
      this.arrivedAt = null;
      this.leavedAt = null;
      this.status = ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED;
      await super.update(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }

  /**
   * Change status to `CONFIRMED`.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toConfirmed(updateOptions = {}) {
    const context = {
      method: "toConfirmed",
      className: "ArrangementNotification",
      arguments: updateOptions,
      state: this.toObject(),
    };
    try {
      this.actualStartTime = this.startTime;
      this.actualEndTime = this.endTime;
      this.actualBreakMinutes = 60;
      this.confirmedAt = new Date();
      this.arrivedAt = null;
      this.leavedAt = null;
      this.status = ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED;
      await super.update(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }

  /**
   * Change status to `ARRIVED`.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toArrived(updateOptions = {}) {
    const context = {
      method: "toArrived",
      className: "ArrangementNotification",
      arguments: updateOptions,
      state: this.toObject(),
    };
    try {
      this.actualStartTime = this.startTime;
      this.actualEndTime = this.endTime;
      this.actualBreakMinutes = 60;
      this.confirmedAt = this.confirmAt ? this.confirmAt : new Date();
      this.arrivedAt = new Date();
      this.leavedAt = null;
      this.status = ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED;
      await super.update(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }

  /**
   * Change status to `LEAVED`.
   * @param {Object} timeOptions - Options for setting time.
   * @param {string} timeOptions.startTime - The actual start time.
   * @param {string} timeOptions.endTime - The actual end time.
   * @param {number} timeOptions.breakMinutes - The actual break minutes.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toLeaved(timeOptions = {}, updateOptions = {}) {
    const { actualStartTime, actualEndTime, actualBreakMinutes } = timeOptions;
    const context = {
      method: "toLeaved",
      className: "ArrangementNotification",
      arguments: { ...timeOptions, ...updateOptions },
      state: this.toObject(),
    };
    try {
      if (
        !actualStartTime ||
        !actualEndTime ||
        actualBreakMinutes === undefined
      ) {
        throw new ContextualError(
          "startTime, endTime, and breakMinutes are required",
          context
        );
      }
      this.actualStartTime = actualStartTime;
      this.actualEndTime = actualEndTime;
      this.actualBreakMinutes = actualBreakMinutes;
      this.confirmedAt = this.confirmAt ? this.confirmAt : new Date();
      this.arrivedAt = this.arrivedAt ? this.arrivedAt : new Date();
      this.leavedAt = new Date();
      this.status = ARRANGEMENT_NOTIFICATION_STATUS_LEAVED;
      await super.update(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }

  /**
   * Fetch ArrangementNotification documents by site operation schedule ID.
   * @param {string} id - The site operation schedule ID.
   * @returns {Promise<Array>} - The fetched documents.
   */
  static async fetchDocsBySiteOperationScheduleId(id) {
    const context = {
      method: "fetchDocsBySiteOperationScheduleId",
      className: "ArrangementNotification",
      arguments: { id },
    };
    try {
      const instance = new ArrangementNotification();
      const constraints = [["where", "siteOperationScheduleId", "==", id]];
      const result = await instance.fetchDocs({ constraints });

      return result;
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }

  /**
   * Delete multiple ArrangementNotification documents by their IDs.
   * - If a transaction is provided, the deletions will be performed within that transaction.
   * - If no transaction is provided, a new transaction will be created for the deletions.
   * - If the `workerIds` array is empty, the method will return immediately without performing any operations.
   * @param {Object} options - Options for bulk deletion.
   * @param {string} options.siteOperationScheduleId - The site operation schedule ID.
   * @param {Array<string>} [options.workerIds=[]] - An array of worker IDs whose notifications should be deleted.
   * @param {Object} [transaction] - The Firestore transaction object.
   * @returns {Promise<void>}
   */
  static async bulkDelete(options = {}, transaction) {
    const context = {
      method: "bulkDelete",
      className: "ArrangementNotification",
      arguments: { ...options, transaction },
    };
    try {
      const { siteOperationScheduleId, workerIds = [] } = options;
      if (!siteOperationScheduleId) {
        throw new Error("siteOperationScheduleId is required");
      }

      if (!Array.isArray(workerIds)) {
        throw new Error("workerIds must be an array");
      }

      const performTransaction = async (txn) => {
        // Delete all notification documents if workerIds is empty.
        if (workerIds.length === 0) {
          const fn = ArrangementNotification.fetchDocsBySiteOperationScheduleId;
          const docs = await fn(siteOperationScheduleId);
          if (docs.length === 0) return;
          await Promise.all(
            docs.map((doc) => doc.delete({ transaction: txn }))
          );
        }

        // Delete specific notification documents if workerIds are provided.
        else {
          const docIds = workerIds.map(
            (id) => `${siteOperationScheduleId}-${id}`
          );
          const promises = docIds.map((id) => {
            const instance = new ArrangementNotification({ docId: id });
            return instance.delete({ transaction: txn });
          });
          await Promise.all(promises);
        }
      };

      if (transaction) {
        await performTransaction(transaction);
      } else {
        const firestore = this.getAdapter().firestore;
        await runTransaction(firestore, performTransaction);
      }
    } catch (error) {
      throw new ContextualError(error.message, context);
    }
  }
}
