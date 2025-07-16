// prettier-ignore
export const DAY_TYPE_DEFAULT = "WEEKDAY";

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
 * - Sunday returns "SUNDAY"
 * - Saturday returns "SATURDAY"
 * - All other days return "WEEKDAY"
 * @param {Date} date
 * @returns {string} "SUNDAY", "SATURDAY", or "WEEKDAY"
 * @throws {TypeError} if date is not a Date object
 */
export const getDayType = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new TypeError("引数は有効な Date オブジェクトでなければなりません。");
  }
  const day = date.getDay();
  return day === 0 ? "SUNDAY" : day === 6 ? "SATURDAY" : "WEEKDAY";
};
