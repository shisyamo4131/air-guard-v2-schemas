/*****************************************************************************
 * @file ./src/WorkingResult.js
 * @author shisyamo4131
 * @description 勤務実績クラス
 * - 勤務実績を表す抽象クラスです。インスタンス化はできません。
 *
 * @class
 * @extends WorkTimeBase
 * @abstract
 * @see Operation
 * @see OperationDetail
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
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 *
 * @getter {boolean} isInvalid - クラス特有のエラーが存在するかどうかを返すプロパティ
 * @getter {Array<Object>} invalidReasons - エラーコード、メッセージ、多言語メッセージ、フィールド名を含む詳細情報の配列を返すプロパティ
 *
 * @static SHIFT_TYPE - 勤務区分を定義する定数オブジェクト
 * @static INVALID_REASON - クラス特有のエラーコードを定義する定数オブジェクト
 * - `BREAK_MINUTES_NEGATIVE`: `breakMinutes` が負の値である場合のエラーコード
 * - `REGULATION_WORK_MINUTES_NEGATIVE`: `regulationWorkMinutes` が負の値である場合のエラーコード
 * @static DAY_TYPE - 曜日区分を定義する定数オブジェクト
 *****************************************************************************/
import { defField } from "./parts/fieldDefinitions.js";
import { getDayType } from "./constants/day-type.js";
import { VALUES as DAY_TYPE } from "./constants/day-type.js";
import WorkTimeBase from "./WorkTimeBase.js";

const classProps = {
  ...WorkTimeBase.classProps,
  dayType: defField("dayType", { required: true }),
};

/*****************************************************************************
 * WorkingResult
 *****************************************************************************/
export default class WorkingResult extends WorkTimeBase {
  static className = "WorkingResult";
  static collectionPath = "WorkingResults";
  static classProps = classProps;

  static DAY_TYPE = DAY_TYPE;

  /**
   * Constructor
   * - 抽象クラスのため、直接のインスタンス化を防止します。
   * @param {Object} item - 初期化オブジェクト
   */
  constructor(item = {}) {
    if (new.target === WorkingResult) {
      throw new Error(
        "WorkingResult is an abstract class and cannot be instantiated directly.",
      );
    }
    super(item);
  }

  /**
   * afterInitialize
   * @param {Object} item - 初期化オブジェクト
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      /**
       * `startAt`, `endAt`, `breakMinutes` から総労働時間を計算して返します。
       */
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const breakMinutes = this.breakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },

      /**
       * 所定労働時間を返します。
       * - `totalWorkMinutes` のうち `regulationWorkMinutes` の範囲である部分を返します。
       * - 実際の労働時間が所定労働時間未満の場合（早退など）は `totalWorkMinutes` と同じ値になります。
       * - 実際の労働時間が所定労働時間を超える場合（残業など）は `regulationWorkMinutes` と同じ値になります。
       */
      regularTimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          return Math.min(this.totalWorkMinutes, this.regulationWorkMinutes);
        },
        set: (v) => {},
      },
      /**
       * 残業時間を返します。
       * - `totalWorkMinutes` から `regulationWorkMinutes` を引いた値を返します。
       * - 残業時間は負の値にならないように、最小値は 0 になります。
       */
      overtimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const diff = this.totalWorkMinutes - this.regulationWorkMinutes;
          return Math.max(0, diff);
        },
        set: (v) => {},
      },
    });
  }

  /**
   * `WorkTimeBase` クラスの `setDateAtCallback` をオーバライドします。
   * - `dayType` を更新します。
   * @param {Date} v - 新しい `dateAt` 値
   * @returns {void}
   */
  setDateAtCallback(v) {
    super.setDateAtCallback(v);
    this.dayType = getDayType(v);
  }
}
