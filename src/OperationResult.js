/*****************************************************************************
 * @file ./src/OperationResult.js
 * @author shisyamo4131
 * @description 稼働実績クラス
 * ### ドキュメント作成前処理
 * - `siteId` から `customerId` を同期し、関連する `agreement` を適用します。
 *
 * ### ドキュメント更新前処理
 * - 更新前および更新後の `isLocked` が true の場合は編集不可とします。（`isLocked` は `OperationBilling` クラスで更新されます。）
 * - `groupKey` が変更された場合は `customerId` の同期と `agreement` の適用を行います。
 *
 * @class
 * @extends Operation
 * @abstract
 * @see OperationDetail
 *
 * @property {Date} dateAt - 日付 (変更されると `dayType` が自動的に更新されます)
 * @property {string} shiftType - 勤務区分 (変更されると `employees` と `outsourcers` の `shiftType` が自動的に更新されます)
 * @property {string} startTime - 開始時刻 (HH:MM 形式)
 * @property {string} endTime - 終了時刻 (HH:MM 形式)
 * @property {boolean} isStartNextDay - 翌日開始フラグ
 * - `true` の場合、実際の勤務は `dateAt` の翌日であることを意味します。
 * @property {number} breakMinutes - 休憩時間 (分)
 * @property {string} date - `dateAt` に基づく YYYY-MM-DD 形式の日付文字列 (読み取り専用)
 * - `dateAt` に基づいて YYYY-MM-DD 形式の文字列を返します。
 * @property {Date} startAt - 開始日時 (Date オブジェクト) (読み取り専用)
 * - `dateAt` に基づいて `startTime` を設定した Date オブジェクトを返します。
 * - `isStartNextDay` が true の場合、1日加算します。
 * @property {Date} endAt - 終了日時 (Date オブジェクト) (読み取り専用)
 * - `startAt` を起点に、最初に現れる `endTime` の Date オブジェクトを返します。
 * @property {boolean} isSpansNextDay - 翌日跨ぎフラグ (読み取り専用)
 * - `true` の場合、`startAt` と `endAt` の日付が異なることを意味します。
 * @property {number} regulationWorkMinutes - 規定労働時間 (分) (変更されると `employees` と `outsourcers` の `regulationWorkMinutes` が自動的に更新されます)
 * - `startAt` から `endAt` までの時間から `breakMinutes` を差し引いた時間のうち、
 *   規定内として扱う労働時間（分）です。
 * - 実際の労働時間から残業時間を算出するための基準となる値です。
 * - この値があることで、取極めに柔軟な設定を行うことが可能になる他、労働基準法の 1 日の所定労働時間上限が変更された際に
 *   影響を最小限に抑えることができます。
 * 例) 8:00 から 17:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 8 時間 (480 分) とし、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 * 例) 8:00 から 16:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 7 時間 (420 分) とすると、実際の勤務が 7 時間 (420 分) を超えた分が残業時間として扱われます。
 * - 規定労働時間を 8 時間 (480 分) とすると、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 * 例) 7:00 から 翌日 7:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 8 時間 (480 分) とすると、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 *   この場合、最初の 8 時間までは基本単価が適用され、残りの 8 時間は残業単価が適用されるといった設定が可能になります。
 * - 規定労働時間を 24 時間 (1440 分) とすると、実際の勤務が 24 時間 (1440 分) を超えた分が残業時間として扱われます。
 *   この場合、全ての勤務時間が基本単価で扱われるといった設定が可能になります。
 * @property {string} dayType - 曜日区分
 * @property {number} totalWorkMinutes - 総労働時間 (休憩時間を除く) (分) (読み取り専用)
 * @property {number} regularTimeWorkMinutes - 所定労働時間 (分) (読み取り専用)
 * @property {number} overtimeWorkMinutes - 残業時間 (分) (読み取り専用)
 * @property {string} siteId - 現場ID (変更されると `employees` と `outsourcers` の `siteId` が自動的に更新されます)
 * @property {number} requiredPersonnel - 必要人数
 * @property {boolean} qualificationRequired - 資格要件フラグ
 * @property {string} workDescription - 作業内容
 * @property {string} remarks - 備考
 * @property {Array<OperationDetail>} employees - 従業員の OperationDetail インスタンスの配列
 * @property {Array<OperationDetail>} outsourcers - 外注の OperationDetail インスタンスの配列
 * @property {Array<string>} employeeIds - 従業員の ID の配列 (読み取り専用)
 * @property {Array<string>} outsourcerIds - 外注の ID の配列 (読み取り専用)
 * @property {number} employeesCount - `employees` の要素数 (読み取り専用)
 * @property {number} outsourcersCount - `outsourcers` の要素数 (読み取り専用)
 * @property {boolean} isPersonnelShortage - 人員不足フラグ (読み取り専用)
 * @property {Array<OperationDetail>} workers - 従業員と外注を合わせた配列
 * - `employees` と `outsourcers` を結合した配列を返します。
 * - Getter: `employees` と `outsourcers` を結合した配列を返します。
 * - Setter: 配列を `isEmployee` プロパティに基づいて `employees` と `outsourcers` に分割します。
 * @property {string} groupKey - `siteId`, `shiftType`, `date` を組み合わせたキー。（読み取り専用）
 * @property {string} agreementKey - `date`, `shiftType` を組み合わせたキー。（読み取り専用）
 * @property {string} orderKey - `siteId`, `shiftType` を組み合わせたキー。（読み取り専用）
 * @property {string|null} siteOperationScheduleId - 現場稼働予定ID
 * - このプロパティは、OperationResult が現場稼働予定に紐づいている場合に、その現場稼働予定の ID を保持します。
 * @property {boolean} useAdjustedQuantity - 請求に調整済み数量を使用するかどうかのフラグ
 * @property {number} adjustedQuantityBase - 基本従業員の調整済み数量
 * - `useAdjustedQuantity` が true の場合、基本従業員の請求に使用される数量です。
 * @property {number} adjustedOvertimeBase - 基本従業員の調整済み残業時間
 * - `useAdjustedQuantity` が true の場合、基本従業員の請求に使用される残業時間です。
 * @property {number} adjustedQuantityQualified - 資格者の調整済み数量
 * - `useAdjustedQuantity` が true の場合、資格者の請求に使用される数量です。
 * @property {number} adjustedOvertimeQualified - 資格者の調整済み残業時間
 * - `useAdjustedQuantity` が true の場合、資格者の請求に使用される残業時間です。
 * @property {Date} billingDateAt - 請求日
 * - 請求に使用される日付です。
 * @property {boolean} isLocked - ロックフラグ
 * - true の場合、OperationResult は OperationBilling として編集する場合を除き、編集できません。
 * @property {Agreement|null} agreement - 関連する取極めオブジェクト
 * - この OperationResult に関連付けられた取極めインスタンスで、価格設定や請求情報に使用されます。
 * - 設定されている場合、単価や請求日などの計算に影響を与えます。
 * @property {boolean} allowEmptyAgreement - 取極めが存在しない場合を許可するフラグ
 * - true に設定されている場合、取極めが関連付けられていなくても OperationResult は有効と見なされます。
 * @property {boolean} hasAgreement - 取極めが関連付けられているかどうかを示すフラグ (読み取り専用)
 * - `agreement` が設定されている場合は `true`、それ以外の場合は `false`。
 * @property {Object} statistics - 従業員の統計情報 (読み取り専用)
 * - 基本従業員と資格者のカウントおよび総労働時間を含む統計情報。
 * - 構造: { base: {...}, qualified: {...}, total: {...} }
 * - 各カテゴリには以下が含まれます: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - 各カテゴリには 'ojt' サブカテゴリも同様の構造で含まれます。
 * @property {Object} sales - 売上金額 (読み取り専用)
 * - 基本従業員と資格者の売上計算を含む。
 * - 構造: { base: {...}, qualified: {...} }
 * - 各カテゴリには以下が含まれます: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * - 計算は `useAdjustedQuantity`, `billingUnitType`, `includeBreakInBilling` の設定を考慮します。
 * @property {number} salesAmount - 売上合計金額 (読み取り専用)
 * - 基本従業員と資格者の売上金額の合計を返します。
 * @property {number} tax - 計算された税額 (読み取り専用)
 * - `salesAmount` と `date` に基づいて `Tax` ユーティリティを使用して計算されます。
 * @property {number} billingAmount - 税込の請求金額 (読み取り専用)
 * - `salesAmount` と `tax` の合計を返します。
 * @property {string|null} billingDate - 請求日 (YYYY-MM-DD 形式) (読み取り専用)
 * - `billingDateAt` に基づいて YYYY-MM-DD 形式の文字列を返します。
 * @property {string} billingMonth - 請求月 (YYYY-MM 形式) (読み取り専用)
 *
 * @property {string|false} isInvalid - バリデーションステータス (読み取り専用)
 * - 有効な場合は false を返します。
 * - 無効な場合は理由コードの文字列を返します:
 *   - `EMPTY_BILLING_DATE`: 請求日が存在しない場合。
 *   - `EMPTY_AGREEMENT`: 取極めが存在せず、`allowEmptyAgreement` が false の場合。
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 * @method getInvalidReasons - クラス特有のエラーの有無を返すメソッド
 * @method addWorker - `Workers` に新しい従業員または外注先を追加します。
 * @method moveWorker - 従業員または外注先の位置を移動します。
 * @method changeWorker - 従業員または外注先の詳細を変更します。
 * @method removeWorker - 従業員または外注先を `workers` から削除します。
 * @method setSiteIdCallback - `siteId` が変更された時に呼び出されるコールバック関数
 * @method setShiftTypeCallback - `shiftType` が変更された時に呼び出されるコールバック関数
 * @method setRegulationWorkMinutesCallback - `regulationWorkMinutes` が変更された時に呼び出されるコールバック関数
 * @method refreshBillingDateAt - Refresh billingDateAt based on dateAt and cutoffDate
 * - Updates `billingDateAt` based on the current `dateAt` and `cutoffDate` values.
 *
 * @getter {boolean} isInvalid - クラス特有のエラーが存在するかどうかを返すプロパティ
 * @getter {Array<string>} invalidReasons - クラス特有のエラーコードの配列を返すプロパティ
 * @getter {boolean} isGroupKeyChanged - `groupKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isAgreementKeyChanged - `agreementKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isEmployeesChanged - 従業員が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {boolean} isOutsourcersChanged - 外注が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {Array<OperationDetail>} addedWorkers - 追加された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} removedWorkers - 削除された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} updatedWorkers - 更新された従業員の配列 (読み取り専用)
 *
 * @static SHIFT_TYPE - 勤務区分を定義する定数オブジェクト
 * @static INVALID_REASON - クラス特有のエラーコードを定義する定数オブジェクト
 * - `BREAK_MINUTES_NEGATIVE`: `breakMinutes` が負の値である場合のエラーコード
 * - `REGULATION_WORK_MINUTES_NEGATIVE`: `regulationWorkMinutes` が負の値である場合のエラーコード
 * - `EMPTY_AGREEMENT`: 取極めが存在せず、`allowEmptyAgreement` が false の場合のエラーコード
 * - `EMPTY_BILLING_DATE`: 請求日が存在しない場合のエラーコード
 * @static DAY_TYPE - 曜日区分を定義する定数オブジェクト
 * @static BILLING_UNIT_TYPE - 請求単位区分を定義する定数オブジェクト
 *
 * @static
 * @method groupKeyDivider - `groupKey` を構成する要素を分割して返す静的メソッド
 *****************************************************************************/
import Operation from "./Operation.js";
import AgreementV2 from "./AgreementV2.js";
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
  agreement: defField("object", { label: "取極め", customClass: AgreementV2 }),
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

export default class OperationResult extends Operation {
  static className = "稼働実績";
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  static BILLING_UNIT_TYPE = BILLING_UNIT_TYPE;

  /**
   * INVALID_REASONS
   */
  static INVALID_REASON = {
    ...Operation.INVALID_REASON,
    EMPTY_BILLING_DATE: "EMPTY_BILLING_DATE",
    EMPTY_AGREEMENT: "EMPTY_AGREEMENT",
  };

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
   * ドキュメント作成前処理
   * - siteId から customerId を同期し、agreement を適用する。
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
   * ドキュメント更新前処理
   * - 更新前および更新後の `isLocked` が true の場合は編集不可とする。
   * - `groupKey` が変更された場合は `customerId` の同期と `agreement` の適用を行う。
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   * @returns {Promise<void>}
   */
  async beforeUpdate(args = {}) {
    await super.beforeUpdate(args);

    // 更新前および更新後の `isLocked` が true の場合は編集不可とする。
    if (this._beforeData.isLocked && this.isLocked) {
      const message = `[OperationResult.js] This OperationResult (docId: ${this.docId}) is locked and cannot be edited.`;
      throw new Error(message);
    }

    // groupKeyが変更された場合はcustomerIdの同期とagreementの適用を行う
    if (this.isGroupKeyChanged) {
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
    if (this._beforeData.isLocked && this.isLocked) {
      const message = `[OperationResult.js] This OperationResult (docId: ${this.docId}) is locked and cannot be deleted.`;
      throw new Error(message);
    }
  }

  /**
   * クラス特有のエラーの有無を返すメソッド
   * - `breakMinutes` が負の値である場合、`INVALID_REASON.BREAK_MINUTES_NEGATIVE` を返します。
   * - `regulationWorkMinutes` が負の値である場合、`INVALID_REASON.REGULATION_WORK_MINUTES_NEGATIVE` を返します。
   * - `agreement` が存在せず、`allowEmptyAgreement` が false の場合、`INVALID_REASON.EMPTY_AGREEMENT` を返します。
   * - `billingDateAt` が存在しない場合、`INVALID_REASON.EMPTY_BILLING_DATE` を返します。
   * @returns {Array<string>} エラーコードの配列
   */
  getInvalidReasons() {
    const result = super.getInvalidReasons();
    if (!this.agreement && !this.allowEmptyAgreement) {
      result.push(INVALID_REASON.EMPTY_AGREEMENT);
    }
    if (!this.billingDateAt) {
      result.push(INVALID_REASON.EMPTY_BILLING_DATE);
    }
    return result;
  }
}
