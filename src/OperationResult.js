/*****************************************************************************
 * OperationResult Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends Operation class to represent the result of an operation.
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * ---------------------------------------------------------------------------
 * @props {string} siteId - Site document ID
 * @props {Date} dateAt - Date of operation (placement date)
 * @props {string} shiftType - `DAY` or `NIGHT`
 * @props {string} startTime - Start time (HH:MM format)
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {number} requiredPersonnel - Required number of personnel
 * @props {boolean} qualificationRequired - Qualification required flag
 * @props {string} workDescription - Work description
 * @props {string} remarks - Remarks
 * @props {Array<OperationDetail>} employees - Assigned employees
 * - Array of `OperationDetail` instances representing assigned employees
 * @props {Array<OperationDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationDetail` instances representing assigned outsourcers
 *
 * [ADDED PROPERTIES]
 * -- those properties are from Agreements ???
 * @props {number} regulationWorkMinutes - Regulation work minutes (minutes)
 * - Maximum work minutes defined for the unit price (`unitPrice` or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * @props {number} unitPrice - Basic unit price
 * - Unit price for work within regulation work minutes.
 * @props {number} overTimeUnitPrice - Overtime unit price
 * - Unit price for overtime work exceeding regulation work minutes.
 * @props {number} unitPriceQualified - Qualified unit price
 * - Unit price for qualified workers within regulation work minutes.
 * @props {number} overTimeUnitPriceQualified - Qualified overtime unit price
 * - Unit price for qualified workers exceeding regulation work minutes.
 * @props {string} billingUnitType - Billing unit type
 * - Billing unit defined in `BILLING_UNIT_TYPE`.
 * @props {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created based on a SiteOperationSchedule document,
 *   this property holds the ID of that source document.
 * ---------------------------------------------------------------------------
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
 * @computed {number} amountBase - Number of base workers
 * - Count of workers excluding those marked as qualified or OJT.
 * @computed {number} amountOverTimeMinutesBase - Total overtime minutes for base workers
 * - Sum of overtime minutes for workers excluding those marked as qualified or OJT.
 * @computed {number} amountQualificated - Number of qualified workers
 * - Count of employees marked as qualified, excluding OJT.
 * @computed {number} amountOverTimeMinutesQualified - Total overtime minutes for qualified workers
 * - Sum of overtime minutes for employees marked as qualified, excluding OJT.
 * @computed {number} salesBase - Total base sales amount
 * - Calculated as `amountBase` multiplied by `unitPrice`.
 * @computed {number} salesOvertimeBase - Total base overtime sales amount
 * - Calculated as `amountOverTimeMinutesBase` multiplied by `overTimeUnitPrice`.
 * @computed {number} salesQualificated - Total qualified sales amount
 * - Calculated as `amountQualificated` multiplied by `unitPriceQualified`.
 * @computed {number} salesOvertimeQualified - Total qualified overtime sales amount
 * - Calculated as `amountOverTimeMinutesQualified` multiplied by `overTimeUnitPriceQualified`.
 * ---------------------------------------------------------------------------
 * @states isEmployeesChanged Indicates whether the employees have changed.
 * @states isOutsourcersChanged Indicates whether the outsourcers have changed.
 * @states addedWorkers An array of workers that have been added.
 * @states removedWorkers An array of workers that have been removed.
 * @states updatedWorkers An array of workers that have been updated.
 * ---------------------------------------------------------------------------
 * @methods addWorker Adds a new worker (employee or outsourcer).
 * @methods changeWorker Changes the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import Operation from "./Operation.js";
import OperationResultDetail from "./OperationResultDetail.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  ...Operation.classProps,
  /** override employees for change customClass */
  employees: defField("array", { customClass: OperationResultDetail }),
  /** override outsourcers for change customClass */
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
  }),
  regulationWorkMinutes: defField("regulationWorkMinutes", {
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  unitPrice: defField("price", {
    label: "基本単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  overTimeUnitPrice: defField("price", {
    label: "時間外単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  unitPriceQualified: defField("price", {
    label: "資格者単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  overTimeUnitPriceQualified: defField("price", {
    label: "資格者時間外単価",
    required: true,
    colsDefinition: { cols: 12, sm: 6 },
  }),
  billingUnitType: defField("billingUnitType", { required: true }),
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

  afterInitialize() {
    super.afterInitialize();
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
      amountOverTimeMinutesBase: {
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
      amountOverTimeMinutesQualified: {
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
      salesBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.amountBase * this.unitPrice;
        },
        set(v) {},
      },
      salesOvertimeBase: {
        configurable: true,
        enumerable: true,
        get() {
          return this.amountOverTimeMinutesBase * this.overTimeUnitPrice;
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
      salesOvertimeQualified: {
        configurable: true,
        enumerable: true,
        get() {
          return (
            this.amountOverTimeMinutesQualified *
            this.overTimeUnitPriceQualified
          );
        },
        set(v) {},
      },
    });
  }

  beforeDelete() {
    return new Promise((resolve, reject) => {
      if (this.siteOperationScheduleId) {
        reject(
          new Error(
            "この稼働実績は現場稼働予定から作成されているため、削除できません。"
          )
        );
        return;
      }
      resolve(true);
    });
  }
}
