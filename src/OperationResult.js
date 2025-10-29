/*****************************************************************************
 * OperationResult Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Extends Operation class to represent the result of an operation.
 * - Also incorporates Agreement class properties for pricing and billing information.
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Provides comprehensive billing calculations including statistics, sales amounts, and tax.
 * - Supports both daily and hourly billing with adjusted quantities.
 * ---------------------------------------------------------------------------
 * @props {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created from a SiteOperationSchedule, this property holds that ID.
 * - If this property is set, the instance cannot be deleted.
 * @props {boolean} useAdjustedQuantity - Flag to indicate if adjusted quantities are used for billing
 * @props {number} adjustedQuantityBase - Adjusted quantity for base workers
 * - Quantity used for billing base workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedOvertimeBase - Adjusted overtime for base workers
 * - Overtime used for billing base workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedQuantityQualified - Adjusted quantity for qualified workers
 * - Quantity used for billing qualified workers when `useAdjustedQuantity` is true.
 * @props {number} adjustedOvertimeQualified - Adjusted overtime for qualified workers
 * - Overtime used for billing qualified workers when `useAdjustedQuantity` is true.
 * @props {Date} billingDateAt - Billing date
 * ---------------------------------------------------------------------------
 * @computed {Object} statistics - Statistics of workers (read-only)
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * - Structure: { base: {...}, qualified: {...}, total: {...} }
 * - Each category contains: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - Each category also has an 'ojt' subcategory with the same structure.
 * @computed {Object} sales - Sales amounts (read-only)
 * - Contains sales calculations for base and qualified workers, including overtime breakdowns.
 * - Structure: { base: {...}, qualified: {...} }
 * - Each category contains: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * - Calculations respect `useAdjustedQuantity`, `billingUnitType`, and `includeBreakInBilling` settings.
 * @computed {number} salesAmount - Total sales amount (read-only)
 * - Sum of sales amounts for base and qualified workers with rounding applied.
 * @computed {number} tax - Calculated tax amount (read-only)
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @computed {number} billingAmount - Total billing amount including tax (read-only)
 * - Sum of `salesAmount` and `tax`.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from Operation:
 * @props {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {number} requiredPersonnel - Required number of personnel
 * @props {boolean} qualificationRequired - Qualification required flag
 * @props {string} workDescription - Work description
 * @props {string} remarks - Remarks
 * @props {Array<OperationResultDetail>} employees - Assigned employees
 * - Array of `OperationResultDetail` instances representing assigned employees
 * @props {Array<OperationResultDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationResultDetail` instances representing assigned outsourcers
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from Agreement (via Operation):
 * @props {number} unitPriceBase - Base unit price (JPY)
 * @props {number} overtimeUnitPriceBase - Overtime unit price (JPY/hour)
 * @props {number} unitPriceQualified - Qualified unit price (JPY)
 * @props {number} overtimeUnitPriceQualified - Qualified overtime unit price (JPY/hour)
 * @props {string} billingUnitType - Billing unit type
 * @props {boolean} includeBreakInBilling - Whether to include break time in billing if `billingUnitType` is `PER_HOUR`.
 * @props {number} cutoffDate - Cutoff date value from CutoffDate.VALUES
 * - The cutoff date for billing, using values defined in the CutoffDate utility class.
 * ---------------------------------------------------------------------------
 * @inherited - The following properties are inherited from WorkingResult (via Operation):
 * @props {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from Operation:
 * @computed {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @computed {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @computed {number} employeesCount - Count of assigned employees (read-only)
 * @computed {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @computed {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 * @computed {Array<OperationResultDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * ---------------------------------------------------------------------------
 * @inherited - The following computed properties are inherited from WorkingResult (via Operation):
 * @computed {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @computed {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @computed {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @computed {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @computed {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @computed {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @computed {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from Operation:
 * @getter {string} groupKey - Combines `siteId`, `shiftType`, and `date` to indicate operation grouping (read-only)
 * @getter {boolean} isEmployeesChanged - Indicates whether the employees have changed (read-only)
 * - Returns true if the employee IDs have changed compared to `_beforeData`
 * @getter {boolean} isOutsourcersChanged - Indicates whether the outsourcers have changed (read-only)
 * - Returns true if the outsourcer IDs have changed compared to `_beforeData`
 * @getter {Array<OperationResultDetail>} addedWorkers - An array of workers that have been added (read-only)
 * - Workers that exist in current data but not in `_beforeData`
 * @getter {Array<OperationResultDetail>} removedWorkers - An array of workers that have been removed (read-only)
 * - Workers that exist in `_beforeData` but not in current data
 * @getter {Array<OperationResultDetail>} updatedWorkers - An array of workers that have been updated (read-only)
 * - Workers whose `startTime`, `isStartNextDay`, `endTime`, `breakMinutes`, `isQualified`, or `isOjt` have changed
 * ---------------------------------------------------------------------------
 * @inherited - The following getter properties are inherited from WorkingResult (via Operation):
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 * ---------------------------------------------------------------------------
 * @method {function} beforeDelete - Override method to prevent deletion with siteOperationScheduleId
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Throws an error if deletion is attempted on an instance created from SiteOperationSchedule.
 * ---------------------------------------------------------------------------
 * @inherited - The following methods are inherited from Operation:
 * @method {function} addWorker - Adds a new worker (employee or outsourcer)
 * - @param {Object} options - Options for adding a worker
 * - @param {string} options.id - The worker ID (employeeId or outsourcerId)
 * - @param {boolean} [options.isEmployee=true] - Whether the worker is an employee
 * - @param {number} [index=0] - Insertion position. If -1, adds to the end
 * @method {function} moveWorker - Moves the position of a worker (employee or outsourcer)
 * - @param {Object} options - Options for changing worker position
 * - @param {number} options.oldIndex - The original index
 * - @param {number} options.newIndex - The new index
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method {function} changeWorker - Changes the details of a worker
 * - @param {Object} newWorker - New worker object
 * @method {function} removeWorker - Removes a worker (employee or outsourcer)
 * - @param {Object} options - Options for removing a worker
 * - @param {string} options.workerId - The ID of the employee or outsourcer
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method {function} setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `siteId` value
 * @method {function} setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `shiftType` value
 * @method {function} setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 * - By default, does nothing.
 * - @param {number} v - The new `regulationWorkMinutes` value
 * @method {function} groupKeyDivider - Returns an array dividing the key into siteId, shiftType, and date.
 * - @param {string} key - The combined key string
 * - @returns {Array<string>} - Array containing [siteId, shiftType, date]
 * - @throws {Error} - If the key is invalid.
 * ---------------------------------------------------------------------------
 * @inherited - The following method is inherited from WorkingResult (via Operation):
 * @method {function} setDateAtCallback - Callback method called when `dateAt` is set
 * - Override this method in subclasses to add custom behavior when `dateAt` changes.
 * - By default, updates `dayType` based on the new `dateAt` value and synchronizes to workers.
 * - @param {Date} v - The new `dateAt` value
 *****************************************************************************/
import Operation from "./Operation.js";
import Agreement from "./Agreement.js";
import { ContextualError } from "./utils/ContextualError.js";
import OperationResultDetail from "./OperationResultDetail.js";
import { defField } from "./parts/fieldDefinitions.js";
import Tax from "./tax.js";
import { BILLING_UNIT_TYPE_PER_HOUR } from "./constants/billing-unit-type.js";
import RoundSetting from "./RoundSetting.js";
import CutoffDate from "./utils/CutoffDate.js";

const classProps = {
  ...Operation.classProps,
  ...Agreement.classProps,
  cutoffDate: defField("select", {
    label: "締日区分",
    default: CutoffDate.VALUES.END_OF_MONTH,
    required: true,
    hidden: true,
    component: {
      attrs: {
        items: CutoffDate.OPTIONS,
      },
    },
  }),
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
  billingDateAt: defField("dateAt", { label: "請求日付", required: true }),
  employees: defField("array", { customClass: OperationResultDetail }),
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
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
   * afterInitialize
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
            breakMinutes: 0,
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
            target.breakMinutes += worker.breakMinutes;
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
              // result.quantity = isPerHour
              //   ? (categoryStats.totalWorkMinutes || 0) / 60
              //   : categoryStats.quantity || 0;
              // result.overtimeMinutes = categoryStats.overtimeWorkMinutes || 0;
              if (isPerHour) {
                // 時間単位請求の場合
                let totalMinutes = categoryStats.totalWorkMinutes || 0;

                // 休憩時間を請求に含める場合は休憩時間を追加
                if (this.includeBreakInBilling) {
                  totalMinutes += categoryStats.breakMinutes || 0;
                }

                result.quantity = totalMinutes / 60;
              } else {
                // 日単位請求の場合（休憩時間は関係なし）
                result.quantity = categoryStats.quantity || 0;
              }
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
