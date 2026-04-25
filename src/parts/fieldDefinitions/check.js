import { generalDefinitions } from "./defaultDefinition.js";

/**
 * CHECK型のフィールド定義
 * {
 *   type: Boolean,
 *   default: false,
 *   label: undefined,
 *   length: undefined,
 *   required: undefined,
 *   hidden: undefined,
 *   validator: undefined,
 *   component: { name: "air-checkbox", attrs: {} },
 * }
 */
export const checkFields = {
  check: generalDefinitions.check,

  /**
   * 使用不可を表すフィールド定義
   * - `label` や他の定義は利用先において定義変更すること。
   */
  disabled: {
    ...generalDefinitions.check,
    label: "使用不可",
  },

  hasPeriodOfStayLimit: {
    ...generalDefinitions.check,
    label: "在留期間制限",
  },
  hasWorkRestrictions: {
    ...generalDefinitions.check,
    label: "就労制限",
  },

  /** 管理者かどうか */
  isAdmin: {
    ...generalDefinitions.check,
    label: "管理者",
  },

  isForeigner: {
    ...generalDefinitions.check,
    label: "外国籍",
  },

  /** 仮登録 */
  isTemporary: {
    ...generalDefinitions.check,
    label: "仮登録",
  },
};
