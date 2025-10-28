/*****************************************************************************
 * ArrangementNotification Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Model representing arrangement notifications for employees extending SiteOperationScheduleDetail.
 * - The `docId` is fixed to `${siteOperationScheduleId}-${workerId}` to allow recreation of documents.
 * - Status-based state management with specific transition methods.
 * - Overrides `totalWorkMinutes` to use actual work times instead of scheduled times.
 * - Direct updates are disabled; use status transition methods instead.
 * ---------------------------------------------------------------------------
 * @props {Date} confirmedAt - Confirmation date and time
 * @props {string} arrivedAt - Arrival time (HH:MM format)
 * @props {string} leavedAt - Leave time (HH:MM format)
 * @props {string} actualStartTime - Actual start time (HH:MM format)
 * @props {boolean} actualIsStartNextDay - Actual next day start flag
 * @props {string} actualEndTime - Actual end time (HH:MM format)
 * @props {number} actualBreakMinutes - Actual break time (minutes)
 * @props {string} status - Arrangement notification status
 * ---------------------------------------------------------------------------
 * @computed {Date} actualStartAt - Actual start date and time (Date object) (read-only)
 * - Returns a Date object with `actualStartTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} actualEndAt - Actual end date and time (Date object) (read-only)
 * - Returns a Date object with `actualEndTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding actual break time) (read-only)
 * - **OVERRIDE**: Calculated using actual times instead of scheduled times.
 * - Calculated as the difference between `actualEndAt` and `actualStartAt` minus `actualBreakMinutes`
 * ---------------------------------------------------------------------------
 * @getter {boolean} isTemporary - Temporary status flag (read-only)
 * - Returns `true` if status is `TEMPORARY`
 * @getter {boolean} isArranged - Arranged status flag (read-only)
 * - Returns `true` if status is `ARRANGED`
 * @getter {boolean} isConfirmed - Confirmed status flag (read-only)
 * - Returns `true` if status is `CONFIRMED`
 * @getter {boolean} isArrived - Arrived status flag (read-only)
 * - Returns `true` if status is `ARRIVED`
 * @getter {boolean} isLeaved - Leaved status flag (read-only)
 * - Returns `true` if status is `LEAVED`
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from SiteOperationScheduleDetail:
 * @props {string} siteOperationScheduleId - Site Operation Schedule ID
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from OperationDetail (via SiteOperationScheduleDetail):
 * @props {string} id - Employee or Outsourcer document ID
 * @props {number} index - Identifier index for Outsourcer (always 0 for Employee)
 * @props {boolean} isEmployee - Employee flag (true: Employee, false: Outsourcer)
 * @props {number} amount - Number of placements (always fixed at 1)
 * @props {string} siteId - Site ID
 * @props {boolean} isQualified - Qualified flag
 * @props {boolean} isOjt - OJT flag
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via SiteOperationScheduleDetail):
 * @props {Date} dateAt - Placement date (trigger property)
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from OperationDetail (via SiteOperationScheduleDetail):
 * @computed {string} workerId - Worker ID (read-only)
 * - For Employee, it's the same as `id`, for Outsourcer, it's a concatenation of `id` and `index` with ':'
 * @computed {string|null} employeeId - Employee ID (null if not applicable) (read-only)
 * @computed {string|null} outsourcerId - Outsourcer ID (null if not applicable) (read-only)
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via SiteOperationScheduleDetail):
 * @computed {string} key - Unique key combining `date`, `dayType`, and `shiftType` (read-only)
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @computed {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult (via SiteOperationScheduleDetail):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @removed - The following properties from SiteOperationScheduleDetail are removed:
 * @removed {boolean} hasNotification - Notification flag (not needed in ArrangementNotification)
 * @removed {string} notificationKey - Notification key (not needed in ArrangementNotification)
 * ---------------------------------------------------------------------------
 * @method {function} create - Override to fix `docId` for recreation
 * - Ensures `docId` is set to `${siteOperationScheduleId}-${workerId}`.
 * - Allows recreation of ArrangementNotification documents.
 * - @param {Object} updateOptions - Options for creating the document
 * @method {function} update - Disabled
 * - Direct updates to ArrangementNotification are not allowed.
 * - Throws an error if called. Use status transition methods instead.
 * @method {function} toTemporary - Change status to `TEMPORARY`
 * - Sets actual times to scheduled times, resets timestamps, updates status.
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} toArranged - Change status to `ARRANGED`
 * - Sets actual times to scheduled times, resets timestamps, updates status.
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} toConfirmed - Change status to `CONFIRMED`
 * - Sets actual times to scheduled times, sets `confirmedAt`, resets other timestamps, updates status.
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} toArrived - Change status to `ARRIVED`
 * - Sets actual times to scheduled times, sets `arrivedAt`, retains or sets `confirmedAt`, updates status.
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} toLeaved - Change status to `LEAVED`
 * - Sets actual times from parameters, sets `leavedAt`, retains or sets other timestamps, updates status.
 * - @param {Object} timeOptions - Time options (actualStartTime, actualEndTime, actualBreakMinutes, actualIsStartNextDay)
 * - @param {Object} updateOptions - Options for updating the document
 * @method {function} fetchDocsBySiteOperationScheduleId - Get documents by `siteOperationScheduleId` (static)
 * - @param {string} id - The site operation schedule ID
 * - @returns {Promise<Array>} - The fetched documents
 * @method {function} bulkDelete - Bulk delete arrangement notifications (static)
 * - @param {Object} options - Deletion options (siteOperationScheduleId, workerIds)
 * - @param {Object} [transaction] - Optional Firestore transaction object
 * - @returns {Promise<void>}
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult (via SiteOperationScheduleDetail):
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import { getDateAt, ContextualError } from "./utils/index.js";
import { defField } from "./parts/fieldDefinitions.js";
import {
  ARRANGEMENT_NOTIFICATION_STATUS,
  ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED,
  ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED,
  ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED,
  ARRANGEMENT_NOTIFICATION_STATUS_LEAVED,
  ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY,
} from "./constants/arrangement-notification-status.js";
import { runTransaction } from "firebase/firestore";

const classProps = {
  ...SiteOperationScheduleDetail.classProps,
  confirmedAt: defField("dateAt", { label: "配置確認日時" }),
  arrivedAt: defField("time", { label: "上番日時" }),
  leavedAt: defField("time", { label: "下番日時" }),
  actualStartTime: defField("time", {
    label: "実際の開始時刻",
    required: true,
  }),
  actualIsStartNextDay: defField("check", { label: "翌日開始" }),
  actualEndTime: defField("time", {
    label: "実際の終了時刻",
    required: true,
  }),
  actualBreakMinutes: defField("breakMinutes", {
    default: 60,
    required: true,
  }),
  status: defField("arrangementNotificationStatus", { required: true }),
};

export default class ArrangementNotification extends SiteOperationScheduleDetail {
  static className = "配置通知";
  static collectionPath = "ArrangementNotifications";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  static STATUS = ARRANGEMENT_NOTIFICATION_STATUS;

  afterInitialize(item = {}) {
    // Define computed properties that are defined on SiteOperationScheduleDetail
    super.afterInitialize(item);

    // Define additional computed properties specific to ArrangementNotification
    Object.defineProperties(this, {
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
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.actualStartAt;
          const end = this.actualEndAt;
          const breakMinutes = this.actualBreakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },
    });

    // Remove inherited properties that are not needed in ArrangementNotification
    delete this.hasNotification;
    delete this.notificationKey;
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
    const context = {
      method: "create",
      className: "ArrangementNotification",
      arguments: updateOptions,
      state: this.toObject(),
    };
    try {
      if (!this.siteOperationScheduleId || !this.workerId) {
        throw new Error("siteOperationScheduleId and workerId are required");
      }
      const docId = `${this.siteOperationScheduleId}-${this.workerId}`;
      return await super.create({ ...updateOptions, docId });
    } catch (error) {
      throw new ContextualError(error.message, context);
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
      this.actualIsStartNextDay = this.isStartNextDay;
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
      this.actualIsStartNextDay = this.isStartNextDay;
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
      this.actualIsStartNextDay = this.isStartNextDay;
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
      this.actualIsStartNextDay = this.isStartNextDay;
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
   * @param {boolean} timeOptions.actualIsStartNextDay - The actual flag indicating if the start time is on the next day.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callBack - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async toLeaved(timeOptions = {}, updateOptions = {}) {
    const {
      actualStartTime,
      actualEndTime,
      actualBreakMinutes,
      actualIsStartNextDay,
    } = timeOptions;
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
      this.actualIsStartNextDay = actualIsStartNextDay;
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
