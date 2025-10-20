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
  static _value = _DEFINITIONS.ROUND.key;
  static set(value) {
    console.log("RoundSetting.set:", value);
    this.validate(value);
    this._value = value;
  }
  static [Symbol.toPrimitive]() {
    return this._value;
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
}
