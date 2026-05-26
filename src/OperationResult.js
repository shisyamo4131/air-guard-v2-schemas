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
 * ### 備考
 * - `OperationResult` ドキュメントは `agreement` プロパティが設定されていると、その内容をもとに `sales` プロパティを計算します。
 * - `agreement` プロパティが設定されておらず、かつ `useAdjusted` プロパティが true の場合、`adjusted*` フィールドをもとに `sales` プロパティを計算します。
 * - `agreement` プロパティが設定されている、または `useAdjusted` プロパティが true の場合に `isBillable` が true になります。
 * - `billingDateAt` は必須フィールドにしていません。これは、`agreement` が設定されていない場合に、`useAdjusted` を true にして手動で設定すべきだからです。
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
 * @property {boolean} useAdjusted - 請求に調整済み数量を使用するかどうかのフラグ
 * @property {number} adjustedQuantityBase - 基本従業員の調整済み数量
 * - `useAdjusted` が true の場合、基本従業員の請求に使用される数量です。
 * @property {number} adjustedOvertimeMinutesBase - 基本従業員の調整済み残業時間
 * - `useAdjusted` が true の場合、基本従業員の請求に使用される残業時間です。
 * @property {number} adjustedQuantityQualified - 資格者の調整済み数量
 * - `useAdjusted` が true の場合、資格者の請求に使用される数量です。
 * @property {number} adjustedOvertimeMinutesQualified - 資格者の調整済み残業時間
 * - `useAdjusted` が true の場合、資格者の請求に使用される残業時間です。
 * @property {number} adjustedUnitPriceBase - 基本従業員の調整済み単価
 * - `useAdjusted` が true の場合、基本従業員の請求に使用される単価です。
 * @property {number} adjustedOvertimeUnitPriceBase - 基本従業員の調整済み残業単価
 * - `useAdjusted` が true の場合、基本従業員の請求に使用される残業単価です。
 * @property {number} adjustedUnitPriceQualified - 資格者の調整済み単価
 * - `useAdjusted` が true の場合、資格者の請求に使用される単価です。
 * @property {number} adjustedOvertimeUnitPriceQualified - 資格者の調整済み残業単価
 * - `useAdjusted` が true の場合、資格者の請求に使用される残業単価です。
 * @property {Date} billingDateAt - 請求日
 * - 請求に使用される日付です。
 * @property {boolean} isLocked - ロックフラグ
 * - true の場合、OperationResult は OperationBilling として編集する場合を除き、編集できません。
 * @property {Agreement|null} agreement - 関連する取極めオブジェクト
 * - この OperationResult に関連付けられた取極めインスタンスで、価格設定や請求情報に使用されます。
 * - 設定されている場合、単価や請求日などの計算に影響を与えます。
 * @property {boolean} hasAgreement - 取極めが関連付けられているかどうかを示すフラグ (読み取り専用)
 * - `agreement` が設定されている場合は `true`、それ以外の場合は `false`。
 * @property {boolean} isBillable - OperationBilling ドキュメントが作成される条件を満たしているかどうかを示すフラグ (読み取り専用)
 * - `hasAgreement` が true または `useAdjusted` が true の場合に `true`。それ以外は `false`。
 * @property {Object} statistics - 従業員の統計情報 (読み取り専用)
 * - 基本従業員と資格者のカウントおよび総労働時間を含む統計情報。
 * - 構造: { base: {...}, qualified: {...}, total: {...} }
 * - 各カテゴリには以下が含まれます: quantity, regularTimeWorkMinutes, overtimeWorkMinutes, totalWorkMinutes, breakMinutes
 * - 各カテゴリには 'ojt' サブカテゴリも同様の構造で含まれます。
 * @property {Object} sales - 売上金額 (読み取り専用)
 * - 実績ベース（original）と調整済み（adjusted）の2層構造。
 * - 構造: { original: { base, qualified }, adjusted: { base, qualified } }
 * - `useAdjusted` に関係なく常に両方が計算される。
 * - original: agreement の rates と statistics から算出。
 * - adjusted: adjusted* フィールドから算出。
 * - 各カテゴリには以下が含まれます: unitPrice, quantity, regularAmount, overtimeUnitPrice, overtimeMinutes, overtimeAmount, total
 * @property {number} salesAmount - 売上合計金額 (読み取り専用)
 * - `useAdjusted` が true の場合は `sales.adjusted`、false の場合は `sales.original` を使用して合計を算出。
 * @property {number} tax - 計算された税額 (読み取り専用)
 * - `salesAmount` と `date` に基づいて `Tax` ユーティリティを使用して計算されます。
 * @property {number} billingAmount - 税込の請求金額 (読み取り専用)
 * - `salesAmount` と `tax` の合計を返します。
 * @property {string|null} billingDate - 請求日 (YYYY-MM-DD 形式) (読み取り専用)
 * - `billingDateAt` に基づいて YYYY-MM-DD 形式の文字列を返します。
 * @property {string} billingMonth - 請求月 (YYYY-MM 形式) (読み取り専用)
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
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
 * @getter {Array<Object>} invalidReasons - エラーコード、メッセージ、多言語メッセージ、フィールド名を含む詳細情報の配列を返すプロパティ
 * @getter {boolean} isGroupKeyChanged - `groupKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isAgreementKeyChanged - `agreementKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isEmployeesChanged - 従業員が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {boolean} isOutsourcersChanged - 外注が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {Array<OperationDetail>} addedWorkers - 追加された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} removedWorkers - 削除された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} updatedWorkers - 更新された従業員の配列 (読み取り専用)
 *
 * @static SHIFT_TYPE - 勤務区分を定義する定数オブジェクト
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
import { formatJstDate } from "./utils/index.js";
import Tax from "./Tax.js";
import { VALUES as BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";
import RoundSetting from "./RoundSetting.js";
import CutoffDate from "./utils/CutoffDate.js";
import Site from "./Site.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

const classProps = {
  ...Operation.classProps,
  siteOperationScheduleId: defField("oneLine", { hidden: true }),
  /**
   * `employees`, `outsourcers` は 継承元である `Operation` クラスで定義されているが、
   * customClass が `OperationDetail` になっているため、`OperationResultDetail` で再定義する。
   */
  employees: defField("array", { customClass: OperationResultDetail }),
  outsourcers: defField("array", {
    customClass: OperationResultDetail,
  }),
  useAdjusted: defField("check", {
    label: "数量・金額を調整する",
    default: false,
  }),
  adjustedQuantityBase: defField("number", {
    label: "基本数量（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedQuantityBase must be a number",
          {
            ja: "基本数量（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedOvertimeMinutesBase: defField("number", {
    label: "基本残業時間（分/調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeMinutesBase must be a number",
          {
            ja: "基本残業時間（分/調整後）は、数値でなければなりません",
          },
        );
      }
      if (value % 15 !== 0) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeMinutesBase must be a multiple of 15",
          {
            ja: "基本残業時間（分/調整後）は、15 分単位でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedQuantityQualified: defField("number", {
    label: "資格数量（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedQuantityQualified must be a number",
          {
            ja: "資格数量（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedOvertimeMinutesQualified: defField("number", {
    label: "資格残業時間（分/調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeMinutesQualified must be a number",
          {
            ja: "資格残業時間（分/調整後）は、数値でなければなりません",
          },
        );
      }
      if (value % 15 !== 0) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeMinutesQualified must be a multiple of 15",
          {
            ja: "資格残業時間（分/調整後）は、15 分単位でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedUnitPriceBase: defField("number", {
    label: "基本単価（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedUnitPriceBase must be a number",
          {
            ja: "基本単価（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedOvertimeUnitPriceBase: defField("number", {
    label: "基本残業単価（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeUnitPriceBase must be a number",
          {
            ja: "基本残業単価（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedUnitPriceQualified: defField("number", {
    label: "資格単価（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedUnitPriceQualified must be a number",
          {
            ja: "資格単価（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  adjustedOvertimeUnitPriceQualified: defField("number", {
    label: "資格残業単価（調整後）",
    default: 0,
    required: true,
    validator: (value, item) => {
      if (value === null || value === undefined) return true; // required でエラーになる
      if (typeof value !== "number" || isNaN(value)) {
        return VALIDATION_ERRORS.CUSTOM_ERROR(
          "INVALID_VALUE",
          "adjustedOvertimeUnitPriceQualified must be a number",
          {
            ja: "資格残業単価（調整後）は、数値でなければなりません",
          },
        );
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  billingDateAt: defField("dateAt", {
    label: "請求締日",
    validator: (value, item) => {
      if (item.useAdjusted && !value) {
        return VALIDATION_ERRORS.REQUIRED_FIELD_ERROR("billingDateAt");
      }
      return true;
    },
    component: {
      attrs: {
        required: ({ item }) => item.useAdjusted,
        disabled: ({ item }) => !item.useAdjusted,
      },
    },
  }),
  isLocked: defField("check", {
    label: "実績確定",
    default: false,
    hidden: true,
  }),
  agreement: defField("object", { label: "取極め", customClass: AgreementV2 }),

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
      /**
       * hasAgreement
       * - getter 定義でも良いが、Firestore のクエリで使用する可能性があるため、
       *   Object.defineProperty で列挙可能プロパティとして定義する。
       */
      hasAgreement: {
        configurable: true,
        enumerable: true,
        get() {
          return this.agreement != null;
        },
        set(v) {},
      },

      /**
       * isBillable
       * - OperationBilling ドキュメントが作成される条件を満たしているかどうかを示すフラグ。
       * - `hasAgreement` が true または `useAdjusted` が true の場合に true を返す。
       * - Firestore のクエリで使用する可能性があるため、Object.defineProperty で列挙可能プロパティとして定義する。
       */
      isBillable: {
        configurable: true,
        enumerable: true,
        get() {
          return this.hasAgreement || this.useAdjusted;
        },
        set(v) {},
      },

      /**
       * 統計情報
       */
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

      /**
       * 売上情報
       * - 実績ベース（original）と調整済み（adjusted）の2層構造。
       * - 構造: { original: { base, qualified }, adjusted: { base, qualified } }
       * - `useAdjusted` に関係なく常に両方を計算する。
       * - original: agreement の rates と statistics から算出。
       * - adjusted: adjusted* フィールドから算出。
       */
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

          // 実績ベース（agreement の rates を使用）での計算
          const calculateOriginalCategorySales = (category) => {
            const isQualified = category === "qualified";
            const categoryStats = this.statistics?.[category];
            const rateSet = this.agreement?.rates?.[this.dayType];

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

            // 数量と残業時間を実績から計算
            const isPerHour =
              this.agreement?.billingUnitType ===
              BILLING_UNIT_TYPE.PER_HOUR.value;

            if (isPerHour) {
              let totalMinutes = categoryStats.totalWorkMinutes || 0;
              if (this.agreement?.includeBreakInBilling) {
                totalMinutes += categoryStats.breakMinutes || 0;
              }
              result.quantity = totalMinutes / 60;
            } else {
              result.quantity = categoryStats.quantity || 0;
            }
            result.overtimeMinutes = categoryStats.overtimeWorkMinutes || 0;

            // agreementがある場合のみ単価と金額を計算
            if (this.agreement) {
              if (!rateSet) {
                console.warn(
                  `[OperationResult] AgreementV2.rates for dayType '${this.dayType}' is missing.`,
                  {
                    docId: this.docId,
                    dateAt: this.dateAt,
                    siteId: this.siteId,
                    dayType: this.dayType,
                    agreement: this.agreement,
                  },
                );
                return result;
              }

              result.unitPrice = isQualified
                ? rateSet.unitPriceQualified || 0
                : rateSet.unitPriceBase || 0;
              result.overtimeUnitPrice = isQualified
                ? rateSet.overtimeUnitPriceQualified || 0
                : rateSet.overtimeUnitPriceBase || 0;

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

          // 調整済みフィールドでの計算
          const calculateAdjustedCategorySales = (category) => {
            const isQualified = category === "qualified";
            const categoryStats = this.statistics?.[category];

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

            result.quantity = isQualified
              ? this.adjustedQuantityQualified || 0
              : this.adjustedQuantityBase || 0;
            result.overtimeMinutes = isQualified
              ? this.adjustedOvertimeMinutesQualified || 0
              : this.adjustedOvertimeMinutesBase || 0;
            result.unitPrice = isQualified
              ? this.adjustedUnitPriceQualified || 0
              : this.adjustedUnitPriceBase || 0;
            result.overtimeUnitPrice = isQualified
              ? this.adjustedOvertimeUnitPriceQualified || 0
              : this.adjustedOvertimeUnitPriceBase || 0;

            result.regularAmount = RoundSetting.apply(
              result.quantity * result.unitPrice,
            );
            result.overtimeAmount = RoundSetting.apply(
              (result.overtimeMinutes * result.overtimeUnitPrice) / 60,
            );
            result.total = result.regularAmount + result.overtimeAmount;

            return result;
          };

          return {
            original: {
              base: calculateOriginalCategorySales("base"),
              qualified: calculateOriginalCategorySales("qualified"),
            },
            adjusted: {
              base: calculateAdjustedCategorySales("base"),
              qualified: calculateAdjustedCategorySales("qualified"),
            },
          };
        },
        set(v) {},
      },

      /**
       * 売上金額
       * - `useAdjusted` が true の場合は `sales.adjusted`、false の場合は `sales.original` を使用する。
       */
      salesAmount: {
        configurable: true,
        enumerable: true,
        get() {
          const target = this.useAdjusted
            ? this.sales.adjusted
            : this.sales.original;
          const amount = target.base.total + target.qualified.total;
          return RoundSetting.apply(amount);
        },
        set(v) {},
      },

      /**
       * 消費税額
       */
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

      /**
       * 税込請求額
       */
      billingAmount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.salesAmount + this.tax;
        },
        set(v) {},
      },

      /**
       * 請求日
       */
      billingDate: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.billingDateAt);
        },
        set(v) {},
      },

      /**
       * 請求年月
       */
      billingMonth: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.billingDateAt, "YYYY-MM");
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
    // this.agreement = siteInstance.getAgreement(this);
    this.agreement = siteInstance.getValidAgreement(this);
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
}
