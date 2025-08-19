import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";
import { BILLING_UNIT_TYPE } from "./constants/billing-unit-type.js";
import { getDateAt } from "./utils/index.js";

export default class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = {
    /**
     * 適用開始日
     * - 本来であれば `from` が妥当だが、SiteOperationSchedule や OperationResultDetail クラスとの
     *   互換性を保つために `dateAt` とする。
     * - `dateAt` は、日付のみを保持し、時刻は 0時に固定。
     */
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
    /**
     * 曜日区分
     * - 当該取極めが適用される曜日の区分。
     * - `DAY_TYPE` で定義された値を使用。
     * - `WEEKDAY`, `SATURDAY`, `SUNDAY`, `HOLIDAY` のいずれか。
     */
    dayType: defField("dayType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 勤務区分
     * - 当該取極めが適用される勤務区分。
     * - `SHIFT_TYPE` で定義された値を使用。
     * - `DAY`, `NIGHT` のいずれか。
     */
    shiftType: defField("shiftType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 開始時刻（HH:MM形式）
     */
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      default: "08:00",
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 終了時刻（HH:MM形式）
     */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      default: "17:00",
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 規定実働時間（分）
     * - `unitPrice`(または `unitPriceQualified`) で定められた単価に対する最大実働時間。
     * - この時間を超えると、残業扱いとなる。
     */
    regulationWorkMinutes: defField("regulationWorkMinutes", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 休憩時間（分）
     * - `startTime` と `endTime` の間に取得される休憩時間（分）。
     * - `totalWorkMinutes` の計算に使用される。
     */
    breakMinutes: defField("breakMinutes", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 基本単価（円）
     */
    unitPrice: defField("price", {
      label: "基本単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 時間外単価（円/時間）
     * - `regulationWorkMinutes` を超える時間に対して適用される単価。
     */
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 資格者単価（円）
     * - 資格者の場合に適用される単価。
     */
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 資格者時間外単価（円/時間）
     * - 資格者の `regulationWorkMinutes` を超える時間に対して適用される単価。
     */
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 請求単位
     * - `BILLING_UNIT_TYPE` で定義された請求単位。
     */
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
      value: (item) =>
        `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType].title}`,
      sortable: false,
    },
    {
      title: "勤務時間",
      key: "time",
      value: (item) => `${item.startTime} ～ ${item.endTime}`,
      sortable: false,
    },
    {
      title: "規定実働時間",
      key: "regulationWorkMinutes",
      value: (item) => `${item.regulationWorkMinutes}分`,
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
      key: "overTimeWorkMinutes",
      value: (item) => `${item.overTimeWorkMinutes}分`,
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
      /**
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => getDateAt(this.dateAt, this.startTime),
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => getDateAt(this.dateAt, this.endTime),
        set: (v) => {},
      },
      /**
       * 日付をまたぐかどうかを表すフラグ
       * - `startTime` が `endTime` よりも遅い場合、true とする。
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      /**
       * 総実働時間（分）
       * - `startAt` と `endAt` の差から休憩時間を引いた値。
       * - `startAt` と `endAt` の差が負の場合は 0を返す。
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
       * 残業時間（分）
       * - `totalWorkMinutes` から `regulationWorkMinutes` を引いた値。
       * - 残業時間は負にならないように 0 を下限とする。
       */
      overTimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          return Math.max(
            0,
            this.totalWorkMinutes - this.regulationWorkMinutes
          );
        },
        set: (v) => {},
      },
    });
  }

  /**
   * 開始時刻の時間部分を取得します。
   * - `startTime` が設定されていない場合は 0 を返します。
   */
  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の分部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
  }
}
