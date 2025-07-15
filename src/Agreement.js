import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";

export default class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = {
    /** 適用開始日 */
    // 本来であれば `from` が妥当だが、SiteOperationSchedule や OperationResultDetail クラスとの
    // 互換性を保つために `dateAt` とする。
    dateAt: defField("dateAt", {
      label: "適用開始日",
      required: true,
      // 既定値は当日日付（時刻は0時）とする
      default: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
      },
    }),
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      default: "08:00",
    }),
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      default: "17:00",
    }),
    workingMinutes: defField("workingMinutes", { required: true }),
    breakMinutes: defField("breakMinutes", { required: true }),
    unitPrice: defField("price", { label: "単価", required: true }),
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
    }),
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      required: true,
    }),
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      required: true,
    }),
    billingUnitType: defField("billingUnitType", { required: true }),
  };

  /** HEADERS */
  static headers = [
    {
      title: "適用開始日",
      key: "dateAt",
      value: (item) => item.dateAt.toLocaleDateString(),
    },
    {
      title: "区分",
      key: "type",
      value: (item) => `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType]}`,
      sortable: false,
    },
    {
      title: "勤務時間",
      key: "time",
      value: (item) => `${item.startTime} ～ ${item.endTime}`,
      sortable: false,
    },
    {
      title: "実働時間",
      key: "workingMinutes",
      value: (item) => `${item.workingMinutes}分`,
      align: "center",
      sortable: false,
    },
    {
      title: "休憩時間",
      key: "breakMinutes",
      value: (item) => `${item.breakMinutes}分`,
      align: "center",
      sortable: false,
    },
    {
      title: "残業時間",
      key: "overTimeWorkingMinutes",
      value: (item) => `${item.overTimeWorkingMinutes}分`,
      align: "center",
      sortable: false,
    },
    {
      title: "通常",
      align: "center",
      children: [
        {
          title: "単価",
          key: "unitPrice",
          value: (item) => item.unitPrice.toLocaleString(),
          align: "center",
          sortable: false,
        },
        {
          title: "時間外",
          key: "overTimeUnitPrice",
          value: (item) => item.overTimeUnitPrice.toLocaleString(),
          align: "center",
          sortable: false,
        },
      ],
    },
    {
      title: "資格者",
      align: "center",
      children: [
        {
          title: "単価",
          key: "unitPriceQualified",
          value: (item) => item.unitPriceQualified.toLocaleString(),
          align: "center",
          sortable: false,
        },
        {
          title: "時間外",
          key: "overTimeUnitPriceQualified",
          value: (item) => item.overTimeUnitPriceQualified.toLocaleString(),
          align: "center",
          sortable: false,
        },
      ],
    },
    {
      title: "請求単位",
      key: "billingUnitType",
      value: (item) => BILLING_UNIT_TYPE[item.billingUnitType],
      align: "center",
      sortable: false,
    },
  ];

  afterInitialize() {
    Object.defineProperties(this, {
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getStartAt(this.dateAt),
        set: (v) => {},
      },
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getEndAt(this.dateAt),
        set: (v) => {},
      },
      isNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      totalWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - this.breakMinutes);
        },
        set: (v) => {},
      },
      overTimeWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          return Math.max(0, this.totalWorkingMinutes - this.workingMinutes);
        },
        set: (v) => {},
      },
      isWorkingMinutesInvalid: {
        configurable: true,
        enumerable: true,
        get: () => {
          return (
            this.totalWorkingMinutes !==
            this.workingMinutes + this.overTimeWorkingMinutes
          );
        },
        set: (v) => {},
      },
    });
  }

  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `startTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getStartAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.startHour, this.startMinute, 0, 0);
    return result;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `endTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getEndAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    if (this.isNextDay) {
      // 次の日にまたがる場合は、翌日の開始時刻を設定
      result.setDate(result.getDate() + 1);
    }

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.endHour, this.endMinute, 0, 0);
    return result;
  }
}
