/*****************************************************************************
 * @file ./src/WorkTimeBase.js
 * @author shisyamo4131
 * @description 勤務実績情報の基底クラス
 * - 日付や時間に関するプロパティを持つ抽象クラスです。インスタンス化はできません。
 * - 24時間を超える勤務は管理できません。`startTime` と `endTime` に同時刻が設定された場合は、24時間勤務と見做されます。
 *
 * @class
 * @extends FireModel
 * @abstract
 * @see AgreementV2
 * @see WorkingResult
 *
 * @property {Date} dateAt - 日付
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
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils/index.js";
import { VALUES as SHIFT_TYPE } from "./constants/shift-type.js";

const classProps = {
  dateAt: defField("dateAt", { required: true }),
  shiftType: defField("shiftType", { required: true }),
  startTime: defField("time", { label: "開始時刻", required: true }),
  isStartNextDay: defField("check", { label: "翌日開始" }),
  endTime: defField("time", { label: "終了時刻", required: true }),
  breakMinutes: defField("breakMinutes", { required: true }),
  regulationWorkMinutes: defField("regulationWorkMinutes", { required: true }),
};

/*****************************************************************************
 * WorkTimeBase
 *****************************************************************************/
export default class WorkTimeBase extends FireModel {
  static className = "WorkTimeBase";
  static collectionPath = "WorkTimeBases";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  static SHIFT_TYPE = SHIFT_TYPE;

  /**
   * INVALID_REASON
   */
  static INVALID_REASON = {
    ...FireModel.INVALID_REASON,
    BREAK_MINUTES_NEGATIVE: {
      code: "BREAK_MINUTES_NEGATIVE",
      message: "$1 must not be negative.",
    },
    REGULATION_WORK_MINUTES_NEGATIVE: {
      code: "REGULATION_WORK_MINUTES_NEGATIVE",
      message: "$1 must not be negative.",
    },
  };

  /**
   * Constructor
   * - 抽象クラスのため、直接のインスタンス化を防止します。
   * @param {Object} item - 初期化オブジェクト
   */
  constructor(item = {}) {
    if (new.target === WorkTimeBase) {
      throw new Error(
        "WorkTimeBase is an abstract class and cannot be instantiated directly.",
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

    let _dateAt = this.dateAt;
    Object.defineProperties(this, {
      /**
       * `dateAt` プロパティの変更に伴った処理を実現するため、`dateAt` を getter/setter で再定義します。
       * - `setDateAtCallback` メソッドを使用して `dateAt` の変更に伴うカスタム処理を実装可能です。
       */
      dateAt: {
        configurable: true,
        enumerable: true,
        get() {
          return _dateAt;
        },
        set(v) {
          if (_dateAt && v.getTime() === _dateAt.getTime()) {
            return;
          }
          const newDate = new Date(v);
          newDate.setHours(0, 0, 0, 0); // 時刻部分をクリア
          _dateAt = newDate;
          this.setDateAtCallback(newDate);
        },
      },

      /**
       * date - `dateAt` に基づく YYYY-MM-DD 形式の日付文字列 (読み取り専用)
       */
      date: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.dateAt) return "";
          // UTC時刻に9時間(JST)を加算してJST日付を取得
          const jstDate = new Date(this.dateAt.getTime() + 9 * 60 * 60 * 1000);
          const year = jstDate.getUTCFullYear();
          const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
          const day = String(jstDate.getUTCDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        },
        set(v) {},
      },

      /**
       * isSpansNextDay - 翌日跨ぎフラグ (読み取り専用)
       * - `startAt` の日付よりも `endAt` の日付が後である場合に `true` を返します。
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.startAt || !this.endAt) return false;
          const startDate = new Date(this.startAt);
          const endDate = new Date(this.endAt);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return endDate.getTime() > startDate.getTime();
        },
        set(v) {},
      },

      /**
       * startAt - 開始日時 (Date オブジェクト) (読み取り専用)
       * - `dateAt` に基づいて `startTime` を設定した Date オブジェクトを返します。
       * - `isStartNextDay` が true の場合、1日加算します。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.startTime) return null;
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.startTime, dateOffset);
        },
        set(v) {},
      },

      /**
       * endAt - 終了日時 (Date オブジェクト) (読み取り専用)
       * - `startAt` を起点に、最初に現れる `endTime` の Date オブジェクトを返します。
       * - `startTime` と `endTime` が同時刻の場合は 24時間勤務と見做し、`endAt` は翌日の同時刻になります。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.startAt || !this.endTime) return null;

          const baseDate = new Date(this.startAt);
          baseDate.setHours(0, 0, 0, 0);
          const endAt = getDateAt(baseDate, this.endTime, 0);

          if (endAt.getTime() <= this.startAt.getTime()) {
            endAt.setDate(endAt.getDate() + 1);
          }

          return endAt;
        },
        set(v) {},
      },
    });
  }

  /**
   * `dateAt` が変更されたときに呼び出されるコールバック関数
   * - サブクラスでこのメソッドをオーバーライドして、`dateAt` の変更に伴うカスタム処理を実装できます。
   * - `dateAt` をこの関数内で更新してはいけません。
   * @param {Date} v - 新しい `dateAt` 値
   * @returns {void}
   */
  setDateAtCallback(v) {}

  /**
   * クラス特有のエラーの有無を返すメソッド
   * - `breakMinutes` が負の値である場合、`INVALID_REASON.BREAK_MINUTES_NEGATIVE` のエラーメッセージを返します。
   * - `regulationWorkMinutes` が負の値である場合、`INVALID_REASON.REGULATION_WORK_MINUTES_NEGATIVE` のエラーメッセージを返します。
   * - 継承先のクラスでさらにエラー判定を追加する場合は、このメソッドをオーバーライドして、スーパークラスの結果に加えて独自のエラーメッセージを返すようにしてください。
   * @returns {Array<string>} エラーメッセージの配列
   */
  getInvalidReasons() {
    const result = super.getInvalidReasons();
    if (this.breakMinutes < 0) {
      result.push(
        WorkTimeBase.formatErrorMessage(
          WorkTimeBase.INVALID_REASON.BREAK_MINUTES_NEGATIVE,
          "Break minutes",
        ),
      );
    }
    if (this.regulationWorkMinutes < 0) {
      result.push(
        WorkTimeBase.formatErrorMessage(
          WorkTimeBase.INVALID_REASON.REGULATION_WORK_MINUTES_NEGATIVE,
          "Regulation work minutes",
        ),
      );
    }
    return result;
  }
}
