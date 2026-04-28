import { generalDefinitions } from "./defaultDefinition.js";

/**
 * DATE AT型のフィールド定義
 */
export const dateAtFields = {
  dateAt: generalDefinitions.dateAt,
  dateOfBirth: {
    ...generalDefinitions.dateAt,
    label: "生年月日",
    default: null, // 2025-12-26 Set default to null
    component: {
      ...generalDefinitions.dateAt.component,
      attrs: {
        viewMode: "year", // 2025-12-26 Added
      },
    },
  },
  dateOfHire: {
    ...generalDefinitions.dateAt,
    label: "入社日",
  },
  // 2025-12-26 Added
  dateOfSecurityGuardRegistration: {
    ...generalDefinitions.dateAt,
    label: "警備員登録日",
    default: null,
  },
  dateOfTermination: {
    ...generalDefinitions.dateAt,
    label: "退職日",
    default: null, // 2025-12-26 Set default to null
  },
  enrollmentDateAt: {
    ...generalDefinitions.dateAt,
    label: "資格取得日",
    default: null,
  },
  // 2025-12-26 Added
  expirationDateAt: {
    ...generalDefinitions.dateAt,
    label: "有効期限",
    default: null,
  },
  issueDateAt: {
    ...generalDefinitions.dateAt,
    label: "取得日",
  },
  lossDateAt: {
    ...generalDefinitions.dateAt,
    label: "資格喪失日",
    default: null,
  },
  notificationSentAt: {
    ...generalDefinitions.dateAt,
    label: "通知送信日時",
    default: null,
  },
  periodOfStay: {
    ...generalDefinitions.dateAt,
    label: "在留期間満了日",
  },
};
