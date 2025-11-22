/*****************************************************************************
 * SiteOperationSchedule Model ver 1.1.0
 * @version 1.1.0
 * @author shisyamo4131
 *
 * @update 2025-11-22 v1.1.0 - Moved `duplicate`, `notify`, `syncToOperationResult`,
 *                             and `toEvent` methods from client side code.
 *
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
 *
 * @prop {string|null} operationResultId - Associated OperationResult document ID
 * - If an OperationResult has been created based on this schedule, this property
 *   holds the ID of that OperationResult document.
 * - If this property is set, the schedule cannot be updated or deleted.
 *   Conversely, if the associated OperationResult is deleted, this property can be set to null.
 *
 * @prop {number} displayOrder - Display order
 * - Property to control the display order of schedules on the same date and shift type.
 * - Automatically assigned during creation based on existing documents.
 *
 * @getter {boolean} isEditable - Indicates whether the instance is editable (read-only)
 * - Returns `false` if `operationResultId` is set, `true` otherwise
 *
 * @getter {boolean} isNotificatedAllWorkers - Indicates whether all workers have been notified (read-only)
 * - Returns `true` if all workers in the `workers` array have `hasNotification` set to `true`
 *
 * @inherited - The following properties are inherited from Operation:
 * @prop {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {number} requiredPersonnel - Required number of personnel
 *
 * @prop {boolean} qualificationRequired - Qualification required flag
 *
 * @prop {string} workDescription - Work description
 *
 * @prop {string} remarks - Remarks
 *
 * @prop {Array<SiteOperationScheduleDetail>} employees - Assigned employees
 * - Array of `SiteOperationScheduleDetail` instances representing assigned employees
 *
 * @prop {Array<SiteOperationScheduleDetail>} outsourcers - Assigned outsourcers
 * - Array of `SiteOperationScheduleDetail` instances representing assigned outsourcers
 *
 * @inherited - The following properties are inherited from WorkingResult (via Operation):
 * @prop {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 *
 * @prop {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {string} startTime - Start time (HH:MM format) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {boolean} isStartNextDay - Next day start flag (trigger property)
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {string} endTime - End time (HH:MM format) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {number} breakMinutes - Break time (minutes) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @prop {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @inherited - The following computed properties are inherited from Operation:
 * @prop {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 *
 * @prop {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 *
 * @prop {number} employeesCount - Count of assigned employees (read-only)
 *
 * @prop {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 *
 * @prop {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 *
 * @prop {Array<SiteOperationScheduleDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 *
 * @inherited - The following computed properties are inherited from WorkingResult (via Operation):
 * @prop {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 *
 * @prop {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 *
 * @prop {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 *
 * @prop {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 *
 * @prop {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 *
 * @prop {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 *
 * @prop {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 *
 * @inherited - The following getter properties are inherited from Operation:
 * @getter {string} groupKey - Combines `siteId`, `shiftType`, and `date` to indicate operation grouping (read-only)
 *
 * @getter {boolean} isEmployeesChanged - Indicates whether the employees have changed (read-only)
 * - Returns true if the employee IDs have changed compared to `_beforeData`
 *
 * @getter {boolean} isOutsourcersChanged - Indicates whether the outsourcers have changed (read-only)
 * - Returns true if the outsourcer IDs have changed compared to `_beforeData`
 *
 * @getter {Array<SiteOperationScheduleDetail>} addedWorkers - An array of workers that have been added (read-only)
 * - Workers that exist in current data but not in `_beforeData`
 *
 * @getter {Array<SiteOperationScheduleDetail>} removedWorkers - An array of workers that have been removed (read-only)
 * - Workers that exist in `_beforeData` but not in current data
 *
 * @getter {Array<SiteOperationScheduleDetail>} updatedWorkers - An array of workers that have been updated (read-only)
 * - Workers whose `startTime`, `isStartNextDay`, `endTime`, `breakMinutes`, `isQualified`, or `isOjt` have changed
 *
 * @inherited - The following getter properties are inherited from WorkingResult (via Operation):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 *
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 *
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 *
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 *
 * @method duplicate - Duplicates the SiteOperationSchedule for specified dates
 * - Creates new SiteOperationSchedule documents for each specified date,
 *   excluding the original date and avoiding duplicates.
 * - Returns an array of newly created SiteOperationSchedule instances.
 *
 * @method notify - Creates arrangement notifications for workers who have not been notified
 * - Creates ArrangementNotification documents for workers with `hasNotification` set to `false`.
 * - Updates the `hasNotification` flag to `true` for all employees and outsourcers.
 *
 * @method syncToOperationResult - Creates an OperationResult document based on the current SiteOperationSchedule
 * - The OperationResult document ID will be the same as the SiteOperationSchedule document ID.
 * - Sets the `operationResultId` property of the SiteOperationSchedule to the created OperationResult document ID.
 * - Accepts an `agreement` object containing necessary properties for creating the OperationResult.
 *
 * @method toEvent - Converts the SiteOperationSchedule instance to a VCalendar event object
 * - Returns an object with properties required for displaying events in Vuetify's VCalendar component.
 * - Includes `name`, `start`, `end`, `color`, and a reference to the original `SiteOperationSchedule` instance.
 *
 * @override
 * @method create - Creates a new SiteOperationSchedule with automatic display order assignment
 *
 * @method update - Updates the SiteOperationSchedule and manages related notifications
 * - Clears all notifications if related data have been changed during updates.
 * - Updates and deletes notifications for removed or updated employees if employee assignments have changed.
 *
 * @method delete - Deletes the SiteOperationSchedule and all related notifications
 * - Deletes all notifications associated with the schedule before deleting the schedule itself.
 *
 * @method addWorker - Adds a new worker with automatic siteOperationScheduleId assignment
 * - Overrides parent method to automatically set `siteOperationScheduleId`
 *
 * @inherited - The following methods are inherited from Operation:
 * @method moveWorker - Moves the position of a worker (employee or outsourcer)
 *
 * @method changeWorker - Changes the details of a worker
 *
 * @method removeWorker - Removes a worker (employee or outsourcer)
 *
 * @method setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 *
 * @method setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 *
 * @method setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 *
 * @static
 * @method groupKeyDivider Returns an array dividing the key into siteId, shiftType, and date.
 *
 * @inherited - The following method is inherited from WorkingResult (via Operation):
 * @method setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value and synchronizes to workers.
 *****************************************************************************/
import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import ArrangementNotification from "./ArrangementNotification.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import OperationResult from "./OperationResult.js";

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

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
  ];

  /***************************************************************************
   * Override `afterInitialize`
   ***************************************************************************/
  afterInitialize() {
    super.afterInitialize();
    const synchronizeToWorkers = (key, value) => {
      this.employees.forEach((emp) => {
        emp[key] = value;
      });
      this.outsourcers.forEach((out) => {
        out[key] = value;
      });
    };

    /***********************************************************
     * TRIGGERS FOR SYNCRONIZATION TO EMPLOYEES AND OUTSOURCERS
     * ---------------------------------------------------------
     * When `docId`, `startTime`, `endTime`, `breakMinutes`, and
     * `isStartNextDay` are changed on the SiteOperationSchedule
     * instance, the corresponding properties on all employees
     * and outsourcers are automatically updated to keep them in sync.
     * Especially important is that when `docId` changes, the
     * `siteOperationScheduleId` on all employees and outsourcers
     * is updated accordingly.
     * [NOTE]
     * `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes` are
     * synchronized in the parent `Operation` class.
     ***********************************************************/
    let _docId = this.docId;
    let _startTime = this.startTime;
    let _endTime = this.endTime;
    let _breakMinutes = this.breakMinutes;
    let _isStartNextDay = this.isStartNextDay;
    defineComputedProperties(this, {
      docId: {
        get() {
          return _docId;
        },
        set(v) {
          if (_docId === v) return;
          _docId = v;
          synchronizeToWorkers("siteOperationScheduleId", v);
        },
      },
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
   * @param {function} updateOptions.callback - The callback function.
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
   * @param {function} updateOptions.callback - The callback function.
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
        // const firestore = this.constructor.getAdapter().firestore;
        // await runTransaction(firestore, performTransaction);
        await this.constructor.runTransaction(performTransaction);
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
   * @param {function} updateOptions.callback - The callback function.
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
        // const firestore = this.constructor.getAdapter().firestore;
        // await runTransaction(firestore, performTransaction);
        await this.constructor.runTransaction(performTransaction);
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

  /**
   * 現場稼働予定ドキュメントを指定された日付分複製します。
   * - 複製された各ドキュメントは新規作成され、元のドキュメントとは別のIDを持ちます。
   * - 複製先の日付が元のドキュメントの日付と同じ場合、その日付分の複製は行われません。
   * @param {Array<Date|string>} dates - 複製先の日付の配列。Dateオブジェクトまたは日付文字列で指定します。
   * @returns {Promise<Array<SiteOperationSchedule>>}
   */
  async duplicate(dates = []) {
    if (!this.docId) {
      throw new Error("不正な処理です。作成前のスケジュールは複製できません。");
    }
    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("複製する日付を配列で指定してください。");
    }
    if (dates.some((d) => !(d instanceof Date) && typeof d !== "string")) {
      throw new TypeError(
        "日付の指定が無効です。Dateオブジェクトか文字列で指定してください。"
      );
    }
    if (dates.length > 20) {
      throw new Error("一度に複製できるスケジュールは最大20件です。");
    }
    try {
      // 日付が Date オブジェクトであれば日付文字列に変換しつつ、元のスケジュールと同じ日付は除外し、
      // 加えて重複も除外する。
      const targetDates = dates
        .map((date) => {
          if (date instanceof Date) return dayjs(date).format("YYYY-MM-DD");
          return date;
        })
        .filter((date) => date !== this.date)
        .reduce((unique, date) => {
          if (!unique.includes(date)) unique.push(date);
          return unique;
        }, []);

      // 複製するための現場稼働予定インスタンスを生成
      const newSchedules = targetDates.map((date) => {
        const instance = this.clone();
        instance.docId = "";
        instance.dateAt = new Date(date);
        instance.operationResultId = null;
        return instance;
      });

      // トランザクションで一括作成
      await this.constructor.runTransaction(async (transaction) => {
        await Promise.all(
          newSchedules.map((schedule) => schedule.create({ transaction }))
        );
      });

      return newSchedules;
    } catch (error) {
      throw new ContextualError("現場稼働予定の複製処理に失敗しました。", {
        method: "duplicate",
        className: "SiteOperationSchedule",
        arguments: { dates },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * 配置通知を作成します。
   * - 現在配置通知がなされてない作業員に対してのみ配置通知ドキュメントを作成します。
   * - 全作業員の配置通知フラグが true に更新されます。
   * @returns {Promise<void>}
   */
  async notify() {
    try {
      // 未通知である作業員を抽出
      const targetWorkers = this.workers.filter((w) => !w.hasNotification);

      // 配置通知ドキュメントを作成するためのインスタンス配列を生成
      const notifications = targetWorkers.map((worker) => {
        return new ArrangementNotification({
          ...worker,
          actualStartTime: worker.startTime,
          actualEndTime: worker.endTime,
          actualBreakMinutes: worker.breakMinutes,
        });
      });

      // 配置通知インスタンスがなければ処理終了
      if (notifications.length === 0) {
        return;
      }

      // 従業員、外注先の通知済みフラグを更新
      this.employees.forEach((emp) => (emp.hasNotification = true));
      this.outsourcers.forEach((out) => (out.hasNotification = true));

      // トランザクションで配置通知ドキュメントを一括作成し、作成済みフラグを更新
      await this.constructor.runTransaction(async (transaction) => {
        await Promise.all([
          ...notifications.map((n) => n.create({ transaction })),
          this.update({ transaction }),
        ]);
      });
    } catch (error) {
      this.undo();
      throw new ContextualError(
        `配置通知作成処理に失敗しました。: ${error.message}`,
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
   * 現在のインスタンスから稼働実績ドキュメントを作成します。
   * - 稼働実績ドキュメントの ID は現場稼働予定ドキュメントの ID と同一になります。
   *   既に存在する場合は上書きされます。
   * - 現場稼働予定ドキュメントの `operationResultId` プロパティに
   *   作成された稼働実績ドキュメントの ID が設定されます。（当該ドキュメント ID と同一）
   * @param {Object} agreement - 取極め情報オブジェクト。稼働実績ドキュメントの生成に必要なプロパティを含みます。
   */
  async syncToOperationResult(agreement, notifications = {}) {
    if (!this.docId) {
      throw new Error(
        "不正な処理です。作成前の現場稼働予定から稼働実績を作成することはできません。"
      );
    }

    if (!notifications) {
      throw new Error("配置通知の指定が必要です。");
    }
    const converter = (prop) => {
      return this[prop].map((w) => {
        const notification = notifications[w.notificationKey];
        if (!notification) return w;
        const {
          actualStartTime: startTime,
          actualEndTime: endTime,
          actualBreakMinutes: breakMinutes,
          actualIsStartNextDay: isStartNextDay,
        } = notification;
        return new SiteOperationScheduleDetail({
          ...w.toObject(),
          startTime,
          endTime,
          breakMinutes,
          isStartNextDay,
        });
      });
    };
    const employees = converter("employees");
    const outsourcers = converter("outsourcers");
    try {
      // Create OperationResult instance based on the current SiteOperationSchedule
      const operationResult = new OperationResult({
        ...this.toObject(),
        employees,
        outsourcers,
        agreement: agreement || null,
        siteOperationScheduleId: this.docId,
      });
      operationResult.refreshBillingDateAt();
      await this.constructor.runTransaction(async (transaction) => {
        const docRef = await operationResult.create({
          docId: this.docId,
          transaction,
        });
        this.operationResultId = docRef.id;
        await this.update({ transaction });
      });
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
   * この現場稼働予定インスタンスを、Vuetify の VCalendar コンポーネントで
   * 表示可能なイベントオブジェクト形式に変換して返します。
   *
   * VCalendar でイベントを表示する際に必要な主要なプロパティ（タイトル、開始日時、
   * 終了日時、色など）を設定します。
   *
   * @returns {object} VCalendar イベントオブジェクト。以下のプロパティを含みます:
   *   @property {string} name - イベントのタイトル。`requiredPersonnel`（必要人数）と `workDescription`（作業内容）から生成されます。
   *   @property {Date} start - イベントの開始日時。インスタンスの `startAt` プロパティ（Dateオブジェクト）がそのまま使用されます。
   *   @property {Date} end - イベントの終了日時。
   *     **注意点:** 本来はインスタンスの `endAt` プロパティを使用すべきですが、
   *     VCalendar の仕様（または過去のバージョンでの挙動）により、日をまたぐイベントを
   *     `endAt` で正確に指定すると、カレンダー上で複数の日にまたがって
   *     同一イベントが複数描画されてしまう問題がありました。
   *     これを回避するため、現状では `startAt` と同じ値を設定し、
   *     イベントが開始日のみに単一のイベントとして表示されるようにしています。
   *     もし将来的に日をまたぐ期間を正確にカレンダー上で表現する必要が生じた場合は、
   *     VCalendar のバージョンアップや設定変更、またはこの `end` プロパティの
   *     扱いについて再検討が必要です。
   *   @property {string} color - イベントの表示色。`shiftType` プロパティの値に応じて、
   *     日勤 (`day`) の場合は 'orange'、夜勤 (`night`) の場合は 'navy' が設定されます。
   *   @property {SiteOperationSchedule} item - この `SiteOperationSchedule` インスタンス自身への参照です。
   *     カレンダー上でイベントがクリックされた際などに、元のスケジュールデータへ
   *     アクセスするために利用できます。
   */
  toEvent() {
    const name = `${this.requiredPersonnel} 名: ${
      this.workDescription || "通常警備"
    }`;
    const color = !this.isEditable
      ? "grey"
      : this.shiftType === "DAY"
      ? "orange"
      : "indigo";
    return {
      name,
      start: this.dateAt,
      end: this.dateAt,
      color,
      item: this,
    };
  }
}
