// prettier-ignore
export const DAY_TYPE = Object.freeze({
  weekday: '平日',
  saturday: '土曜',
  sunday: '日曜',
  holiday: '祝日',});

export const DAY_TYPE_ARRAY = Object.entries(DAY_TYPE).map(([key, value]) => {
  return { value: key, title: value };
});

/**
 * Returns the corresponding day type based on the given date's day of the week.
 * - Sunday returns "sunday"
 * - Saturday returns "saturday"
 * - All other days return "weekday"
 * @param {Date} date
 * @returns {string} "sunday", "saturday", or "weekday"
 * @throws {TypeError} if date is not a Date object
 */
export const getDayType = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new TypeError("引数は有効な Date オブジェクトでなければなりません。");
  }
  const day = date.getDay();
  return day === 0 ? "sunday" : day === 6 ? "saturday" : "weekday";
};
