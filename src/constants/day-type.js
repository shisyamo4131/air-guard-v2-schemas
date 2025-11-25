// prettier-ignore
import holiday_jp from "@holiday-jp/holiday_jp";

export const VALUES = Object.freeze({
  WEEKDAY: { value: "WEEKDAY", title: "平日" },
  SATURDAY: { value: "SATURDAY", title: "土曜" },
  SUNDAY: { value: "SUNDAY", title: "日曜" },
  HOLIDAY: { value: "HOLIDAY", title: "祝日" },
});

export const OPTIONS = [
  { title: VALUES.WEEKDAY.title, value: VALUES.WEEKDAY.value },
  { title: VALUES.SATURDAY.title, value: VALUES.SATURDAY.value },
  { title: VALUES.SUNDAY.title, value: VALUES.SUNDAY.value },
  { title: VALUES.HOLIDAY.title, value: VALUES.HOLIDAY.value },
];

/**
 * Returns the corresponding day type based on the given date's day of the week.
 * If the date is a holiday, it returns "HOLIDAY".
 * If the date is a Sunday, it returns "SUNDAY".
 * If the date is a Saturday, it returns "SATURDAY".
 * Otherwise, it returns "WEEKDAY".
 * @param {Date} date
 * @returns {string} - The day type corresponding to the date.
 * @throws {TypeError} if date is not a Date object
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
