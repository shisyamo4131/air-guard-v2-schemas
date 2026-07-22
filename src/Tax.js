/*****************************************************************************
 * Tax Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - A class for calculating consumption tax based on historical rates.
 * - Uses RoundSetting for rounding tax amounts.
 * ---------------------------------------------------------------------------
 * @static getRate(date) - Gets the applicable tax rate for a given date
 * @static calc(amount, date) - Calculates the tax for a given amount and date
 * @static calculateBreakdown(items) - Calculates tax totals grouped by rate
 *****************************************************************************/
import RoundSetting from "./RoundSetting.js";

const _RATES = Object.freeze({
  "1989-04-01": { date: "1989-04-01", rate: 0.03 },
  "1997-04-01": { date: "1997-04-01", rate: 0.05 },
  "2014-04-01": { date: "2014-04-01", rate: 0.08 },
  "2019-10-01": { date: "2019-10-01", rate: 0.1 },
});

export default class Tax {
  static getRate(date) {
    const applicableDates = Object.keys(_RATES).filter((d) => d <= date);
    if (applicableDates.length === 0) {
      throw new Error(`No tax rate found for date: ${date}`);
    }
    const latestDate = applicableDates[applicableDates.length - 1];
    return _RATES[latestDate].rate;
  }

  static calc(amount, date) {
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new Error("Amount must be a valid number");
    }
    const rate = this.getRate(date);
    let tax = amount * rate;
    tax = RoundSetting.apply(tax);
    return tax;
  }

  /**
   * 税率ごとに課税対象額を集計し、税率単位で端数処理した税額内訳を返します。
   * @param {Array<{amount: number, taxRate: number}>} items
   * @returns {Array<{
   *   taxRate: number,
   *   taxableAmount: number,
   *   unroundedTaxAmount: number,
   *   taxAmount: number
   * }>} 税率昇順の税額内訳
   */
  static calculateBreakdown(items = []) {
    if (!Array.isArray(items)) {
      throw new Error("Items must be an array");
    }

    const taxableAmountsByRate = new Map();

    items.forEach(({ amount, taxRate }, index) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        throw new Error(`Invalid amount at index ${index}`);
      }
      if (typeof taxRate !== "number" || isNaN(taxRate) || taxRate < 0) {
        throw new Error(`Invalid tax rate at index ${index}`);
      }

      taxableAmountsByRate.set(
        taxRate,
        (taxableAmountsByRate.get(taxRate) || 0) + amount,
      );
    });

    return [...taxableAmountsByRate.entries()]
      .sort(([rateA], [rateB]) => rateA - rateB)
      .map(([taxRate, taxableAmount]) => {
        const unroundedTaxAmount = taxableAmount * taxRate;
        return {
          taxRate,
          taxableAmount,
          unroundedTaxAmount,
          taxAmount: RoundSetting.apply(unroundedTaxAmount),
        };
      });
  }
}
