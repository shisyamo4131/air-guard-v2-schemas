/*****************************************************************************
 * @file ./src/SiteOperationScheduleDetail.js
 * @author shisyamo4131
 * @description 現場稼働予定明細クラス
 *
 * @class
 * @extends OperationDetail
 * @abstract
 * @see ArrangementNotification
 *
 * @property {Date} dateAt - 日付 (変更されると `dayType` が自動的に更新されます)
 * @property {string} shiftType - 勤務区分
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
 * @property {number} regulationWorkMinutes - 規定労働時間 (分)
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
 * @property {string} id - 従業員ID または 外注先ID
 * @property {number} index - 外注先の識別用インデックス (従業員の場合は常に0)
 * @property {boolean} isEmployee - 従業員フラグ (true: 従業員, false: 外注先)
 * @property {number} amount - 配置人数 (常に1で固定)
 * @property {string} siteId - 現場ID
 * @property {boolean} isQualified - 資格者フラグ
 * @property {boolean} isOjt - OJTフラグ
 * @property {string} workerId - 作業者ID (読み取り専用)
 * - 従業員の場合は `id` と同じ、外注先の場合は `id` と `index` を `:` で結合した文字列を返します。
 * @property {string|null} employeeId - 従業員ID (該当しない場合は null) (読み取り専用)
 * @property {string|null} outsourcerId - 外注先ID (該当しない場合は null) (読み取り専用)
 * @property {string} siteOperationScheduleId - 現場稼働予定ID
 * @property {boolean} hasNotification - 配置通知が作成されているかどうかのフラグ
 * - SiteOperationSchedule クラスから設定されます。
 * @property {string} notificationKey - 通知キー (読み取り専用)
 * - `siteOperationScheduleId` と `workerId` を `_` で連結した文字列を返します。
 * - `ArrangementNotification` のドキュメント ID と一致します。
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 * @method getInvalidReasons - クラス特有のエラーの有無を返すメソッド
 *
 * @getter {boolean} isInvalid - クラス特有のエラーが存在するかどうかを返すプロパティ
 * @getter {Array<string>} invalidReasons - クラス特有のエラーコードの配列を返すプロパティ
 *
 * @static SHIFT_TYPE - 勤務区分を定義する定数オブジェクト
 * @static INVALID_REASON - クラス特有のエラーコードを定義する定数オブジェクト
 * - `BREAK_MINUTES_NEGATIVE`: `breakMinutes` が負の値である場合のエラーコード
 * - `REGULATION_WORK_MINUTES_NEGATIVE`: `regulationWorkMinutes` が負の値である場合のエラーコード
 * @static DAY_TYPE - 曜日区分を定義する定数オブジェクト
 *****************************************************************************/
import OperationDetail from "./OperationDetail.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  ...OperationDetail.classProps,
  siteOperationScheduleId: defField("oneLine", { required: true }),
  hasNotification: defField("check"),
};
export default class SiteOperationScheduleDetail extends OperationDetail {
  static className = "現場稼働予定明細";
  static collectionPath = "SiteOperationScheduleDetails";
  static classProps = classProps;

  /**
   * afterInitialize
   * @param {Object} item - 初期化オブジェクト
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /** NOTIFICATION KEY */
    Object.defineProperties(this, {
      notificationKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.siteOperationScheduleId}_${this.workerId}`;
        },
        set() {},
      },
    });
  }
}
