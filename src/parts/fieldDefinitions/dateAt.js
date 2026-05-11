import { generalDefinitions } from "./defaultDefinition.js";

/**
 * DATE AT型のフィールド定義
 */
export const dateAtFields = {
  dateAt: generalDefinitions.dateAt,

  /** 工期（終了日） */
  constructionPeriodEndAt: {
    ...generalDefinitions.dateAt,
    label: "工期（終了日）",
    default: null,
  },

  /** 工期（開始日） */
  constructionPeriodStartAt: {
    ...generalDefinitions.dateAt,
    label: "工期（開始日）",
    default: null,
  },

  /** 生年月日 */
  dateOfBirth: {
    ...generalDefinitions.dateAt,
    label: "生年月日",
    default: null,
    component: {
      ...generalDefinitions.dateAt.component,
      attrs: {
        viewMode: "year",
      },
    },
  },

  /** 入社日 */
  dateOfHire: {
    ...generalDefinitions.dateAt,
    label: "入社日",
  },

  /** 警備員登録日 */
  dateOfSecurityGuardRegistration: {
    ...generalDefinitions.dateAt,
    label: "警備員登録日",
    default: null,
  },

  /** 退職日 */
  dateOfTermination: {
    ...generalDefinitions.dateAt,
    label: "退職日",
    default: null,
  },

  /** 資格取得日 */
  enrollmentDateAt: {
    ...generalDefinitions.dateAt,
    label: "資格取得日",
    default: null,
  },

  /** 有効期限 */
  expirationDateAt: {
    ...generalDefinitions.dateAt,
    label: "有効期限",
    default: null,
  },

  /** 取得日 */
  issueDateAt: {
    ...generalDefinitions.dateAt,
    label: "取得日",
  },

  /** 資格喪失日 */
  lossDateAt: {
    ...generalDefinitions.dateAt,
    label: "資格喪失日",
    default: null,
  },

  /** 通知送信日時 */
  notificationSentAt: {
    ...generalDefinitions.dateAt,
    label: "通知送信日時",
    default: null,
  },

  /** 在留期間満了日 */
  periodOfStay: {
    ...generalDefinitions.dateAt,
    label: "在留期間満了日",
    default: null,
  },
};
