/*****************************************************************************
 * @file ./constants/day-type.js
 * @description 曜日区分定義
 * @author shisyamo4131
 *
 * @export {Object} VALUES - 曜日区分の定数オブジェクト
 * @export {Array} OPTIONS - 曜日区分の選択肢配列
 * @export {Function} getDayType - 日付から曜日区分を取得する関数
 *****************************************************************************/
import holiday_jp from "@holiday-jp/holiday_jp";

export const VALUES = Object.freeze({
  WEEKDAY: { value: "WEEKDAY", title: "平日", order: 0 },
  SATURDAY: { value: "SATURDAY", title: "土曜", order: 1 },
  SUNDAY: { value: "SUNDAY", title: "日曜", order: 2 },
  HOLIDAY: { value: "HOLIDAY", title: "祝日", order: 3 },
});

export const OPTIONS = [
  { title: VALUES.WEEKDAY.title, value: VALUES.WEEKDAY.value },
  { title: VALUES.SATURDAY.title, value: VALUES.SATURDAY.value },
  { title: VALUES.SUNDAY.title, value: VALUES.SUNDAY.value },
  { title: VALUES.HOLIDAY.title, value: VALUES.HOLIDAY.value },
];

/**
 * 引数で与えられた日付の曜日に基づいて、対応する曜日区分を返します。
 * - 日付が祝日であれば、「HOLIDAY」を返します。
 * - 日付が日曜日であれば、「SUNDAY」を返します。
 * - 日付が土曜日であれば、「SATURDAY」を返します。
 * - それ以外の場合は、「WEEKDAY」を返します。
 * @param {Date} date
 * @returns {string} - 引数の日付に対応する曜日区分
 * @throws {TypeError} - 引数がDateオブジェクトでない場合
 */
export const getDayType = (date) => {
  if (!(date instanceof Date)) {
    throw new TypeError("Input must be a Date object");
  }
  if (holiday_jp.isHoliday(date)) {
    return VALUES.HOLIDAY.value;
  } else if (date.getDay() === 0) {
    return VALUES.SUNDAY.value;
  } else if (date.getDay() === 6) {
    return VALUES.SATURDAY.value;
  } else {
    return VALUES.WEEKDAY.value;
  }
};
