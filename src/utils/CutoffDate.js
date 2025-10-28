/*****************************************************************************
 * CutoffDate Utility Class ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * A utility class for managing cutoff date calculations and definitions.
 * - Provides constants for cutoff date values
 * - Provides options for UI selection components
 * - Provides static methods for cutoff date calculations
 * ---------------------------------------------------------------------------
 * @static {Object} VALUES - Cutoff date constant values
 * @static {Array} OPTIONS - Options for selection components
 * @static {function} calculateActualCutoffDay - Calculate actual cutoff day for given year/month
 * @static {function} calculateBillingPeriod - Calculate billing period for given date and cutoff
 * @static {function} calculateCutoffDate - Calculate cutoff date as Date object for given sales date
 * @static {function} calculateCutoffDateString - Calculate cutoff date as string (YYYY-MM-DD) for given sales date
 * @static {function} getDisplayText - Get display text for cutoff date value
 * @static {function} isValidCutoffDate - Validate cutoff date value
 *****************************************************************************/

export default class CutoffDate {
  /**
   * Cutoff date constant values
   */
  static VALUES = Object.freeze({
    DAY_5: 5,
    DAY_10: 10,
    DAY_15: 15,
    DAY_20: 20,
    DAY_25: 25,
    END_OF_MONTH: 0,
  });

  /**
   * Options for selection components
   */
  static OPTIONS = [
    { title: "5日", value: CutoffDate.VALUES.DAY_5 },
    { title: "10日", value: CutoffDate.VALUES.DAY_10 },
    { title: "15日", value: CutoffDate.VALUES.DAY_15 },
    { title: "20日", value: CutoffDate.VALUES.DAY_20 },
    { title: "25日", value: CutoffDate.VALUES.DAY_25 },
    { title: "月末", value: CutoffDate.VALUES.END_OF_MONTH },
  ];

  /**
   * Calculate actual cutoff day for given year and month
   * @param {number} year - Target year
   * @param {number} month - Target month (0-based: 0=January, 11=December)
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {number} Actual cutoff day
   * @example
   * // Get cutoff day for February 2024 with month-end setting
   * const cutoffDay = CutoffDate.calculateActualCutoffDay(2024, 1, CutoffDate.VALUES.END_OF_MONTH);
   * // Returns 29 (leap year)
   */
  static calculateActualCutoffDay(year, month, cutoffDateValue) {
    if (cutoffDateValue === CutoffDate.VALUES.END_OF_MONTH) {
      // Get last day of the month
      return new Date(year, month + 1, 0).getDate();
    }
    return cutoffDateValue;
  }

  /**
   * Calculate billing period for given date and cutoff setting
   * @param {Date} targetDate - Target date
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {Object} Billing period object
   * @property {Date} periodStart - Period start date
   * @property {Date} periodEnd - Period end date
   * @property {string} periodLabel - Period label (YYYY-MM format)
   * @example
   * // Calculate billing period for March 15, 2024 with 10th cutoff
   * const period = CutoffDate.calculateBillingPeriod(new Date(2024, 2, 15), CutoffDate.VALUES.DAY_10);
   * // Returns period from March 11 to April 10
   */
  static calculateBillingPeriod(targetDate, cutoffDateValue) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();

    // Calculate cutoff day for current month
    const currentCutoffDay = CutoffDate.calculateActualCutoffDay(
      year,
      month,
      cutoffDateValue
    );

    let periodStart, periodEnd, periodLabel;

    if (day <= currentCutoffDay) {
      // Target date is within current month's billing period
      // Period: Previous month's cutoff + 1 to current month's cutoff
      const prevMonth = month - 1;
      const prevYear = prevMonth < 0 ? year - 1 : year;
      const normalizedPrevMonth = prevMonth < 0 ? 11 : prevMonth;

      const prevCutoffDay = CutoffDate.calculateActualCutoffDay(
        prevYear,
        normalizedPrevMonth,
        cutoffDateValue
      );

      periodStart = new Date(prevYear, normalizedPrevMonth, prevCutoffDay + 1);
      periodEnd = new Date(year, month, currentCutoffDay);
      periodLabel = `${year}-${String(month + 1).padStart(2, "0")}`;
    } else {
      // Target date is within next month's billing period
      // Period: Current month's cutoff + 1 to next month's cutoff
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth;

      const nextCutoffDay = CutoffDate.calculateActualCutoffDay(
        nextYear,
        normalizedNextMonth,
        cutoffDateValue
      );

      periodStart = new Date(year, month, currentCutoffDay + 1);
      periodEnd = new Date(nextYear, normalizedNextMonth, nextCutoffDay);
      periodLabel = `${nextYear}-${String(normalizedNextMonth + 1).padStart(
        2,
        "0"
      )}`;
    }

    return {
      periodStart,
      periodEnd,
      periodLabel,
    };
  }

  /**
   * Get display text for cutoff date value
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {string} Display text
   * @example
   * const displayText = CutoffDate.getDisplayText(CutoffDate.VALUES.DAY_10);
   * // Returns "10日"
   */
  static getDisplayText(cutoffDateValue) {
    const option = CutoffDate.OPTIONS.find(
      (opt) => opt.value === cutoffDateValue
    );
    return option ? option.title : "";
  }

  /**
   * Validate cutoff date value
   * @param {number} cutoffDateValue - Cutoff date value to validate
   * @returns {boolean} True if valid
   */
  static isValidCutoffDate(cutoffDateValue) {
    return Object.values(CutoffDate.VALUES).includes(cutoffDateValue);
  }

  /**
   * Calculate the cutoff date as Date object for given sales date and cutoff setting
   * @param {Date} salesDate - Sales date
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {Date} Cutoff date as Date object
   * @example
   * // Sales on March 15, 2024 with 10th cutoff
   * const cutoffDate = CutoffDate.calculateCutoffDate(new Date(2024, 2, 15), CutoffDate.VALUES.DAY_10);
   * // Returns Date object for 2024-04-10
   *
   * // Sales on March 5, 2024 with 10th cutoff
   * const cutoffDate = CutoffDate.calculateCutoffDate(new Date(2024, 2, 5), CutoffDate.VALUES.DAY_10);
   * // Returns Date object for 2024-03-10
   */
  static calculateCutoffDate(salesDate, cutoffDateValue) {
    const year = salesDate.getFullYear();
    const month = salesDate.getMonth();
    const day = salesDate.getDate();

    // Calculate cutoff day for current month
    const currentCutoffDay = CutoffDate.calculateActualCutoffDay(
      year,
      month,
      cutoffDateValue
    );

    if (day <= currentCutoffDay) {
      // Sales date is within current month's billing period
      // Cutoff date is current month's cutoff day
      return new Date(year, month, currentCutoffDay);
    } else {
      // Sales date is within next month's billing period
      // Cutoff date is next month's cutoff day
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth;

      const nextCutoffDay = CutoffDate.calculateActualCutoffDay(
        nextYear,
        normalizedNextMonth,
        cutoffDateValue
      );

      return new Date(nextYear, normalizedNextMonth, nextCutoffDay);
    }
  }

  /**
   * Calculate the cutoff date string (YYYY-MM-DD) for given sales date and cutoff setting
   * @param {Date} salesDate - Sales date
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {string} Cutoff date in YYYY-MM-DD format
   * @example
   * // Sales on March 15, 2024 with 10th cutoff
   * const cutoffDateString = CutoffDate.calculateCutoffDateString(new Date(2024, 2, 15), CutoffDate.VALUES.DAY_10);
   * // Returns "2024-04-10"
   */
  static calculateCutoffDateString(salesDate, cutoffDateValue) {
    const cutoffDate = CutoffDate.calculateCutoffDate(
      salesDate,
      cutoffDateValue
    );
    return cutoffDate.toISOString().split("T")[0];
  }
}
