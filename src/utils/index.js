/**
 * Utility function to get a Date object at a specific time.
 * This function takes a date and a time string in HH:MM format,
 * and returns a Date object with the specified time set.
 * @param {string|Date} date The date to set the time on. Can be a string or a Date object.
 *                           If not provided, the current date is used.
 * @param {string} time The time to set in HH:MM format.
 *                      If not provided, defaults to 00:00 (midnight).
 * @param {number} [dateOffset=0] Optional offset in days to apply to the date.
 * @returns {Date} A Date object with the specified date and time.
 * @throws {Error} If the date is not a string or Date, or if the time is not a string in HH:MM format.
 * @throws {Error} If the time format is invalid.
 */
export function getDateAt(date, time, dateOffset = 0) {
  // If date is not null/undefined and is not a string or Date, throw an error
  if (date != null && !(typeof date === "string" || date instanceof Date)) {
    throw new Error(
      `[getDateAt] Invalid date type. Expected string or Date, got ${typeof date}`
    );
  }

  // If time is not null and is not a string, throw an error
  if (time != null && typeof time !== "string") {
    throw new Error(
      `[getDateAt] Invalid time type. Expected string, got ${typeof time}`
    );
  }

  // If time is provided, split it into hours and minutes
  // If time is not provided, default to 0 hours and 0 minutes
  const [hour, minute] = time ? time.split(":").map(Number) : [0, 0];
  if (isNaN(hour) || isNaN(minute)) {
    throw new Error(
      `[getDateAt] Invalid time format. Expected HH:MM, got ${time}`
    );
  }

  // If date is not provided, use the current date
  const result = new Date(date || Date.now());

  // Set the hours and minutes
  result.setHours(hour, minute, 0, 0);

  result.setDate(result.getDate() + dateOffset);
  return result;
}

export { ContextualError } from "./ContextualError.js";
