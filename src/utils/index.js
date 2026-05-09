/**
 * Utility function to get a Date object at a specific JST time.
 * This function takes a date and a JST time string in HH:MM format,
 * and returns a Date object with the specified JST time set.
 * @param {string|Date} date The date to set the time on. Can be a string or a Date object.
 *                           If not provided, the current date is used.
 * @param {string} time The JST time to set in HH:MM format.
 *                      If not provided, defaults to 00:00 (midnight JST).
 * @param {number} [dateOffset=0] Optional offset in days to apply to the date.
 * @returns {Date} A Date object with the specified date and JST time.
 * @throws {Error} If the date is not a string or Date, or if the time is not a string in HH:MM format.
 * @throws {Error} If the time format is invalid.
 */
export function getDateAt(date, time, dateOffset = 0) {
  // If date is not null/undefined and is not a string or Date, throw an error
  if (date != null && !(typeof date === "string" || date instanceof Date)) {
    throw new Error(
      `[getDateAt] Invalid date type. Expected string or Date, got ${typeof date}`,
    );
  }

  // If time is not null and is not a string, throw an error
  if (time != null && typeof time !== "string") {
    throw new Error(
      `[getDateAt] Invalid time type. Expected string, got ${typeof time}`,
    );
  }

  // If time is provided, split it into hours and minutes
  // If time is not provided, default to 0 hours and 0 minutes
  const [hour, minute] = time ? time.split(":").map(Number) : [0, 0];
  if (isNaN(hour) || isNaN(minute)) {
    throw new Error(
      `[getDateAt] Invalid time format. Expected HH:MM, got ${time}`,
    );
  }

  // If date is not provided, use the current date
  const baseDate = new Date(date || Date.now());

  // 入力日時から JST の日付成分を取得してから、JST時刻を合成する。
  // これにより、UTC日付境界を跨ぐケースでも期待通りの JST 日付を保てる。
  const jstDate = new Date(baseDate.getTime() + 9 * 60 * 60 * 1000);
  const year = jstDate.getUTCFullYear();
  const month = jstDate.getUTCMonth();
  const day = jstDate.getUTCDate();

  const utcMillis = Date.UTC(
    year,
    month,
    day + dateOffset,
    hour - 9,
    minute,
    0,
    0,
  );
  return new Date(utcMillis);
}

/**
 * 現在のJST時刻をUTCとして保存されたDateオブジェクトとして返す
 * システム時刻（UTC）をJST時刻に変換し、その時刻をUTCとして保存します。
 * @returns {Date} 現在のJST時刻をUTCとして保存したDateオブジェクト
 * @example
 * // 現在のJST時刻が 2024-03-05 10:30:45 の場合
 * const now = getCurrentJstDate()
 * // now は内部的に 2024-03-05T10:30:45.000Z として保存される
 * formatJstDate(now) // '2024-03-05'
 */
export function getCurrentJstDate() {
  const now = new Date();
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const year = jstDate.getUTCFullYear();
  const month = jstDate.getUTCMonth();
  const day = jstDate.getUTCDate();
  const hour = jstDate.getUTCHours();
  const minute = jstDate.getUTCMinutes();
  const second = jstDate.getUTCSeconds();
  const millisecond = jstDate.getUTCMilliseconds();

  const utcMillis = Date.UTC(
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
  );
  return new Date(utcMillis);
}

/**
 * DateオブジェクトをJST基準の文字列に変換
 * UTCとして保存されているJST時刻を、JST日付の文字列表現に変換します。
 * @param {Date} dateAt - UTCとして保存されたJST時刻
 * @param {string} format - 'YYYY-MM-DD' | 'YYYY-MM'
 * @returns {string|null} フォーマットされた日付文字列。dateAtがnull/undefinedの場合はnullを返す。
 * @example
 * // YYYY-MM-DD形式
 * formatJstDate(new Date('2024-03-04T15:00:00Z')) // '2024-03-05'
 *
 * // YYYY-MM形式
 * formatJstDate(new Date('2024-03-04T15:00:00Z'), 'YYYY-MM') // '2024-03'
 */
export function formatJstDate(dateAt, format = "YYYY-MM-DD") {
  if (!dateAt) return null;

  const jstDate = new Date(dateAt.getTime() + 9 * 60 * 60 * 1000);
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getUTCDate()).padStart(2, "0");

  return format === "YYYY-MM" ? `${year}-${month}` : `${year}-${month}-${day}`;
}

export { ContextualError } from "./ContextualError.js";
