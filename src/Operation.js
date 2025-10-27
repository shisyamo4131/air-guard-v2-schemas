/*****************************************************************************
 * Operation Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Base class of SiteOperationSchedule and OperationResult
 * - `dateAt` property indicates the date of operation (placement date)
 *   used for billing purposes.
 *   Actual working day may differ from this date.
 * - `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes` are
 *   automatically synchronized to all assigned employees and outsourcers
 *   when they are changed on the Operation instance.
 * - `startTime`, `endTime`, and `breakMinutes` are NOT synchronized here.
 *   They should be synchronized at `SiteOperationSchedule` level instead.
 * ---------------------------------------------------------------------------
 * @props {string} siteId - Site document ID
 * @props {Date} dateAt - Date of operation (placement date)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * - Indicates the maximum working time treated as regular working hours.
 * - A new value will be synchronized to all `employees` and `outsourcers`.
 * @props {number} requiredPersonnel - Required number of personnel
 * @props {boolean} qualificationRequired - Qualification required flag
 * @props {string} workDescription - Work description
 * @props {string} remarks - Remarks
 * @props {Array<OperationDetail>} employees - Assigned employees
 * - Array of `OperationDetail` instances representing assigned employees
 * @props {Array<OperationDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationDetail` instances representing assigned outsourcers
 * ---------------------------------------------------------------------------
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * @computed {string} dayType - Day type based on `dateAt`
 * @computed {Date} startAt - Start date and time (Date object)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
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
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 * ---------------------------------------------------------------------------
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods moveWorker Moves the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import OperationDetail from "./OperationDetail.js";
import Site from "./Site.js";
import { defField } from "./parts/fieldDefinitions.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";
import {
  classProps as workingResultClassProps,
  accessors as workingResultAccessors,
} from "./WorkingResult.js";

const classProps = {
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
  ...workingResultClassProps, // Inherited from WorkingResult.js
  requiredPersonnel: defField("number", {
    label: "必要人数",
    required: true,
  }),
  qualificationRequired: defField("check", { label: "要資格者" }),
  workDescription: defField("workDescription"),
  remarks: defField("multipleLine", { label: "備考" }),
  employees: defField("array", { customClass: OperationDetail }),
  outsourcers: defField("array", {
    customClass: OperationDetail,
  }),
};

export default class Operation extends FireModel {
  static className = "稼働ベース";
  static collectionPath = "Operations";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  static DAY_TYPE = DAY_TYPE;
  static DAY_TYPE_DAY = DAY_TYPE.DAY;
  static DAY_TYPE_NIGHT = DAY_TYPE.NIGHT;

  static SHIFT_TYPE = SHIFT_TYPE;
  static SHIFT_TYPE_DAY = SHIFT_TYPE.DAY;
  static SHIFT_TYPE_NIGHT = SHIFT_TYPE.NIGHT;

  /**
   * Override `afterInitialize`.
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** Define computed properties from WorkingResult.js */
    workingResultAccessors(this);

    /***********************************************************
     * TRIGGERS FOR SYNCRONIZATION TO EMPLOYEES AND OUTSOURCERS
     * ---------------------------------------------------------
     * When `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes`
     * are changed on the Operation instance,
     * the corresponding properties on all employees and outsourcers
     * are automatically updated to keep them in sync.
     * [NOTE]
     * `startTime`, `endTime`, and `breakMinutes` are NOT synchronized here.
     * They should be synchronized at `SiteOperationSchedule` level instead.
     ***********************************************************/
    let _siteId = this.siteId;
    let _dateAt = this.dateAt;
    let _shiftType = this.shiftType;
    let _regulationWorkMinutes = this.regulationWorkMinutes;
    Object.defineProperties(this, {
      siteId: {
        configurable: true,
        enumerable: true,
        get() {
          return _siteId;
        },
        set(v) {
          if (!!v && typeof v !== "string") {
            throw new Error(`siteId must be a string. siteId: ${v}`);
          }
          if (_siteId === v) return;
          _siteId = v;
          this.employees.forEach((emp) => (emp.siteId = v));
          this.outsourcers.forEach((out) => (out.siteId = v));
        },
      },
      dateAt: {
        configurable: true,
        enumerable: true,
        get() {
          return _dateAt;
        },
        set(v) {
          if (!(v instanceof Date)) {
            throw new Error(`dateAt must be a Date object. dateAt: ${v}`);
          }
          if (_dateAt && v.getTime() === _dateAt.getTime()) {
            return;
          }
          _dateAt = v;
          this.employees.forEach((emp) => (emp.dateAt = v));
          this.outsourcers.forEach((out) => (out.dateAt = v));
        },
      },
      shiftType: {
        configurable: true,
        enumerable: true,
        get() {
          return _shiftType;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`shiftType must be a string. shiftType: ${v}`);
          }
          if (!SHIFT_TYPE[v]) {
            throw new Error(`Invalid shiftType value. shiftType: ${v}`);
          }
          if (_shiftType === v) return;
          _shiftType = v;
          this.employees.forEach((emp) => (emp.shiftType = v));
          this.outsourcers.forEach((out) => (out.shiftType = v));
        },
      },
      regulationWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return _regulationWorkMinutes;
        },
        set(v) {
          if (typeof v !== "number" || isNaN(v) || v < 0) {
            throw new Error(
              `regulationWorkMinutes must be a non-negative number. regulationWorkMinutes: ${v}`
            );
          }
          if (_regulationWorkMinutes === v) return;
          _regulationWorkMinutes = v;
          this.employees.forEach((emp) => (emp.regulationWorkMinutes = v));
          this.outsourcers.forEach((out) => (out.regulationWorkMinutes = v));
        },
      },
    });

    /** define computed properies */
    Object.defineProperties(this, {
      /** Returns an array of employee IDs */
      employeeIds: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.map((emp) => emp.employeeId);
        },
        set(v) {},
      },
      /** Returns an array of outsourcer IDs */
      outsourcerIds: {
        configurable: true,
        enumerable: true,
        get() {
          return this.outsourcers.map((out) => out.outsourcerId);
        },
        set(v) {},
      },
      /** Returns the count of assigned employees */
      employeesCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.length;
        },
        set(v) {},
      },
      /** Returns the count of assigned outsourcers (sum of amounts) */
      outsourcersCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.outsourcers.reduce((sum, i) => sum + i.amount, 0);
        },
        set(v) {},
      },
      /** Returns whether there is a personnel shortage */
      isPersonnelShortage: {
        configurable: true,
        enumerable: true,
        get() {
          const totalRequired = this.requiredPersonnel || 0;
          const totalAssigned = this.employeesCount + this.outsourcersCount;
          return totalAssigned < totalRequired;
        },
        set(v) {},
      },
      /** Returns a combined array of employees and outsourcers */
      workers: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.concat(this.outsourcers);
        },
        set(v) {
          const employees = v.filter((emp) => emp.isEmployee);
          const outsourcers = v.filter((out) => !out.isEmployee);
          this.employees = employees;
          this.outsourcers = outsourcers;
        },
      },
    });

    /** Define custom methods for employees and outsourcers */
    const self = this;
    Object.defineProperties(this.employees, {
      /**
       * Adds a new employee to the `employees` property with the specified ID.
       * - The element added is as an instance specified by `employees.customClass`.
       * - Throws an error if the specified employee ID already exists in the `employees` property.
       * - `startAt`, `endAt`, and `breakMinutes` are taken from the current instance.
       * - `employeeId` is required.
       * [Note]
       * Any options other than `id` and `amount` are accepted and used as initial values
       * for the new instance.
       * @param {Object} args - arguments.
       * @param {string} args.id - The employee's ID.
       * @param {number} args.amount - amount.
       * @param {number} [index=0] - Insertion position. If -1, adds to the end.
       * @returns {Object} - The added employee object.
       * @throws {Error} - If the employee ID already exists.
       */
      add: {
        value: function (args = {}, index = 0) {
          const { id } = args;
          if (!id || typeof id !== "string") {
            throw new Error(
              `Employee ID is required and must be a string. id: ${id}`
            );
          }
          if (this.some((emp) => emp.workerId === id)) {
            throw new Error(`Employee with ID ${id} already exists.`);
          }
          const schema = self.constructor.classProps?.employees?.customClass;
          if (!schema || typeof schema !== "function") {
            throw new Error("employees.customClass is not defined.");
          }
          const newEmployee = new schema({
            ...self.toObject(),
            ...args,
            isEmployee: true, // Force override to true
          });
          if (index === -1) {
            this.push(newEmployee);
          } else {
            this.splice(index, 0, newEmployee);
          }
          return newEmployee;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Moves the position of an employee in the employees array.
       * @param {number} oldIndex - The original index.
       * @param {number} newIndex - The new index.
       */
      move: {
        value: function (oldIndex, newIndex) {
          if (newIndex > this.length - 1) {
            throw new Error(
              `Employees must be placed before outsourcers. newIndex: ${newIndex}, employees.length: ${this.length}`
            );
          }
          if (newIndex < 0 || newIndex >= this.length) {
            throw new Error(`Invalid new index: ${newIndex}`);
          }
          const employee = this.splice(oldIndex, 1)[0];
          this.splice(newIndex, 0, employee);
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Changes the details of an existing employee in the employees array.
       * @param {Object} newEmployee - The updated employee object.
       * @throws {Error} - If the employee is not found.
       */
      change: {
        value: function (newEmployee) {
          const index = this.findIndex(
            (e) => e.workerId === newEmployee.workerId
          );
          if (index < 0) {
            throw new Error("Worker not found in employees.");
          }
          this[index] = newEmployee;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Removes the employee corresponding to `employeeId` from this.employees.
       * @param {string} employeeId - The employee's ID
       * @throws {Error} - If the employee ID is not found.
       */
      remove: {
        value: function (employeeId) {
          const index = this.findIndex((emp) => emp.workerId === employeeId);
          if (index === -1) {
            throw new Error(`Employee with ID "${employeeId}" not found.`);
          }
          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
      },
    });
    Object.defineProperties(this.outsourcers, {
      /**
       * Adds a new outsourcer to the `outsourcers` property with the specified ID.
       * - The element added is as an instance specified by `outsourcers.customClass`.
       * - If the specified outsourcer ID already exists in the `outsourcers` property, increases the amount.
       * - `startTime`, `endTime`, and `isStartNextDay` are taken from the current instance.
       * - `outsourcerId` is required.
       * [Note]
       * Any options other than `id` and `amount` are accepted and used as initial values
       * for the new instance.
       * @param {Object} args - arguments.
       * @param {string} args.id - The outsourcer's ID.
       * @param {number} args.amount - amount.
       * @param {number} [index=0] - Insertion position. If -1, adds to the end.
       * @return {Object} - The added outsourcer object.
       * @throws {Error} - If the outsourcer ID is not provided.
       */
      add: {
        value: function (args = {}, index = 0) {
          const { id } = args;
          if (!id || typeof id !== "string") {
            throw new Error(
              `Outsourcer ID is required and must be a string. id: ${id}`
            );
          }
          const maxIndex = this.reduce((result, out) => {
            if (out.outsourcerId === id) {
              return Math.max(result, Number(out.index));
            }
            return result;
          }, 0);

          const schema = self.constructor.classProps.outsourcers.customClass;
          if (!schema || typeof schema !== "function") {
            throw new Error("outsourcers.customClass is not defined.");
          }
          const newOutsourcer = new schema({
            ...self.toObject(),
            ...args,
            index: maxIndex + 1, // Always set to the next index
            isEmployee: false, // Force override to false
          });

          if (index === -1) {
            this.push(newOutsourcer);
          } else {
            this.splice(index, 0, newOutsourcer);
          }
          return newOutsourcer;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Moves the position of an outsourcer in the outsourcers array.
       * - `oldIndex` and `newIndex` are offset by the number of employees.
       * @param {number} oldIndex - The original index.
       * @param {number} newIndex - The new index.
       */
      move: {
        value: function (oldIndex, newIndex) {
          if (newIndex <= self.employees.length - 1) {
            throw new Error(
              `Outsourcers must be placed after employees. newIndex: ${newIndex}, employees.length: ${self.employees.length}`
            );
          }
          const internalOldIndex = Math.max(
            0,
            oldIndex - self.employees.length
          );
          const internalNewIndex = Math.max(
            0,
            newIndex - self.employees.length
          );
          if (internalOldIndex < 0 || internalOldIndex >= this.length) {
            throw new Error(`Invalid old index: ${internalOldIndex}`);
          }
          if (internalNewIndex < 0 || internalNewIndex >= this.length) {
            throw new Error(`Invalid new index: ${internalNewIndex}`);
          }
          const outsourcer = this.splice(internalOldIndex, 1)[0];
          this.splice(internalNewIndex, 0, outsourcer);
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Changes the details of an existing outsourcer in the outsourcers array.
       * @param {Object} newOutsourcer - The updated outsourcer object.
       * @throws {Error} - If the outsourcer is not found.
       */
      change: {
        value: function (newOutsourcer) {
          const index = this.findIndex(
            (e) => e.workerId === newOutsourcer.workerId
          );
          if (index < 0) {
            throw new Error("Worker not found in outsourcers.");
          }
          this[index] = newOutsourcer;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Removes the outsourcer corresponding to `outsourcerId` from this.outsourcers.
       * - Throws an error for invalid values or if not found.
       * @param {string} outsourcerId - The ID of the outsourcer.
       * @throws {Error} - If the outsourcer ID is not found.
       */
      remove: {
        value: function (outsourcerId) {
          const index = this.findIndex((out) => out.workerId === outsourcerId);
          if (index === -1) {
            throw new Error(`Outsourcer with ID "${outsourcerId}" not found.`);
          }
          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
      },
    });
    /** Remove unnecessary properties */
    delete this.key; // From workingResult.js
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
   * @returns {Array<OperationDetail>} - Array of added workers.
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
   * @returns {Array<OperationDetail>} - Array of removed workers.
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
   * @returns {Array<OperationDetail>} - Array of updated workers.
   */
  get updatedWorkers() {
    const before = this._beforeData.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const keys = [
      "startTime",
      "isStartNextDay",
      "endTime",
      "breakMinutes",
      "isQualified",
      "isOjt",
    ];
    const isUpdated = (emp) => {
      const worker = before.find((e) => e.workerId === emp.workerId);
      if (!worker) return false;
      return keys.some((key) => emp[key] !== worker[key]);
    };
    return current.filter(isUpdated);
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
   * @param {number} [index=0] - Insertion position. If -1, adds to the end.
   */
  addWorker(options = {}, index = 0) {
    const { isEmployee = true } = options;
    if (isEmployee) {
      this.employees.add(options, index);
    } else {
      this.outsourcers.add(options, index);
    }
  }

  /**
   * Moves the position of workers.
   * @param {Object} options - Options for changing worker position.
   * @param {number} options.oldIndex - The original index.
   * @param {number} options.newIndex - The new index.
   * @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer.
   */
  moveWorker(options) {
    const { oldIndex, newIndex, isEmployee = true } = options;
    if (typeof oldIndex !== "number" || typeof newIndex !== "number") {
      throw new Error(
        "oldIndex and newIndex are required and must be numbers."
      );
    }
    if (isEmployee) {
      this.employees.move(oldIndex, newIndex);
    } else {
      this.outsourcers.move(oldIndex, newIndex);
    }
  }

  /**
   * Changes the details of a worker.
   * @param {Object} newWorker - New worker object
   */
  changeWorker(newWorker) {
    if (newWorker.isEmployee) {
      this.employees.change(newWorker);
    } else {
      this.outsourcers.change(newWorker);
    }
  }

  /**
   * Removes an employee or outsourcer from the schedule.
   * @param {Object} options - Options for removing a worker.
   * @param {string} options.workerId - The ID of the employee or outsourcer.
   * @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer.
   */
  removeWorker(options) {
    const { workerId, isEmployee = true } = options;
    if (isEmployee) {
      this.employees.remove(workerId);
    } else {
      this.outsourcers.remove(workerId);
    }
  }
}
