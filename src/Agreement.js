import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";

export default class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = {
    from: defField("dateAt", {
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
      key: "from",
      value: (item) => item.from.toLocaleDateString(),
    },
    {
      title: "区分",
      key: "type",
      value: (item) => `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType]}`,
      sortable: false,
    },
    {
      title: "時間",
      key: "time",
      value: (item) =>
        `${item.startTime} ～ ${item.endTime} (休憩${item.breakMinutes}分)`,
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

  /**
   * `startTime` と `endTime` を比較し、次の日にまたがるかどうかを判定します。
   */
  get isNextDay() {
    // 開始時刻が終了時刻より前の場合は true
    return this.startTime > this.endTime;
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
  getStartAt(date) {
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
  getEndAt(date) {
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
