/*****************************************************************************
 * WorkingResult ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * Provides classProps and accessors for working result details.
 * - Used in other classes to define common properties and accessors values.
 * ---------------------------------------------------------------------------
 * @props {Date} dateAt - Applicable start date
 * @props {string} dayType - Day type (e.g., `WEEKDAY`, `WEEKEND`, `HOLIDAY`)
 * @props {string} shiftType - Shift type (`DAY`, `NIGHT`)
 * @props {string} startTime - Start time (HH:MM format)
 * @props {boolean} isStartNextDay - Next day start flag
 * - `true` if the actual work starts the day after the placement date `dateAt`
 * @props {string} endTime - End time (HH:MM format)
 * @props {number} breakMinutes - Break time (minutes)
 * @props {number} regulationWorkMinutes - Regulation work minutes
 * - The maximum working time defined by `unitPriceBase` (or `unitPriceQualified`).
 * - Exceeding this time is considered overtime.
 * ---------------------------------------------------------------------------
 * @accessor {string} key - Unique key combining `date` and `shiftType`
 * - A unique identifier for the agreement, combining `date` and `shiftType`.
 * @accessor {string} date - Date string in YYYY-MM-DD format based on `dateAt`
 * - Returns a string in the format YYYY-MM-DD based on `dateAt`.
 * @accessor {Date} startAt - Start date and time (Date object)
 * - Returns a Date object with `startTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * @accessor {Date} endAt - End date and time (Date object)
 * - Returns a Date object with `endTime` set based on `dateAt`.
 * - If `isStartNextDay` is true, add 1 day.
 * - If `isSpansNextDay` is true, add 1 day.
 * @accessor {boolean} isSpansNextDay - Flag indicating whether the date spans from start date to end date
 * - `true` if `startTime` is later than `endTime`
 * @accessor {number} totalWorkMinutes - Total working time in minutes (excluding break time)
 * - Calculated as the difference between `endAt` and `startAt` minus `breakMinutes`
 * @accessor {number} overtimeWorkMinutes - Overtime work in minutes
 * - Calculated as `totalWorkMinutes` minus `regulationWorkMinutes`
 * - Overtime work is not negative; the minimum is 0.
 *****************************************************************************/
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils/index.js";
import { getDayType } from "./constants/day-type.js";

export const classProps = {
  dateAt: defField("dateAt", { required: true }),
  dayType: defField("dayType", { required: true }),
  shiftType: defField("shiftType", { required: true }),
  startTime: defField("time", {
    label: "開始時刻",
    required: true,
    default: "08:00",
  }),
  isStartNextDay: defField("check", { label: "翌日開始" }),
  endTime: defField("time", {
    label: "終了時刻",
    required: true,
    default: "17:00",
  }),
  breakMinutes: defField("breakMinutes", { required: true }),
  regulationWorkMinutes: defField("regulationWorkMinutes", { required: true }),
};

export function accessors(self) {
  let _dateAt = self.dateAt;
  Object.defineProperty(self, "dateAt", {
    configurable: true,
    enumerable: true,
    get() {
      return _dateAt;
    },
    set(v) {
      if (_dateAt && v.getTime() === _dateAt.getTime()) {
        return;
      }
      _dateAt = v;
      self.dayType = getDayType(v);
    },
  });
  Object.defineProperties(self, {
    key: {
      configurable: true,
      enumerable: true,
      get: () => {
        return `${self.date}-${self.dayType}-${self.shiftType}`;
      },
      set: () => {},
    },
    /**
     * 日付文字列（YYYY-MM-DD形式）
     * - `dateAt` を基に、ISO 形式の文字列から日付部分のみを抽出して返す。
     */
    date: {
      configurable: true,
      enumerable: true,
      get: () => {
        if (!self.dateAt) return "";
        const year = self.dateAt.getFullYear();
        const month = String(self.dateAt.getMonth() + 1).padStart(2, "0"); // 月は0始まり
        const day = String(self.dateAt.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
      set: (v) => {},
    },
    /**
     * 開始日時（Date オブジェクト）
     * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
     */
    startAt: {
      configurable: true,
      enumerable: true,
      get() {
        const dateOffset = self.isStartNextDay ? 1 : 0;
        return getDateAt(self.dateAt, self.startTime, dateOffset);
      },
      set(v) {},
    },
    /**
     * 終了日時（Date オブジェクト）
     * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
     */
    endAt: {
      configurable: true,
      enumerable: true,
      get() {
        const dateOffset =
          (self.isSpansNextDay ? 1 : 0) + (self.isStartNextDay ? 1 : 0);
        return getDateAt(self.dateAt, self.endTime, dateOffset);
      },
      set(v) {},
    },
    /**
     * 日付をまたぐかどうかを表すフラグ
     * - `startTime` が `endTime` よりも遅い場合、true とする。
     */
    isSpansNextDay: {
      configurable: true,
      enumerable: true,
      get: () => self.startTime > self.endTime,
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
        const start = self.startAt;
        const end = self.endAt;
        const breakMinutes = self.breakMinutes || 0;
        const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
        return Math.max(0, diff - breakMinutes);
      },
      set: (v) => {},
    },
    /**
     * 規定時間内実働時間（分）
     * - 実際の`totalWorkMinutes`のうち、契約上の`regulationWorkMinutes`以内として扱われる時間。
     * - 早退などで実働時間が規定時間を下回る場合は`totalWorkMinutes`と同じ。
     * - 残業で実働時間が規定時間を上回る場合は`regulationWorkMinutes`と同じ。
     */
    regularTimeWorkMinutes: {
      configurable: true,
      enumerable: true,
      get: () => {
        return Math.min(self.totalWorkMinutes, self.regulationWorkMinutes);
      },
      set: (v) => {},
    },
    /**
     * 残業時間（分）
     * - `totalWorkMinutes` から `regulationWorkMinutes` を引いた値。
     * - 残業時間は負にならないように 0 を下限とする。
     */ overtimeWorkMinutes: {
      configurable: true,
      enumerable: true,
      get: () => {
        return Math.max(0, self.totalWorkMinutes - self.regulationWorkMinutes);
      },
      set: (v) => {},
    },
  });
}
