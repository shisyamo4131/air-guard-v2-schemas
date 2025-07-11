import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";

export default class Company extends FireModel {
  static className = "会社";
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    companyName: defField("name", { label: "会社名", required: true }),
    companyNameKana: defField("nameKana", {
      label: "会社名（カナ）",
      required: true,
    }),
    /** 以下、管理者アカウント作成時に未入力状態で作成されるため required は未定義とする */
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode"),
    city: defField("city"),
    address: defField("address"),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
    /** 以下は既定値を持っているので required を設定 */
    defaultStartTimeDayShift: defField("time", {
      label: "日勤開始時刻",
      default: "08:00",
      required: true,
    }),
    defaultEndTimeDayShift: defField("time", {
      label: "日勤終了時刻",
      default: "17:00",
      required: true,
    }),
    defaultBreakMinutesDayShift: defField("number", {
      label: "日勤休憩時間（分）",
      defaultValue: 60,
    }),
    defaultStartTimeNightShift: defField("time", {
      label: "夜勤開始時刻",
      default: "20:00",
      required: true,
    }),
    defaultEndTimeNightShift: defField("time", {
      label: "夜勤終了時刻",
      default: "05:00",
      required: true,
    }),
    defaultBreakMinutesNightShift: defField("number", {
      label: "夜勤休憩時間（分）",
      defaultValue: 60,
    }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
      defaultScheduledWorkMinutesDayShift: {
        configurable: true,
        enumerable: true,
        /**
         * defaultStartTimeDayShift と defaultEndTimeDayShift の時間差（分）から defaultBreakMinutesDayShift を引いた値を返すアクセサ
         * @returns {number} 日勤の標準労働時間（分）
         */
        get: () => {
          const start = this.defaultStartTimeDayShift || "08:00";
          const end = this.defaultEndTimeDayShift || "17:00";
          const breakMinutes = this.defaultBreakMinutesDayShift || 60;

          const startTime = new Date(`1970-01-01T${start}:00`);
          const endTime = new Date(`1970-01-01T${end}:00`);

          const totalMinutes =
            (endTime - startTime) / (1000 * 60) - breakMinutes;
          return totalMinutes < 0 ? 0 : totalMinutes;
        },
        set: () => {},
      },
      defaultScheduledWorkMinutesNightShift: {
        configurable: true,
        enumerable: true,
        /**
         * defaultStartTimeNightShift と defaultEndTimeNightShift の時間差（分）から defaultBreakMinutesNightShift を引いた値を返すアクセサ
         * @returns {number} 夜勤の標準労働時間（分）
         */
        get: () => {
          const start = this.defaultStartTimeNightShift || "20:00";
          const end = this.defaultEndTimeNightShift || "05:00";
          const breakMinutes = this.defaultBreakMinutesNightShift || 60;
          // 夜勤の終了時刻が翌日の05:00になるため、日付を1970-01-01に固定して計算
          // 1970-01-01T20:00:00 から 1970-01-02T05:00:00 までの時間差を計算
          const startTime = new Date(`1970-01-01T${start}:00`);
          const endTime = new Date(`1970-01-02T${end}:00`);

          const totalMinutes =
            (endTime - startTime) / (1000 * 60) - breakMinutes;
          return totalMinutes < 0 ? 0 : totalMinutes;
        },
        set: () => {},
      },
    });
  }

  /**
   * Returns the default time map for day and night shifts.
   * @returns {Object} An object containing start and end times for day and night shifts.
   * @property {Object} day - Contains start and end times for the day shift.
   * @property {Object} night - Contains start and end times for the night shift.
   * @property {string} day.start - Default start time for the day shift.
   * @property {string} day.end - Default end time for the day shift.
   * @property {string} night.start - Default start time for the night shift.
   * @property {string} night.end - Default end time for the night shift.
   */
  get defaultTimeMap() {
    return {
      day: {
        start: this.defaultStartTimeDayShift || "08:00",
        end: this.defaultEndTimeDayShift || "17:00",
      },
      night: {
        start: this.defaultStartTimeNightShift || "20:00",
        end: this.defaultEndTimeNightShift || "05:00",
      },
    };
  }
}
