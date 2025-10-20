/*****************************************************************************
 * RoundSetting Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - A class for managing rounding settings.
 * - Provides static states for easy access to rounding modes.
 * - Can get current rounding mode via `RoundSetting` directly.
 * ---------------------------------------------------------------------------
 * @props {string} operationResultSales - Rounding mode for operation result sales
 * @props {string} operationResultTax - Rounding mode for operation result tax
 * ---------------------------------------------------------------------------
 * @static FLOOR - Rounding mode: Floor
 * @static ROUND - Rounding mode: Round
 * @static CEIL - Rounding mode: Ceil
 * ---------------------------------------------------------------------------
 * @method static set(value) - Sets the rounding mode
 * @method static validate(value) - Validates the rounding mode
 * @method static round(value, mode, precision) - Rounds a number based on the specified mode and precision
 * @method static apply(value, precision) - Rounds a number using the current setting
 * ---------------------------------------------------------------------------
 * @example
 * // Rounding examples
 * RoundSetting.round(123.456, RoundSetting.FLOOR);     // Returns: 123
 * RoundSetting.round(123.456, RoundSetting.ROUND);     // Returns: 123
 * RoundSetting.round(123.456, RoundSetting.CEIL);      // Returns: 124
 * RoundSetting.round(123.456, RoundSetting.ROUND, 2);  // Returns: 123.46
 *
 * // Using current setting
 * RoundSetting.set(RoundSetting.ROUND);                // Set to Round mode
 * RoundSetting.apply(123.456);                         // Uses current setting
 */
const _DEFINITIONS = Object.freeze({
  FLOOR: { key: "FLOOR", label: "切り捨て", order: 0 },
  ROUND: { key: "ROUND", label: "四捨五入", order: 1 },
  CEIL: { key: "CEIL", label: "切り上げ", order: 2 },
});

const _ARRAY = Object.values(_DEFINITIONS).map((def) => ({
  key: def.key,
  label: def.label,
}));

const _ITEMS = _ARRAY.map((item) => ({
  title: item.label,
  value: item.key,
}));

export default class RoundSetting {
  /** Provides all rounding modes */
  static FLOOR = _DEFINITIONS.FLOOR.key;
  static ROUND = _DEFINITIONS.ROUND.key;
  static CEIL = _DEFINITIONS.CEIL.key;

  static ITEMS = _ITEMS;

  /** Static states */
  static _mode = _DEFINITIONS.ROUND.key;
  static set(value) {
    this.validate(value);
    this._mode = value;
  }
  static [Symbol.toPrimitive]() {
    return this._mode;
  }

  static label(value) {
    this.validate(value);
    return _DEFINITIONS[value].label;
  }

  static validate(value) {
    if (!Object.values(_DEFINITIONS).some((def) => def.key === value)) {
      throw new Error(`Invalid rounding value: ${value}`);
    }
    return true;
  }

  /**
   * Rounds a number based on the specified rounding mode
   * @param {number} value - The number to round
   * @param {string} mode - The rounding mode (FLOOR, ROUND, CEIL)
   * @param {number} precision - Number of decimal places (default: 0)
   * @returns {number} The rounded number
   */
  static round(value, mode = null, precision = 0) {
    if (typeof value !== "number" || isNaN(value)) {
      throw new Error("Value must be a valid number");
    }

    const roundingMode = mode || this._mode;
    this.validate(roundingMode);

    const factor = Math.pow(10, precision);
    const scaledValue = value * factor;

    let result;
    switch (roundingMode) {
      case this.FLOOR:
        result = Math.floor(scaledValue);
        break;
      case this.ROUND:
        result = Math.round(scaledValue);
        break;
      case this.CEIL:
        result = Math.ceil(scaledValue);
        break;
      default:
        throw new Error(`Unsupported rounding mode: ${roundingMode}`);
    }

    return result / factor;
  }

  /**
   * Rounds using current setting
   * @param {number} value - The number to round
   * @param {number} precision - Number of decimal places (default: 0)
   * @returns {number} The rounded number
   */
  static apply(value, precision = 0) {
    return this.round(value, this._mode, precision);
  }
}
