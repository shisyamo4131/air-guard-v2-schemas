import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import WorkTimeBase from "./WorkTimeBase.js";
import {
  BILLING_UNIT_TYPE_VALUES,
  DAY_TYPE_VALUES,
  SHIFT_TYPE_VALUES,
} from "./constants/index.js";

/*****************************************************************************
 * @class RateSet
 *****************************************************************************/
export class RateSet extends BaseClass {
  static className = "単価モデル";
  static classProps = {
    unitPriceBase: defField("price", { label: "基本単価" }),
    overtimeUnitPriceBase: defField("price", { label: "残業単価" }),
    unitPriceQualified: defField("price", { label: "資格者単価" }),
    overtimeUnitPriceQualified: defField("price", { label: "資格者残業単価" }),
  };
}

/*****************************************************************************
 * @class ShiftTypeRates
 *****************************************************************************/
export class ShiftTypeRates extends BaseClass {
  static className = "勤務区分単価モデル";
  static classProps = {
    DAY: defField("object", {
      customClass: RateSet,
      default: () => new RateSet(),
    }),
    NIGHT: defField("object", {
      customClass: RateSet,
      default: () => new RateSet(),
    }),
  };
}

/*****************************************************************************
 * @class DayTypeRates
 *****************************************************************************/
export class DayTypeRates extends BaseClass {
  static className = "曜日区分単価モデル";
  static classProps = {
    WEEKDAY: defField("object", {
      customClass: ShiftTypeRates,
      default: () => new ShiftTypeRates(),
    }),
    SATURDAY: defField("object", {
      customClass: ShiftTypeRates,
      default: () => new ShiftTypeRates(),
    }),
    SUNDAY: defField("object", {
      customClass: ShiftTypeRates,
      default: () => new ShiftTypeRates(),
    }),
    HOLIDAY: defField("object", {
      customClass: ShiftTypeRates,
      default: () => new ShiftTypeRates(),
    }),
  };
}

/*****************************************************************************
 * @class AgreementV2
 * @extends WorkTimeBase
 *
 * @property {Date} dateAt - 日付
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
 * @property {DayTypeRates} rates - 曜日区分、勤務区分ごとの単価情報オブジェクト
 * @property {string} billingUnitType - 請求単位 (PER_DAY, PER_HOUR)
 * @property {boolean} includeBreakInBilling - 請求に休憩時間を含めるかどうかのフラグ
 * @property {number} cutoffDate - 締日区分 (0: 月末, 5: 5日, 10: 10日, 15: 15日, 20: 20日, 25: 25日)
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 * @method getInvalidReasons - クラス特有のエラーの有無を返すメソッド
 *
 * @getter {boolean} isInvalid - クラス特有のエラーが存在するかどうかを返すプロパティ
 * @getter {Array<string>} invalidReasons - クラス特有のエラーコードの配列を返すプロパティ
 *
 * @setter rateSet - `rates` プロパティを更新するためのアクセサー
 *
 * @static BILLING_UNIT_TYPE - 請求単位の定数オブジェクト
 * @static DAY_TYPE - 曜日区分の定数オブジェクト
 * @static SHIFT_TYPE - 勤務区分の定数オブジェクト
 * @static INVALID_REASON - クラス特有のエラーコードを定義する定数オブジェクト
 * - `BREAK_MINUTES_NEGATIVE`: `breakMinutes` が負の値である場合のエラーコード
 * - `REGULATION_WORK_MINUTES_NEGATIVE`: `regulationWorkMinutes` が負の値である場合のエラーコード
 *****************************************************************************/
export default class AgreementV2 extends WorkTimeBase {
  static className = "AgreementV2";
  static collectionPath = "AgreementV2s";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    ...WorkTimeBase.classProps,
    rates: defField("object", {
      customClass: DayTypeRates,
      default: () => new DayTypeRates(),
    }),
    billingUnitType: defField("billingUnitType", {
      required: true,
    }),
    includeBreakInBilling: defField("check", {
      label: "請求に休憩時間を含める",
      default: false,
    }),
    cutoffDate: defField("cutoffDate", { required: true }),
  };

  /** STATIC VALUES */
  static BILLING_UNIT_TYPE = BILLING_UNIT_TYPE_VALUES;
  static DAY_TYPE = DAY_TYPE_VALUES;
  static SHIFT_TYPE = SHIFT_TYPE_VALUES;

  /**
   * rates プロパティを更新するためのアクセサー
   * - AirItemManager の `updateProperties` メソッドを使用してネスト構造のオブジェクトである
   *   `rates` を更新するためのアクセサーです。
   * @property {DayTypeRates} rates - 曜日区分、勤務区分ごとの単価情報オブジェクト
   * @property {string} dayType - 曜日区分 (WEEKDAY, SATURDAY, SUNDAY, HOLIDAY)
   * @property {string} shiftType - 勤務区分 (DAY, NIGHT)
   * @property {RateSet|Object} value - 設定する単価情報オブジェクト、もしくはそのオブジェクトを生成するためのプレーンオブジェクト
   */
  set rateSet({ dayType, shiftType, value } = {}) {
    if (!dayType || !this.constructor.DAY_TYPE[dayType]) {
      throw new Error(`Invalid dayType: ${dayType}`);
    }
    if (!shiftType || !this.constructor.SHIFT_TYPE[shiftType]) {
      throw new Error(`Invalid shiftType: ${shiftType}`);
    }

    // value のチェック
    // 値をセットする際に RateSet のインスタンスを作成するため、インスタンスのチェックは不要
    if (!value || typeof value !== "object") {
      throw new Error(`Invalid value for rateSet: ${value}`);
    }
    if (!this.rates) {
      this.rates = new DayTypeRates();
    }

    this.rates[dayType][shiftType] =
      value instanceof RateSet ? value : new RateSet(value);
  }
}
