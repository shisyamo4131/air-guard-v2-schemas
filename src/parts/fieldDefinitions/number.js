import { generalDefinitions } from "./defaultDefinition.js";
import { DEFAULT_BREAK_MINUTES, DEFAULT_WORKING_MINUTES } from "./constants.js";
import { VALIDATION_ERRORS } from "../../errorDefinitions.js";

/**
 * NUMBER型のフィールド定義
 */
export const numberFields = {
  number: generalDefinitions.number,
  breakMinutes: {
    ...generalDefinitions.number,
    label: "休憩時間（分）",
    default: DEFAULT_BREAK_MINUTES,
    validator: (v) => {
      if (v < 0) {
        return VALIDATION_ERRORS.MIN_VALUE_ERROR(0);
      }
      return true;
    },
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
      },
    },
  },
  overtimeWorkMinutes: {
    ...generalDefinitions.number,
    label: "残業時間（分）",
    default: 0,
    validator: (v) => {
      if (v < 0) {
        return VALIDATION_ERRORS.MIN_VALUE_ERROR(0);
      }
      return true;
    },
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
      },
    },
  },
  regulationWorkMinutes: {
    ...generalDefinitions.number,
    label: "規定実働時間（分）",
    default: DEFAULT_WORKING_MINUTES,
    validator: (v) => {
      if (v < 0) {
        return VALIDATION_ERRORS.MIN_VALUE_ERROR(0);
      }
      return true;
    },
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
        persistentHint: true,
        hint: "この時間を超えると残業扱いになります。",
      },
    },
  },
  price: {
    ...generalDefinitions.number,
  },
};
