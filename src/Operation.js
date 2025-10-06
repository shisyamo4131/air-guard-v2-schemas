import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt, ContextualError } from "./utils/index.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import { DAY_TYPE_DEFAULT, getDayType } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";

/**
 * @file .src/Operation.js
 * @description A base class of SiteOperationSchedule and OperationResult.
 *
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 *
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods changeWorker Changes the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 */
export default class Operation extends FireModel {
  static className = "稼働ベース";
  static collectionPath = "Operations";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場ドキュメントID */
    siteId: defField("siteId", {
      required: true,
      component: {
        attrs: {
          api: () => fetchDocsApi(Site),
          clearable: true,
          fetchItemByKeyApi: () => fetchItemByKeyApi(Site),
        },
      },
    }),
    /**
     * 日付
     * NOTE: ユーザーが管理上で使用する日付。date プロパティ（YYYY-MM-DD 形式）に変換され、
     *       取引先への請求基準日として使用される。
     *       実際の勤務時間帯とは異なるケースがある。
     *       （例: 2025-12-31 が請求基準日で、勤務開始時刻が 2026-01-01 01:00 など）
     *       実際の稼働時間帯は `startTime`, `endTime`, `isStartNextDay` プロパティによって計算される。
     */
    dateAt: defField("dateAt", { label: "日付", required: true }),
    /** 勤務区分 */
    shiftType: defField("shiftType", {
      required: true,
      colsDefinition: { cols: 12 },
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
    /** 休憩時間（分） */
    breakMinutes: defField("breakMinutes", {
      default: 60,
      required: true,
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
  };

  static SHIFT_TYPE = SHIFT_TYPE;
  static SHIFT_TYPE_DAY = SHIFT_TYPE.DAY;
  static SHIFT_TYPE_NIGHT = SHIFT_TYPE.NIGHT;

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
      /** dateAt をもとに曜日区分を返す。 */
      dayType: {
        configurable: true,
        enumerable: true,
        get: () => {
          if (!this.dateAt) return DAY_TYPE_DEFAULT;
          return getDayType(this.dateAt);
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
   * Returns whether the employees have changed.
   * - Returns true if the employee IDs have changed.
   * - Returns false if the employee IDs have not changed or
   *   are the same even if the order has changed.
   * @returns {boolean} - Whether the employees have changed.
   */
  get isEmployeesChanged() {
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
  get isOutsourcersChanged() {
    const current = this.outsourcerIds || [];
    const before = this._beforeData?.outsourcerIds || [];
    return current.sort().join(",") !== before.sort().join(",");
  }

  /**
   * Returns a filtered array of workers that have been added.
   * @returns {Array<SiteOperationScheduleDetail>} - Array of added workers.
   */
  get addedWorkers() {
    const current = this.workers || [];
    if (current.length === 0) return [];
    const before = this._beforeData?.workers || [];
    const isAdded = (emp) => !before.some((e) => e.workerId === emp.workerId);
    return current.filter(isAdded);
  }

  /**
   * Returns a filtered array of workers that have been removed.
   * Note: The returned elements do not exist in this.workers.
   * @returns {Array<SiteOperationScheduleDetail>} - Array of removed workers.
   */
  get removedWorkers() {
    const before = this._beforeData?.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const isRemoved = (emp) =>
      !current.some((e) => e.workerId === emp.workerId);
    return before.filter(isRemoved);
  }

  /**
   * Returns a filtered array of workers that have been updated.
   * - Compares `startTime`, `isStartNextDay`, `endTime`, and `breakMinutes` properties.
   * @returns {Array<SiteOperationScheduleDetail>} - Array of updated workers.
   */
  get updatedWorkers() {
    const before = this._beforeData.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const keys = ["startTime", "isStartNextDay", "endTime", "breakMinutes"];
    const isUpdated = (emp) => {
      const worker = before.find((e) => e.workerId === emp.workerId);
      if (!worker) return false;
      return keys.some((key) => emp[key] !== worker[key]);
    };
    return current.filter(isUpdated);
  }

  /**
   * Override `beforeEdit`.
   * - Synchronize `siteId`, `dateAt`, `shiftType`, `startTime`, `isStartNextDay`,
   *   `endTime`, and `breakMinutes` of all employees and outsourcers before create or update
   *   `SiteOperationSchedule` document.
   * - All `SiteOperationScheduleDetail` instances should be synchronized with the `SiteOperationSchedule`.
   * @returns {Promise<void>}
   */
  beforeEdit() {
    const keys1 = ["siteId", "dateAt", "shiftType"];
    const keys2 = ["startTime", "isStartNextDay", "endTime", "breakMinutes"];
    const syncKeys = [...keys1, ...keys2];

    const isDetailShouldBeSynced = syncKeys.some(
      (key) => this[key] !== this._beforeData?.[key]
    );

    // If no relevant properties have changed, skip synchronization.
    if (!isDetailShouldBeSynced) return Promise.resolve();

    // Function to synchronize properties of a detail instance.
    const syncDetail = (detail) => {
      syncKeys.forEach((key) => (detail[key] = this[key]));
    };

    // Synchronize all detail instances.
    return new Promise((resolve, reject) => {
      try {
        this.employees.forEach(syncDetail);
        this.outsourcers.forEach(syncDetail);
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
        ...this.toObject(),
        siteOperationScheduleId: this.docId,
        id: employeeId,
        amount: 1,
        isEmployee: true,
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
        ...this.toObject(),
        siteOperationScheduleId: this.docId,
        id: outsourcerId,
        index: maxIndex + 1,
        amount: 1,
        isEmployee: false,
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
}
