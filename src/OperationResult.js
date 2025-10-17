/*****************************************************************************
 * OperationResult Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends Operation class to represent the result of an operation.
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Synchronized `regulationWorkMinutes` to all employees and outsourcers.
 * ---------------------------------------------------------------------------
 * [INHERIT]
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
 * @props {Array<OperationDetail>} employees - Assigned employees
 * - Array of `OperationDetail` instances representing assigned employees
 * @props {Array<OperationDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationDetail` instances representing assigned outsourcers
 *
 * [ADDED]
 * @props {number} unitPrice - Basic unit price
 * - Unit price for work within regulation work minutes.
 * @props {number} overtimeUnitPrice - Overtime unit price
 * - Unit price for overtime work exceeding regulation work minutes.
 * @props {number} unitPriceQualified - Qualified unit price
 * - Unit price for qualified workers within regulation work minutes.
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price
 * - Unit price for qualified workers exceeding regulation work minutes.
 * @props {string} billingUnitType - Billing unit type
 * - Billing unit defined in `BILLING_UNIT_TYPE`.
 * @props {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created based on a SiteOperationSchedule document,
 *   this property holds the ID of that source document.
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
 *
 * [ADDED]
 * @computed {number} amountBase - Number of base workers
 * - Count of workers excluding those marked as qualified or OJT.
 * @computed {number} amountOvertimeMinutes - Total overtime minutes for base workers
 * - Sum of overtime minutes for workers excluding those marked as qualified or OJT.
 * @computed {number} amountQualificated - Number of qualified workers
 * - Count of employees marked as qualified, excluding OJT.
 * @computed {number} amountOvertimeMinutesQualified - Total overtime minutes for qualified workers
 * - Sum of overtime minutes for employees marked as qualified, excluding OJT.
 * @computed {number} salesBase - Total base sales amount
 * - Calculated as `amountBase` multiplied by `unitPrice`.
 * @computed {number} salesOvertimeBase - Total base overtime sales amount
 * - Calculated as `amountOvertimeMinutes` multiplied by `overtimeUnitPrice`.
 * @computed {number} salesQualificated - Total qualified sales amount
 * - Calculated as `amountQualificated` multiplied by `unitPriceQualified`.
 * @computed {number} salesOvertimeQualified - Total qualified overtime sales amount
 * - Calculated as `amountOvertimeMinutesQualified` multiplied by `overtimeUnitPriceQualified`.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 * ---------------------------------------------------------------------------
 * [INHERIT]
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods changeWorker Changes the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import Operation from "./Operation.js";
import OperationResultDetail from "./OperationResultDetail.js";
import { defField } from "./parts/fieldDefinitions.js";
import { classProps as unitPriceClassProps } from "./UnitPrice.js";

const classProps = {
  ...Operation.classProps,
  /** override employees for change customClass */
  employees: defField("array", { customClass: OperationResultDetail }),
  /** override outsourcers for change customClass */
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
  }),
  ...unitPriceClassProps,
  siteOperationScheduleId: defField("oneLine", { hidden: true }),
};

export default class OperationResult extends Operation {
  static className = "稼働実績";
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
  ];

  /**
   * Override `afterInitialize`.
   * - Define a trigger for synchronize regulationWorkMinutes to all employees and workers.
   * - Define computed properties.
   */
  afterInitialize() {
    super.afterInitialize();

    /** Computed properties */
    Object.defineProperties(this, {
      amountBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.workers.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length;
        },
        set(v) {},
      },
      amountQualificated: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.filter(
            ({ isQualificated, isOjt }) => isQualificated && !isOjt
          ).length;
        },
        set(v) {},
      },
      amount: {
        configurable: true,
        enumerable: true,
        get() {
          const base = this.amountBase;
          const qualificated = this.amountQualificated;
          return { base, qualificated, total: base + qualificated };
        },
        set(v) {},
      },
      amountOvertimeMinutesBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.workers
            .filter(({ isQualificated, isOjt }) => !isQualificated && !isOjt)
            .reduce(
              (sum, wkr) =>
                sum +
                Math.max(wkr.totalWorkMinutes - this.regulationWorkMinutes, 0),
              0
            );
        },
        set(v) {},
      },
      amountOvertimeMinutesQualified: {
        configurable: true,
        enumerable: true,
        get() {
          return this.workers
            .filter(({ isQualificated, isOjt }) => isQualificated && !isOjt)
            .reduce(
              (sum, wkr) =>
                sum +
                Math.max(wkr.totalWorkMinutes - this.regulationWorkMinutes, 0),
              0
            );
        },
        set(v) {},
      },
      amountOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          const base = this.amountOvertimeMinutesBase;
          const qualificated = this.amountOvertimeMinutesQualified;
          return { base, qualificated, total: base + qualificated };
        },
        set(v) {},
      },
      salesBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.amountBase * this.unitPriceBase;
        },
        set(v) {},
      },
      salesQualificated: {
        configurable: true,
        enumerable: true,
        get() {
          return this.amountQualificated * this.unitPriceQualified;
        },
        set(v) {},
      },
      salesOvertimeBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.amountOvertimeMinutesBase * this.overtimeUnitPriceBase;
        },
        set(v) {},
      },
      salesOvertimeQualified: {
        configurable: true,
        enumerable: true,
        get() {
          return (
            this.amountOvertimeMinutesQualified *
            this.overtimeUnitPriceQualified
          );
        },
        set(v) {},
      },
      sales: {
        configurable: true,
        enumerable: true,
        get() {
          const base = this.salesBase;
          const qualificated = this.salesQualificated;
          const overtimeBase = this.salesOvertimeBase;
          const overtimeQualificated = this.salesOvertimeQualified;
          return {
            base,
            qualificated,
            overtimeBase,
            overtimeQualificated,
            total: base + qualificated + overtimeBase + overtimeQualificated,
          };
        },
        set(v) {},
      },
    });
  }

  /**
   * Override `beforeDelete`.
   * - Prevents deletion if the instance has `siteOperationScheduleId`.
   */
  async beforeDelete() {
    await super.beforeDelete();
    if (this.siteOperationScheduleId) {
      throw new Error(
        "この稼働実績は現場稼働予定から作成されているため、削除できません。"
      );
    }
  }
}
