import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import OperationResult from "./OperationResult.js";
import { formatJstDate } from "./utils/index.js";
import { VALUES as BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";
import { VALUES as SHIFT_TYPE } from "./constants/shift-type.js";

/*****************************************************************************
 * @class DailyOperationByEmployee
 *
 * OperationResultDetail.dateAt（稼働日）を基準として、従業員ごとの日次稼働を
 * 集計するドキュメントです。
 *
 * @property {Date} dateAt - 稼働日
 * @property {string} date - 稼働日（YYYY-MM-DD、読み取り専用）
 * @property {string} employeeId - 従業員ID
 * @property {Array<OperationResult>} operationResults - 稼働実績の配列
 * @property {Array<string>} operationResultIds - 稼働実績IDの配列（読み取り専用）
 * @property {Array<Object>} details - 対象従業員の稼働明細（読み取り専用）
 * @property {Array<Object>} agreementBasedSalesDetails
 *   - 明細ごとの取極め基準売上計算結果（読み取り専用）
 * @property {number} operationCount - 稼働明細数（読み取り専用）
 * @property {number} dayOperationCount - 日勤の稼働明細数（読み取り専用）
 * @property {number} nightOperationCount - 夜勤の稼働明細数（読み取り専用）
 * @property {number} totalWorkMinutes - 総労働時間（分、読み取り専用）
 * @property {number} regularTimeWorkMinutes - 所定内労働時間（分、読み取り専用）
 * @property {number} overtimeWorkMinutes - 残業時間（分、読み取り専用）
 * @property {number} breakMinutes - 休憩時間（分、読み取り専用）
 * @property {number|null} agreementBasedSalesAmount
 *   - 算出可能な明細の取極め基準売上合計。全明細が未算出の場合は null。
 * @property {number} calculableDetailCount - 売上を算出できた明細数（読み取り専用）
 * @property {number} uncalculableDetailCount - 売上を算出できなかった明細数（読み取り専用）
 * @property {boolean} isAgreementBasedSalesComplete
 *   - 全明細の取極め基準売上を算出できたか（読み取り専用）
 *****************************************************************************/
export default class DailyOperationByEmployee extends FireModel {
  static className = "従業員別日次稼働";
  static collectionPath = "DailyOperationsByEmployee";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    dateAt: defField("dateAt", { required: true }),
    employeeId: defField("employeeId", { required: true }),
    operationResults: defField("array", {
      customClass: OperationResult,
    }),
  };

  /*****************************************************************************
   * AFTER INITIALIZE [OVERRIDE]
   *****************************************************************************/
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      /**
       * dateAtをYYYY-MM-DD形式に変換した稼働日を返します。
       */
      date: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.dateAt);
        },
        set(v) {},
      },

      /**
       * 当該ドキュメントに含まれる稼働実績IDを返します。
       * OperationResult更新・削除時の逆引きに使用します。
       */
      operationResultIds: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.operationResults ?? []).map((result) => result.docId);
        },
        set(v) {},
      },

      /**
       * 当該従業員・稼働日に該当するOperationResultDetailを返します。
       */
      details: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.operationResults ?? [])
            .flatMap((operationResult) => operationResult.employees ?? [])
            .filter(
              (detail) =>
                detail.id === this.employeeId && detail.date === this.date,
            );
        },
        set(v) {},
      },

      /**
       * 明細ごとの取極め基準売上計算結果を返します。
       * - useAdjustedおよびarticlesは使用しません。
       * - OJTは取極めの有無にかかわらず算出可能な0円として扱います。
       * - 通常明細で取極めまたは該当単価が存在しない場合は未算出とします。
       * - 金額は明細単位で合計後に四捨五入します。
       */
      agreementBasedSalesDetails: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.operationResults ?? []).flatMap((operationResult) => {
            const detail = (operationResult.employees ?? []).find(
              (employee) =>
                employee.id === this.employeeId &&
                employee.date === this.date,
            );
            if (!detail) return [];

            const baseResult = {
              operationResultId: operationResult.docId,
              shiftType: detail.shiftType,
              isQualified: detail.isQualified,
              isOjt: detail.isOjt,
              amount: null,
              isCalculable: false,
              uncalculableReason: null,
            };

            if (detail.isOjt) {
              return [
                {
                  ...baseResult,
                  amount: 0,
                  isCalculable: true,
                },
              ];
            }

            const agreement = operationResult.agreement;
            if (!agreement) {
              return [
                {
                  ...baseResult,
                  uncalculableReason: "AGREEMENT_NOT_FOUND",
                },
              ];
            }

            const rateSet = agreement.rates?.[detail.dayType];
            if (!rateSet) {
              return [
                {
                  ...baseResult,
                  uncalculableReason: "RATE_NOT_FOUND",
                },
              ];
            }

            const unitPrice = detail.isQualified
              ? rateSet.unitPriceQualified
              : rateSet.unitPriceBase;
            const overtimeUnitPrice = detail.isQualified
              ? rateSet.overtimeUnitPriceQualified
              : rateSet.overtimeUnitPriceBase;

            if (
              !Number.isFinite(unitPrice) ||
              !Number.isFinite(overtimeUnitPrice)
            ) {
              return [
                {
                  ...baseResult,
                  uncalculableReason: "RATE_NOT_FOUND",
                },
              ];
            }

            const isPerHour =
              agreement.billingUnitType === BILLING_UNIT_TYPE.PER_HOUR.value;
            const regularQuantity = isPerHour
              ? ((detail.totalWorkMinutes ?? 0) +
                  (agreement.includeBreakInBilling
                    ? detail.breakMinutes ?? 0
                    : 0)) /
                60
              : 1;
            const regularAmount = regularQuantity * unitPrice;
            const overtimeAmount =
              ((detail.overtimeWorkMinutes ?? 0) * overtimeUnitPrice) / 60;

            return [
              {
                ...baseResult,
                amount: Math.round(regularAmount + overtimeAmount),
                isCalculable: true,
              },
            ];
          });
        },
        set(v) {},
      },

      /**
       * 当該従業員の日次稼働明細数を返します。
       */
      operationCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.length;
        },
        set(v) {},
      },

      /**
       * 日勤の稼働明細数を返します。
       */
      dayOperationCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.filter(
            (detail) => detail.shiftType === SHIFT_TYPE.DAY.value,
          ).length;
        },
        set(v) {},
      },

      /**
       * 夜勤の稼働明細数を返します。
       */
      nightOperationCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.filter(
            (detail) => detail.shiftType === SHIFT_TYPE.NIGHT.value,
          ).length;
        },
        set(v) {},
      },

      /**
       * 全明細の総労働時間を返します。
       */
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.reduce(
            (total, detail) => total + (detail.totalWorkMinutes ?? 0),
            0,
          );
        },
        set(v) {},
      },

      /**
       * 全明細の所定内労働時間を返します。
       */
      regularTimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.reduce(
            (total, detail) => total + (detail.regularTimeWorkMinutes ?? 0),
            0,
          );
        },
        set(v) {},
      },

      /**
       * 全明細の残業時間を返します。
       */
      overtimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.reduce(
            (total, detail) => total + (detail.overtimeWorkMinutes ?? 0),
            0,
          );
        },
        set(v) {},
      },

      /**
       * 全明細の休憩時間を返します。
       */
      breakMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.reduce(
            (total, detail) => total + (detail.breakMinutes ?? 0),
            0,
          );
        },
        set(v) {},
      },

      /**
       * 算出可能な明細の取極め基準売上を合計して返します。
       * 全明細が未算出の場合は、0円との混同を避けるためnullを返します。
       */
      agreementBasedSalesAmount: {
        configurable: true,
        enumerable: true,
        get() {
          const calculableDetails = this.agreementBasedSalesDetails.filter(
            (detail) => detail.isCalculable,
          );
          if (calculableDetails.length === 0) return null;
          return calculableDetails.reduce(
            (total, detail) => total + detail.amount,
            0,
          );
        },
        set(v) {},
      },

      /**
       * 取極め基準売上を算出できた明細数を返します。
       */
      calculableDetailCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.agreementBasedSalesDetails.filter(
            (detail) => detail.isCalculable,
          ).length;
        },
        set(v) {},
      },

      /**
       * 取極め基準売上を算出できなかった明細数を返します。
       */
      uncalculableDetailCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.agreementBasedSalesDetails.filter(
            (detail) => !detail.isCalculable,
          ).length;
        },
        set(v) {},
      },

      /**
       * 全明細の取極め基準売上を算出できたかを返します。
       */
      isAgreementBasedSalesComplete: {
        configurable: true,
        enumerable: true,
        get() {
          return (
            this.agreementBasedSalesDetails.length > 0 &&
            this.uncalculableDetailCount === 0
          );
        },
        set(v) {},
      },
    });
  }

  /*****************************************************************************
   * CREATE [OVERRIDE]
   *****************************************************************************/
  async create(options = {}) {
    if (!this.date) {
      throw new Error(
        "dateAt is required to create DailyOperationByEmployee.",
      );
    }
    if (!this.employeeId) {
      throw new Error(
        "employeeId is required to create DailyOperationByEmployee.",
      );
    }
    const docId = `${this.employeeId}_${this.date}`;
    return await super.create({ ...options, docId, useAutonumber: false });
  }

  /*****************************************************************************
   * UPDATE [OVERRIDE]
   *****************************************************************************/
  async update(options = {}) {
    if (!this.date) {
      throw new Error(
        "dateAt is required to update DailyOperationByEmployee.",
      );
    }
    if (!this.employeeId) {
      throw new Error(
        "employeeId is required to update DailyOperationByEmployee.",
      );
    }
    return await super.update(options);
  }
}
