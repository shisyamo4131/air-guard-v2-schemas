/*****************************************************************************
 * @file ./src/OperationBilling.js
 * @author shisyamo4131
 * @description 稼働請求クラス
 *
 * @class
 * @extends OperationResult
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
 * @property {string|false} isInvalid - バリデーションステータス (読み取り専用)
 * - 有効な場合は false を返します。
 * - 無効な場合は理由コードの文字列を返します:
 *   - `EMPTY_BILLING_DATE`: 請求日が存在しない場合。
 *   - `EMPTY_AGREEMENT`: 取極めが存在せず、`allowEmptyAgreement` が false の場合。
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 * @method addWorker - `Workers` に新しい従業員または外注先を追加します。
 * @method moveWorker - 従業員または外注先の位置を移動します。
 * @method changeWorker - 従業員または外注先の詳細を変更します。
 * @method removeWorker - 従業員または外注先を `workers` から削除します。
 * @method setSiteIdCallback - `siteId` が変更された時に呼び出されるコールバック関数
 * @method setShiftTypeCallback - `shiftType` が変更された時に呼び出されるコールバック関数
 * @method setRegulationWorkMinutesCallback - `regulationWorkMinutes` が変更された時に呼び出されるコールバック関数
 * @method refreshBillingDateAt - 請求日を `dateAt` と `cutoffDate` に基づいて更新します。
 * - 現在の `dateAt` と `cutoffDate` の値に基づいて `billingDateAt` を更新します。
 *
 * @method toggleLock - OperationResult ドキュメントのロック状態を切り替える
 * - 指定されたドキュメント ID の OperationResult ドキュメントを取得し、その `isLocked` プロパティを指定された値に更新します。
 * - ドキュメントが存在しない場合や、無効な引数が提供された場合はエラーをスローします。
 *
 * @override
 * @method create - このクラスのインスタンスは `create` メソッドを使用できません。
 * - 稼働請求のレコードは通常、OperationResult クラスを通じて生成されるため、OperationBilling クラスのインスタンスの作成は実装されていません。
 * @method delete - このクラスのインスタンスは `delete` メソッドを使用できません。
 * - 稼働請求のレコードは通常、OperationResult クラスを通じて生成されるため、OperationBilling クラスのインスタンスの削除は実装されていません。
 *****************************************************************************/
import OperationResult from "./OperationResult.js";

export default class OperationBilling extends OperationResult {
  static className = "稼働請求";

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
    { title: "売上金額", key: "salesAmount", value: "salesAmount" },
  ];

  /**
   * Override create method to disallow creation of OperationBilling instances
   * @returns
   */
  async create() {
    return Promise.reject(
      new Error(
        "[OperationBilling.js] Creation of OperationBilling is not implemented.",
      ),
    );
  }

  /**
   * Override delete method to disallow deletion of OperationBilling instances
   * @returns {Promise<void>}
   */
  async delete() {
    return Promise.reject(
      new Error(
        "[OperationBilling.js] Deletion of OperationBilling is not implemented.",
      ),
    );
  }

  /**
   * Toggle the lock status of an OperationResult document
   * @param {string} docId - Document ID
   * @param {boolean} value - Lock status value
   */
  static async toggleLock(docId, value) {
    if (!docId || typeof docId !== "string") {
      throw new Error("Invalid docId provided to toggleLock method");
    }
    if (typeof value !== "boolean") {
      throw new Error("Invalid value provided to toggleLock method");
    }
    const instance = new OperationBilling();
    const doc = await instance.fetchDoc({ docId });
    if (!doc) {
      throw new Error(`OperationResult document with ID ${docId} not found`);
    }
    doc.isLocked = value;
    await doc.update();
  }
}
