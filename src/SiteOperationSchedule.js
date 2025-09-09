import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt, ContextualError } from "./utils/index.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import { runTransaction } from "firebase/firestore";
import { getDayType } from "./constants/day-type.js";
import ArrangementNotification from "./ArrangementNotification.js";

const isDebug = false;

const logDebugInfo = (message, data) => {
  if (!isDebug) return;
  const text = `[SiteOperationSchedule.js] ${message}`;
  if (data) console.log(text, data);
  if (!data) console.log(text);
};

export default class SiteOperationSchedule extends FireModel {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場ドキュメントID */
    siteId: defField("siteId", { required: true, hidden: true }),
    /**
     * 日付
     * NOTE: ユーザーが管理上で使用する日付。date プロパティ（YYYY-MM-DD 形式）に変換され、
     *       取引先への請求基準日として使用される。
     *       実際の勤務時間帯とは異なるケースがある。
     *       （例: 2025-12-31 が請求基準日で、勤務開始時刻が 2026-01-01 01:00 など）
     *       実際の稼働時間帯は `startTime`, `endTime`, `isStartNextDay` プロパティによって計算される。
     */
    dateAt: defField("dateAt", {
      label: "日付",
      required: true,
      component: {
        name: "air-date-input",
        attrs: {
          "onUpdate:modelValue": (item, updater) => {
            return ($event) => {
              updater({ dayType: getDayType($event) });
            };
          },
        },
      },
    }),
    /**
     * 曜日区分
     * - `SiteOperationSchedule` クラスでは不要なプロパティ。
     * - `OperationResult` クラスで使用される。
     */
    dayType: defField("dayType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 勤務区分 */
    shiftType: defField("shiftType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 開始時刻（HH:MM 形式） */
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 翌日開始フラグ
     * - 請求基準日である `dateAt` の翌日に実際の勤務が開始される場合に true
     */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 必要人数 */
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    /** 要資格者フラグ */
    qualificationRequired: defField("check", { label: "要資格者" }),
    /** 作業内容 */
    workDescription: defField("workDescription"),
    /** 備考 */
    remarks: defField("multipleLine", { label: "備考" }),

    /**
     * 配置従業員
     * - この稼働予定に配置される従業員のリスト。
     * - `SiteOperationScheduleDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `employees` フィールドに転用される。
     */
    employees: defField("array", { customClass: SiteOperationScheduleDetail }),

    /**
     * 配置外注先
     * - この稼働予定に配置される外注先のリスト。
     * - `SiteOperationScheduleDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `outsourcers` フィールドに転用される。
     */
    outsourcers: defField("array", {
      customClass: SiteOperationScheduleDetail,
    }),

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
   * AFTER INITIALIZE
   ***************************************************************************/
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
       * - `isSpansNextDay` が true の場合は翌日の同時刻を返す。
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
       * 開始日から終了日にかけて日付をまたぐかどうかのフラグ
       * - `startTime` が `endTime` よりも遅い場合 true
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      /**
       * `employees` プロパティから従業員のIDを取得するためのアクセサ
       */
      employeeIds: {
        configurable: true,
        enumerable: true,
        get: () => this.employees.map((emp) => emp.employeeId),
        set: (v) => {},
      },
      /**
       * `outsourcers` プロパティから外注のIDを取得するためのアクセサ
       */
      outsourcerIds: {
        configurable: true,
        enumerable: true,
        get: () => this.outsourcers.map((out) => out.outsourcerId),
        set: (v) => {},
      },
      employeesCount: {
        configurable: true,
        enumerable: true,
        get: () => this.employees.length,
        set: (v) => {},
      },
      outsourcersCount: {
        configurable: true,
        enumerable: true,
        get: () => this.outsourcers.reduce((sum, i) => sum + i.amount, 0),
        set: (v) => {},
      },
      /**
       * 必要人数（requiredPersonnel）に対して、実際に割り当てられた従業員と外注先の合計が不足しているかどうかを示すアクセサ
       * - `employees` と `outsourcers` の合計人数が `requiredPersonnel` より少ない場合に `true` を返す。
       * - `employees` と `outsourcers` の合計人数が `requiredPersonnel` 以上の場合は `false` を返す。
       * - `requiredPersonnel` が未設定の場合は `false` を返す。
       */
      isPersonnelShortage: {
        configurable: true,
        enumerable: true,
        get: () => {
          const totalRequired = this.requiredPersonnel || 0;
          const totalAssigned = this.employeesCount + this.outsourcersCount;
          return totalAssigned < totalRequired;
        },
        set: (v) => {},
      },
      workers: {
        configurable: true,
        enumerable: true,
        get: () => {
          return this.employees.concat(this.outsourcers);
        },
        set: (v) => {},
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

  /**
   * Returns whether the notifications should be cleared.
   * - Returns an object describing the changes if any of the following properties have changed:
   *   `siteId`, `shiftType`, `date`, `isStartNextDay`, `startTime`, or `endTime`.
   * - Returns false if there are no changes.
   * @returns {Object|boolean} - If changes exist, returns an object with details; otherwise, returns false.
   */
  get _shouldClearNotifications() {
    try {
      const { siteId, shiftType, date, isStartNextDay, startTime, endTime } =
        this._beforeData;
      const changes = {};

      if (siteId !== this.siteId) {
        changes.siteId = { before: siteId, after: this.siteId };
      }
      if (shiftType !== this.shiftType) {
        changes.shiftType = { before: shiftType, after: this.shiftType };
      }
      if (date !== this.date) {
        changes.date = { before: date, after: this.date };
      }
      if (isStartNextDay !== this.isStartNextDay) {
        changes.isStartNextDay = {
          before: isStartNextDay,
          after: this.isStartNextDay,
        };
      }
      if (startTime !== this.startTime) {
        changes.startTime = { before: startTime, after: this.startTime };
      }
      if (endTime !== this.endTime) {
        changes.endTime = { before: endTime, after: this.endTime };
      }

      return Object.keys(changes).length > 0 ? changes : false;
    } catch (error) {
      console.error("Error in _shouldClearNotifications:", error);
      return false;
    }
  }

  /**
   * Returns whether the employees have changed.
   * - Returns true if the employee IDs have changed.
   * - Returns false if the employee IDs have not changed or
   *   are the same even if the order has changed.
   * @returns {boolean} - Whether the employees have changed.
   */
  get _isEmployeesChanged() {
    const current = this.employeeIds || [];
    const before = this._beforeData?.employeeIds || [];
    return current.sort().join(",") !== before.sort().join(",");
  }

  /**
   * Returns whether the outsourcers have changed.
   * - Returns true if the outsourcer IDs have changed.
   * - Returns false if the outsourcer IDs have not changed or
   *   are the same even if the order has changed.
   * @returns {boolean} - Whether the outsourcers have changed.
   */
  get _isOutsourcersChanged() {
    const current = this.outsourcerIds || [];
    const before = this._beforeData?.outsourcerIds || [];
    return current.sort().join(",") !== before.sort().join(",");
  }

  /**
   * Returns a filtered array of workers that have been removed.
   * @returns {Array<SiteOperationScheduleDetail>} - Array of removed workers.
   */
  get _removedWorkers() {
    const before = this._beforeData?.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const isRemoved = (emp) =>
      !current.some((e) => e.workerId === emp.workerId);
    return before.filter(isRemoved);
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
        siteOperationScheduleId: this.docId,
        workerId: worker.workerId,
        dateAt: this.dateAt,
        siteId: this.siteId,
        shiftType: this.shiftType,
        startTime: worker.startTime,
        endTime: worker.endTime,
        isStartNextDay: worker.isStartNextDay,
        actualStartTime: worker.startTime,
        actualEndTime: worker.endTime,
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

  /**
   * Override `beforeEdit`.
   * - Synchronize `startTime`, `endTime`, and `isStartNextDay` of all employees
   *   and outsourcers before create of update `SiteOperationSchedule` document.
   * - All `SiteOperationScheduleDetail` instances should be synchronized with
   *   the `SiteOperationSchedule`.
   * @returns {Promise<void>}
   */
  beforeEdit() {
    // internal method for synchronize to `SiteOperationScheduleDetail`.
    const syncToDetails = () => {
      const { startTime, endTime, isStartNextDay } = this._beforeData;
      const isDetailShouldBeSynced =
        this.startTime !== startTime ||
        this.endTime !== endTime ||
        this.isStartNextDay !== isStartNextDay;
      if (!isDetailShouldBeSynced) return;
      this.employees.forEach((emp) => {
        emp.startTime = this.startTime;
        emp.endTime = this.endTime;
        emp.isStartNextDay = this.isStartNextDay;
      });
      this.outsourcers.forEach((out) => {
        out.startTime = this.startTime;
        out.endTime = this.endTime;
        out.isStartNextDay = this.isStartNextDay;
      });
    };

    return new Promise((resolve, reject) => {
      try {
        syncToDetails();
        resolve();
      } catch (error) {
        console.error("Error in beforeEdit:", error);
        reject(error);
      }
    });
  }

  /***************************************************************************
   * PRIVATE METHODS
   ***************************************************************************/
  /**
   * Adds a new employee to the `employees` property with the specified ID.
   * - The element added is an instance of `SiteOperationScheduleDetail`.
   * - Throws an error if the specified employee ID already exists in the `employees` property.
   * - `startAt`, `endAt`, and `breakMinutes` are taken from the current instance.
   * - `employeeId` is required.
   * @param {string} employeeId - The employee's ID.
   * @param {number} [index=-1] - Insertion position. If -1, adds to the end.
   * @returns {SiteOperationScheduleDetail} - The added employee.
   * @throws {Error} - If the employee ID already exists.
   */
  _addEmployee(employeeId, index = -1) {
    try {
      if (this.employees.some((emp) => emp.workerId === employeeId)) {
        throw new Error(`Employee with ID ${employeeId} already exists.`);
      }
      const newEmployee = new SiteOperationScheduleDetail({
        id: employeeId,
        amount: 1,
        isEmployee: true,
        startTime: this.startTime,
        endTime: this.endTime,
      });
      if (index === -1) {
        this.employees.push(newEmployee);
      } else {
        this.employees.splice(index, 0, newEmployee);
      }
      return newEmployee;
    } catch (error) {
      throw new ContextualError("Failed to add employee", {
        method: "_addEmployee",
        className: "SiteOperationSchedule",
        arguments: { employeeId, index },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Adds a new outsourcer to the `outsourcers` property with the specified ID.
   * - The element added is an instance of `SiteOperationScheduleDetail`.
   * - If the specified outsourcer ID already exists in the `outsourcers` property, increases the amount.
   * - `startTime`, `endTime`, and `isStartNextDay` are taken from the current instance.
   * - `outsourcerId` is required.
   * @param {string} outsourcerId - The outsourcer's ID.
   * @param {number} [amount=1] - Number of outsourcers.
   * @param {number} [index=-1] - Insertion position. If -1, adds to the end.
   */
  _addOutsourcer(outsourcerId, index = -1) {
    try {
      // Get max index number of existing same outsourcers
      const maxIndex = this.outsourcers.reduce((result, out) => {
        if (out.outsourcerId === outsourcerId) {
          return Math.max(result, Number(out.index));
        }
        return result;
      }, 0);

      // Create new SiteOperationScheduleDetail instance.
      const newOutsourcer = new SiteOperationScheduleDetail({
        id: outsourcerId,
        index: maxIndex + 1,
        amount: 1,
        isEmployee: false,
        startTime: this.startTime,
        endTime: this.endTime,
      });

      if (index === -1) {
        this.outsourcers.push(newOutsourcer);
      } else {
        this.outsourcers.splice(index, 0, newOutsourcer);
      }
      return newOutsourcer;
    } catch (error) {
      throw new ContextualError("Failed to add outsourcer", {
        method: "_addOutsourcer",
        className: "SiteOperationSchedule",
        arguments: { outsourcerId, index },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Changes the position of an employee in the employees array.
   * @param {number} oldIndex - The original index.
   * @param {number} newIndex - The new index.
   */
  _changeEmployee(oldIndex, newIndex) {
    try {
      if (newIndex > this.employees.length - 1) {
        throw new Error(
          `Employees must be placed before outsourcers. newIndex: ${newIndex}, employees.length: ${this.employees.length}`
        );
      }
      if (newIndex < 0 || newIndex >= this.employees.length) {
        throw new Error(`Invalid new index: ${newIndex}`);
      }
      const employee = this.employees.splice(oldIndex, 1)[0];
      this.employees.splice(newIndex, 0, employee);
    } catch (error) {
      throw new ContextualError("Failed to change employee position", {
        method: "_changeEmployee",
        className: "SiteOperationSchedule",
        arguments: { oldIndex, newIndex },
        state: this.toObject(),
        error,
      });
    }
  }
  /**
   * Changes the position of an outsourcer in the outsourcers array.
   * - `oldIndex` and `newIndex` are offset by the number of employees.
   * @param {number} oldIndex - The original index.
   * @param {number} newIndex - The new index.
   */
  _changeOutsourcer(oldIndex, newIndex) {
    try {
      if (newIndex <= this.employees.length - 1) {
        throw new Error(
          `Outsourcers must be placed after employees. newIndex: ${newIndex}, employees.length: ${this.employees.length}`
        );
      }
      const internalOldIndex = Math.max(0, oldIndex - this.employees.length);
      const internalNewIndex = Math.max(0, newIndex - this.employees.length);
      if (internalOldIndex < 0 || internalOldIndex >= this.outsourcers.length) {
        throw new Error(`Invalid old index: ${internalOldIndex}`);
      }
      if (internalNewIndex < 0 || internalNewIndex >= this.outsourcers.length) {
        throw new Error(`Invalid new index: ${internalNewIndex}`);
      }
      const outsourcer = this.outsourcers.splice(internalOldIndex, 1)[0];
      this.outsourcers.splice(internalNewIndex, 0, outsourcer);
    } catch (error) {
      throw new ContextualError("Failed to change outsourcer position", {
        method: "_changeOutsourcer",
        className: "SiteOperationSchedule",
        arguments: { oldIndex, newIndex },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Removes the employee corresponding to `employeeId` from this.employees.
   * @param {string} employeeId - The employee's ID
   * @throws {Error} - If the employee ID is not found.
   */
  _removeEmployee(employeeId) {
    try {
      const index = this.employees.findIndex(
        (emp) => emp.workerId === employeeId
      );
      if (index === -1) {
        throw new Error(`Employee with ID "${employeeId}" not found.`);
      }
      this.employees.splice(index, 1);
    } catch (error) {
      throw new ContextualError("Failed to remove employee", {
        method: "_removeEmployee",
        className: "SiteOperationSchedule",
        arguments: { employeeId },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Removes the outsourcer corresponding to `outsourcerId` from this.outsourcers.
   * - Throws an error for invalid values or if not found.
   * @param {string} outsourcerId - The ID of the outsourcer.
   * @throws {Error} - If the outsourcer ID is not found.
   */
  _removeOutsourcer(outsourcerId) {
    try {
      const index = this.outsourcers.findIndex(
        (out) => out.workerId === outsourcerId
      );
      if (index === -1) {
        throw new Error(`Outsourcer with ID "${outsourcerId}" not found.`);
      }
      this.outsourcers.splice(index, 1);
    } catch (error) {
      throw new ContextualError("Failed to remove outsourcer", {
        method: "_removeOutsourcer",
        className: "SiteOperationSchedule",
        arguments: { outsourcerId },
        state: this.toObject(),
        error,
      });
    }
  }

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  /**
   * Adds a new worker.
   * - Calls the appropriate method based on the value of `isEmployee`.
   * @param {Object} options - Options for adding a worker.
   * @param {string} options.id - The worker ID (employeeId or outsourcerId)
   * @param {boolean} [options.isEmployee=true] - Whether the worker is an employee
   * @param {number} [options.index=0] - Insertion position
   */
  addWorker(options) {
    try {
      const { id, isEmployee = true, index = 0 } = options;
      if (isEmployee) {
        this._addEmployee(id, index);
      } else {
        this._addOutsourcer(id, index);
      }
    } catch (error) {
      throw new ContextualError("Failed to add worker", {
        method: "addWorker",
        className: "SiteOperationSchedule",
        arguments: { workerId, isEmployee, index },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Changes the position of workers.
   * @param {Object} options - Options for changing worker position.
   * @param {number} options.oldIndex - The original index.
   * @param {number} options.newIndex - The new index.
   * @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer.
   */
  changeWorker(options) {
    try {
      const { oldIndex, newIndex, isEmployee = true } = options;
      if (typeof oldIndex !== "number" || typeof newIndex !== "number") {
        throw new Error(
          "oldIndex and newIndex are required and must be numbers."
        );
      }
      if (isEmployee) {
        this._changeEmployee(oldIndex, newIndex);
      } else {
        this._changeOutsourcer(oldIndex, newIndex);
      }
    } catch (error) {
      throw new ContextualError("Failed to change worker position", {
        method: "changeWorker",
        className: "SiteOperationSchedule",
        arguments: options,
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * Removes an employee or outsourcer from the schedule.
   * @param {Object} options - Options for removing a worker.
   * @param {string} options.workerId - The ID of the employee or outsourcer.
   * @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer.
   */
  removeWorker(options) {
    try {
      const { workerId, isEmployee = true } = options;
      if (isEmployee) {
        this._removeEmployee(workerId);
      } else {
        this._removeOutsourcer(workerId);
      }
    } catch (error) {
      throw new ContextualError("Failed to remove worker", {
        method: "removeWorker",
        className: "SiteOperationSchedule",
        arguments: { workerId, isEmployee },
        state: this.toObject(),
      });
    }
  }

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
