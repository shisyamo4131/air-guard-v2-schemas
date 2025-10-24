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
 * @props {boolean} useAdjustedQuantity - Flag to indicate if adjusted quantities are used for billing
 * @props {number} adjustedQuantityBase - Adjusted quantity for base workers
 * - Quantity used for billing base workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedOvertimeBase - Adjusted overtime for base workers
 * - Overtime used for billing base workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedQuantityQualified - Adjusted quantity for qualified workers
 * - Quantity used for billing qualified workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedOvertimeQualified - Adjusted overtime for qualified workers
 * - Overtime used for billing qualified workers when `useAdjustedQuantity` is true.
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
 * @computed {object} statistics - Statistics of workers
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * @computed {object} sales - Sales amounts
 * - Contains sales amounts for base and qualified workers, including overtime breakdowns.
 * @computed {number} salesAmount - Total sales amount
 * - Sum of sales amounts for base and qualified workers.
 * @computed {number} tax - Calculated tax amount
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @computed {number} billingAmount - Total billing amount including tax
 * - Sum of `salesAmount` and `tax`.
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
 * @methods moveWorker Moves the position of a worker (employee or outsourcer).
 * @methods removeWorker Removes a worker (employee or outsourcer).
 *****************************************************************************/
import { ContextualError } from "./utils/ContextualError.js";
import Operation from "./Operation.js";
import OperationResultDetail from "./OperationResultDetail.js";
import { defField } from "./parts/fieldDefinitions.js";
import Tax from "./tax.js";
import UnitPrice from "./UnitPrice.js";
import { BILLING_UNIT_TYPE_PER_HOUR } from "./constants/billing-unit-type.js";
import RoundSetting from "./RoundSetting.js";

const classProps = {
  ...Operation.classProps,
  /** override employees for change customClass */
  employees: defField("array", { customClass: OperationResultDetail }),
  /** override outsourcers for change customClass */
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
  }),
  ...UnitPrice.classProps,
  siteOperationScheduleId: defField("oneLine", { hidden: true }),
  useAdjustedQuantity: defField("check", {
    label: "調整数量を使用",
    default: false,
  }),
  adjustedQuantityBase: defField("number", {
    label: "基本人工（調整）",
    default: 0,
  }),
  adjustedOvertimeBase: defField("number", {
    label: "基本残業（調整）",
    default: 0,
  }),
  adjustedQuantityQualified: defField("number", {
    label: "資格人工（調整）",
    default: 0,
  }),
  adjustedOvertimeQualified: defField("number", {
    label: "資格残業（調整）",
    default: 0,
  }),
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
          const initialValues = {
            quantity: 0,
            regularTimeWorkMinutes: 0,
            overtimeWorkMinutes: 0,
            totalWorkMinutes: 0,
          };
          const result = {
            base: { ...initialValues, ojt: { ...initialValues } },
            qualified: { ...initialValues, ojt: { ...initialValues } },
            total: { ...initialValues, ojt: { ...initialValues } },
          };

          // 各カテゴリに値を追加する関数
          const addToCategory = (categoryObj, worker, isOjt) => {
            const target = isOjt ? categoryObj.ojt : categoryObj;
            target.quantity += 1;
            target.regularTimeWorkMinutes += worker.regularTimeWorkMinutes;
            target.overtimeWorkMinutes += worker.overtimeWorkMinutes;
            target.totalWorkMinutes += worker.totalWorkMinutes;
          };

          this.workers.forEach((worker) => {
            const category = worker.isQualified ? "qualified" : "base";
            const isOjt = worker.isOjt;

            // 該当カテゴリ（base/qualified）に追加
            addToCategory(result[category], worker, isOjt);

            // 全体合計に追加
            addToCategory(result.total, worker, isOjt);
          });

          return result;
        },
        set(v) {},
      },
      sales: {
        configurable: true,
        enumerable: true,
        get() {
          const createInitialValues = () => ({
            unitPrice: 0,
            quantity: 0,
            regularAmount: 0,
            overtimeUnitPrice: 0,
            overtimeMinutes: 0,
            overtimeAmount: 0,
            total: 0,
          });

          const calculateCategorySales = (category) => {
            const isQualified = category === "qualified";
            const categoryStats = this.statistics?.[category];

            // 統計データが存在しない場合は警告を出力して初期値を返す
            if (!categoryStats) {
              console.warn(
                `[OperationResult] Statistics data for category '${category}' is missing.`,
                {
                  docId: this.docId,
                  dateAt: this.dateAt,
                  siteId: this.siteId,
                  category,
                  statistics: this.statistics,
                }
              );
              return createInitialValues();
            }

            const unitPrice = isQualified
              ? this.unitPriceQualified || 0
              : this.unitPriceBase || 0;
            const overtimeUnitPrice = isQualified
              ? this.overtimeUnitPriceQualified || 0
              : this.overtimeUnitPriceBase || 0;
            const isPerHour =
              this.billingUnitType === BILLING_UNIT_TYPE_PER_HOUR;

            const result = createInitialValues();

            // 基本情報の設定
            result.unitPrice = unitPrice;
            result.overtimeUnitPrice = overtimeUnitPrice;

            // 調整値の使用判定
            if (this.useAdjustedQuantity) {
              result.quantity = isQualified
                ? this.adjustedQuantityQualified || 0
                : this.adjustedQuantityBase || 0;
              result.overtimeMinutes = isQualified
                ? this.adjustedOvertimeQualified || 0
                : this.adjustedOvertimeBase || 0;
            } else {
              result.quantity = isPerHour
                ? (categoryStats.totalWorkMinutes || 0) / 60
                : categoryStats.quantity || 0;
              result.overtimeMinutes = categoryStats.overtimeWorkMinutes || 0;
            }

            // 金額計算（RoundSettingを適用）
            result.regularAmount = RoundSetting.apply(
              result.quantity * unitPrice
            );
            result.overtimeAmount = RoundSetting.apply(
              (result.overtimeMinutes * overtimeUnitPrice) / 60
            );
            result.total = result.regularAmount + result.overtimeAmount;

            return result;
          };

          const base = calculateCategorySales("base");
          const qualified = calculateCategorySales("qualified");

          return { base, qualified };
        },
        set(v) {},
      },
      salesAmount: {
        configurable: true,
        enumerable: true,
        get() {
          const amount = this.sales.base.total + this.sales.qualified.total;
          return RoundSetting.apply(amount);
        },
        set(v) {},
      },
      tax: {
        configurable: true,
        enumerable: true,
        get() {
          try {
            return Tax.calc(this.salesAmount, this.date);
          } catch (error) {
            throw new ContextualError("Failed to calculate tax", {
              method: "OperationResult.tax (computed)",
              arguments: { amount: this.salesAmount, date: this.date },
              error,
            });
          }
        },
        set(v) {},
      },
      billingAmount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.salesAmount + this.tax;
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
