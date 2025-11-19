/*****************************************************************************
 * OperationResult Model
 * @version 1.2.0 - 2025-11-19 Add `agreement`, `hasAgreement`, `isValid` properties.
 * @author shisyamo4131
 *
 * - Extends Operation class to represent the result of an operation.
 * - Also incorporates Agreement class properties for pricing and billing information.
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Provides comprehensive billing calculations including statistics, sales amounts, and tax.
 * - Supports both daily and hourly billing with adjusted quantities.
 * - Automatically updates `billingDateAt` based on `dateAt` and `cutoffDate`.
 * - Introduces a lock mechanism (`isLocked`) to prevent edits when necessary.
 *
 * @prop {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * - Used to determine `dayType`.
 * - When `dateAt` changes, `billingDateAt` is also updated based on `agreement.cutoffDate`.
 * @prop {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @prop {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {string} startTime - Start time (HH:MM format)
 * @prop {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @prop {string} endTime - End time (HH:MM format)
 * @prop {number} breakMinutes - Break time (minutes)
 * @prop {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @prop {number} requiredPersonnel - Required number of personnel
 * @prop {boolean} qualificationRequired - Qualification required flag
 * @prop {string} workDescription - Work description
 * @prop {string} remarks - Remarks
 * @prop {Array<OperationResultDetail>} employees - Assigned employees
 * - Array of `OperationResultDetail` instances representing assigned employees
 * @prop {Array<OperationResultDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationResultDetail` instances representing assigned outsourcers
 * @prop {Array<OperationResultDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * @prop {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created from a SiteOperationSchedule, this property holds that ID.
 * - If this property is set, the instance cannot be deleted.
 * @prop {boolean} useAdjustedQuantity - Flag to indicate if adjusted quantities are used for billing
 * @prop {number} adjustedQuantityBase - Adjusted quantity for base workers
 * - Quantity used for billing base workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedOvertimeBase - Adjusted overtime for base workers
 * - Overtime used for billing base workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedQuantityQualified - Adjusted quantity for qualified workers
 * - Quantity used for billing qualified workers when `useAdjustedQuantity` is true.
 * @prop {number} adjustedOvertimeQualified - Adjusted overtime for qualified workers
 * - Overtime used for billing qualified workers when `useAdjustedQuantity` is true.
 * @prop {Date} billingDateAt - Billing date
 * - The date used for billing purposes.
 * @prop {boolean} isLocked - Lock flag
 * - When set to true, the OperationResult is locked from edits exept for editing as OperationBilling.
 * @prop {Agreement|null} agreement - Associated Agreement object
 * - The Agreement instance associated with this OperationResult for pricing and billing information.
 * - When set, it influences billing calculations such as unit prices and billing dates.
 * @prop {boolean} allowEmptyAgreement - Flag to ignore missing Agreement
 * - When set to true, allows the OperationResult to be valid even if no Agreement is associated.
 * @readonly
 * @prop {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @prop {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @prop {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @prop {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @prop {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @prop {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @prop {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * @prop {boolean} hasAgreement - Indicates if an Agreement is associated (read-only)
 * - `true` if `agreement` is set, otherwise `false`.
 * @prop {string|false} isInvalid - Validation status (read-only)
 * - Returns false if valid.
 * - Returns reason code string if invalid:
 *   - `EMPTY_BILLING_DATE`: Billing date is missing.
 *   - `EMPTY_AGREEMENT`: Agreement is missing and `allowEmptyAgreement` is false.
 * @prop {Object} statistics - Statistics of workers (read-only)
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * - Structure: { base: {...}, qualified: {...}, total: {...} }
 * - Each category contains: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - Each category also has an 'ojt' subcategory with the same structure.
 * @prop {Object} sales - Sales amounts (read-only)
 * - Contains sales calculations for base and qualified workers, including overtime breakdowns.
 * - Structure: { base: {...}, qualified: {...} }
 * - Each category contains: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * - Calculations respect `useAdjustedQuantity`, `billingUnitType`, and `includeBreakInBilling` settings.
 * @prop {number} salesAmount - Total sales amount (read-only)
 * - Sum of sales amounts for base and qualified workers with rounding applied.
 * @prop {number} tax - Calculated tax amount (read-only)
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @prop {number} billingAmount - Total billing amount including tax (read-only)
 * - Sum of `salesAmount` and `tax`.
 * @prop {string} billingMonth - Billing month in YYYY-MM format (read-only)
 * @prop {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @prop {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @prop {number} employeesCount - Count of assigned employees (read-only)
 * @prop {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @prop {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
 * - `true` if the sum of `employeesCount` and `outsourcersCount` is less than `requiredPersonnel`
 *
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
 * @getter {number} startHour - Start hour (0-23) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} startMinute - Start minute (0-59) (read-only)
 * - Extracted from `startTime`.
 * @getter {number} endHour - End hour (0-23) (read-only)
 * - Extracted from `endTime`.
 * @getter {number} endMinute - End minute (0-59) (read-only)
 * - Extracted from `endTime`.
 *
 * @method beforeDelete - Override method to prevent deletion with siteOperationScheduleId
 * - Prevents deletion if the instance has `siteOperationScheduleId`.
 * - Throws an error if deletion is attempted on an instance created from SiteOperationSchedule.
 * @method refreshBillingDateAt - Refresh billingDateAt based on dateAt and cutoffDate
 * - Updates `billingDateAt` based on the current `dateAt` and `cutoffDate` values.
 * @method addWorker - Adds a new worker (employee or outsourcer)
 * - @param {Object} options - Options for adding a worker
 * - @param {string} options.id - The worker ID (employeeId or outsourcerId)
 * - @param {boolean} [options.isEmployee=true] - Whether the worker is an employee
 * - @param {number} [index=0] - Insertion position. If -1, adds to the end
 * @method moveWorker - Moves the position of a worker (employee or outsourcer)
 * - @param {Object} options - Options for changing worker position
 * - @param {number} options.oldIndex - The original index
 * - @param {number} options.newIndex - The new index
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method changeWorker - Changes the details of a worker
 * - @param {Object} newWorker - New worker object
 * @method removeWorker - Removes a worker (employee or outsourcer)
 * - @param {Object} options - Options for removing a worker
 * - @param {string} options.workerId - The ID of the employee or outsourcer
 * - @param {boolean} [options.isEmployee=true] - True for employee, false for outsourcer
 * @method setSiteIdCallback - Callback method called when `siteId` is set
 * - Override this method in subclasses to add custom behavior when `siteId` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `siteId` value
 * @method setShiftTypeCallback - Callback method called when `shiftType` is set
 * - Override this method in subclasses to add custom behavior when `shiftType` changes.
 * - By default, does nothing.
 * - @param {string} v - The new `shiftType` value
 * @method setRegulationWorkMinutesCallback - Callback method called when `regulationWorkMinutes` is set
 * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
 * - By default, does nothing.
 * - @param {number} v - The new `regulationWorkMinutes` value
 *
 * @static
 * @method groupKeyDivider
 * - Returns an array dividing the key into siteId, shiftType, and date.
 * - @param {Object|string} key - The combined key string or object
 * - @returns {Array<string>} - Array containing [siteId, shiftType, date]
 * - @throws {Error} - If the key is invalid.
 *
 * @override setDateAtCallback - Updates `billingDateAt` based on the new `dateAt` value.
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
  billingDateAt: defField("dateAt", { label: "請求日付" }),
  employees: defField("array", { customClass: OperationResultDetail }),
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
  }),
  isLocked: defField("check", {
    label: "実績確定",
    default: false,
  }),
  agreement: defField("object", { label: "取極め", customClass: Agreement }),
  allowEmptyAgreement: defField("check", {
    label: "取極めなしを無視",
    default: false,
  }),
};

const INVALID_REASON = {
  EMPTY_BILLING_DATE: "EMPTY_BILLING_DATE",
  EMPTY_AGREEMENT: "EMPTY_AGREEMENT",
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
    let _agreement = this.agreement;
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

            const result = createInitialValues();

            // agreementの有無に関わらず数量と残業時間を計算
            if (this.useAdjustedQuantity) {
              result.quantity = isQualified
                ? this.adjustedQuantityQualified || 0
                : this.adjustedQuantityBase || 0;
              result.overtimeMinutes = isQualified
                ? this.adjustedOvertimeQualified || 0
                : this.adjustedOvertimeBase || 0;
            } else {
              // agreementがある場合のみbillingUnitTypeとincludeBreakInBillingを使用
              const isPerHour =
                this.agreement?.billingUnitType === BILLING_UNIT_TYPE_PER_HOUR;

              if (isPerHour) {
                // 時間単位請求の場合
                let totalMinutes = categoryStats.totalWorkMinutes || 0;

                // 休憩時間を請求に含める場合は休憩時間を追加
                if (this.agreement?.includeBreakInBilling) {
                  totalMinutes += categoryStats.breakMinutes || 0;
                }

                result.quantity = totalMinutes / 60;
              } else {
                // 日単位請求の場合(休憩時間は関係なし)
                result.quantity = categoryStats.quantity || 0;
              }
              result.overtimeMinutes = categoryStats.overtimeWorkMinutes || 0;
            }

            // agreementがある場合のみ単価と金額を計算
            if (this.agreement) {
              result.unitPrice = isQualified
                ? this.agreement.unitPriceQualified || 0
                : this.agreement.unitPriceBase || 0;
              result.overtimeUnitPrice = isQualified
                ? this.agreement.overtimeUnitPriceQualified || 0
                : this.agreement.overtimeUnitPriceBase || 0;

              // 金額計算(RoundSettingを適用)
              result.regularAmount = RoundSetting.apply(
                result.quantity * result.unitPrice
              );
              result.overtimeAmount = RoundSetting.apply(
                (result.overtimeMinutes * result.overtimeUnitPrice) / 60
              );
              result.total = result.regularAmount + result.overtimeAmount;
            }

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
      billingMonth: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.billingDateAt) return null;
          const jstDate = new Date(
            this.billingDateAt.getTime() + 9 * 60 * 60 * 1000
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          return `${year}-${String(month).padStart(2, "0")}`;
        },
        set(v) {},
      },

      agreement: {
        configurable: true,
        enumerable: true,
        get() {
          return _agreement;
        },
        set(v) {
          _agreement = v;
          this.refreshBillingDateAt();
        },
      },
      hasAgreement: {
        configurable: true,
        enumerable: true,
        get() {
          return this.agreement != null;
        },
        set(v) {},
      },
      isInvalid: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.agreement && !this.allowEmptyAgreement) {
            return INVALID_REASON.EMPTY_AGREEMENT;
          }
          if (!this.billingDateAt) {
            return INVALID_REASON.EMPTY_BILLING_DATE;
          }
          return false;
        },
        set(v) {},
      },
    });
  }

  /**
   * Refresh billingDateAt based on dateAt and cutoffDate
   * @returns {void}
   */
  refreshBillingDateAt() {
    if (!this.dateAt) {
      this.billingDateAt = null;
      return;
    }
    if (!this.agreement) {
      this.billingDateAt = null;
      return;
    }
    if (this.agreement.cutoffDate !== 0 && !this.agreement.cutoffDate) {
      this.billingDateAt = null;
      return;
    }
    this.billingDateAt = CutoffDate.calculateBillingDateAt(
      this.dateAt,
      this.agreement.cutoffDate
    );
  }

  /**
   * Override `setDateAtCallback` to refresh billingDateAt
   * @param {Date} v
   */
  setDateAtCallback(v) {
    super.setDateAtCallback(v);
    this.refreshBillingDateAt();
  }

  /**
   * Override create method to validate billingDateAt when allowEmptyAgreement is true
   * @param {*} options
   * @returns {Promise<DocumentReference>}
   */
  async create(options = {}) {
    return await super.create(options);
  }

  /**
   * Override update method to prevent editing if isLocked is true
   * - Also validate billingDateAt when allowEmptyAgreement is true
   * @param {*} options
   * @returns {Promise<void>}
   */
  async update(options = {}) {
    if (this.isLocked) {
      throw new Error(
        "[OperationResult] This OperationResult is locked and cannot be edited."
      );
    }
    return await super.update(options);
  }

  /**
   * Override delete method to prevent deletion if isLocked is true
   * @param {*} options
   * @returns {Promise<void>}
   */
  async delete(options = {}) {
    if (this.isLocked) {
      throw new Error(
        "[OperationResult] This OperationResult is locked and cannot be deleted."
      );
    }
    return await super.delete(options);
  }
}
