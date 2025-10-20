/*****************************************************************************
 * RoundSetting Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - A class for managing rounding settings.
 * - Provides static states for easy access to rounding modes.
 * - Also implements and provides `classProps` for other classes to use.
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
 ****************************************************************************
 */
import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions";

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

const _COMPONENT = { name: "air-select", attrs: { items: _ITEMS } };

export default class RoundSetting extends BaseClass {
  static className = "端数処理設定クラス";
  static classProps = {
    roundOperationResultSales: defField("oneLine", {
      label: "売上端数処理",
      default: _DEFINITIONS.ROUND.key,
      component: _COMPONENT,
    }),
    roundOperationResultTax: defField("oneLine", {
      label: "消費税端数処理",
      default: _DEFINITIONS.ROUND.key,
      component: _COMPONENT,
    }),
  };

  /** Provides all rounding modes */
  static FLOOR = _DEFINITIONS.FLOOR.key;
  static ROUND = _DEFINITIONS.ROUND.key;
  static CEIL = _DEFINITIONS.CEIL.key;

  /** Static states */
  static _value = _DEFINITIONS.ROUND.key;
  static set(value) {
    this.validate(value);
    this._value = value;
  }
  static [Symbol.toPrimitive]() {
    return this._value;
  }

  static validate(value) {
    if (!Object.values(_DEFINITIONS).some((def) => def.key === value)) {
      throw new Error(`Invalid rounding value: ${value}`);
    }
    return true;
  }
}
