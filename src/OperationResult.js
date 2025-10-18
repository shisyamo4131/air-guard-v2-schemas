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
 * @props {number} unitPriceBase - Basic unit price
 * - Unit price for work within regulation work minutes.
 * @props {number} overtimeUnitPriceBase - Overtime unit price
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
 *
 * [ADDED]
 * @computed {object} statistics - Statistics of workers
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * @computed {object} sales - Sales amounts
 * - Contains sales amounts for base and qualified workers, including overtime breakdowns.
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
import { BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";
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
      statistics: {
        configurable: true,
        enumerable: true,
        get() {
          const values = {
            amount: 0,
            regularTimeWorkMinutes: 0,
            overtimeWorkMinutes: 0,
            totalWorkMinutes: 0,
          };
          const result = {
            base: {
              ...values,
              ojt: { ...values },
            },
            qualificated: {
              ...values,
              ojt: {
                ...values,
              },
            },
            total: {
              ...values,
              ojt: { ...values },
            },
          };
          this.workers.reduce((acc, worker) => {
            const category = worker.isQualificated ? "qualificated" : "base";
            if (!worker.isOjt) {
              acc[category].amount += 1;
              acc[category].regularTimeWorkMinutes +=
                worker.regularTimeWorkMinutes;
              acc[category].overtimeWorkMinutes += worker.overtimeWorkMinutes;
              acc[category].totalWorkMinutes += worker.totalWorkMinutes;
              acc.total.amount += 1;
              acc.total.regularTimeWorkMinutes += worker.regularTimeWorkMinutes;
              acc.total.overtimeWorkMinutes += worker.overtimeWorkMinutes;
              acc.total.totalWorkMinutes += worker.totalWorkMinutes;
            } else {
              acc[category].ojt.amount += 1;
              acc[category].ojt.regularTimeWorkMinutes +=
                worker.regularTimeWorkMinutes;
              acc[category].ojt.overtimeWorkMinutes +=
                worker.overtimeWorkMinutes;
              acc[category].ojt.totalWorkMinutes += worker.totalWorkMinutes;
              acc.total.ojt.amount += 1;
              acc.total.ojt.regularTimeWorkMinutes +=
                worker.regularTimeWorkMinutes;
              acc.total.ojt.overtimeWorkMinutes += worker.overtimeWorkMinutes;
              acc.total.ojt.totalWorkMinutes += worker.totalWorkMinutes;
            }
            return acc;
          }, result);
          return result;
        },
        set(v) {},
      },
      sales: {
        configurable: true,
        enumerable: true,
        get() {
          const values = {
            amount: 0, // Number of workers or total work minutes if billing-type is `PER_HOUR`
            overtime: 0, // Total overtime minutes
            total: 0,
          };
          const result = {
            base: { ...values },
            qualificated: { ...values },
            total: { ...values },
          };
          const stats = this.statistics;
          for (const key of ["base", "qualificated", "total"]) {
            const unitPriceKey =
              key === "base" ? "unitPriceBase" : "unitPriceQualified";
            const overtimeUnitPriceKey =
              key === "base"
                ? "overtimeUnitPriceBase"
                : "overtimeUnitPriceQualified";
            if (this.billingUnitType === BILLING_UNIT_TYPE.PER_HOUR) {
              result[key].amount = stats[key].totalWorkMinutes;
            } else {
              result[key].amount = stats[key].amount;
            }
            result[key].overtime =
              (stats[key].overtimeWorkMinutes * this[overtimeUnitPriceKey]) /
              60;
            result[key].total =
              result[key].amount * this[unitPriceKey] + result[key].overtime;
          }
          return result;
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
