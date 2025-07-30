// prettier-ignore
import holiday_jp from "@holiday-jp/holiday_jp";

export const DAY_TYPE_DEFAULT = "WEEKDAY";
export const DAY_TYPE_WEEKDAY = "WEEKDAY";
export const DAY_TYPE_SATURDAY = "SATURDAY";
export const DAY_TYPE_SUNDAY = "SUNDAY";
export const DAY_TYPE_HOLIDAY = "HOLIDAY";

export const DAY_TYPE = Object.freeze({
  WEEKDAY: "平日",
  SATURDAY: "土曜",
  SUNDAY: "日曜",
  HOLIDAY: "祝日",
});

export const DAY_TYPE_ARRAY = Object.entries(DAY_TYPE).map(([key, value]) => {
  return { value: key, title: value };
});

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
    return DAY_TYPE_HOLIDAY;
  } else if (date.getDay() === 0) {
    return DAY_TYPE_SUNDAY;
  } else if (date.getDay() === 6) {
    return DAY_TYPE_SATURDAY;
  } else {
    return DAY_TYPE_WEEKDAY;
  }
};
