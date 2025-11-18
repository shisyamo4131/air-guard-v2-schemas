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
 * @static {function} calculateBillingDateAt - Calculate cutoff date as Date object for given sales date
 * @static {function} calculateBillingDateAtString - Calculate cutoff date as string (YYYY-MM-DD) for given sales date
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
      // Get last day of the month using UTC
      return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    return cutoffDateValue;
  }

  /**
   * Calculate billing period for given date and cutoff setting
   * @param {Date} targetDate - Target date in UTC (representing a JST date)
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {Object} Billing period object
   * @property {Date} periodStart - Period start date in UTC (representing JST date)
   * @property {Date} periodEnd - Period end date in UTC (representing JST date)
   * @property {string} periodLabel - Period label (YYYY-MM format)
   * @example
   * // For JST 2025-01-20 with 15th cutoff
   * // Input: UTC date representing JST 2025-01-20
   * const period = CutoffDate.calculateBillingPeriod(new Date('2025-01-19T15:00:00Z'), 15);
   * // Returns:
   * // periodStart: UTC date representing JST 2025-01-16
   * // periodEnd: UTC date representing JST 2025-02-15
   */
  static calculateBillingPeriod(targetDate, cutoffDateValue) {
    // Convert UTC to JST by adding 9 hours to get the JST date
    const jstDate = new Date(targetDate.getTime() + 9 * 60 * 60 * 1000);
    const year = jstDate.getUTCFullYear();
    const month = jstDate.getUTCMonth();
    const day = jstDate.getUTCDate();

    // Calculate cutoff day for current month
    const currentCutoffDay = CutoffDate.calculateActualCutoffDay(
      year,
      month,
      cutoffDateValue
    );

    let periodStart, periodEnd, periodLabel;

    if (day <= currentCutoffDay) {
      // Target date is within current month's billing period
      const prevMonth = month - 1;
      const prevYear = prevMonth < 0 ? year - 1 : year;
      const normalizedPrevMonth = prevMonth < 0 ? 11 : prevMonth;

      const prevCutoffDay = CutoffDate.calculateActualCutoffDay(
        prevYear,
        normalizedPrevMonth,
        cutoffDateValue
      );

      // Create dates in UTC representing JST dates (subtract 9 hours)
      const startJst = Date.UTC(
        prevYear,
        normalizedPrevMonth,
        prevCutoffDay + 1
      );
      const endJst = Date.UTC(year, month, currentCutoffDay);

      periodStart = new Date(startJst - 9 * 60 * 60 * 1000);
      periodEnd = new Date(endJst - 9 * 60 * 60 * 1000);
      periodLabel = `${year}-${String(month + 1).padStart(2, "0")}`;
    } else {
      // Target date is within next month's billing period
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth;

      const nextCutoffDay = CutoffDate.calculateActualCutoffDay(
        nextYear,
        normalizedNextMonth,
        cutoffDateValue
      );

      // Create dates in UTC representing JST dates (subtract 9 hours)
      const startJst = Date.UTC(year, month, currentCutoffDay + 1);
      const endJst = Date.UTC(nextYear, normalizedNextMonth, nextCutoffDay);

      periodStart = new Date(startJst - 9 * 60 * 60 * 1000);
      periodEnd = new Date(endJst - 9 * 60 * 60 * 1000);
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
   * @param {Date} salesDate - Sales date in UTC (representing a JST date)
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {Date} Cutoff date in UTC (representing a JST date)
   * @example
   * // For JST 2024-03-15 with 10th cutoff
   * // Input: UTC date representing JST 2024-03-15
   * const cutoffDate = CutoffDate.calculateBillingDateAt(new Date('2024-03-14T15:00:00Z'), CutoffDate.VALUES.DAY_10);
   * // Returns: UTC date representing JST 2024-04-10
   *
   * // For JST 2024-03-05 with 10th cutoff
   * const cutoffDate = CutoffDate.calculateBillingDateAt(new Date('2024-03-04T15:00:00Z'), CutoffDate.VALUES.DAY_10);
   * // Returns: UTC date representing JST 2024-03-10
   */
  static calculateBillingDateAt(salesDate, cutoffDateValue) {
    // Convert UTC to JST by adding 9 hours to get the JST date
    const jstDate = new Date(salesDate.getTime() + 9 * 60 * 60 * 1000);
    const year = jstDate.getUTCFullYear();
    const month = jstDate.getUTCMonth();
    const day = jstDate.getUTCDate();

    // Calculate cutoff day for current month
    const currentCutoffDay = CutoffDate.calculateActualCutoffDay(
      year,
      month,
      cutoffDateValue
    );

    if (day <= currentCutoffDay) {
      // Sales date is within current month's billing period
      // Cutoff date is current month's cutoff day
      const cutoffJst = Date.UTC(year, month, currentCutoffDay);
      return new Date(cutoffJst - 9 * 60 * 60 * 1000);
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

      const cutoffJst = Date.UTC(nextYear, normalizedNextMonth, nextCutoffDay);
      return new Date(cutoffJst - 9 * 60 * 60 * 1000);
    }
  }

  /**
   * Calculate the cutoff date string (YYYY-MM-DD) for given sales date and cutoff setting
   * @param {Date} salesDate - Sales date in UTC (representing a JST date)
   * @param {number} cutoffDateValue - Cutoff date value from VALUES
   * @returns {string} Cutoff date in YYYY-MM-DD format (JST)
   * @example
   * // For JST 2024-03-15 with 10th cutoff
   * const cutoffDateString = CutoffDate.calculateBillingDateAtString(new Date('2024-03-14T15:00:00Z'), CutoffDate.VALUES.DAY_10);
   * // Returns "2024-04-10"
   */
  static calculateBillingDateAtString(salesDate, cutoffDateValue) {
    const cutoffDate = CutoffDate.calculateBillingDateAt(
      salesDate,
      cutoffDateValue
    );
    // Convert UTC back to JST for string representation
    const jstDate = new Date(cutoffDate.getTime() + 9 * 60 * 60 * 1000);
    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(jstDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
