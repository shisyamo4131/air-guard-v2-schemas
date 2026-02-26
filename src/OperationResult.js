/*****************************************************************************
 * OperationResult Model
 * @author shisyamo4131
 *
 * - Extends Operation class to represent the result of an operation.
 * - Also incorporates Agreement class properties for pricing and billing information.
 * - Provides comprehensive billing calculations including statistics, sales amounts, and tax.
 * - Supports both daily and hourly billing with adjusted quantities.
 * - Automatically updates `billingDateAt` based on `dateAt` and `cutoffDate`.
 * - Introduces a lock mechanism (`isLocked`) to prevent edits when necessary.
 *
 * @property { string } key - {@link Operation#key}
 *
 * @property {string} agreementKey - {@link Operation#agreementKey}
 *
 * @property {string} orderKey - {@link Operation#orderKey}
 *
 * @property {string} siteId - Site document ID (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 *
 * @property {Date} dateAt - Date of operation (placement date) (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * - Used to determine `dayType`.
 * - When `dateAt` changes, `billingDateAt` is also updated based on `agreement.cutoffDate`.
 * @property {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @property {string} shiftType - `DAY` or `NIGHT` (trigger property)
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @property {string} startTime - Start time (HH:MM format)
 * @property {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @property {string} endTime - End time (HH:MM format)
 * @property {number} breakMinutes - Break time (minutes)
 * @property {number} regulationWorkMinutes - Regulation work minutes (trigger property)
 * - Indicates the maximum working time treated as regular working hours.
 * - Automatically synchronizes to all `employees` and `outsourcers` when changed.
 * @property {number} requiredPersonnel - Required number of personnel
 * @property {boolean} qualificationRequired - Qualification required flag
 * @property {string} workDescription - Work description
 * @property {string} remarks - Remarks
 * @property {Array<OperationResultDetail>} employees - Assigned employees
 * - Array of `OperationResultDetail` instances representing assigned employees
 * @property {Array<OperationResultDetail>} outsourcers - Assigned outsourcers
 * - Array of `OperationResultDetail` instances representing assigned outsourcers
 * @property {Array<OperationResultDetail>} workers - Combined array of `employees` and `outsourcers`
 * - Getter: Returns concatenated array of employees and outsourcers
 * - Setter: Splits array into employees and outsourcers based on `isEmployee` property
 * @property {string|null} siteOperationScheduleId - Associated SiteOperationSchedule document ID
 * - If this OperationResult was created from a SiteOperationSchedule, this property holds that ID.
 * @property {boolean} useAdjustedQuantity - Flag to indicate if adjusted quantities are used for billing
 * @property {number} adjustedQuantityBase - Adjusted quantity for base workers
 * - Quantity used for billing base workers when `useAdjustedQuantity` is true.
 * @property {number} adjustedOvertimeBase - Adjusted overtime for base workers
 * - Overtime used for billing base workers when `useAdjustedQuantity` is true.
 * @property {number} adjustedQuantityQualified - Adjusted quantity for qualified workers
 * - Quantity used for billing qualified workers when `useAdjustedQuantity` is true.
 * @property {number} adjustedOvertimeQualified - Adjusted overtime for qualified workers
 * - Overtime used for billing qualified workers when `useAdjustedQuantity` is true.
 * @property {Date} billingDateAt - Billing date
 * - The date used for billing purposes.
 * @property {boolean} isLocked - Lock flag
 * - When set to true, the OperationResult is locked from edits exept for editing as OperationBilling.
 * @property {Agreement|null} agreement - Associated Agreement object
 * - The Agreement instance associated with this OperationResult for pricing and billing information.
 * - When set, it influences billing calculations such as unit prices and billing dates.
 * @property {boolean} allowEmptyAgreement - Flag to ignore missing Agreement
 * - When set to true, allows the OperationResult to be valid even if no Agreement is associated.
 * @readonly
 * @property {string} date - Date string in YYYY-MM-DD format based on `dateAt` (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @property {Date} startAt - Start date and time (Date object) (read-only)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @property {Date} endAt - End date and time (Date object) (read-only)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @property {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date (read-only)
 * - `true` if `startTime` is later than `endTime`
 * @property {number} totalWorkMinutes - Total working time in minutes (excluding break time) (read-only)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @property {number} regularTimeWorkMinutes - Regular working time in minutes (read-only)
 * - The portion of `totalWorkMinutes` that is considered within the contract's `regulationWorkMinutes`.
 * @property {number} overtimeWorkMinutes - Overtime work in minutes (read-only)
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * @property {boolean} hasAgreement - Indicates if an Agreement is associated (read-only)
 * - `true` if `agreement` is set, otherwise `false`.
 * @property {string|false} isInvalid - Validation status (read-only)
 * - Returns false if valid.
 * - Returns reason code string if invalid:
 *   - `EMPTY_BILLING_DATE`: Billing date is missing.
 *   - `EMPTY_AGREEMENT`: Agreement is missing and `allowEmptyAgreement` is false.
 * @property {Object} statistics - Statistics of workers (read-only)
 * - Contains counts and total work minutes for base and qualified workers, including OJT breakdowns.
 * - Structure: { base: {...}, qualified: {...}, total: {...} }
 * - Each category contains: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - Each category also has an 'ojt' subcategory with the same structure.
 * @property {Object} sales - Sales amounts (read-only)
 * - Contains sales calculations for base and qualified workers, including overtime breakdowns.
 * - Structure: { base: {...}, qualified: {...} }
 * - Each category contains: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * - Calculations respect `useAdjustedQuantity`, `billingUnitType`, and `includeBreakInBilling` settings.
 * @property {number} salesAmount - Total sales amount (read-only)
 * - Sum of sales amounts for base and qualified workers with rounding applied.
 * @property {number} tax - Calculated tax amount (read-only)
 * - Calculated using the `Tax` utility based on `salesAmount` and `date`.
 * @property {number} billingAmount - Total billing amount including tax (read-only)
 * - Sum of `salesAmount` and `tax`.
 * @property {string|null} billingDate - Billing date in YYYY-MM-DD format (read-only)
 * - Returns a string in the format YYYY-MM-DD based on `billingDateAt`.
 * @property {string} billingMonth - Billing month in YYYY-MM format (read-only)
 * @property {Array<string>} employeeIds - Array of employee IDs from `employees` (read-only)
 * @property {Array<string>} outsourcerIds - Array of outsourcer IDs from `outsourcers` (read-only)
 * @property {number} employeesCount - Count of assigned employees (read-only)
 * @property {number} outsourcersCount - Count of assigned outsourcers (sum of amounts) (read-only)
 * @property {boolean} isPersonnelShortage - Indicates if there is a shortage of personnel (read-only)
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
 * @getter {boolean} isKeyChanged - Flag indicating whether the key has changed compared to previous data (read-only)
 * - Compares the current `key` with the `key` in `_beforeData`.
 *
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
 * @override
 * @method setDateAtCallback - Updates `billingDateAt` based on the new `dateAt` value.
 * @method beforeCreate - Override to sync customerId from siteId
 * @method beforeUpdate - Override to sync customerId from siteId when siteId changes
 * @method beforeDelete - Override to prevent deletion if isLocked is true
 *****************************************************************************/
import Operation from "./Operation.js";
import Agreement from "./Agreement.js";
import { ContextualError } from "./utils/ContextualError.js";
import OperationResultDetail from "./OperationResultDetail.js";
import { defField } from "./parts/fieldDefinitions.js";
import Tax from "./Tax.js";
import { VALUES as BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";
import RoundSetting from "./RoundSetting.js";
import CutoffDate from "./utils/CutoffDate.js";
import Site from "./Site.js";

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
  billingDateAt: defField("dateAt", { label: "請求締日" }),
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
    label: "取極めなしを許容",
    default: false,
  }),

  /**
   * siteId から自動同期されるプロパティ
   * - 従属する取引先の変更を不可としているため、ドキュメントの更新時に取得するだけで問題ない。
   * - 但し、siteId が変更された時は再取得する必要がある。
   */
  customerId: defField("customerId", { required: true, hidden: true }),
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

  static BILLING_UNIT_TYPE = BILLING_UNIT_TYPE;
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
                },
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
                this.agreement?.billingUnitType ===
                BILLING_UNIT_TYPE.PER_HOUR.value;

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
                result.quantity * result.unitPrice,
              );
              result.overtimeAmount = RoundSetting.apply(
                (result.overtimeMinutes * result.overtimeUnitPrice) / 60,
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
      billingDate: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.billingDateAt) return null;
          const jstDate = new Date(
            this.billingDateAt.getTime() + 9 * 60 * 60 * 1000,
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          const day = jstDate.getUTCDate();
          return `${year}-${String(month).padStart(2, "0")}-${String(
            day,
          ).padStart(2, "0")}`;
        },
        set(v) {},
      },
      billingMonth: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.billingDateAt) return null;
          const jstDate = new Date(
            this.billingDateAt.getTime() + 9 * 60 * 60 * 1000,
          ); /* JST補正 */
          const year = jstDate.getUTCFullYear();
          const month = jstDate.getUTCMonth() + 1;
          return `${year}-${String(month).padStart(2, "0")}`;
        },
        set(v) {},
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

    /** Triggers */
    let _agreement = this.agreement;
    Object.defineProperties(this, {
      agreement: {
        configurable: true,
        enumerable: true,
        get() {
          return _agreement;
        },
        set(v) {
          const oldKey = _agreement ? _agreement.key : null;
          const newKey = v ? v.key : null;
          if (oldKey === newKey) return;
          _agreement = v;
          this.allowEmptyAgreement = false; // 取極めが設定された場合は許容を解除
          this.refreshBillingDateAt();
        },
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
      this.agreement.cutoffDate,
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
   * Synchronize customerId and apply (re-apply) agreement from siteId
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   * @throws {Error} If the specified siteId does not exist
   */
  async _syncCustomerIdAndApplyAgreement(args = {}) {
    if (!this.siteId) return;
    const siteInstance = new Site();
    const siteExists = await siteInstance.fetch({
      ...args,
      docId: this.siteId,
    });
    if (!siteExists) {
      const message = `[OperationResult.js] The specified siteId (${this.siteId}) does not exist.`;
      throw new Error(message);
    }
    this.customerId = siteInstance.customerId;
    this.agreement = siteInstance.getAgreement(this);
  }

  /**
   * Override beforeCreate to sync customerId
   * @param {Object} args - Creation options.
   * @param {string} [args.docId] - Document ID to use (optional).
   * @param {boolean} [args.useAutonumber=true] - Whether to use auto-numbering.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeCreate(args = {}) {
    await super.beforeCreate(args);

    // Sync customerId and apply agreement
    await this._syncCustomerIdAndApplyAgreement();
  }

  /**
   * Override beforeUpdate to sync customerId and apply agreement if key changed
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeUpdate(args = {}) {
    await super.beforeUpdate(args);

    // 更新前および更新後の `isLocked` が true の場合は編集不可とする。
    if (this.isLocked && this._beforeData.isLocked) {
      const message = `[OperationResult.js] This OperationResult (docId: ${this.docId}) is locked and cannot be edited.`;
      throw new Error(message);
    }

    // Sync customerId and apply agreement if key changed
    if (this.agreementKey !== this._beforeData.agreementKey) {
      await this._syncCustomerIdAndApplyAgreement();
    }
  }

  /**
   * Override beforeDelete to prevent deletion if isLocked is true
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   * @throws {Error} If isLocked is true
   */
  async beforeDelete(args = {}) {
    await super.beforeDelete(args);

    // 更新前および更新後の `isLocked` が true の場合は削除不可とする。
    if (this.isLocked && this._beforeData.isLocked) {
      const message = `[OperationResult.js] This OperationResult (docId: ${this.docId}) is locked and cannot be deleted.`;
      throw new Error(message);
    }
  }
}
