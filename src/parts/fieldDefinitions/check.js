import { generalDefinitions } from "./defaultDefinition.js";

/**
 * CHECK型のフィールド定義
 */
export const checkFields = {
  check: generalDefinitions.check,
  hasPeriodOfStayLimit: {
    ...generalDefinitions.check,
    label: "在留期間制限",
  },
  hasWorkRestrictions: {
    ...generalDefinitions.check,
    label: "就労制限",
  },
  isForeigner: {
    ...generalDefinitions.check,
    label: "外国籍",
  },
};
